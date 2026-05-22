import random
import string
import re

from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone

from rest_framework.decorators import api_view
from rest_framework.response import Response

# Imported directly from your main models file where OTPToken added
from .models import Users, Roles, OTPToken


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _generate_otp(length=6):
    return ''.join(random.choices(string.digits, k=length))


def _send_otp_email(to_email: str, otp: str, purpose: str):
    if purpose == OTPToken.PURPOSE_SIGNUP:
        subject = "CITC-APP — Verify Your Email"
        body = (
            f"Hello,\n\n"
            f"Your email verification code for CITC Academic Procedure Portal is:\n\n"
            f"    {otp}\n\n"
            f"This code expires in {getattr(settings, 'OTP_EXPIRY_MINUTES', 10)} minutes.\n"
            f"If you did not request this, please ignore this message.\n\n"
            f"— CITC Team"
        )
    else:
        subject = "CITC-APP — Password Reset OTP"
        body = (
            f"Hello,\n\n"
            f"Your password reset code for CITC Academic Procedure Portal is:\n\n"
            f"    {otp}\n\n"
            f"This code expires in {getattr(settings, 'OTP_EXPIRY_MINUTES', 10)} minutes.\n"
            f"If you did not request this, please ignore this message.\n\n"
            f"— CITC Team"
        )

    send_mail(
        subject=subject,
        message=body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[to_email],
        fail_silently=False,
    )


def _invalidate_previous_otps(email: str, purpose: str):
    """Mark all previous unused OTPs for this email+purpose as used."""
    OTPToken.objects.filter(
        email=email,
        purpose=purpose,
        is_used=False,
    ).update(is_used=True)


# ─── SIGNUP FLOW ──────────────────────────────────────────────────────────────

@api_view(['POST'])
def send_signup_otp(request):
 
    id_number = request.data.get("id_number", "").strip()
    email     = request.data.get("email", "").strip().lower()
    password  = request.data.get("password", "")

    # ── Basic validation ──────────────────────────────────────────────────────
    if not id_number or not email or not password:
        return Response({"error": "All fields are required."}, status=400)

    if not id_number.isdigit():
        return Response({"error": "ID Number must contain only numbers."}, status=400)

    if len(id_number) < 8 or len(id_number) > 20:
        return Response({"error": "Invalid ID Number length."}, status=400)

    if not re.match(r'\S+@\S+\.\S+', email):
        return Response({"error": "Invalid email format."}, status=400)

    if len(password) < 8:
        return Response({"error": "Password must be at least 8 characters."}, status=400)

    # ── Duplicate checks ──────────────────────────────────────────────────────
    if User.objects.filter(username=id_number).exists():
        return Response({"error": "ID Number already registered."}, status=400)

    if Users.objects.filter(id_number=id_number).exists():
        return Response({"error": "ID Number already registered."}, status=400)

    if Users.objects.filter(email=email).exists():
        return Response({"error": "Email already registered."}, status=400)

    # ── Create OTP ────────────────────────────────────────────────────────────
    otp = _generate_otp()
    _invalidate_previous_otps(email, OTPToken.PURPOSE_SIGNUP)

    OTPToken.objects.create(
        email=email,
        otp=otp,
        purpose=OTPToken.PURPOSE_SIGNUP,
        pending_data={
            "id_number": id_number,
            "email": email,
            "password": make_password(password),  # store hashed
        },
    )

    # ── Send email ────────────────────────────────────────────────────────────
    try:
        _send_otp_email(email, otp, OTPToken.PURPOSE_SIGNUP)
    except Exception as e:
        return Response(
            {"error": f"Failed to send email: {str(e)}"},
            status=500,
        )

    return Response({"message": "OTP sent to your email address."}, status=200)


@api_view(['POST'])
def verify_signup_otp(request):
   
    email = request.data.get("email", "").strip().lower()
    otp   = request.data.get("otp", "").strip()

    if not email or not otp:
        return Response({"error": "Email and OTP are required."}, status=400)

    # ── Find latest unused OTP ────────────────────────────────────────────────
    token = (
        OTPToken.objects
        .filter(email=email, purpose=OTPToken.PURPOSE_SIGNUP, is_used=False)
        .order_by('-created_at')
        .first()
    )

    if not token:
        return Response({"error": "No pending OTP found. Please request a new one."}, status=400)

    if token.is_expired():
        return Response({"error": "OTP has expired. Please request a new one."}, status=400)

    if token.otp != otp:
        return Response({"error": "Invalid OTP."}, status=400)

    # ── Mark used ─────────────────────────────────────────────────────────────
    token.is_used = True
    token.save()

    # ── Create user ───────────────────────────────────────────────────────────
    pending = token.pending_data
    id_number = str(pending["id_number"])
    email_val = pending["email"]
    hashed_pw = pending["password"]

    # Guard against duplicate if the user somehow slipped through
    if User.objects.filter(username=id_number).exists():
        return Response({"error": "ID Number already registered."}, status=400)
    
    try:
        # 1. Create the Django Auth User
        auth_user = User(
            username=id_number,
            email=email_val,
            password=hashed_pw,
        )
        auth_user.save()

        # 2. Fetch the Student Role (role_id=1)
        try:
            role_user = Roles.objects.get(role_id=1)
        except Roles.DoesNotExist:
            role_user = None

        # 3. EXPLICITLY CREATE THE CITC PROFILE ROW
        profile = Users.objects.create(
            auth_user=auth_user,
            id_number=int(id_number),
            email=email_val,
            role=role_user,
            created_at=timezone.now()  # Sets the initial signup timestamp
        )

        return Response({
            "message": "Account created successfully.",
            "user_id": str(profile.user_id),
            "role_id": profile.role.role_id if profile.role else None,
        }, status=201)

    except Exception as e:
        return Response({"error": str(e)}, status=500)

# ─── FORGOT PASSWORD FLOW ─────────────────────────────────────────────────────

@api_view(['POST'])
def forgot_password(request):
   
    email = request.data.get("email", "").strip().lower()

    if not email:
        return Response({"error": "Email is required."}, status=400)

    # Only send if account actually exists
    user_exists = Users.objects.filter(email=email).exists()

    if user_exists:
        otp = _generate_otp()
        _invalidate_previous_otps(email, OTPToken.PURPOSE_RESET)

        OTPToken.objects.create(
            email=email,
            otp=otp,
            purpose=OTPToken.PURPOSE_RESET,
        )

        try:
            _send_otp_email(email, otp, OTPToken.PURPOSE_RESET)
        except Exception as e:
            return Response(
                {"error": f"Failed to send email: {str(e)}"},
                status=500,
            )

    # Always return 200 so attackers can't enumerate registered emails
    return Response(
        {"message": "If that email is registered, an OTP has been sent."},
        status=200,
    )


@api_view(['POST'])
def verify_reset_otp(request):
   
    email = request.data.get("email", "").strip().lower()
    otp   = request.data.get("otp", "").strip()

    if not email or not otp:
        return Response({"error": "Email and OTP are required."}, status=400)

    token = (
        OTPToken.objects
        .filter(email=email, purpose=OTPToken.PURPOSE_RESET, is_used=False)
        .order_by('-created_at')
        .first()
    )

    if not token:
        return Response({"error": "No pending OTP found. Please request a new one."}, status=400)

    if token.is_expired():
        return Response({"error": "OTP has expired. Please request a new one."}, status=400)

    if token.otp != otp:
        return Response({"error": "Invalid OTP."}, status=400)

    # Don't mark used yet — the user still needs to set the new password
    return Response({"valid": True}, status=200)


@api_view(['POST'])
def reset_password(request):
   
    email        = request.data.get("email", "").strip().lower()
    otp          = request.data.get("otp", "").strip()
    new_password = request.data.get("new_password", "")

    if not email or not otp or not new_password:
        return Response({"error": "All fields are required."}, status=400)

    if len(new_password) < 8:
        return Response({"error": "Password must be at least 8 characters."}, status=400)

    token = (
        OTPToken.objects
        .filter(email=email, purpose=OTPToken.PURPOSE_RESET, is_used=False)
        .order_by('-created_at')
        .first()
    )

    if not token or token.is_expired() or token.otp != otp:
        return Response({"error": "Invalid or expired OTP."}, status=400)

    # Find the user and update password
    try:
        profile   = Users.objects.get(email=email)
        auth_user = User.objects.get(id=profile.auth_user_id)
    except (Users.DoesNotExist, User.DoesNotExist):
        return Response({"error": "No account found for this email."}, status=404)

    auth_user.password = make_password(new_password)
    auth_user.save()

    # Mark OTP as used
    token.is_used = True
    token.save()

    return Response({"message": "Password reset successfully."}, status=200)