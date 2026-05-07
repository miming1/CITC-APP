from django.contrib.auth.models import User
from django.contrib.auth import authenticate

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token

from django.utils import timezone
import uuid

from .models import (
    Procedures,
    ProcedureSteps,
    ProcedureRequirements,
    Faqs,
    Requests,
    Users
)

from .serializers import (
    ProcedureSerializer,
    ProcedureStepSerializer,
    ProcedureRequirementSerializer,
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

    if not id_number or not password:
        return Response(
            {"error": "id_number and password required"},
            status=400
        )

    # prevent duplicate auth user
    if User.objects.filter(username=id_number).exists():
        return Response(
            {"error": "ID already exists"},
            status=400
        )

    # create django auth user
    auth_user = User.objects.create_user(
        username=id_number,
        email=email,
        password=password
    )

    # create profile
    Users.objects.create(
        user_id=uuid.uuid4(),
        id_number=id_number,
        email=email,
        password_hash=password,
        role_id=1,  # student default
        auth_user_id=auth_user.id,
        created_at=timezone.now()
    )

    return Response(
        {"message": "User registered successfully"},
        status=201
    )


# =========================
# LOGIN (FIXED + ROLE RETURN)
# =========================
@api_view(['POST'])
def user_login(request):

    id_number = request.data.get("id_number")
    password = request.data.get("password")

    user = authenticate(
        username=str(id_number),
        password=password
    )

    if not user:
        return Response(
            {"error": "Invalid credentials"},
            status=400
        )

    token, _ = Token.objects.get_or_create(user=user)

    # get profile for role check
    try:
        profile = Users.objects.get(auth_user_id=user.id)
        role_id = profile.role_id
    except Users.DoesNotExist:
        role_id = None

    return Response({
        "token": token.key,
        "role_id": role_id,
        "id_number": id_number
    })


# =========================
# CURRENT USER
# =========================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):

    try:
        profile = Users.objects.get(auth_user_id=request.user.id)
    except Users.DoesNotExist:
        return Response({"error": "Profile not found"}, status=404)

    return Response({
        "id_number": profile.id_number,
        "email": profile.email,
        "role_id": profile.role_id,
        "office_id": profile.office_id
    })


# =========================
# PROCEDURES
# =========================
@api_view(['GET'])
def get_procedures(request):
    procedures = Procedures.objects.all()
    return Response(ProcedureSerializer(procedures, many=True).data)


@api_view(['PUT', 'PATCH'])
def update_procedure(request, pk):

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
def delete_procedure(request, pk):

    try:
        procedure = Procedures.objects.get(pk=pk)
    except Procedures.DoesNotExist:
        return Response({'error': 'Procedure not found'}, status=404)

    procedure.delete()
    return Response({'message': 'Procedure deleted'}, status=204)


# =========================
# FAQS
# =========================
@api_view(['GET'])
def get_faqs(request):
    faqs = Faqs.objects.all()
    return Response(FAQSerializer(faqs, many=True).data)

@api_view(['PUT', 'PATCH'])
def update_faq(request, pk):
    try:
        faq = Faqs.objects.get(pk=pk)
    except Faqs.DoesNotExist:
        return Response({'error': 'FAQ not found'}, status=404)

    serializer = FAQSerializer(faq, data=request.data, partial=True)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)

    return Response(serializer.errors, status=400)

@api_view(['DELETE'])
def delete_faq(request, pk):

    try:
        faq = Faqs.objects.get(pk=pk)
    except Faqs.DoesNotExist:
        return Response({'error': 'FAQ not found'}, status=404)

    faq.delete()

    return Response(
        {'message': 'FAQ deleted successfully'},
        status=204
    )

# =========================
# REQUESTS
# =========================
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_request(request):

    serializer = RequestSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)

    return Response(serializer.errors, status=400)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def track_requests(request):

    try:
        profile = Users.objects.get(auth_user_id=request.user.id)
    except Users.DoesNotExist:
        return Response({"error": "Profile not found"}, status=404)

    requests = Requests.objects.filter(user=profile)

    return Response(RequestSerializer(requests, many=True).data)


# =========================
# PROCESS SCREEN
# =========================
@api_view(['GET'])
def get_process_screen(request, procedure_id):

    try:
        data = get_full_procedure(procedure_id)
    except Exception:
        return Response({'error': 'Procedure not found'}, status=404)

    return Response({
        "procedure": ProcedureSerializer(data["procedure"]).data,
        "steps": ProcedureStepSerializer(data["steps"], many=True).data,
        "requirements": ProcedureRequirementSerializer(data["requirements"], many=True).data,
        "faqs": FAQSerializer(data["faqs"], many=True).data,
    })