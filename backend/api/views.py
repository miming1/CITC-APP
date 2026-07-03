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
    Procedures,
    ProcedureSteps,
    Requirements,
    ProcedureRequirements,
    FaqCategories,
    Faqs,
    Requests,
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
def get_procedures(request):

    procedures = Procedures.objects.all()

    return Response(
        ProcedureSerializer(
            procedures,
            many=True
        ).data
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
# FAQS
# =========================
@api_view(["GET"])
def get_faq_categories(request):

    categories = FaqCategories.objects.all()

    return Response(
        FAQCategorySerializer(
            categories,
            many=True
        ).data
    )

@api_view(['GET'])
def get_faqs(request):

    faqs = Faqs.objects.all()

    return Response(
        FAQSerializer(
            faqs,
            many=True
        ).data
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

    serializer = RequestSerializer(data=request.data)

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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def track_requests(request):

    try:

        profile = Users.objects.get(
            auth_user_id=request.user.id
        )

    except Users.DoesNotExist:

        return Response({
            "error": "Profile not found"
        }, status=404)

    requests = Requests.objects.filter(
        user=profile
    )

    return Response(
        RequestSerializer(
            requests,
            many=True
        ).data
    )


# =========================
# PROCESS SCREEN
# =========================
@api_view(['GET'])
def get_process_screen(request, procedure_id):

    try:
        data = get_full_procedure(procedure_id)

    except Procedures.DoesNotExist:
        return Response({
            "error": "Procedure not found"
        }, status=404)

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

    password = request.data.get("password")

    user = request.user

    if user.check_password(password):

        return Response({
            "valid": True
        })

    return Response({
        "valid": False
    }, status=400)


