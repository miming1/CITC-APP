from django.contrib import admin

from .models import (
    Procedures,
    Faqs,
    FaqCategories,
    Requests,
    Users,
    Offices,
    Roles
)

admin.site.register(Procedures)
admin.site.register(Faqs)
admin.site.register(FaqCategories)
admin.site.register(Requests)
admin.site.register(Users)
admin.site.register(Offices)
admin.site.register(Roles)