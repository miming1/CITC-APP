from rest_framework import serializers
from django.contrib.auth.models import User

from .models import (
    Procedures,
    ProcedureSteps,
    ProcedureRequirements,
    ProcedureDocuments,
    Faqs,
    FaqCategories,
    Requests,
    Roles,
    Users
)

# =========================
# AUTH / USERS
# =========================

class AuthUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class AppUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = Users
        fields = '__all__'


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Roles
        fields = '__all__'


# =========================
# PROCEDURE SYSTEM
# =========================

class ProcedureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Procedures
        fields = '__all__'


class ProcedureStepSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProcedureSteps
        fields = [
            'step_id',
            'step_number',
            'step_description',
            'office_location',
            'reference_link'
        ]


class ProcedureRequirementSerializer(serializers.ModelSerializer):
    requirement_text = serializers.CharField(
        source='requirement.requirement_name',
        read_only=True
    )

    class Meta:
        model = ProcedureRequirements
        fields = [
            'requirement_id',
            'requirement_text'
        ]


class ProcedureDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProcedureDocuments
        fields = '__all__'


# =========================
# FAQ SYSTEM
# =========================

class FAQCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = FaqCategories
        fields = '__all__'


class FAQSerializer(serializers.ModelSerializer):
    class Meta:
        model = Faqs
        fields = '__all__'


# =========================
# REQUEST SYSTEM
# =========================

class RequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Requests
        fields = '__all__'