
from django.contrib import admin
from django.urls import path,re_path,include
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.auth import views as auth_views
from Notification.admin_views import (
    admin_notifications_page,
    admin_notifications_count,
    admin_notifications_mark_read,
    admin_notification_mark_unread,
    admin_notifications_mark_all,
    admin_notification_delete,
    admin_notification_detail
)
from UI import views

urlpatterns = [
    #app urls
    path('admin/notifications/', admin.site.admin_view(admin_notifications_page), name='admin-notifications'),
    path('admin/notifications-count/', admin.site.admin_view(admin_notifications_count), name='admin-notifications-count'),
    path("admin/notifications/<uuid:pk>/", admin.site.admin_view(admin_notification_detail), name="admin-notification-detail"),
    path('admin/notifications/<uuid:pk>/mark-read/', admin.site.admin_view(admin_notifications_mark_read), name='admin-notifications-mark-read'),
    path("admin/notifications/<uuid:pk>/unread/",admin.site.admin_view(admin_notification_mark_unread), name="admin-notifications-unread"),
    path("admin/notifications/<uuid:pk>/delete/", admin.site.admin_view(admin_notification_delete), name="admin-notifications-delete"),
    path('admin/notifications/mark-all/', admin.site.admin_view(admin_notifications_mark_all), name='admin-notifications-mark-all'),
    path("admin/logout/",auth_views.LogoutView.as_view(next_page="/admin/login/"),name="admin_logout"),
    
    path('admin/', admin.site.urls),
    path('accounts-jobseeker/',include('JobSeekerProfile.urls')),
    path('accounts-employer/',include('EmployerProfile.urls')),
    path('job/',include('Jobs.urls')),
    path('notifications/',include('Notification.urls')),
    path('application/',include('Application.urls')),
    path('accounts/',include('Accounts.urls')),
    path('legal/',include('legal.urls')),
    
    #allauth and dj-rest-auth
    path("auth/", include("dj_rest_auth.urls")),
    path("auth/registration/", include("dj_rest_auth.registration.urls")),
    path("auth/social/", include("allauth.socialaccount.urls")),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

#frontend
urlpatterns += [
    re_path(r'^(?:.*)/?$', views.frontend)
]