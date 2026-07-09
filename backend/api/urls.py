from django.urls import path
from . import views, views_otp
from .views import NotificationListView
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
    path('process/<int:procedure_id>/save/', views.save_full_process),
    path('process/create/', views.create_full_process),

    # =========================
    # PROCESS SCREEN (service layer)
    # =========================
    path('process/<int:procedure_id>/', views.get_process_screen),
    path('process/<int:procedure_id>/documents/', views.get_procedure_documents),

    # =========================
    # FAQS
    # =========================
    path('faq-categories/', views.get_faq_categories),
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
    path("notifications/",NotificationListView.as_view(),name="notifications"),

    # =========================
    # VERIFY PASSWORD 
    # =========================
    path("verify-password/", views.verify_password, name="verify-password"),
    
    # =========================
    # OTP-BASED AUTH (signup + forgot password)
    # =========================
    path('auth/send-signup-otp/', views_otp.send_signup_otp),
    path('auth/verify-signup-otp/', views_otp.verify_signup_otp),
    path('auth/forgot-password/', views_otp.forgot_password),
    path('auth/verify-otp/', views_otp.verify_reset_otp),
    path('auth/reset-password/', views_otp.reset_password),

]