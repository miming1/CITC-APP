from rest_framework import serializers
from django.contrib.auth.models import User
from datetime import timedelta
from django.utils import timezone

from .models import (
    Notifications,
    Procedures,
    ProcedureSteps,
    ProcedureDocuments,
    Requirements,
    Faqs,
    FaqCategories,
    Requests,
    RequestDocuments,
    OfficeProcedures,
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
            'password': {
                'write_only': True
            }
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

    requirements = serializers.SerializerMethodField()


    class Meta:
        model = Procedures
        fields = [
            "procedure_id",
            "procedure_name",
            "description",
            "created_at",
            "updated_at",
            "requirements",
        ]


    def get_requirements(self, obj):

        data = []


        requirements = Requirements.objects.filter(
            procedure=obj
        )


        for requirement in requirements:


            is_document = ProcedureDocuments.objects.filter(
                procedure=obj,
                document__document_name__iexact=requirement.requirement_name
            ).exists()


            data.append({
                "requirement_id": requirement.requirement_id,
                "requirement_name": requirement.requirement_name,
                "is_document": is_document,
            })


        return data



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



class RequirementSerializer(serializers.ModelSerializer):

    class Meta:
        model = Requirements
        fields = [
            "requirement_id",
            "procedure",
            "requirement_name"
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

    office_name = serializers.SerializerMethodField()

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
    days_remaining = serializers.SerializerMethodField()

    class Meta:
        model = Requests
        fields = [
            "request_id",
            "procedure_name",
            "office_name",

            "student_name",
            "id_number",
            "program",
            "year_level",
            "email",

            "document_name",
            "reference_code",
            "status",
            "remarks",
            "days_remaining",
            "created_at",
        ]

    def get_request_document(self, obj):
        return (
            RequestDocuments.objects
            .filter(request=obj)
            .select_related("document")
            .first()
        )

    def get_document_name(self,obj):
        req_doc = self.get_request_document(obj)
        if not req_doc or not req_doc.document:
            return None
        return req_doc.document.document_name

    def get_reference_code(self, obj):
        req_doc = self.get_request_document(obj)
        return req_doc.reference_code if req_doc else None

    def get_status(self, obj):
        req_doc = self.get_request_document(obj)
        return req_doc.status if req_doc else None

    def get_remarks(self, obj):
        req_doc = self.get_request_document(obj)
        return req_doc.remarks if req_doc else None
        fields = [
            'request_id',
            'user',
            'procedure',
            'user_id_number_snapshot',
            'procedure_name_snapshot',
            'created_at'
        ]
    def get_days_remaining(self, obj):
        req_doc = self.get_request_document(obj)

        if not req_doc:
            return None

        if req_doc.status != "Rejected":
            return None

        if not req_doc.rejected_at:
            return None

        expiry_date = req_doc.rejected_at + timedelta(days=7)

        remaining = (expiry_date - timezone.now()).days

        return max(remaining, 0)
    
    def get_office_name(self, obj):
        office_proc = (
            OfficeProcedures.objects
            .select_related("office")
            .filter(procedure=obj.procedure)
            .first()
        )

        return office_proc.office.office_name if office_proc else None


class RequestDocumentSerializer(serializers.ModelSerializer):

    class Meta:
        model = RequestDocuments
        fields = [
            'req_doc_id',
            'request',
            'document',
            'document_name_snapshot',
            'tracking_number',
            'reference_code',
            'status',
            'updated_by',
            'updated_by_id_snapshot',
            'updated_at',
            'remarks'
        ]
