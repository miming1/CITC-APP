from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone

import uuid

from .forms import CustomUserChangeForm

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

    fieldsets = UserAdmin.fieldsets + (
        (
            "Profile",
            {
                "fields": (
                    "profile_email",
                    "profile_role",
                    "profile_office",
                )
            },
        ),
    )

    def save_model(self, request, obj, form, change):

        is_new = obj.pk is None

        super().save_model(request, obj, form, change)

        if is_new:

            admin_role = Roles.objects.filter(
                role_id=2
            ).first()

            Users.objects.filter(
                auth_user=obj
            ).update(
                role=admin_role
            )


admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)


# ======================================
# SIGNAL
# ======================================

@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):

    email = instance.email.strip() if instance.email else None

    if email == "":
        email = None

    if created:

        Users.objects.get_or_create(
            auth_user=instance,
            defaults={
                "user_id": uuid.uuid4(),
                "id_number": instance.username,
                "email": email,
                "created_at": timezone.now(),
            },
        )

    else:

        try:
            profile = instance.profile

            profile.id_number = instance.username

            if email:
                profile.email = email

            profile.save()

        except Users.DoesNotExist:
            pass