from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Users

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Users.objects.create(
            auth_user_id=instance.id,
            email=instance.email,
            id_number=instance.username  # since we mapped it
        )