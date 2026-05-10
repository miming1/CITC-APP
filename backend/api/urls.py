from django.urls import path
from . import views

urlpatterns = [
    # =========================
    # AUTH
    # =========================
    path('auth/register/', views.register),
    path('auth/login/', views.user_login),
    path('auth/me/', views.me),
    #path('auth/admin', views.admin_dashboard),

    # =========================
    # PROCEDURES
    # =========================
    path('procedures/', views.get_procedures),
    path('procedures/<int:pk>/', views.update_procedure),
    path('procedures/<int:pk>/delete/', views.delete_procedure),

    # =========================
    # PROCESS SCREEN (service layer)
    # =========================
    path('process/<int:procedure_id>/', views.get_process_screen),

    # =========================
    # FAQS
    # =========================
    path('faqs/', views.get_faqs),
    path('faqs/<int:pk>/', views.update_faq),
    path('faqs/<int:pk>/delete/', views.delete_faq),
    path('faqs/create/', views.create_faq),

    # =========================
    # REQUESTS
    # =========================
    path('requests/', views.submit_request),
    path('requests/track/', views.track_requests),

    # =========================
    # PROFILE 
    # =========================
    path('auth/update-profile/', views.update_profile),

    # =========================
    # VERIFY PASSWORD 
    # =========================
    path("verify-password/", views.verify_password, name="verify-password"),

]