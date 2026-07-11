from rest_framework import serializers
from django.contrib.auth.models import User

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
        fields = [
            'request_id',
            'user',
            'procedure',
            'user_id_number_snapshot',
            'procedure_name_snapshot',
            'created_at'
        ]



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