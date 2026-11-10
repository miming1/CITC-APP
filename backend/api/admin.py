
from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin
from django.db.models.signals import post_save
from django.dispatch import receiver

from .forms import (
    CustomUserChangeForm,
    CustomUserCreationForm,
)

from .models import (
    Procedures,
    Faqs,
    FaqCategories,
    Requests,
    Users,
    Offices,
    Roles,
)


# ======================================
# NORMAL TABLES
# ======================================

admin.site.register(Procedures)
admin.site.register(Faqs)
admin.site.register(FaqCategories)
admin.site.register(Requests)
admin.site.register(Offices)
admin.site.register(Roles)


@admin.register(Users)
class UsersAdmin(admin.ModelAdmin):

    list_display = (
        "id_number",
        "email",
        "role",
        "office",
        "auth_user",
    )

    readonly_fields = (
        "user_id",
        "created_at",
    )

    search_fields = (
        "id_number",
        "email",
        "auth_user__username",
    )


# ======================================
# USER ADMIN
# ======================================

class CustomUserAdmin(UserAdmin):

    form = CustomUserChangeForm
    add_form = CustomUserCreationForm

    # Fields displayed when editing an existing user.
    fieldsets = UserAdmin.fieldsets + (
        (
            "CITC-APP Profile",
            {
                "fields": (
                    "profile_email",
                    "profile_role",
                    "profile_office",
                )
            },
        ),
    )

    # Fields displayed when creating a new user through Django Admin.
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "username",
                    "password1",
                    "password2",
                    "profile_email",
                    "profile_role",
                    "profile_office",
                ),
            },
        ),
    )

    def save_model(self, request, obj, form, change):

        # Keep the Django account email synchronized
        # with the CITC-APP profile email.
        if not obj.is_superuser:
            profile_email = form.cleaned_data.get("profile_email")
            obj.email = (profile_email or "").strip()

        # Save the Django User first.
        # The post_save signal will create the Users profile.
        super().save_model(request, obj, form, change)

        # Superadmins do not need a CITC-APP Users profile.
        if obj.is_superuser:
            return

        # Retrieve the profile created by the signal.
        profile = Users.objects.get(auth_user=obj)

        # Assign the selected CITC-APP role and office.
        profile.email = obj.email or None
        profile.role = form.cleaned_data.get("profile_role")
        profile.office = form.cleaned_data.get("profile_office")

        profile.save()


# Replace Django's default User administration.
admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)


# ======================================
# SIGNAL
# ======================================

@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):

    # 1. Skip Django Superadmin accounts.
    # They do not require a CITC-APP Users profile.
    if instance.is_superuser:
        return

    # 2. Normalize the username and email.
    username = instance.username.strip()
    email = instance.email.strip() if instance.email else None

    if email == "":
        email = None

    # 3. Normal CITC-APP accounts must use numeric usernames.
    # The username serves as the personnel/student ID number.
    if not username.isdigit():
        raise ValueError(
            "CITC-APP application users must have a numeric username "
            "matching their ID number. Django Superadmins are exempt."
        )

    id_number = int(username)

    # 4. Create the profile if it does not exist.
    # Otherwise, update its ID number and email.
    profile, profile_created = Users.objects.get_or_create(
        auth_user=instance,
        defaults={
            "id_number": id_number,
            "email": email,
        },
    )

    if not profile_created:

        profile.id_number = id_number
        profile.email = email

        profile.save(
            update_fields=[
                "id_number",
                "email",
            ]
        )
