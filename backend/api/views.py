from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token

from django.utils import timezone
import uuid
import random

from django.core.mail import get_connection, send_mail
from django.conf import settings

from .models import (
    OfficeProcedures,
    Procedures,
    ProcedureSteps,
    Requirements,
    ProcedureRequirements,
    ProcedureDocuments,
    Documents,
    FaqCategories,
    Faqs,
    Requests,
    RequestDocuments,
    Users,
    Roles
)

from .serializers import (
    ProcedureSerializer,
    ProcedureStepSerializer,
    ProcedureRequirementSerializer,
    FAQCategorySerializer,
    FAQSerializer,
    RequestSerializer
)

from .services.procedure_service import get_full_procedure


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
        "student_name": profile.student_name,
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

    profile = Users.objects.get(auth_user_id=request.user.id)
    role_id = getattr(profile.role, "role_id", None)

    # STUDENT
    if role_id == 1:
        procedures = Procedures.objects.all()

    # ADMIN
    else:
        if not profile.office_id:
            return Response([])

        procedures = Procedures.objects.filter(
            officeprocedures__office_id=profile.office_id
        ).distinct()

    return Response(
        ProcedureSerializer(procedures, many=True).data
    )

@api_view(['PUT', 'PATCH'])
def update_procedure(request, pk):

    try:

        procedure = Procedures.objects.get(pk=pk)

    except Procedures.DoesNotExist:

        return Response({
            'error': 'Procedure not found'
        }, status=404)

    serializer = ProcedureSerializer(
        procedure,
        data=request.data,
        partial=True
    )

    if serializer.is_valid():

        serializer.save()

        return Response(serializer.data)

    return Response(
        serializer.errors,
        status=400
    )


@api_view(['DELETE'])
def delete_procedure(request, pk):

    try:

        procedure = Procedures.objects.get(pk=pk)

    except Procedures.DoesNotExist:

        return Response({
            'error': 'Procedure not found'
        }, status=404)

    procedure.delete()

    return Response({
        'message': 'Procedure deleted successfully'
    }, status=204)

@api_view(['POST'])
def save_full_process(request, procedure_id):

    try:
        procedure = Procedures.objects.get(pk=procedure_id)
    except Procedures.DoesNotExist:
        return Response({"error": "Procedure not found"}, status=404)

    data = request.data

    # =========================
# CREATE FULL PROCESS (ADMIN)
# =========================
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_full_process(request):

    try:
        profile = Users.objects.get(auth_user_id=request.user.id)
    except Users.DoesNotExist:
        return Response({"error": "Profile not found"}, status=404)

    role_id = getattr(profile.role, "role_id", None)

    if role_id != 2:
        return Response({"error": "Only admins can create processes"}, status=403)

    data = request.data

    procedure_name = (data.get("procedure_name") or "").strip()
    description = data.get("description") or ""
    category_name = (data.get("category_name") or "").strip() or procedure_name
    requirements = data.get("requirements", [])
    steps = data.get("steps", [])

    if not procedure_name:
        return Response({"error": "Procedure name is required"}, status=400)

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
    if profile.office_id:
        OfficeProcedures.objects.get_or_create(
            office_id=profile.office_id,
            procedure=procedure,
        )

    # =========================
    # REQUIREMENTS
    # =========================
    for req in requirements:
        req_name = (req or "").strip()

        if not req_name:
            continue

        requirement, _ = Requirements.objects.get_or_create(
            requirement_name=req_name
        )

        ProcedureRequirements.objects.get_or_create(
            procedure=procedure,
            requirement=requirement,
        )

    # =========================
    # STEPS
    # =========================
    for idx, step in enumerate(steps, start=1):
        step_description = (step.get("step_description") or "").strip()

        if not step_description:
            continue

        ProcedureSteps.objects.create(
            procedure=procedure,
            step_number=step.get("step_number") or idx,
            step_description=step_description,
            office_location=step.get("office_location") or "",
            reference_link=step.get("reference_link") or "",
        )

    # =========================
    # AUTO-CREATE EMPTY FAQ CATEGORY
    # (Individual FAQs are added later on the FAQ page)
    # =========================
    faq_category = FaqCategories.objects.create(
        category_name=category_name,
        procedure=procedure,
    )

    return Response({
        "message": "Process created successfully",
        "procedure": ProcedureSerializer(procedure).data,
        "category_id": faq_category.category_id,
        "category_name": faq_category.category_name,
    }, status=201)

    # =========================
    # UPDATE PROCEDURE
    # =========================
    procedure.procedure_name = data.get(
        "procedure_name",
        procedure.procedure_name
    )

    procedure.description = data.get(
        "description",
        procedure.description
    )

    procedure.save()

    # =========================
    # SYNC REQUIREMENTS
    # =========================
    incoming_requirements = data.get("requirements", [])

    existing_links = ProcedureRequirements.objects.filter(
        procedure=procedure
    )

    linked_requirement_ids = []

    for req in incoming_requirements:

        requirement_name = (
            req.get("requirement_name") or ""
        ).strip()

        if not requirement_name:
            continue

        # Reuse existing requirement if it already exists
        requirement, _ = Requirements.objects.get_or_create(
            requirement_name=requirement_name
        )

        linked_requirement_ids.append(
            requirement.requirement_id
        )

        # Create link if it doesn't already exist
        ProcedureRequirements.objects.get_or_create(
            procedure=procedure,
            requirement=requirement
        )

    # Remove links that are no longer included
    existing_links.exclude(
        requirement_id__in=linked_requirement_ids
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

            obj = ProcedureSteps.objects.get(
                pk=step_id
            )

            obj.step_description = step.get(
                "step_description"
            )

            obj.office_location = step.get(
                "office_location"
            )

            obj.reference_link = step.get(
                "reference_link"
            )

            obj.step_number = step.get(
                "step_number"
            )

            obj.save()

            incoming_step_ids.append(
                obj.step_id
            )

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

    # Delete removed steps
    existing_steps.exclude(
        step_id__in=incoming_step_ids
    ).delete()

    return Response({
        "message": "Process updated successfully"
    }, status=200)

# =========================
# FAQ CATEGORIES
# =========================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_faq_categories(request):

    profile = Users.objects.get(auth_user_id=request.user.id)
    role_id = getattr(profile.role, "role_id", None)

    if role_id != 1 and not profile.office_id:
        return Response([])

    # STUDENT
    if role_id == 1:
        categories = FaqCategories.objects.all()

    # ADMIN
    else:
        if not profile.office_id:
            return Response([])

        categories = FaqCategories.objects.all()

        if role_id != 1 and profile.office_id:
            categories = categories.filter(
                procedure_id__in=OfficeProcedures.objects.filter(
                    office_id=profile.office_id
                ).values_list("procedure_id", flat=True)
            )

    data = []

    for category in categories:

        faq_count = Faqs.objects.filter(category=category).count()

        data.append({
            "category_id": category.category_id,
            "category_name": category.category_name,
            "procedure": int(category.procedure_id) if category.procedure_id else None,
            "faq_count": faq_count,
        })

    return Response(data)


# =========================
# FAQS
# =========================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_faqs(request):

    profile = Users.objects.get(auth_user_id=request.user.id)
    role_id = getattr(profile.role, "role_id", None)

    if role_id != 1 and not profile.office_id:
        return Response([])

    category_id = request.query_params.get("category_id")

    # BASE QUERY
    faqs = Faqs.objects.all()

    # ADMIN FILTER
    if role_id != 1:
        if profile.office_id:
            allowed_procedures = OfficeProcedures.objects.filter(
                office_id=profile.office_id
            ).values_list("procedure_id", flat=True)

            faqs = faqs.filter(
                category__procedure_id__in=allowed_procedures
            )
        else:
            return Response([])

    if category_id:
        faqs = faqs.filter(category_id=category_id)

    return Response(
        FAQSerializer(faqs, many=True).data
    )


@api_view(['POST'])
def create_faq(request):

    data = request.data.copy()

    if 'answer' not in data or data['answer'] is None:
        data['answer'] = ""

    serializer = FAQSerializer(data=data)

    if serializer.is_valid():

        serializer.save()

        return Response(
            serializer.data,
            status=201
        )

    return Response(
        serializer.errors,
        status=400
    )


@api_view(['PUT', 'PATCH'])
def update_faq(request, pk):

    try:

        faq = Faqs.objects.get(pk=pk)

    except Faqs.DoesNotExist:

        return Response({
            'error': 'FAQ not found'
        }, status=404)

    serializer = FAQSerializer(
        faq,
        data=request.data,
        partial=True
    )

    if serializer.is_valid():

        serializer.save()

        return Response(serializer.data)

    return Response(
        serializer.errors,
        status=400
    )


@api_view(['DELETE'])
def delete_faq(request, pk):

    try:

        faq = Faqs.objects.get(pk=pk)

    except Faqs.DoesNotExist:

        return Response({
            'error': 'FAQ not found'
        }, status=404)

    faq.delete()

    return Response({
        'message': 'FAQ deleted successfully'
    }, status=204)


# =========================
# REQUESTS
# =========================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_request(request):

    try:
        profile = Users.objects.get(
            auth_user_id=request.user.id
        )

    except Users.DoesNotExist:
        return Response(
            {"error": "User profile not found"},
            status=404
        )

    procedure_id = request.data.get("procedure")

    if not procedure_id:
        return Response(
            {"error": "Procedure is required"},
            status=400
        )

    try:
        procedure = Procedures.objects.get(
            procedure_id=procedure_id
        )

    except Procedures.DoesNotExist:
        return Response(
            {"error": "Procedure not found"},
            status=404
        )


    request_record = Requests.objects.create(

        # actual references
        user=profile,
        procedure=procedure,

        # snapshots
        user_id_number_snapshot=profile.id_number,
        procedure_name_snapshot=procedure.procedure_name,

        created_at=timezone.now()
    )


    return Response(
        {
            "message": "Request submitted successfully",
            "request_id": request_record.request_id,
            "procedure": request_record.procedure_name_snapshot,
            "user_id_number": request_record.user_id_number_snapshot
        },
        status=201
    )

# =========================
# REQUESTS
# =========================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_request(request):

    try:
        profile = Users.objects.get(
            auth_user_id=request.user.id
        )

    except Users.DoesNotExist:
        return Response(
            {"error": "User profile not found"},
            status=404
        )

    procedure_id = request.data.get("procedure")

    if not procedure_id:
        return Response(
            {"error": "Procedure is required"},
            status=400
        )

    try:
        procedure = Procedures.objects.get(
            procedure_id=procedure_id
        )

    except Procedures.DoesNotExist:
        return Response(
            {"error": "Procedure not found"},
            status=404
        )


    request_record = Requests.objects.create(

        # actual references
        user=profile,
        procedure=procedure,

        # snapshots
        user_id_number_snapshot=profile.id_number,
        procedure_name_snapshot=procedure.procedure_name,

        created_at=timezone.now()
    )


    return Response(
        {
            "message": "Request submitted successfully",
            "request_id": request_record.request_id,
            "procedure": request_record.procedure_name_snapshot,
            "user_id_number": request_record.user_id_number_snapshot
        },
        status=201
    )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_request_document(request):

    request_id = request.data.get("request")
    document_id = request.data.get("document")


    if not request_id or not document_id:
        return Response(
            {
                "error": "Request and document are required"
            },
            status=400
        )


    try:

        request_record = Requests.objects.get(
            request_id=request_id
        )

        document = Documents.objects.get(
            document_id=document_id
        )


    except Requests.DoesNotExist:

        return Response(
            {"error": "Request not found"},
            status=404
        )


    except Documents.DoesNotExist:

        return Response(
            {"error": "Document not found"},
            status=404
        )


    request_document = RequestDocuments.objects.create(

        request=request_record,

        document=document,

        # snapshot
        document_name_snapshot=document.document_name,

        status="pending",

        created_at=timezone.now()
    )


    return Response(
        {
            "message": "Document submitted successfully",
            "request_document_id": request_document.req_doc_id,
            "document": request_document.document_name_snapshot
        },
        status=201
    )

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_request_document(request, req_doc_id):

    try:

        request_document = RequestDocuments.objects.get(
            req_doc_id=req_doc_id
        )


    except RequestDocuments.DoesNotExist:

        return Response(
            {
                "error": "Request document not found"
            },
            status=404
        )


    try:

        profile = Users.objects.get(
            auth_user_id=request.user.id
        )

    except Users.DoesNotExist:

        return Response(
            {
                "error": "User profile not found"
            },
            status=404
        )


    new_status = request.data.get("status")
    remarks = request.data.get("remarks")


    if new_status:
        request_document.status = new_status


    if remarks is not None:
        request_document.remarks = remarks


    # updater snapshot
    request_document.updated_by = profile
    request_document.updated_by_id_snapshot = profile.id_number

    request_document.updated_at = timezone.now()


    request_document.save()


    return Response(
        {
            "message": "Request document updated successfully",
            "status": request_document.status,
            "updated_by": request_document.updated_by_id_snapshot
        }
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

    if profile.role.role_id == 2:

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

# =========================
# PROCESS SCREEN
# =========================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_process_screen(request, procedure_id):

    profile = Users.objects.get(auth_user_id=request.user.id)
    role_id = getattr(profile.role, "role_id", None)

    # OFFICE ACCESS CHECK
    if role_id == 2:
        allowed = OfficeProcedures.objects.filter(
            office_id=profile.office_id,
            procedure_id=procedure_id
        ).exists()

        if not allowed:
            return Response({"error": "Not allowed"}, status=403)

    data = get_full_procedure(procedure_id)

    procedure = data["procedure"]
    steps = data["steps"]
    requirements = data["requirements"]

    categories = FaqCategories.objects.filter(
        procedure_id=procedure_id
    )

    faq_categories = []

    for category in categories:
        faqs = Faqs.objects.filter(category=category)

        faq_categories.append({
            "category_id": category.category_id,
            "category_name": category.category_name,
            "faqs": FAQSerializer(faqs, many=True).data
        })

    return Response({
        "procedure": ProcedureSerializer(procedure).data,
        "steps": ProcedureStepSerializer(steps, many=True).data,
        "requirements": requirements,
        "faq_categories": faq_categories,
    })

    # =========================
    # OFFICE ACCESS CHECK
    # =========================
    # only admins are office restricted
    if profile.role.role_id == 2:

        allowed = OfficeProcedures.objects.filter(
            office_id=profile.office_id,
            procedure_id=procedure_id
        ).exists()

        if not allowed:
            return Response(
                {"error":"Not allowed"},
                status=403
            )

    # =========================
    # LOAD PROCEDURE
    # =========================
    try:
        data = get_full_procedure(procedure_id)
    except Procedures.DoesNotExist:
        return Response(
            {"error": "Procedure not found"},
            status=404
        )

    procedure = data["procedure"]
    steps = data["steps"]
    requirements = data["requirements"]

    # =========================
    # FAQ CATEGORIES
    # =========================
    categories = (
        FaqCategories.objects
        .filter(procedure_id=procedure_id)
        .order_by("category_name")
    )

    faq_categories = []

    for category in categories:

        faqs = Faqs.objects.filter(category=category)

        faq_categories.append({
            "category_id": category.category_id,
            "category_name": category.category_name,
            "faqs": FAQSerializer(
                faqs,
                many=True
            ).data
        })

    return Response({

        "procedure":
            ProcedureSerializer(
                data["procedure"]
            ).data,

        "steps":
            ProcedureStepSerializer(
                data["steps"],
                many=True
            ).data,

        # procedure_service already converts these into dictionaries
        "requirements":
            data["requirements"],

        "faqs":
            FAQSerializer(
                data["faqs"],
                many=True
            ).data,
    })

@api_view(["GET"])
def get_procedure_documents(request, procedure_id):

    documents = (
        ProcedureDocuments.objects
        .filter(procedure_id=procedure_id)
        .select_related("document")
    )

    return Response([
        {
            "document_id": item.document.document_id,
            "document_name": item.document.document_name,
        }
        for item in documents
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
    new_student_name = data.get("student_name")
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
    # STUDENT NAME
    # =========================
    if new_student_name is not None:
        profile.student_name = new_student_name

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
        "student_name": profile.student_name,
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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_procedure(request):
    profile = Users.objects.get(auth_user_id=request.user.id)
    if getattr(profile.role, "role_id", None) != 2:
        return Response({"error": "Only office admins can create a process."}, status=403)

    data = request.data
    procedure_name = (data.get("procedure_name") or "").strip()
    if not procedure_name:
        return Response({"error": "Procedure name is required."}, status=400)

    procedure = Procedures.objects.create(
        procedure_name=procedure_name,
        description=data.get("description", ""),
        created_at=timezone.now(),
        updated_at=timezone.now(),
    )

    if profile.office_id:
        OfficeProcedures.objects.get_or_create(office_id=profile.office_id, procedure=procedure)

    for req_name in data.get("requirements", []):
        req_name = (req_name or "").strip()
        if not req_name:
            continue
        requirement, _ = Requirements.objects.get_or_create(requirement_name=req_name)
        ProcedureRequirements.objects.get_or_create(procedure=procedure, requirement=requirement)

    for step in data.get("steps", []):
        ProcedureSteps.objects.create(
            procedure=procedure,
            step_number=step.get("step_number"),
            step_description=step.get("step_description", ""),
            office_location=step.get("office_location", ""),
            reference_link=step.get("reference_link", ""),
        )

    FaqCategories.objects.create(
        category_name=(data.get("category_name") or procedure_name).strip(),
        procedure=procedure,
    )

    return Response({"message": "Process created successfully", "procedure_id": procedure.procedure_id}, status=201)

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