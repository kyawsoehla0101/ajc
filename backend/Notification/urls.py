from django.urls import path
from . import views

urlpatterns = [
    path('notifications/applications/', views.application_notification_list, name='notification-list'),
    path("notifications/applications/<uuid:pk>/mark-read/",views.application_notification_mark_read, name="notification-mark-read"),
    path("notifications/applications/mark-all-read/",views.application_notification_mark_all_read, name="notification-mark-all-read"),
    path("notifications/applications/<uuid:pk>/mark-unread/",views.application_notification_mark_unread, name="notification-mark-unread"),

    path('notifications/applications/all-delete/',views.application_notification_delete_all,name="notification-all-delete"),
    path('notifications/applications/delete/<uuid:pk>/', views.application_notification_delete, name='notification-read-delete'),
    path('notifications/jobs/', views.job_notifications_list, name='job-notification-list'),  # new path for application notifications
]