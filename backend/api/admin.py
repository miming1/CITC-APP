from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone

import uuid

from .models import (
    Procedures,
    Faqs,
    FaqCategories,
    Requests,
    Users,
    Offices,
    Roles
)

from rest_framework.decorators import api_view
from rest_framework.response import Response


# =========================
# DEFAULT TABLES
# =========================

admin.site.register(Procedures)
admin.site.register(Faqs)
admin.site.register(FaqCategories)
admin.site.register(Requests)
admin.site.register(Offices)
admin.site.register(Roles)
admin.site.register(Users)


# =========================
# CUSTOM USERS ADMIN
# =========================

class UsersInline(admin.StackedInline):
    model = Users
    can_delete = False
    extra = 0

    fields = (
        'email',
        'role',
        'office',
    )


class CustomUserAdmin(UserAdmin):

    inlines = [UsersInline]

    # =========================
    # HANDLE ADMIN-CREATED USERS
    # =========================
    def save_model(self, request, obj, form, change):
        is_new = obj.pk is None
        super().save_model(request, obj, form, change)

        if is_new:
            try:
                admin_role = Roles.objects.get(role_id=2)

                Users.objects.filter(auth_user_id=obj.id).update(
                    role=admin_role
                )

            except Roles.DoesNotExist:
                pass


admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)


# =========================
# SIGNAL (ONLY CREATE PROFILE)
# =========================

@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):

    # normalize email
    email_value = instance.email.strip() if instance.email else None

    if email_value == "":
        email_value = None

    if created:

        Users.objects.get_or_create(
            auth_user_id=instance.id,
            defaults={
                "user_id": uuid.uuid4(),
                "id_number": instance.username,
                "email": email_value,
                "role": None,
                "created_at": timezone.now()
            }
        )

    else:

        try:
            profile = Users.objects.get(auth_user_id=instance.id)

            profile.email = email_value if email_value else profile.email
            profile.id_number = instance.username
            profile.save()

        except Users.DoesNotExist:
            pass