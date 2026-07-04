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
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'procedures'


class Requirements(models.Model):
    requirement_id = models.AutoField(primary_key=True)
    requirement_name = models.TextField(unique=True)

    class Meta:
        managed = True
        db_table = 'requirements'


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


class Users(models.Model):
    user_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False,)
    id_number = models.BigIntegerField(unique=True)
    email = models.TextField(unique=True, blank=True, null=True)
    role = models.ForeignKey(Roles, models.DO_NOTHING, blank=True, null=True)
    office = models.ForeignKey(Offices, models.DO_NOTHING, blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    auth_user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        db_column='auth_user_id',
        related_name='profile'
    )
    student_name = models.TextField(blank=True, null=True)
    year_level = models.SmallIntegerField(blank=True, null=True)
    program = models.TextField(blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'users'


class Requests(models.Model):
    request_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(Users, models.DO_NOTHING, blank=True, null=True)
    procedure = models.ForeignKey(Procedures, models.DO_NOTHING, blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'requests'


class FaqCategories(models.Model):
    category_id = models.AutoField(primary_key=True)
    category_name = models.CharField(max_length=100)
    procedure = models.ForeignKey(Procedures, models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'faq_categories'


class Faqs(models.Model):
    faq_id = models.AutoField(primary_key=True)
    question = models.TextField()
    answer = models.TextField()
    category = models.ForeignKey(FaqCategories, models.DO_NOTHING, blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'faqs'


class Notifications(models.Model):
    notification_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(Users, models.DO_NOTHING, blank=True, null=True)
    message = models.TextField()
    is_read = models.BooleanField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    request = models.ForeignKey(Requests, models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'notifications'


from django.db import models
from django.utils import timezone
import datetime


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

    # ✅ FIX: prevents NULL crash
    created_at = models.DateTimeField(auto_now_add=True)

    is_used = models.BooleanField(default=False)

    def is_expired(self):
        expiry_minutes = 5
        return timezone.now() > self.created_at + datetime.timedelta(minutes=expiry_minutes)

    class Meta:
        db_table = "otp_tokens"


class ProcedureDocuments(models.Model):
    pk = models.CompositePrimaryKey('procedure_id', 'document_id')
    procedure = models.ForeignKey(Procedures, models.DO_NOTHING)
    document = models.ForeignKey(Documents, models.DO_NOTHING)
    office = models.ForeignKey(Offices, models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'procedure_documents'


class ProcedureRequirements(models.Model):
    pk = models.CompositePrimaryKey('procedure_id', 'requirement_id')
    procedure = models.ForeignKey(Procedures, models.DO_NOTHING)
    requirement = models.ForeignKey(Requirements, models.DO_NOTHING)

    class Meta:
        managed = True
        db_table = 'procedure_requirements'


class ProcedureSteps(models.Model):
    step_id = models.AutoField(primary_key=True)
    procedure = models.ForeignKey(Procedures, models.DO_NOTHING, blank=True, null=True)
    step_number = models.IntegerField()
    step_description = models.TextField()
    person_in_charge = models.CharField(max_length=100, blank=True, null=True)
    office_location = models.CharField(max_length=150, blank=True, null=True)
    reference_link = models.TextField(blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'procedure_steps'
        unique_together = (('procedure', 'step_number'),)


class RequestDocuments(models.Model):
    req_doc_id = models.AutoField(primary_key=True)
    request = models.ForeignKey(Requests, models.DO_NOTHING, blank=True, null=True)
    document = models.ForeignKey(Documents, models.DO_NOTHING, blank=True, null=True)
    status = models.TextField(blank=True, null=True)
    updated_by = models.ForeignKey(Users, models.DO_NOTHING, db_column='updated_by', blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)
    remarks = models.TextField(blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'request_documents'