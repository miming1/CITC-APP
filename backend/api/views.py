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
    ProcedureRequirements,
    Faqs,
    Requests,
    Users,
    Roles
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


# =========================
# FAQS
# =========================
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

    # Prevent NULL answer issue
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

    except Exception:

        return Response({
            'error': 'Procedure not found'
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

        "requirements":
            ProcedureRequirementSerializer(
                data["requirements"],
                many=True
            ).data,

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

        profile = Users.objects.get(
            auth_user_id=request.user.id
        )

        auth_user = User.objects.get(
            id=request.user.id
        )

    except Users.DoesNotExist:

        return Response({
            "error": "Profile not found"
        }, status=404)

    except User.DoesNotExist:

        return Response({
            "error": "Auth user not found"
        }, status=404)

    data = request.data

    new_email = data.get("email")
    new_id_number = data.get("id_number")
    new_password = data.get("password")

    # =========================
    # UPDATE EMAIL
    # =========================
    if new_email:

        # prevent duplicate email
        if Users.objects.filter(email=new_email).exclude(
            user_id=profile.user_id
        ).exists():

            return Response({
                "error": "Email already exists"
            }, status=400)

        profile.email = new_email
        auth_user.email = new_email

    # =========================
    # UPDATE ID NUMBER
    # =========================
    if new_id_number:

        # prevent duplicate username
        if User.objects.filter(
            username=str(new_id_number)
        ).exclude(
            id=auth_user.id
        ).exists():

            return Response({
                "error": "ID Number already exists"
            }, status=400)

        profile.id_number = new_id_number
        auth_user.username = str(new_id_number)

    # =========================
    # UPDATE PASSWORD
    # =========================
    if new_password:

        auth_user.password = make_password(
            new_password
        )

    auth_user.save()
    profile.save()

    return Response({
        "message": "Profile updated successfully",
        "user_id": str(profile.user_id),
        "email": profile.email,
        "id_number": profile.id_number
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


# =========================
# OTP & PASSWORD RESET VIEWS
# =========================
OTP_STORAGE = {}

@api_view(['POST'])
def send_signup_otp(request):
    email = request.data.get("email")
    if not email:
        return Response({"error": "Email is required"}, status=400)
        
    otp_code = str(random.randint(100000, 999999))
    OTP_STORAGE[email] = otp_code
    
    try:
        connection = get_connection(
            backend=settings.EMAIL_BACKEND,
            fail_silently=False,
            timeout=3
        )
        
        send_mail(
            subject="CITC App - Your Verification OTP",
            message=f"Your verification code is: {otp_code}. It will expire shortly.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            connection=connection,
            fail_silently=False,
        )
        print(f"SUCCESS: Email sent to inbox. OTP: {otp_code}")
        return Response({"message": "OTP sent successfully to your inbox"}, status=200)
        
    except Exception as e:
        print("\n" + "="*50)
        print(f"SMTP CONNECTION BLOCKED BY HOST: {str(e)}")
        print(f"FALLBACK TESTING OTP FOR {email} ---> [ {otp_code} ]")
        print("="*50 + "\n")
        
        return Response({
            "message": "OTP generated (Testing Fallback Mode)",
            "note": "Read the code directly from your Render Console Logs"
        }, status=200)


@api_view(['POST'])
def verify_signup_otp(request):
    email = request.data.get("email")
    otp = request.data.get("otp")
    
    if OTP_STORAGE.get(email) == str(otp):
        OTP_STORAGE.pop(email, None)
        return Response({"message": "OTP verified successfully"}, status=200)
        
    return Response({"error": "Invalid or expired OTP code"}, status=400)


@api_view(['POST'])
def forgot_password(request):
    email = request.data.get("email")
    if not email:
        return Response({"error": "Email is required"}, status=400)
        
    if not User.objects.filter(email=email).exists():
        return Response({"error": "No user account found with this email"}, status=404)
        
    otp_code = str(random.randint(100000, 999999))
    OTP_STORAGE[email] = otp_code
    
    try:
        connection = get_connection(
            backend=settings.EMAIL_BACKEND,
            fail_silently=False,
            timeout=3
        )
        
        send_mail(
            subject="CITC App - Password Reset Verification Code",
            message=f"Use this OTP to reset your password: {otp_code}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            connection=connection,
            fail_silently=False,
        )
        print(f"SUCCESS: Reset email sent. OTP: {otp_code}")
        return Response({"message": "Reset verification OTP sent"}, status=200)
        
    except Exception as e:
        print("\n" + "="*50)
        print(f"SMTP CONNECTION BLOCKED BY HOST: {str(e)}")
        print(f"FALLBACK RESET OTP FOR {email} ---> [ {otp_code} ]")
        print("="*50 + "\n")
        
        return Response({
            "message": "Reset OTP generated (Testing Fallback Mode)",
            "note": "Read the code directly from your Render Console Logs"
        }, status=200)


@api_view(['POST'])
def verify_reset_otp(request):
    email = request.data.get("email")
    otp = request.data.get("otp")
    
    if OTP_STORAGE.get(email) == str(otp):
        return Response({"message": "OTP verified. You may now reset your password."}, status=200)
    return Response({"error": "Invalid verification code"}, status=400)


@api_view(['POST'])
def reset_password(request):
    email = request.data.get("email")
    otp = request.data.get("otp")
    new_password = request.data.get("password")
    
    if not email or not new_password:
        return Response({"error": "Missing parameters"}, status=400)
        
    try:
        user = User.objects.get(email=email)
        user.set_password(new_password)
        user.save()
        
        OTP_STORAGE.pop(email, None)
        return Response({"message": "Password updated successfully!"}, status=200)
    except User.DoesNotExist:
        return Response({"error": "User could not be found"}, status=404)