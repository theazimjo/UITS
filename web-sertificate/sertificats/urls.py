from django.urls import path

from . import views_new
from . import api_views

urlpatterns = [
    # Original HTML/ZIP generation views
    path('ks/', views_new.ks_view, name='cs'),
    path('word/', views_new.word_view, name='word'),
    path('photo/', views_new.photoshop_view, name='photo'),
    path('admin/', views_new.admin_view, name='admin'),
    path('max/', views_new.graphick_3d_max_view, name='max'),
    path('maxint/', views_new.graphick_3d_interior_view, name='max_int'),
    path('maxext/', views_new.graphick_3d_exterior_view, name='max_ext'),
    path('maxmod/', views_new.graphick_3d_modeling_view, name='max_mod'),
    path('webdes/', views_new.web_design_view, name='web_design'),
    path('webprog/', views_new.web_programming_view, name='web_programming'),
    path('py/', views_new.pyhton_backend_view, name='py'),
    path('doctor/', views_new.doctor_view, name='doctor'),
    path('verify-certificate/<str:cert_id>/', views_new.verify_certificate, name='verify_certificate'),
    path('verify-certificate/<str:cert_id>/image/', views_new.verify_certificate_image, name='verify_certificate_image'),
    path('doctors/verify-certificate/<str:cert_id>/', views_new.verify_certificate_doctors, name='verify_certificate_doctors'),
    path('doctors/verify-certificate/<str:cert_id>/image/', views_new.verify_certificate_doctors_image, name='verify_certificate_doctors_image'),

    # JSON API endpoints for UITS admin panel
    path('api/courses/', api_views.api_courses, name='api_courses'),
    path('api/certificates/', api_views.api_certificates_list, name='api_certificates_list'),
    path('api/certificates/stats/', api_views.api_stats, name='api_stats'),
    path('api/certificates/create/', api_views.api_certificate_create, name='api_certificate_create'),
    path('api/certificates/next-id/', api_views.api_next_cert_id, name='api_next_cert_id'),
    path('api/certificates/generate-bulk/', api_views.api_certificates_bulk_generate, name='api_certificates_bulk_generate'),
    path('api/certificates/preview-bulk/', api_views.api_certificates_bulk_preview, name='api_certificates_bulk_preview'),
    path('api/certificates/download-zip/', api_views.api_certificates_download_zip, name='api_certificates_download_zip'),
    path('api/certificates/<str:cert_id>/detail/', api_views.api_certificate_detail, name='api_certificate_detail'),
    path('api/certificates/<str:cert_id>/image/', api_views.api_certificate_image, name='api_certificate_image'),
    path('api/certificates/<int:pk>/delete/', api_views.api_certificate_delete, name='api_certificate_delete'),
]