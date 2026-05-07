# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models

# =========================
# ROLES
# =========================

class Roles(models.Model):
    role_id = models.AutoField(primary_key=True)
    role_name = models.CharField(unique=True, max_length=50)

    class Meta:
        managed = False
        db_table = 'roles'


# =========================
# OFFICES
# =========================

class Offices(models.Model):
    office_id = models.AutoField(primary_key=True)
    office_name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    contact_info = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'offices'


# =========================
# USERS
# =========================

class Users(models.Model):
    user_id = models.UUIDField(primary_key=True)

    auth_user = models.OneToOneField(
        'AuthUser',
        models.DO_NOTHING,
        blank=True,
        null=True
    )

    id_number = models.BigIntegerField(unique=True)

    email = models.CharField(
        unique=True,
        max_length=100
    )

    password_hash = models.TextField()

    role = models.ForeignKey(
        Roles,
        models.DO_NOTHING,
        blank=True,
        null=True
    )

    office = models.ForeignKey(
        Offices,
        models.DO_NOTHING,
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        blank=True,
        null=True
    )

    class Meta:
        managed = False
        db_table = 'users'


# =========================
# PROCEDURES
# =========================

class Procedures(models.Model):
    procedure_id = models.AutoField(primary_key=True)

    procedure_name = models.CharField(
        max_length=150
    )

    description = models.TextField(
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        blank=True,
        null=True
    )

    updated_at = models.DateTimeField(
        blank=True,
        null=True
    )

    class Meta:
        managed = False
        db_table = 'procedures'


# =========================
# PROCEDURE REQUIREMENTS
# =========================

class ProcedureRequirements(models.Model):
    requirement_id = models.AutoField(primary_key=True)

    procedure = models.ForeignKey(
        Procedures,
        models.DO_NOTHING,
        blank=True,
        null=True
    )

    requirement_text = models.TextField()

    class Meta:
        managed = False
        db_table = 'procedure_requirements'

class ProcedureDocuments(models.Model):
    document_type_id = models.AutoField(primary_key=True)
    procedure = models.ForeignKey('Procedures', models.DO_NOTHING, blank=True, null=True)
    document_name = models.CharField(max_length=150)
    description = models.TextField(blank=True, null=True)
    office = models.ForeignKey(Offices, models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'procedure_documents'

# =========================
# PROCEDURE STEPS
# =========================

class ProcedureSteps(models.Model):
    step_id = models.AutoField(primary_key=True)

    procedure = models.ForeignKey(
        Procedures,
        models.DO_NOTHING,
        blank=True,
        null=True
    )

    step_number = models.IntegerField()

    step_description = models.TextField()

    office = models.ForeignKey(
        Offices,
        models.DO_NOTHING,
        blank=True,
        null=True
    )

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
        managed = False
        db_table = 'procedure_steps'
        unique_together = (('procedure', 'step_number'),)


# =========================
# FAQ CATEGORIES
# =========================

class FaqCategories(models.Model):
    category_id = models.AutoField(primary_key=True)

    category_name = models.CharField(
        max_length=100
    )

    class Meta:
        managed = False
        db_table = 'faq_categories'


# =========================
# FAQS
# =========================

class Faqs(models.Model):
    faq_id = models.AutoField(primary_key=True)

    question = models.TextField()

    answer = models.TextField()

    category = models.ForeignKey(
        FaqCategories,
        models.DO_NOTHING,
        blank=True,
        null=True
    )

    procedure = models.ForeignKey(
        Procedures,
        models.DO_NOTHING,
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        blank=True,
        null=True
    )

    class Meta:
        managed = False
        db_table = 'faqs'


# =========================
# REQUESTS
# =========================

class Requests(models.Model):
    request_id = models.AutoField(primary_key=True)

    user = models.ForeignKey(
        Users,
        models.DO_NOTHING,
        blank=True,
        null=True
    )

    procedure = models.ForeignKey(
        Procedures,
        models.DO_NOTHING,
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        blank=True,
        null=True
    )

    class Meta:
        managed = False
        db_table = 'requests'

class RequestDocuments(models.Model):
    request = models.ForeignKey('Requests', models.DO_NOTHING, blank=True, null=True)
    document_type = models.ForeignKey(ProcedureDocuments, models.DO_NOTHING, blank=True, null=True)
    file_name = models.TextField(blank=True, null=True)
    file_path = models.TextField(blank=True, null=True)
    status = models.TextField(blank=True, null=True)  # This field type is a guess.
    updated_by = models.ForeignKey('Users', models.DO_NOTHING, db_column='updated_by', blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)
    remarks = models.TextField(blank=True, null=True)
    uploaded_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'request_documents'


# =========================
# DJANGO AUTH USER
# =========================

class AuthUser(models.Model):
    password = models.CharField(max_length=128)

    last_login = models.DateTimeField(
        blank=True,
        null=True
    )

    is_superuser = models.BooleanField()

    username = models.CharField(
        unique=True,
        max_length=150
    )

    first_name = models.CharField(max_length=150)

    last_name = models.CharField(max_length=150)

    email = models.CharField(max_length=254)

    is_staff = models.BooleanField()

    is_active = models.BooleanField()

    date_joined = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'auth_user'

# =========================
# NOTIFICATIONS
# =========================

class Notifications(models.Model):
    notification_id = models.AutoField(primary_key=True)
    user = models.ForeignKey('Users', models.DO_NOTHING, blank=True, null=True)
    message = models.TextField()
    is_read = models.BooleanField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'notifications'