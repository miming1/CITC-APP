from django.db import models
from django.contrib.auth.models import User
import uuid
import datetime
from django.utils import timezone


class Documents(models.Model):
    document_id = models.AutoField(primary_key=True)
    document_name = models.CharField(unique=True, max_length=150)

    class Meta:
        managed = True
        db_table = 'documents'


class Procedures(models.Model):
    procedure_id = models.AutoField(primary_key=True)
    procedure_name = models.CharField(max_length=150)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = True
        db_table = 'procedures'


class Requirements(models.Model):
    requirement_id = models.AutoField(primary_key=True)

    procedure = models.ForeignKey(
        'Procedures',
        on_delete=models.CASCADE,
        related_name='requirements',
        db_column='procedure_id'
    )

    requirement_name = models.TextField()

    class Meta:
        managed = True
        db_table = 'requirements'

    def __str__(self):
        return self.requirement_name


class Roles(models.Model):
    role_id = models.AutoField(primary_key=True)
    role_name = models.CharField(unique=True, max_length=50)

    class Meta:
        managed = True
        db_table = 'roles'


class Offices(models.Model):
    office_id = models.AutoField(primary_key=True)
    office_name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    contact_info = models.TextField(blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'offices'

class OfficeProcedures(models.Model):
    office_procedure_id = models.AutoField(primary_key=True)

    office = models.ForeignKey(
        Offices,
        on_delete=models.CASCADE, blank=True,null=True
    )

    procedure = models.ForeignKey(
        Procedures,
        on_delete=models.CASCADE, blank=True,null=True
    )

    class Meta:
        db_table = "office_procedures"
        unique_together = ("office", "procedure")

class Users(models.Model):
    user_id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    id_number = models.BigIntegerField(unique=True)
    email = models.TextField(unique=True, blank=True, null=True)

    role = models.ForeignKey(
        Roles,
        on_delete=models.PROTECT,
        blank=True,
        null=True,
    )

    office = models.ForeignKey(
        Offices,
        on_delete=models.PROTECT,
        blank=True,
        null=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)

    auth_user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        db_column="auth_user_id",
        related_name="profile",
    )

    student_name = models.TextField(blank=True, null=True)
    year_level = models.SmallIntegerField(blank=True, null=True)
    program = models.TextField(blank=True, null=True)

    class Meta:
        db_table = "users"


class Requests(models.Model):
    request_id = models.AutoField(primary_key=True)

    user = models.ForeignKey(
        Users,
        on_delete=models.SET_NULL,
        blank=True,
        null=True
    )

    user_id_number_snapshot = models.BigIntegerField(blank=True,null=True)

    procedure = models.ForeignKey(
        Procedures,
        on_delete=models.SET_NULL,
        blank=True,
        null=True
    )

    procedure_name_snapshot = models.TextField(blank=True,null=True)

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        managed = True
        db_table = 'requests'

class FaqCategories(models.Model):

    category_id = models.AutoField(
        primary_key=True
    )

    category_name = models.CharField(
        max_length=100
    )

    procedure = models.ForeignKey(
        Procedures,
        models.CASCADE,
        blank=True,
        null=True
    )

    class Meta:
        managed = True
        db_table = 'faq_categories'


class Faqs(models.Model):
    faq_id = models.AutoField(primary_key=True)
    question = models.TextField()
    answer = models.TextField()
    category = models.ForeignKey(FaqCategories,models.CASCADE,blank=True,null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        managed = True
        db_table = 'faqs'


class Notifications(models.Model):
    notification_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(Users,on_delete=models.CASCADE,blank=True,null=True)
    message = models.TextField()
    is_read = models.BooleanField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    request = models.ForeignKey(Requests, models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'notifications'

class OtpTokens(models.Model):
    PURPOSE_SIGNUP = "signup"
    PURPOSE_RESET = "reset"

    PURPOSE_CHOICES = [
        (PURPOSE_SIGNUP, "Signup"),
        (PURPOSE_RESET, "Reset Password"),
    ]

    id = models.BigAutoField(primary_key=True)
    email = models.CharField(max_length=254)
    otp = models.CharField(max_length=6)

    purpose = models.CharField(
        max_length=10,
        choices=PURPOSE_CHOICES
    )

    pending_data = models.JSONField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    is_used = models.BooleanField(default=False)

    def is_expired(self):
        expiry_minutes = 5
        return timezone.now() > self.created_at + datetime.timedelta(minutes=expiry_minutes)

    class Meta:
        db_table = "otp_tokens"


class ProcedureDocuments(models.Model):
    pk = models.CompositePrimaryKey(
        'procedure_id',
        'document_id'
    )

    procedure = models.ForeignKey(
        Procedures,
        on_delete=models.CASCADE,
        related_name="procedure_documents",
        null=False,
        blank=False
    )

    document = models.ForeignKey(
        Documents,
        on_delete=models.CASCADE,
        null=False,
        blank=False
    )

    office = models.ForeignKey(
        Offices,
        on_delete=models.SET_NULL,
        blank=True,
        null=True
    )

    class Meta:
        db_table = 'procedure_documents'

class ProcedureSteps(models.Model):
    step_id = models.AutoField(primary_key=True)

    procedure = models.ForeignKey(
        Procedures,
        models.CASCADE,
        related_name="procedure_steps",
        blank=True,
        null=True
    )

    step_number = models.IntegerField()
    step_description = models.TextField()
    person_in_charge = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    office_location = models.CharField(
        max_length=150,
        blank=True,
        null=True
    )

    reference_link = models.TextField(
        blank=True,
        null=True
    )


    class Meta:
        managed = True
        db_table = 'procedure_steps'
        unique_together = (
            ('procedure', 'step_number'),
        )


class RequestDocuments(models.Model):
    req_doc_id = models.AutoField(primary_key=True)

    request = models.ForeignKey(
        Requests,
        on_delete=models.CASCADE, blank=True,null=True
    )

    document = models.ForeignKey(
        Documents,
        on_delete=models.CASCADE,
        blank=True,null=True
    )

    document_name_snapshot = models.TextField(blank=True,null=True)

    tracking_number = models.IntegerField(
        blank=True,
        null=True
    )

    reference_code = models.CharField(
        max_length=20,
        unique=True,
        blank=True,
        null=True
    )

    status = models.CharField(
        max_length=50,
        default="pending"
    )

    updated_by = models.ForeignKey(
        Users,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        db_column="updated_by"
    )

    updated_by_id_snapshot = models.BigIntegerField(blank=True,null=True)

    updated_at = models.DateTimeField(
        auto_now=True
    )

    remarks = models.TextField(
        blank=True,
        null=True
    )

    rejected_at = models.DateTimeField(
        blank=True,
        null=True
    )

    archived = models.BooleanField(
        default=False
    )

    class Meta:
        db_table = "request_documents"