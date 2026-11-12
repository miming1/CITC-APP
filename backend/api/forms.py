
from django import forms
from django.contrib.auth.forms import (
    UserChangeForm,
    UserCreationForm,
)
from django.contrib.auth.models import User

from .models import Users, Roles, Offices


# ======================================
# USER CREATION FORM
# ======================================

class CustomUserCreationForm(UserCreationForm):

    profile_email = forms.EmailField(
        required=False,
        label="CITC-APP Email"
    )

    profile_role = forms.ModelChoiceField(
        queryset=Roles.objects.all(),
        required=False,
        label="CITC-APP Role"
    )

    profile_office = forms.ModelChoiceField(
        queryset=Offices.objects.all(),
        required=False,
        label="CITC-APP Office"
    )

    class Meta(UserCreationForm.Meta):
        model = User
        fields = (
            "username",
        )


# ======================================
# USER CHANGE FORM
# ======================================

class CustomUserChangeForm(UserChangeForm):

    profile_email = forms.EmailField(
        required=False,
        label="CITC-APP Email"
    )

    profile_role = forms.ModelChoiceField(
        queryset=Roles.objects.all(),
        required=False,
        label="CITC-APP Role"
    )

    profile_office = forms.ModelChoiceField(
        queryset=Offices.objects.all(),
        required=False,
        label="CITC-APP Office"
    )

    class Meta(UserChangeForm.Meta):
        model = User
        fields = "__all__"

    def __init__(self, *args, **kwargs):

        super().__init__(*args, **kwargs)

        try:
            profile = self.instance.profile

            self.fields["profile_email"].initial = profile.email
            self.fields["profile_role"].initial = profile.role
            self.fields["profile_office"].initial = profile.office

        except Users.DoesNotExist:
            pass
