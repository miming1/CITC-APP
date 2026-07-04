from django import forms
from django.contrib.auth.forms import UserChangeForm
from django.contrib.auth.models import User

from .models import Users, Roles, Offices


class CustomUserChangeForm(UserChangeForm):

    profile_email = forms.EmailField(
        required=False,
        label="Email"
    )

    profile_role = forms.ModelChoiceField(
        queryset=Roles.objects.all(),
        required=False,
        label="Role"
    )

    profile_office = forms.ModelChoiceField(
        queryset=Offices.objects.all(),
        required=False,
        label="Office"
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

    def save(self, commit=True):

        user = super().save(commit)

        profile, _ = Users.objects.get_or_create(
            auth_user=user,
            defaults={
                "user_id": __import__("uuid").uuid4(),
                "id_number": user.username,
            }
        )

        profile.email = self.cleaned_data["profile_email"]
        profile.role = self.cleaned_data["profile_role"]
        profile.office = self.cleaned_data["profile_office"]
        profile.id_number = user.username

        profile.save()

        return user