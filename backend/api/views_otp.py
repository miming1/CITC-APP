import random
import string
import re
import urllib.request
import urllib.error
import json

from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from django.conf import settings
from django.utils import timezone

from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Users, Roles, OTPToken


# ─── Allowed email domains (real providers only) ──────────────────────────────

ALLOWED_EMAIL_DOMAINS = {
    "gmail.com",
    "yahoo.com", "yahoo.co.uk", "yahoo.co.ph", "yahoo.com.ph",
    "outlook.com", "hotmail.com", "live.com", "msn.com",
    "icloud.com", "me.com", "mac.com",
    "ustp.edu.ph", "up.edu.ph", "dlsu.edu.ph", "ateneo.edu.ph",
    "mapua.edu.ph", "feu.edu.ph", "ust.edu.ph",
    "protonmail.com", "proton.me", "zoho.com",
    "aol.com", "gmx.com", "mail.com",
    "globe.com.ph", "smart.com.ph",
}


def _is_real_email(email: str) -> bool:
    try:
        domain = email.strip().lower().split("@")[1]
    except IndexError:
        return False
    return domain in ALLOWED_EMAIL_DOMAINS


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _generate_otp(length=6):
    return ''.join(random.choices(string.digits, k=length))


def _send_otp_email(to_email: str, otp: str, purpose: str):
    """
    Sends OTP via Resend HTTP API (port 443).
    """
    if purpose == OTPToken.PURPOSE_SIGNUP:
        subject = "CITC-APP - Verify Your Email"
        html_body = (
            "<div style='font-family:sans-serif;padding:24px;'>"
            "<h2 style='color:#422780;'>Email Verification</h2>"
            "<p>Your verification code for CITC Academic Procedure Portal:</p>"
            f"<div style='font-size:36px;font-weight:700;letter-spacing:8px;"
            f"color:#9B7FD4;text-align:center;padding:20px 0;'>{otp}</div>"
            f"<p style='color:#6b7280;font-size:13px;'>Expires in {getattr(settings, 'OTP_EXPIRY_MINUTES', 5)} minutes.</p>"
            "</div>"
        )
    else:
        subject = "CITC-APP - Password Reset Code"
        html_body = (
            "<div style='font-family:sans-serif;padding:24px;'>"
            "<h2 style='color:#422780;'>Password Reset</h2>"
            "<p>Your password reset code for CITC Academic Procedure Portal:</p>"
            f"<div style='font-size:36px;font-weight:700;letter-spacing:8px;"
            f"color:#9B7FD4;text-align:center;padding:20px 0;'>{otp}</div>"
            f"<p style='color:#6b7280;font-size:13px;'>Expires in {getattr(settings, 'OTP_EXPIRY_MINUTES', 5)} minutes.</p>"
            "</div>"
        )

    api_key = getattr(settings, 'RESEND_API_KEY', '').strip()
    from_email = getattr(settings, 'RESEND_FROM_EMAIL', 'onboarding@resend.dev').strip()

    if not api_key:
        raise Exception("RESEND_API_KEY is not set in environment variables.")

    payload = json.dumps({
        "from": from_email,
        "to": [to_email],
        "subject": subject,
        "html": html_body,
    }).encode("utf-8")

    req = urllib.request.Request(
        "https://api.resend.com/emails",
        data=payload,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            response_body = resp.read().decode("utf-8")
            print(f"[Resend] SUCCESS: {response_body}")
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8")
        print(f"[Resend] HTTP {e.code} ERROR: {error_body}")
        raise Exception(f"Resend API error {e.code}: {error_body}")
    except urllib.error.URLError as e:
        print(f"[Resend] URL ERROR: {e.reason}")
        raise Exception(f"Network error contacting Resend: {e.reason}")


def _invalidate_previous_otps(email: str, purpose: str):
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

    if not id_number or not email or not password:
        return Response({"error": "All fields are required."}, status=400)

    if not id_number.isdigit():
        return Response({"error": "ID Number must contain only numbers."}, status=400)

    if len(id_number) < 8 or len(id_number) > 20:
        return Response({"error": "Invalid ID Number length."}, status=400)

    if not re.match(r'\S+@\S+\.\S+', email):
        return Response({"error": "Invalid email format."}, status=400)

    if not _is_real_email(email):
        return Response(
            {"error": "Please use a real email address (e.g. Gmail, Yahoo, Outlook)."},
            status=400,
        )

    if len(password) < 8:
        return Response({"error": "Password must be at least 8 characters."}, status=400)

    if User.objects.filter(username=id_number).exists():
        return Response({"error": "ID Number already registered."}, status=400)

    if Users.objects.filter(id_number=id_number).exists():
        return Response({"error": "ID Number already registered."}, status=400)

    if Users.objects.filter(email=email).exists():
        return Response({"error": "Email already registered."}, status=400)

    otp = _generate_otp()
    _invalidate_previous_otps(email, OTPToken.PURPOSE_SIGNUP)

    OTPToken.objects.create(
        email=email,
        otp=otp,
        purpose=OTPToken.PURPOSE_SIGNUP,
        pending_data={
            "id_number": id_number,
            "email": email,
            "password": make_password(password),
        },
    )

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

    token.is_used = True
    token.save()

    pending   = token.pending_data
    id_number = str(pending["id_number"])
    email_val = pending["email"]
    hashed_pw = pending["password"]

    if User.objects.filter(username=id_number).exists():
        return Response({"error": "ID Number already registered."}, status=400)

    try:
        auth_user = User(
            username=id_number,
            email=email_val,
            password=hashed_pw,
        )
        auth_user.save()

        try:
            role_user = Roles.objects.get(role_id=1)
        except Roles.DoesNotExist:
            role_user = None

        profile = Users.objects.create(
            auth_user=auth_user,
            id_number=int(id_number),
            email=email_val,
            role=role_user,
            created_at=timezone.now()
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

    if not _is_real_email(email):
        return Response(
            {"error": "Please use a real email address (e.g. Gmail, Yahoo, Outlook)."},
            status=400,
        )

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

    try:
        profile   = Users.objects.get(email=email)
        auth_user = User.objects.get(id=profile.auth_user_id)
    except (Users.DoesNotExist, User.DoesNotExist):
        return Response({"error": "No account found for this email."}, status=404)

    auth_user.password = make_password(new_password)
    auth_user.save()

    token.is_used = True
    token.save()

    return Response({"message": "Password reset successfully."}, status=200)