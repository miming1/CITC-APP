from rest_framework import serializers
from django.contrib.auth.models import User

from .models import (
    Notifications,
    Procedures,
    ProcedureSteps,
    ProcedureRequirements,
    ProcedureDocuments,
    RequestDocuments,
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

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notifications
        fields = [
            "notification_id",
            "message",
            "is_read",
            "created_at",
            "request",
        ]


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

class ActiveRequestSerializer(serializers.ModelSerializer):
    procedure_name = serializers.CharField(
        source="procedure.procedure_name",
        read_only=True,
    )

    student_name = serializers.CharField(
    source="user.student_name",
    read_only=True,
    )

    id_number = serializers.CharField(
    source="user.id_number",
    read_only=True,
    )

    program = serializers.CharField(
    source="user.program",
    read_only=True,
    )

    year_level = serializers.IntegerField(
    source="user.year_level",
    read_only=True,
    )

    email = serializers.EmailField(
    source="user.email",
    read_only=True,
    )

    document_name = serializers.SerializerMethodField()
    reference_code = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    remarks = serializers.SerializerMethodField()

    class Meta:
        model = Requests
        fields = [
            "request_id",
            "procedure_name",

            "student_name",
            "id_number",
            "program",
            "year_level",
            "email",

            "document_name",
            "reference_code",
            "status",
            "remarks",
            "created_at",
]

    def get_request_document(self, obj):
        return (
            RequestDocuments.objects
            .filter(request=obj)
            .select_related("document")
            .first()
        )

    def get_document_name(self, obj):
        req_doc = self.get_request_document(obj)
        return req_doc.document.document_name if req_doc else None

    def get_reference_code(self, obj):
        req_doc = self.get_request_document(obj)
        return req_doc.reference_code if req_doc else None

    def get_status(self, obj):
        req_doc = self.get_request_document(obj)
        return req_doc.status if req_doc else None

    def get_remarks(self, obj):
        req_doc = self.get_request_document(obj)
        return req_doc.remarks if req_doc else None