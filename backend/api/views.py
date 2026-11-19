from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework import status

from .models  import Requests
from django.utils import timezone
from datetime import timedelta
from django.db.models import Q
from django.db import transaction
import uuid
import random

from django.core.mail import get_connection, send_mail
from django.conf import settings

from .models import (
    OfficeProcedures,
    Offices,
    Procedures,
    ProcedureSteps,
    Requirements,
    ProcedureDocuments,
    Documents,
    FaqCategories,
    Faqs,
    Requests,
    RequestDocuments,
    Users,
    Roles,
    Notifications
)

from .serializers import (
    ProcedureSerializer,
    ProcedureStepSerializer,
    FAQCategorySerializer,
    FAQSerializer,
    RequestSerializer,
    ActiveRequestSerializer
)

from .services.procedure_service import get_full_procedure
from datetime import timedelta

def is_office_user(profile):
    """Any role except Student (1): Admin, Dean, Chairperson, Staff, Faculty."""
    role_id = getattr(profile.role, "role_id", None)
    return role_id is not None and role_id != 1


import re

OPERATIONAL, DEAN, CHAIR, STAFF, FACULTY = 2, 3, 4, 5, 6


def _profile(request):
    return (
        Users.objects.select_related("role", "office")
        .filter(auth_user_id=request.user.id)
        .first()
    )


def role_of(p):
    return getattr(p.role, "role_id", None)


def deny(msg="Not allowed."):
    return Response({"error": msg}, status=403)


DEAN_OFFICE = "Dean's Office"


def in_deans_office(p):
    return bool(p.office_id) and (p.office.office_name or "").strip().lower() == DEAN_OFFICE.lower()


def has_global_scope(p):
    """Operational Admin, Dean and Dean's Office staff work across ALL offices."""
    r = role_of(p)
    return r in (OPERATIONAL, DEAN) or (r == STAFF and in_deans_office(p))


def sees_all(p):
    """Can view every procedure / FAQ: Students plus anyone with global scope."""
    return role_of(p) == 1 or has_global_scope(p)


def can_edit_procedures(p):
    """CRUD on procedures / FAQs: Operational Admin, Dean, Chairperson, Staff. Faculty view only."""
    r = role_of(p)
    if r in (OPERATIONAL, DEAN):
        return True
    return r in (CHAIR, STAFF) and bool(p.office_id)


def owns_procedure(p, procedure_id):
    return OfficeProcedures.objects.filter(
        office_id=p.office_id, procedure_id=procedure_id
    ).exists()


def can_edit_procedure(p, procedure_id):
    if not can_edit_procedures(p):
        return False
    if has_global_scope(p):
        return True
    return owns_procedure(p, procedure_id)   # Chairperson / department Staff: own office only


def acting_office(p):
    """Office a newly created procedure is assigned to (Operational Admin has none -> Dean's Office)."""
    if p.office_id:
        return p.office
    return Offices.objects.filter(office_name__iexact=DEAN_OFFICE).first()


def handles_all_requests(p):
    """Requests across every office: Operational Admin (view) and Dean."""
    return role_of(p) in (OPERATIONAL, DEAN)


def can_handle_requests(p):
    """Approve / reject tracked requests. Dean: all offices. Others: own office only."""
    r = role_of(p)
    if r == DEAN:
        return True
    return r in (CHAIR, STAFF, FACULTY) and bool(p.office_id)


# =========================
# REGISTER
# =========================
@api_view(['POST'])
def register(request):

    id_number = request.data.get("id_number")
    email = request.data.get("email")
    password = request.data.get("password")

    # =========================
    # VALIDATION
    # =========================
    if not id_number or not email or not password:
        return Response(
            {"error": "All fields are required"},
            status=400
        )

    if User.objects.filter(username=str(id_number)).exists():
        return Response(
            {"error": "ID Number already exists"},
            status=400
        )

    if Users.objects.filter(id_number=id_number).exists():
        return Response(
            {"error": "Profile already exists"},
            status=400
        )

    if Users.objects.filter(email=email).exists():
        return Response(
            {"error": "Email already exists"},
            status=400
        )

    try:

        # =========================
        # CREATE DJANGO USER
        # =========================
        auth_user = User.objects.create_user(
            username=str(id_number),
            email=email,
            password=password
        )

        # =========================
        # WAIT FOR SIGNAL THEN ASSIGN ROLE
        # =========================
        role_user = Roles.objects.get(role_id=1)

        Users.objects.filter(auth_user_id=auth_user.id).update(
            role=role_user
        )

        profile = Users.objects.get(auth_user_id=auth_user.id)

        return Response({
            "message": "User registered successfully",
            "user_id": str(profile.user_id),
            "role_id": profile.role.role_id if profile.role else None
        }, status=201)

    except Roles.DoesNotExist:
        return Response(
            {"error": "Default role not found"},
            status=500
        )

    except Exception as e:
        return Response(
            {"error": str(e)},
            status=500
        )

# =========================
# LOGIN
# =========================
@api_view(['POST'])
def user_login(request):

    id_number = request.data.get("id_number")
    password = request.data.get("password")

    if not id_number or not password:
        return Response(
            {"error": "ID Number and password are required"},
            status=400
        )

    # =========================
    # AUTHENTICATE VIA AUTH_USER
    # =========================
    auth_user = authenticate(
        username=str(id_number),
        password=password
    )

    if not auth_user:
        return Response(
            {"error": "Invalid credentials"},
            status=401
        )

    # =========================
    # CREATE TOKEN
    # =========================
    token, _ = Token.objects.get_or_create(user=auth_user)

    # =========================
    # FETCH USER PROFILE
    # =========================
    try:

        profile = Users.objects.get(
            auth_user_id=auth_user.id
        )

    except Users.DoesNotExist:

        return Response({
            "error": "User profile not found"
        }, status=404)

    return Response({
        "token": token.key,
        "user_id": str(profile.user_id),
        "id_number": profile.id_number,
        "email": profile.email,
        "role_id": profile.role.role_id if profile.role else None,
        "office_id": profile.office_id
    })


# =========================
# CURRENT USER
# =========================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):

    try:

        profile = Users.objects.get(
            auth_user_id=request.user.id
        )

    except Users.DoesNotExist:

        return Response({
            "error": "Profile not found"
        }, status=404)

    return Response({
        "user_id": str(profile.user_id),
        "id_number": profile.id_number,
        "email": profile.email,
        "first_name": profile.first_name,
        "last_name": profile.last_name,
        "program": profile.program,
        "year_level": profile.year_level,
        "role_id": profile.role.role_id if profile.role else None,
        "office_id": profile.office_id
    })


# =========================
# PROCEDURES
# =========================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_procedures(request):
    profile = _profile(request)
    if not profile:
        return Response({"error": "Profile not found"}, status=404)

    if sees_all(profile):
        procedures = Procedures.objects.all()
    else:
        if not profile.office_id:
            return Response([])
        procedures = Procedures.objects.filter(
            officeprocedures__office_id=profile.office_id
        ).distinct()

    data = list(ProcedureSerializer(procedures, many=True).data)
    mine = set(
        OfficeProcedures.objects.filter(office_id=profile.office_id)
        .values_list("procedure_id", flat=True)
    ) if profile.office_id else set()
    for item in data:
        item["is_mine"] = item["procedure_id"] in mine
    return Response(data)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_procedure(request, pk):
    profile = _profile(request)
    if not profile or not can_edit_procedure(profile, pk):
        return deny("You are not allowed to edit this procedure.")
    try:
        procedure = Procedures.objects.get(pk=pk)
    except Procedures.DoesNotExist:
        return Response({'error': 'Procedure not found'}, status=404)
    serializer = ProcedureSerializer(procedure, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_procedure(request, pk):
    profile = _profile(request)
    if not profile or not can_edit_procedure(profile, pk):
        return deny("You are not allowed to delete this procedure.")
    try:
        procedure = Procedures.objects.get(pk=pk)
    except Procedures.DoesNotExist:
        return Response({'error': 'Procedure not found'}, status=404)
    procedure.delete()
    return Response(status=204)


# =========================
# CREATE FULL PROCESS (ADMIN)
# =========================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_full_process(request):

    try:
        profile = Users.objects.get(
            auth_user_id=request.user.id
        )

    except Users.DoesNotExist:
        return Response(
            {"error": "Profile not found"},
            status=404
        )


    role_id = getattr(
        profile.role,
        "role_id",
        None
    )


    if not can_edit_procedures(profile):
        return deny("You are not allowed to create processes.")

    owner_office = acting_office(profile)
    if not owner_office:
        return Response({"error": "No office available for this procedure."}, status=400)


    data = request.data


    print("INCOMING REQUIREMENTS:")
    print(data.get("requirements"))


    procedure_name = (
        data.get("procedure_name") or ""
    ).strip()


    description = (
        data.get("description") or ""
    )


    category_name = (
        data.get("category_name") or ""
    ).strip() or procedure_name



    requirements = data.get(
        "requirements",
        []
    )


    steps = data.get(
        "steps",
        []
    )



    if not procedure_name:
        return Response(
            {"error": "Procedure name is required"},
            status=400
        )



    # =========================
    # CREATE PROCEDURE
    # =========================

    procedure = Procedures.objects.create(
        procedure_name=procedure_name,
        description=description,
        created_at=timezone.now(),
        updated_at=timezone.now(),
    )



    # =========================
    # LINK TO ADMIN'S OFFICE
    # =========================

    OfficeProcedures.objects.get_or_create(
        office=owner_office,
        procedure=procedure,
    )



    # =========================
    # CREATE REQUIREMENTS + DOCUMENTS
    # =========================

    for req in requirements:


        req_name = (
            req.get("requirement_name") or ""
        ).strip()


        is_document = req.get(
            "is_document",
            False
        )


        if not req_name:
            continue



        # =========================
        # CREATE REQUIREMENT
        # =========================

        requirement = Requirements.objects.create(
            procedure=procedure,
            requirement_name=req_name,
        )



        # =========================
        # IF MARKED AS DOCUMENT
        # CREATE TRACKABLE DOCUMENT
        # =========================

        if is_document:


            document, _ = Documents.objects.get_or_create(
                document_name=req_name
            )


            ProcedureDocuments.objects.get_or_create(
                procedure=procedure,
                document=document,
                office=owner_office,
            )



    # =========================
    # CREATE STEPS
    # =========================

    for idx, step in enumerate(
        steps,
        start=1
    ):


        step_description = (
            step.get("step_description") or ""
        ).strip()


        if not step_description:
            continue



        ProcedureSteps.objects.create(
            procedure=procedure,
            step_number=step.get(
                "step_number"
            ) or idx,

            step_description=step_description,

            office_location=step.get(
                "office_location"
            ) or "",

            reference_link=step.get(
                "reference_link"
            ) or "",
        )



    # =========================
    # AUTO-CREATE EMPTY FAQ CATEGORY
    # =========================

    faq_category = FaqCategories.objects.create(
        category_name=category_name,
        procedure=procedure,
    )



    return Response(
        {
            "message": "Process created successfully",
            "procedure": ProcedureSerializer(procedure).data,
            "category_id": faq_category.category_id,
            "category_name": faq_category.category_name,
        },
        status=201
    )

# =========================
# UPDATE FULL PROCESS (ADMIN)
# =========================

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_full_process(request, procedure_id):

    try:
        profile = Users.objects.get(auth_user_id=request.user.id)
    except Users.DoesNotExist:
        return Response({"error": "Profile not found"}, status=404)

    if not can_edit_procedure(profile, procedure_id):
        return deny("You are not allowed to do this.")

    try:
        procedure = Procedures.objects.get(procedure_id=procedure_id)
    except Procedures.DoesNotExist:
        return Response({"error": "Procedure not found"}, status=404)

    # Documents belong to the procedure's owning office, not to whoever edits it
    owner_link = OfficeProcedures.objects.filter(
        procedure_id=procedure_id
    ).select_related("office").first()
    owner_office = owner_link.office if owner_link else acting_office(profile)

    data = request.data

    # =========================
    # UPDATE PROCEDURE
    # =========================

    procedure.procedure_name = data.get("procedure_name", procedure.procedure_name)
    procedure.description = data.get("description", procedure.description)
    procedure.updated_at = timezone.now()
    procedure.save()


    # =========================
    # SYNC REQUIREMENTS + DOCUMENTS
    # =========================

    incoming_requirements = data.get("requirements", [])

    existing_requirements = Requirements.objects.filter(
        procedure=procedure
    )

    existing_documents = ProcedureDocuments.objects.filter(
        procedure=procedure
    )

    incoming_requirement_ids = []
    linked_document_ids = []


    for req in incoming_requirements:

        requirement_name = (req.get("requirement_name") or "").strip()
        is_document = req.get("is_document", False)

        if not requirement_name:
            continue


        requirement, _ = Requirements.objects.get_or_create(
            procedure=procedure,
            requirement_name=requirement_name
        )

        incoming_requirement_ids.append(
            requirement.requirement_id
        )


        if is_document:

            document, _ = Documents.objects.get_or_create(
                document_name=requirement_name
            )

            linked_document_ids.append(
                document.document_id
            )

            ProcedureDocuments.objects.get_or_create(
                procedure=procedure,
                document=document,
                office=owner_office
            )


    # Remove deleted requirements

    existing_requirements.exclude(
        requirement_id__in=incoming_requirement_ids
    ).delete()


    # Remove document links when unchecked

    existing_documents.exclude(
        document_id__in=linked_document_ids
    ).delete()



    # =========================
    # SYNC STEPS
    # =========================

    incoming_steps = data.get("steps", [])

    existing_steps = ProcedureSteps.objects.filter(
        procedure=procedure
    )

    incoming_step_ids = []


    for step in incoming_steps:

        step_id = step.get("step_id")


        if step_id:

            try:
                obj = ProcedureSteps.objects.get(
                    step_id=step_id,
                    procedure=procedure
                )

            except ProcedureSteps.DoesNotExist:
                continue


            obj.step_description = step.get(
                "step_description",
                obj.step_description
            )

            obj.office_location = step.get(
                "office_location",
                obj.office_location
            )

            obj.reference_link = step.get(
                "reference_link",
                obj.reference_link
            )

            obj.step_number = step.get(
                "step_number",
                obj.step_number
            )

            obj.save()

            incoming_step_ids.append(obj.step_id)


        else:

            new_step = ProcedureSteps.objects.create(
                procedure=procedure,
                step_number=step.get("step_number"),
                step_description=step.get("step_description"),
                office_location=step.get("office_location"),
                reference_link=step.get("reference_link"),
            )

            incoming_step_ids.append(
                new_step.step_id
            )


    # Remove deleted steps

    existing_steps.exclude(
        step_id__in=incoming_step_ids
    ).delete()


    return Response(
        {
            "message": "Process updated successfully"
        },
        status=200
    )

# =========================
# DELETE FULL PROCESS (ADMIN)
# =========================

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_full_process(request, procedure_id):

    try:
        profile = Users.objects.get(auth_user_id=request.user.id)
    except Users.DoesNotExist:
        return Response({"error": "Profile not found"}, status=404)

    if not can_edit_procedure(profile, procedure_id):
        return deny("You are not allowed to do this.")

    try:
        procedure = Procedures.objects.get(
            procedure_id=procedure_id
        )
    except Procedures.DoesNotExist:
        return Response({"error": "Procedure not found"}, status=404)


    # =========================
    # DELETE RELATED DATA
    # =========================

    ProcedureDocuments.objects.filter(
        procedure=procedure
    ).delete()

    Requirements.objects.filter(
        procedure=procedure
    ).delete()

    ProcedureSteps.objects.filter(
        procedure=procedure
    ).delete()

    OfficeProcedures.objects.filter(
        procedure=procedure
    ).delete()

    FaqCategories.objects.filter(
        procedure=procedure
    ).delete()


    # =========================
    # DELETE PROCEDURE
    # =========================

    procedure.delete()


    return Response(
        {
            "message": "Process deleted successfully"
        },
        status=200
    )

# =========================
# DISPLAY PROCEDURE OFFICES
# =========================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_procedure_offices(request, procedure_id):

    offices = (
        OfficeProcedures.objects
        .filter(procedure_id=procedure_id)
        .select_related("office")
    )

    return Response([
        {
            "office_id": item.office.office_id,
            "office_name": item.office.office_name,
        }
        for item in offices
    ])

# =========================
# FAQ CATEGORIES
# =========================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_faq_categories(request):
    profile = _profile(request)
    if not profile:
        return Response({"error": "Profile not found"}, status=404)

    categories = FaqCategories.objects.all()
    if not sees_all(profile):
        if not profile.office_id:
            return Response([])
        categories = categories.filter(
            procedure_id__in=OfficeProcedures.objects.filter(
                office_id=profile.office_id
            ).values_list("procedure_id", flat=True)
        )

    data = []
    for category in categories:
        data.append({
            "category_id": category.category_id,
            "category_name": category.category_name,
            "procedure": int(category.procedure_id) if category.procedure_id else None,
            "faq_count": Faqs.objects.filter(category=category).count(),
            "can_edit": bool(category.procedure_id)
                        and can_edit_procedure(profile, category.procedure_id),
        })
    return Response(data)


# =========================
# FAQS
# =========================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_faqs(request):
    profile = _profile(request)
    if not profile:
        return Response({"error": "Profile not found"}, status=404)

    faqs = Faqs.objects.all()
    if not sees_all(profile):
        if not profile.office_id:
            return Response([])
        allowed = OfficeProcedures.objects.filter(
            office_id=profile.office_id
        ).values_list("procedure_id", flat=True)
        faqs = faqs.filter(category__procedure_id__in=allowed)

    category_id = request.query_params.get("category_id")
    if category_id:
        faqs = faqs.filter(category_id=category_id)

    return Response(FAQSerializer(faqs, many=True).data)


def _faq_procedure_id(category_id):
    return (
        FaqCategories.objects.filter(pk=category_id)
        .values_list("procedure_id", flat=True).first()
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_faq(request):
    profile = _profile(request)
    pid = _faq_procedure_id(request.data.get("category"))
    if not profile or not pid or not can_edit_procedure(profile, pid):
        return deny("You can only add FAQs to your own office's procedures.")
    data = request.data.copy()
    if data.get('answer') is None:
        data['answer'] = ""
    serializer = FAQSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_faq(request, pk):
    profile = _profile(request)
    faq = Faqs.objects.filter(pk=pk).select_related("category").first()
    if not faq:
        return Response({'error': 'FAQ not found'}, status=404)
    pid = faq.category.procedure_id if faq.category else None
    if not profile or not pid or not can_edit_procedure(profile, pid):
        return deny()
    serializer = FAQSerializer(faq, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_faq(request, pk):
    profile = _profile(request)
    faq = Faqs.objects.filter(pk=pk).select_related("category").first()
    if not faq:
        return Response({'error': 'FAQ not found'}, status=404)
    pid = faq.category.procedure_id if faq.category else None
    if not profile or not pid or not can_edit_procedure(profile, pid):
        return deny()
    faq.delete()
    return Response(status=204)


# =========================
# REQUESTS
# =========================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_request(request):

    try:
        profile = Users.objects.get(auth_user_id=request.user.id)
    except Users.DoesNotExist:
        return Response({"error": "Profile not found"}, status=404)

    procedure_id = request.data.get("procedure")
    document_id = request.data.get("document")

    if not procedure_id or not document_id:
        return Response(
            {"error": "Procedure and document are required."},
            status=400
        )

    try:
        procedure = Procedures.objects.get(pk=procedure_id)
        document = Documents.objects.get(pk=document_id)
    except (Procedures.DoesNotExist, Documents.DoesNotExist):
        return Response(
            {"error": "Invalid procedure or document."},
            status=400
        )

    # Create request
    new_request = Requests.objects.create(
        user=profile,
        procedure=procedure,
        created_at=timezone.now(),
    )

    # Find the latest tracking number for this document
    last_request = (
        RequestDocuments.objects
        .filter(document=document)
        .order_by("-tracking_number")
        .first()
    )

    if last_request and last_request.tracking_number:
        next_tracking_number = last_request.tracking_number + 1
    else:
        next_tracking_number = 1

    # Format the reference code
    reference_code = f"{document.document_id:04d}-{next_tracking_number:08d}"

    # Create request document
    request_document = RequestDocuments.objects.create(
        request=new_request,
        document=document,
        tracking_number=next_tracking_number,
        reference_code=reference_code,
        status="Pending",
        updated_at=timezone.now(),
    )

    return Response(
    {
        "request_id": new_request.request_id,
        "reference_code": reference_code,
        "tracking_number": next_tracking_number,
        "status": request_document.status,
    },
    status=201,
)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def track_requests(request):

    try:
        profile = Users.objects.get(auth_user_id=request.user.id)
    except Users.DoesNotExist:
        return Response({"error": "Profile not found"}, status=404)

    # user requests only
    requests = Requests.objects.filter(user=profile)

    if is_office_user(profile):

        allowed = OfficeProcedures.objects.filter(
            office_id=profile.office_id
        ).values_list(
            "procedure_id",
            flat=True
        )

        requests = Requests.objects.filter(
            procedure_id__in=allowed
        )

    else:
        requests = Requests.objects.filter(
            user=profile
        )

    return Response(
        RequestSerializer(requests, many=True).data
    )

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def active_requests(request):
    profile = _profile(request)
    if not profile:
        return Response({"error": "Profile not found"}, status=404)

    cutoff = timezone.now() - timedelta(days=7)

    if role_of(profile) == 1:
        requests = (
            Requests.objects
            .filter(user=profile)
            .select_related("procedure", "user")
            .prefetch_related("requestdocuments_set")
            .order_by("-created_at")
        )
    else:
        docs = ProcedureDocuments.objects.all()
        if not handles_all_requests(profile):
            docs = docs.filter(office_id=profile.office_id)
        allowed_documents = docs.values_list("document_id", flat=True)
        requests = (
            Requests.objects
            .filter(requestdocuments__document_id__in=allowed_documents)
            .select_related("procedure", "user")
            .prefetch_related("requestdocuments_set")
            .order_by("-created_at")
            .distinct()
        )

    active = []
    for req in requests:
        req_doc = req.requestdocuments_set.first()
        if not req_doc:
            continue
        st = (req_doc.status or "").lower()
        if st == "pending":
            active.append(req)
        elif st == "rejected" and req_doc.updated_at >= cutoff:
            active.append(req)

    return Response(ActiveRequestSerializer(active, many=True).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def search_request_by_reference(request):
    profile = _profile(request)
    if not profile or not (can_handle_requests(profile) or role_of(profile) == OPERATIONAL):
        return deny("Not allowed.")

    reference_code = request.data.get("reference_code")
    if not reference_code:
        return Response({"error": "Reference code is required"}, status=400)

    try:
        req_doc = (
            RequestDocuments.objects
            .select_related("request", "request__procedure", "document")
            .get(reference_code=reference_code)
        )
    except RequestDocuments.DoesNotExist:
        return Response({"error": "Request not found"}, status=404)

    if not handles_all_requests(profile) and not ProcedureDocuments.objects.filter(
        office_id=profile.office_id, document_id=req_doc.document_id
    ).exists():
        return deny("This document belongs to another office.")

    return Response(ActiveRequestSerializer(req_doc.request).data)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_request_status(request, request_id):
    profile = _profile(request)
    if not profile or not can_handle_requests(profile):
        return deny("Only office staff can approve or reject requests.")

    req_doc = (
        RequestDocuments.objects
        .select_related("request", "document")
        .filter(request_id=request_id)
        .first()
    )
    if not req_doc:
        return Response({"error": "Request not found"}, status=404)

    if not handles_all_requests(profile) and not ProcedureDocuments.objects.filter(
        office_id=profile.office_id, document_id=req_doc.document_id
    ).exists():
        return deny("This document belongs to another office.")

    new_status = (request.data.get("status") or "").strip().lower()
    remarks = request.data.get("remarks")

    if new_status not in ("approved", "rejected"):
        return Response({"error": "Status must be Approved or Rejected."}, status=400)

    now = timezone.now()
    if new_status == "approved":
        req_doc.status = "Approved"
        req_doc.is_followed_up = True
        req_doc.followed_up_at = now
        req_doc.history_at = now
        req_doc.follow_up_deadline = None
        req_doc.rejected_at = None
    else:
        req_doc.status = "Rejected"
        req_doc.is_followed_up = False
        req_doc.followed_up_at = None
        req_doc.rejected_at = now
        req_doc.follow_up_deadline = now + timedelta(days=7)
        req_doc.history_at = None

    if remarks is not None:
        req_doc.remarks = remarks

    req_doc.updated_by = profile
    req_doc.updated_by_id_snapshot = profile.id_number
    req_doc.updated_at = now
    req_doc.save()

    student = req_doc.request.user if req_doc.request else None
    if student:
        doc_name = (
            req_doc.document.document_name if req_doc.document
            else req_doc.document_name_snapshot
        )
        message = f"Your request for {doc_name} has been {new_status}."
        if new_status == "rejected" and req_doc.remarks:
            message += f" Remarks: {req_doc.remarks}"
        Notifications.objects.create(
            user=student, request=req_doc.request, message=message, is_read=False
        )

    return Response({"message": "Request updated successfully"})


# =========================
# PROCESS SCREEN
# =========================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_process_screen(request, procedure_id):
    profile = _profile(request)
    if not profile:
        return Response({"error": "Profile not found"}, status=404)

    if not sees_all(profile) and not owns_procedure(profile, procedure_id):
        return Response({"error": "Not allowed"}, status=403)

    try:
        data = get_full_procedure(procedure_id)
    except Procedures.DoesNotExist:
        return Response({"error": "Procedure not found"}, status=404)

    faq_categories = []
    for category in FaqCategories.objects.filter(procedure_id=procedure_id):
        faqs = Faqs.objects.filter(category=category)
        faq_categories.append({
            "category_id": category.category_id,
            "category_name": category.category_name,
            "faqs": FAQSerializer(faqs, many=True).data,
        })

    return Response({
        "procedure": ProcedureSerializer(data["procedure"]).data,
        "steps": ProcedureStepSerializer(data["steps"], many=True).data,
        "requirements": data["requirements"],
        "faq_categories": faq_categories,
        "can_edit": can_edit_procedure(profile, procedure_id),
    })


# =========================
# DOCUMENTS
# =========================

@api_view(["GET"])
def get_procedure_documents(request, procedure_id):
    docs = {}
    rows = (
        ProcedureDocuments.objects
        .filter(procedure_id=procedure_id)
        .select_related("document")
    )
    for item in rows:
        docs[item.document.document_id] = item.document.document_name

    return Response([
        {"document_id": k, "document_name": v} for k, v in docs.items()
    ])
# =========================
# PROFILE
# =========================
@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request):

    try:
        profile = Users.objects.get(auth_user_id=request.user.id)
        auth_user = User.objects.get(id=request.user.id)

    except Users.DoesNotExist:
        return Response({"error": "Profile not found"}, status=404)

    except User.DoesNotExist:
        return Response({"error": "Auth user not found"}, status=404)

    data = request.data

    new_email = data.get("email")
    new_id_number = data.get("id_number")
    new_password = data.get("password")
    new_first_name = data.get("first_name")
    new_last_name = data.get("last_name")
    new_program = data.get("program")
    new_year_level = data.get("year_level")

    # =========================
    # EMAIL
    # =========================
    if new_email:
        if Users.objects.filter(email=new_email).exclude(user_id=profile.user_id).exists():
            return Response({"error": "Email already exists"}, status=400)

        profile.email = new_email
        auth_user.email = new_email

    # =========================
    # ID NUMBER
    # =========================
    if new_id_number:
        if User.objects.filter(username=str(new_id_number)).exclude(id=auth_user.id).exists():
            return Response({"error": "ID Number already exists"}, status=400)

        profile.id_number = new_id_number
        auth_user.username = str(new_id_number)

    # =========================
    # PASSWORD
    # =========================
    if new_password:
        auth_user.password = make_password(new_password)

    # =========================
    # FIRST NAME
    # =========================
    if new_first_name is not None:
        profile.first_name = new_first_name

    # =========================
    # LAST NAME
    # =========================
    if new_last_name is not None:
        profile.last_name = new_last_name

    # =========================
    # PROGRAM
    # =========================
    if new_program is not None:
        profile.program = new_program

    # =========================
    # YEAR LEVEL
    # =========================
    if new_year_level is not None:
        try:
            profile.year_level = int(new_year_level)
        except (ValueError, TypeError):
            return Response({"error": "Invalid year level"}, status=400)

    # SAVE EVERYTHING
    auth_user.save()
    profile.save()

    return Response({
        "message": "Profile updated successfully",
        "user_id": str(profile.user_id),
        "email": profile.email,
        "id_number": profile.id_number,
        "first_name": profile.first_name,
        "last_name": profile.last_name,
        "program": profile.program,
        "year_level": profile.year_level,
    })


# =========================
# VERIFY PASSWORD
# =========================
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def verify_password(request):

    user = request.user

    return Response({
        "valid": user.check_password(request.data.get("password"))
    })

from .models import Notifications
from .serializers import NotificationSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated


class NotificationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        user_profile = request.user.profile

        notifications = Notifications.objects.filter(
            user=user_profile
        ).order_by("-created_at")

        serializer = NotificationSerializer(
            notifications,
            many=True
        )

        return Response(serializer.data)

@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def mark_notifications_read(request):

    profile = request.user.profile

    Notifications.objects.filter(
        user=profile,
        is_read=False
    ).update(is_read=True)

    return Response({
        "message": "Notifications marked as read."
    })

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def admin_statistics(request):
    profile = _profile(request)
    if not profile or role_of(profile) in (None, 1):
        return deny("Unauthorized")

    if sees_all(profile):
        data = {
            "procedures": Procedures.objects.count(),
            "faqs": Faqs.objects.count(),
            "requests": Requests.objects.count(),
        }
    else:
        ids = list(
            OfficeProcedures.objects.filter(office_id=profile.office_id)
            .values_list("procedure_id", flat=True)
        )
        data = {
            "procedures": len(ids),
            "faqs": Faqs.objects.filter(category__procedure_id__in=ids).count(),
            "requests": Requests.objects.filter(procedure_id__in=ids).count(),
        }

    if role_of(profile) == OPERATIONAL:
        def count(r):
            return Users.objects.filter(role_id=r).count()

        data["accounts"] = {
            "students": count(1), "deans": count(DEAN),
            "chairpersons": count(CHAIR), "staff": count(STAFF),
            "faculty": count(FACULTY),
        }
        offices = []
        for o in Offices.objects.order_by("office_name"):
            docs = ProcedureDocuments.objects.filter(office=o).values_list("document_id", flat=True)
            rd = RequestDocuments.objects.filter(document_id__in=docs)
            offices.append({
                "office_name": o.office_name,
                "pending": rd.filter(status__iexact="pending").count(),
                "approved": rd.filter(status__iexact="approved").count(),
                "rejected": rd.filter(status__iexact="rejected").count(),
            })
        data["offices"] = offices

    return Response(data)


# =========================
# USER SUBMISSION HISTORY
# =========================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_submission_history(request):

    try:
        profile = Users.objects.get(auth_user_id=request.user.id)
    except Users.DoesNotExist:
        return Response({"error": "Profile not found"}, status=404)

    req_docs = (
        RequestDocuments.objects
        .filter(request__user=profile)
        .filter(
            Q(status__iexact="approved") |
            Q(status__iexact="rejected")
        )
        .select_related("request", "request__procedure", "document")
        .order_by("-updated_at")
    )

    data = []

    for doc in req_docs:
        req = doc.request

        data.append({
            "req_doc_id": doc.req_doc_id,
            "reference_code": doc.reference_code,
            "status": doc.status,
            "remarks": doc.remarks,
            "updated_at": doc.updated_at,
            "procedure_name": (
                req.procedure.procedure_name
                if req and req.procedure
                else (req.procedure_name_snapshot if req else None)
            ),
            "document_name": (
                doc.document.document_name
                if doc.document
                else doc.document_name_snapshot
            ),
        })

    return Response(data)

# =========================
# ADMIN TRANSACTION HISTORY
# =========================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def admin_transaction_history(request):

    try:
        profile = Users.objects.get(auth_user_id=request.user.id)
    except Users.DoesNotExist:
        return Response({"error": "Profile not found"}, status=404)

    if not is_office_user(profile):
        return Response({"error": "Unauthorized"}, status=403)

    if not handles_all_requests(profile) and not profile.office_id:
        return Response([])

    # Documents handled by this admin's office (role 2 sees all)
    docs = ProcedureDocuments.objects.all()
    if not handles_all_requests(profile):
        docs = docs.filter(office_id=profile.office_id)
    allowed_documents = docs.values_list("document_id", flat=True)

    now = timezone.now()
    cutoff = now - timedelta(days=7)

    req_docs = (
        RequestDocuments.objects
        .filter(document_id__in=allowed_documents)
        .filter(
            Q(status__iexact="approved") |
            Q(
                status__iexact="rejected",
                rejected_at__lte=cutoff
            )
        )
        .select_related("request", "request__user", "document")
        .order_by("-updated_at")
    )

    data = []

    for doc in req_docs:
        req = doc.request
        student = req.user if req else None

        data.append({
            "req_doc_id": doc.req_doc_id,
            "document_name": (
                doc.document.document_name
                if doc.document
                else doc.document_name_snapshot
            ),
            "reference_code": doc.reference_code,
            "tracking_number": doc.tracking_number,
            "status": doc.status,
            "updated_at": doc.updated_at,
            "remarks": doc.remarks,
            "first_name": student.first_name if student else None,
            "last_name": student.last_name if student else None,
            "student_name": (
                f"{student.first_name} {student.last_name}".strip()
                if student else None
            ),
            "student_id_number": student.id_number if student else None,
            "program": student.program if student else None,
            "year_level": student.year_level if student else None,
            "email": student.email if student else None,
            "created_at": req.created_at if req else None,
        })

    return Response(data)

# =========================
# MANAGE ACCOUNTS
# =========================
# Operational Admin -> Dean
# Dean              -> Chairperson (department offices), Staff (Dean's Office)
# Chairperson       -> Staff, Faculty (own office)
CAN_CREATE = {
    OPERATIONAL: [DEAN],
    DEAN: [CHAIR, STAFF],
    CHAIR: [STAFF, FACULTY],
}
def _full_name(u):
    return f"{u.first_name} {u.last_name}".strip()


def _offices_for(profile, new_role):
    """Offices this creator may assign to the given account type."""
    my = role_of(profile)
    qs = Offices.objects.all().order_by("office_name")
    deans = qs.filter(office_name__iexact=DEAN_OFFICE)
    if my == OPERATIONAL and new_role == DEAN:
        return deans
    if my == DEAN and new_role == CHAIR:
        return qs.exclude(pk__in=deans.values("pk"))
    if my == DEAN and new_role == STAFF:
        return qs.filter(office_id=profile.office_id)
    if my == CHAIR and new_role in (STAFF, FACULTY):
        return qs.filter(office_id=profile.office_id)
    return qs.none()


def _manageable(profile):
    """Accounts this user may list / deactivate."""
    my = role_of(profile)
    qs = Users.objects.select_related("role", "office", "auth_user")
    if my == OPERATIONAL:
        return qs.filter(role_id=DEAN)
    if my == DEAN:
        return qs.filter(
            Q(role_id=CHAIR) | Q(role_id=STAFF, office_id=profile.office_id)
        )
    if my == CHAIR:
        return qs.filter(role_id__in=(STAFF, FACULTY), office_id=profile.office_id)
    return qs.none()


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_offices(request):
    profile = _profile(request)
    if not profile or role_of(profile) not in CAN_CREATE:
        return deny("Unauthorized")
    try:
        new_role = int(request.query_params.get("role_id"))
    except (TypeError, ValueError):
        return Response([])
    if new_role not in CAN_CREATE[role_of(profile)]:
        return Response([])
    return Response([
        {"office_id": o.office_id, "office_name": o.office_name}
        for o in _offices_for(profile, new_role)
    ])


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_accounts(request):
    profile = _profile(request)
    if not profile or role_of(profile) not in CAN_CREATE:
        return deny("Unauthorized")
    accounts = _manageable(profile).order_by("-created_at")
    return Response([
        {
            "user_id": str(a.user_id),
            "id_number": a.id_number,
            "student_name": _full_name(a),
            "email": a.email,
            "role_id": a.role.role_id if a.role else None,
            "office_name": a.office.office_name if a.office else None,
            "is_active": bool(a.auth_user and a.auth_user.is_active),
        }
        for a in accounts
    ])


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_account(request):
    profile = _profile(request)
    if not profile:
        return Response({"error": "Profile not found"}, status=404)

    allowed = CAN_CREATE.get(role_of(profile), [])
    if not allowed:
        return deny("Your account type cannot create other accounts.")

    data = request.data
    try:
        new_role_id = int(data.get("role_id"))
    except (TypeError, ValueError):
        return Response({"error": "Account type is required."}, status=400)
    if new_role_id not in allowed:
        return deny("You are not allowed to create this account type.")

    id_number = str(data.get("id_number") or "").strip()
    full_name = (data.get("student_name") or "").strip()
    email = (data.get("email") or "").strip().lower() or None   # optional -> NULL
    password = data.get("password") or ""

    if not id_number or not full_name or not password:
        return Response({"error": "ID number, name and password are required."}, status=400)
    if not id_number.isdigit() or not (8 <= len(id_number) <= 20):
        return Response({"error": "Invalid ID Number."}, status=400)
    if len(password) < 8:
        return Response({"error": "Password must be at least 8 characters."}, status=400)
    if email:
        if not re.match(r"\S+@\S+\.\S+", email):
            return Response({"error": "Invalid email format."}, status=400)
        if Users.objects.filter(email__iexact=email).exists():
            return Response({"error": "Email already exists."}, status=400)

    try:
        office_id = int(data.get("office_id"))
    except (TypeError, ValueError):
        return Response({"error": "Office is required."}, status=400)
    office = _offices_for(profile, new_role_id).filter(office_id=office_id).first()
    if not office:
        return deny("Office not allowed for this account type.")

    active = Users.objects.filter(auth_user__is_active=True)
    if new_role_id == DEAN and active.filter(role_id=DEAN).exists():
        return Response(
            {"error": "A Dean account is already active. Deactivate it first."}, status=400)
    if new_role_id == CHAIR and active.filter(role_id=CHAIR, office_id=office.office_id).exists():
        return Response(
            {"error": "This office already has an active Chairperson. Deactivate it first."},
            status=400)

    if User.objects.filter(username=id_number).exists() \
            or Users.objects.filter(id_number=int(id_number)).exists():
        return Response({"error": "ID Number already exists."}, status=400)

    role = Roles.objects.filter(role_id=new_role_id).first()
    if not role:
        return Response({"error": "Invalid account type."}, status=400)

    parts = full_name.rsplit(None, 1)
    first_name = parts[0]
    last_name = parts[1] if len(parts) > 1 else ""

    try:
        with transaction.atomic():
            auth_user = User.objects.create_user(
                username=id_number, email=email or "", password=password
            )
            # the post_save signal in admin.py normally creates this row
            new_profile, _ = Users.objects.get_or_create(
                auth_user=auth_user, defaults={"id_number": int(id_number)}
            )
            new_profile.id_number = int(id_number)
            new_profile.email = email
            new_profile.first_name = first_name
            new_profile.last_name = last_name
            new_profile.role = role
            new_profile.office = office
            new_profile.created_by = profile
            new_profile.created_at = timezone.now()
            new_profile.save()
    except Exception as e:
        return Response({"error": str(e)}, status=500)

    return Response(
        {"message": "Account created successfully.", "user_id": str(new_profile.user_id)},
        status=201,
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def set_account_active(request, user_id):
    profile = _profile(request)
    if not profile or role_of(profile) not in CAN_CREATE:
        return deny("Unauthorized")

    target = _manageable(profile).filter(user_id=user_id).first()
    if not target or not target.auth_user:
        return deny("You cannot manage this account.")

    make_active = bool(request.data.get("active"))

    if make_active:  # reactivation must respect the one-active-per-seat rule
        others = Users.objects.filter(auth_user__is_active=True).exclude(pk=target.pk)
        if target.role_id == DEAN and others.filter(role_id=DEAN).exists():
            return Response({"error": "Another Dean is already active."}, status=400)
        if target.role_id == CHAIR and others.filter(
            role_id=CHAIR, office_id=target.office_id
        ).exists():
            return Response(
                {"error": "Another Chairperson is already active for this office."}, status=400)

    target.auth_user.is_active = make_active
    target.auth_user.save(update_fields=["is_active"])
    if not make_active:
        Token.objects.filter(user=target.auth_user).delete()   # force logout

    return Response({"message": "Account updated.", "is_active": make_active})