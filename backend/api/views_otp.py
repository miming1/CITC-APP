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

from .models import Users, Roles, OtpTokens


# ─────────────────────────────────────────────
# EMAIL VALIDATION
# ─────────────────────────────────────────────

ALLOWED_EMAIL_DOMAINS = {
    "gmail.com",
    "yahoo.com", "yahoo.co.uk", "yahoo.co.ph", "yahoo.com.ph",
    "outlook.com", "hotmail.com", "live.com", "msn.com",
    "icloud.com", "me.com", "mac.com",
    "ustp.edu.ph", "up.edu.ph", "dlsu.edu.ph", "ateneo.edu.ph",
    "mapua.edu.ph", "feu.edu.ph", "ust.edu.ph",
    "protonmail.com", "proton.me", "zoho.com",
    "aol.com", "gmx.com",
    "globe.com.ph", "smart.com.ph",
}


def _is_real_email(email: str) -> bool:
    try:
        domain = email.strip().lower().split("@")[1]
        return domain in ALLOWED_EMAIL_DOMAINS
    except Exception:
        return False


# ─────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────

def _generate_otp(length=6):
    return ''.join(random.choices(string.digits, k=length))


def _invalidate_previous_otps(email: str, purpose: str):
    OtpTokens.objects.filter(
        email=email,
        purpose=purpose,
        is_used=False
    ).update(is_used=True)


from urllib.error import HTTPError
import urllib.request
import json

def _send_otp_email(to_email: str, otp: str, purpose: str):

    api_key = getattr(settings, 'BREVO_API_KEY', '')
    from_email = getattr(settings, 'BREVO_FROM_EMAIL', '')
    from_name = getattr(settings, 'BREVO_FROM_NAME', 'CITC App')

    if not api_key:
        raise Exception("BREVO_API_KEY not set.")

    if not from_email:
        raise Exception("BREVO_FROM_EMAIL not set.")

    subject = (
        "CITC-APP - Verify Your Email"
        if purpose == OtpTokens.PURPOSE_SIGNUP
        else "CITC-APP - Password Reset Code"
    )

    html = f"""
    <div style="font-family:sans-serif;padding:20px;">
        <h2 style="color:#422780;">CITC Verification</h2>
        <p>Your OTP code:</p>
        <div style="font-size:32px;font-weight:bold;">{otp}</div>
        <p>Expires in {getattr(settings, 'OTP_EXPIRY_MINUTES', 5)} minutes.</p>
    </div>
    """

    payload = json.dumps({
        "sender": {
            "name": from_name,
            "email": from_email
        },
        "to": [
            {
                "email": to_email
            }
        ],
        "subject": subject,
        "htmlContent": html,
    }).encode("utf-8")

    req = urllib.request.Request(
        "https://api.brevo.com/v3/smtp/email",
        data=payload,
        method="POST"
    )

    req.add_header("api-key", api_key)
    req.add_header("Content-Type", "application/json")

    print("\n========== BREVO DEBUG ==========")
    print("To:", to_email)
    print("From:", from_email)
    print("Key Start:", api_key[:15] if api_key else "EMPTY")
    print("Key Length:", len(api_key))
    print("Raw Key:", repr(api_key))
    print("=================================\n")

    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            body = resp.read().decode()

            print("\n========== BREVO SUCCESS ==========")
            print(body)
            print("===================================\n")

    except HTTPError as e:
        print("\n========== BREVO ERROR ==========")
        print("Status:", e.code)

        try:
            error_body = e.read().decode()
            print("Response:", error_body)
        except Exception as ex:
            print("Could not read error response:", ex)

        print("=================================\n")

        raise

    except Exception as e:
        print("\n========== GENERAL ERROR ==========")
        print(type(e).__name__)
        print(str(e))
        print("===================================\n")

        raise

# ─────────────────────────────────────────────
# SIGNUP OTP
# ─────────────────────────────────────────────

@api_view(['POST'])
def send_signup_otp(request):

    id_number = request.data.get("id_number", "").strip()
    email = request.data.get("email", "").strip().lower()
    password = request.data.get("password", "")

    if not id_number or not email or not password:
        return Response({"error": "All fields are required."}, status=400)

    if not id_number.isdigit():
        return Response({"error": "ID must be numeric."}, status=400)

    if len(password) < 8:
        return Response({"error": "Password too short."}, status=400)

    if not re.match(r'\S+@\S+\.\S+', email):
        return Response({"error": "Invalid email format."}, status=400)

    if not _is_real_email(email):
        return Response({"error": "Email domain not allowed."}, status=400)

    if User.objects.filter(username=id_number).exists():
        return Response({"error": "ID already exists."}, status=400)

    if Users.objects.filter(email=email).exists():
        return Response({"error": "Email already exists."}, status=400)

    otp = _generate_otp()

    _invalidate_previous_otps(email, OtpTokens.PURPOSE_SIGNUP)

    OtpTokens.objects.create(
        email=email,
        otp=otp,
        purpose=OtpTokens.PURPOSE_SIGNUP,
        pending_data={
            "id_number": id_number,
            "email": email,
            "password": make_password(password),
        },
        is_used=False
    )

    _send_otp_email(email, otp, OtpTokens.PURPOSE_SIGNUP)

    return Response({"message": "OTP sent successfully."}, status=200)


# ─────────────────────────────────────────────
# VERIFY SIGNUP OTP
# ─────────────────────────────────────────────

@api_view(['POST'])
def verify_signup_otp(request):

    email = request.data.get("email", "").strip().lower()
    otp = request.data.get("otp", "").strip()

    token = (
        OtpTokens.objects
        .filter(email=email, purpose=OtpTokens.PURPOSE_SIGNUP, is_used=False)
        .order_by('-created_at')
        .first()
    )

    if not token:
        return Response({"error": "OTP not found."}, status=400)

    if token.is_expired():
        return Response({"error": "OTP expired."}, status=400)

    if token.otp != otp:
        return Response({"error": "Invalid OTP."}, status=400)

    token.is_used = True
    token.save()

    data = token.pending_data

    auth_user = User.objects.create(
        username=data["id_number"],
        email=data["email"],
        password=data["password"],
    )

    role = Roles.objects.filter(role_id=1).first()

    # NOTE: the post_save signal in admin.py already created the Users
    # profile row for this auth_user (with role=None), the instant
    # User.objects.create() ran above. Because of that, get_or_create()
    # here would just return the existing row and silently skip
    # "defaults" — role would never actually get set. So instead we
    # fetch the row the signal made and set fields on it directly.
    profile = auth_user.profile
    profile.id_number = int(data["id_number"])
    profile.email = data["email"]
    profile.role = role
    profile.save()

    return Response({
        "message": "Account created successfully",
        "user_id": str(profile.user_id)
    }, status=201)


# ─────────────────────────────────────────────
# FORGOT PASSWORD OTP
# ─────────────────────────────────────────────

@api_view(['POST'])
def forgot_password(request):

    email = request.data.get("email", "").strip().lower()

    if not email:
        return Response({"error": "Email required."}, status=400)

    if not Users.objects.filter(email=email).exists():
        return Response({"message": "If email exists, OTP sent."}, status=200)

    otp = _generate_otp()

    _invalidate_previous_otps(email, OtpTokens.PURPOSE_RESET)

    OtpTokens.objects.create(
        email=email,
        otp=otp,
        purpose=OtpTokens.PURPOSE_RESET,
        is_used=False
    )

    _send_otp_email(email, otp, OtpTokens.PURPOSE_RESET)

    return Response({"message": "Reset OTP sent."}, status=200)


# ─────────────────────────────────────────────
# VERIFY RESET OTP
# ─────────────────────────────────────────────

@api_view(['POST'])
def verify_reset_otp(request):

    email = request.data.get("email", "").strip().lower()
    otp = request.data.get("otp", "").strip()

    token = (
        OtpTokens.objects
        .filter(email=email, purpose=OtpTokens.PURPOSE_RESET, is_used=False)
        .order_by('-created_at')
        .first()
    )

    if not token or token.is_expired():
        return Response({"error": "OTP invalid or expired."}, status=400)

    if token.otp != otp:
        return Response({"error": "Invalid OTP."}, status=400)

    return Response({"valid": True}, status=200)


# ─────────────────────────────────────────────
# RESET PASSWORD
# ─────────────────────────────────────────────

@api_view(['POST'])
def reset_password(request):

    email = request.data.get("email", "").strip().lower()
    otp = request.data.get("otp", "").strip()
    new_password = request.data.get("new_password", "")

    token = (
        OtpTokens.objects
        .filter(email=email, purpose=OtpTokens.PURPOSE_RESET, is_used=False)
        .order_by('-created_at')
        .first()
    )

    if not token or token.is_expired() or token.otp != otp:
        return Response({"error": "Invalid OTP."}, status=400)

    user = User.objects.get(email=email)
    user.password = make_password(new_password)
    user.save()

    token.is_used = True
    token.save()

    return Response({"message": "Password reset successful."}, status=200)