from django.shortcuts import render
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated,IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from .models import Notification
from Application.models import *
from Jobs.models import *
from .serializers import NotificationSerializer
from django.contrib.contenttypes.models import ContentType
from django.db.models import Q


from rest_framework.permissions import AllowAny

@api_view(['GET'])
@permission_classes([AllowAny])
def application_notification_list(request):
    """
    Return job application notifications for employer user.
    If no user, no employer, or no notifications → return empty data safely.
    """
    user = request.user

    # 1️⃣ Handle case: no logged-in user
    if not user or user.is_anonymous:
        return Response({
            "counts": {"total": 0, "read": 0, "unread": 0},
            "all_list": [],
            "read_list": [],
            "unread_list": [],
        }, status=200)

    # 2️⃣ Handle case: not an employer or no such user
    if getattr(user, "role", None) != "employer":
        return Response({
            "counts": {"total": 0, "read": 0, "unread": 0},
            "all_list": [],
            "read_list": [],
            "unread_list": [],
        }, status=200)

    # 3️⃣ Normal case: employer exists → load notifications
    ct_app = ContentType.objects.get_for_model(Application, for_concrete_model=False)
    base_qs = (
        Notification.objects
        .filter(user=user, user__role="employer", content_type=ct_app)
        .select_related('content_type')
        .order_by('-created_at')
    )

    total_count = base_qs.count()
    read_count = base_qs.filter(is_read=True).count()
    unread_count = total_count - read_count

    read_notifications = base_qs.filter(is_read=True)
    unread_notifications = base_qs.filter(is_read=False)

    all_ser = NotificationSerializer(base_qs, many=True, context={'request': request})
    read_ser = NotificationSerializer(read_notifications, many=True, context={'request': request})
    unread_ser = NotificationSerializer(unread_notifications, many=True, context={'request': request})

    return Response({
        "counts": {
            "total": total_count,
            "read": read_count,
            "unread": unread_count,
        },
        "all_list": all_ser.data,
        "read_list": read_ser.data,
        "unread_list": unread_ser.data,
    }, status=200)


#notification read list 
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def application_notification_mark_read(request,pk):
    user=request.user
    noti=Notification.objects.get(user=user,pk=pk)
    noti.is_read=True
    noti.save(update_fields=["is_read"])
    return Response({"detail": f"Notification {pk} marked as read."}, status=status.HTTP_200_OK)
#end

#notificaton all_read list
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def application_notification_mark_all_read(request):
      user=request.user
      ct_app=ContentType.objects.get_for_model(Notification,for_concrete_model=False)
      all_noti=Notification.objects.filter(content_type=ct_app,user=user)
      all_noti.is_read=True
      all_noti.save(update_fields=["is_read"])
      return Response({"detail": f"Notification {all_noti} marked as read."}, status=status.HTTP_200_OK)
#end

#notification unread list
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def application_notification_mark_unread(request,pk):
     user=request.user
     noti=Notification.objects.get(user=user,pk=pk)
     noti.is_read=False
     noti.save(update_fields=["is_read"])
     return Response({"detail": f"Notification {pk} marked as unread."}, status=status.HTTP_200_OK)
#end

#delete application notification read list
@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def application_notification_delete(request, pk):
    """
    Delete a specific Application notification for the logged-in user.
    Returns a friendly message with the deleted notification's message.
    """
    user = request.user
    ct_app = ContentType.objects.get_for_model(Application, for_concrete_model=False)
    qs = Notification.objects.filter(user=user, content_type=ct_app, pk=pk)
    if not qs.exists():
        return Response(
            {"message": "Notification not found."},
            status=status.HTTP_404_NOT_FOUND,
        )
    # Capture message before delete
    notif_message = qs.values_list("message", flat=True).first()
    # Delete it
    qs.delete()
    return Response(
        {"message": f"'{notif_message}' notification deleted."},
        status=status.HTTP_200_OK,
    )
#end

@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def application_notification_delete_all(request):
    """
    Delete the logged-in user's Application notifications.
    Show how many and which ones were deleted.
    """
    user = request.user
    status_param = (request.GET.get("status") or "read").lower()   # read | all | unread
    ct_app = ContentType.objects.get_for_model(Application, for_concrete_model=False)
    qs = Notification.objects.filter(user=user, content_type=ct_app)
    if status_param == "read":
        qs = qs.filter(is_read=True)
    elif status_param == "unread":
        qs = qs.filter(is_read=False)
    deleted_notifications = list(
        qs.values("message")
    )
    deleted_count = len(deleted_notifications)
    # Perform delete
    qs.delete()

    return Response(
        {
            "message": f"Successfully deleted {deleted_count} application notifications.",
            "status_filter": status_param,
            "deleted_count": deleted_count,
            "deleted_items": deleted_notifications,
        },
        status=status.HTTP_200_OK,
    )

#end


#job notification list api
@api_view(['GET'])  
@permission_classes([IsAuthenticated])
@permission_classes([IsAdminUser])
def job_notifications_list(request):
    """
    Admin: list ONLY Job-related notifications (site-wide).
    """
    ct_jobs = ContentType.objects.get_for_model(Jobs, for_concrete_model=False)
    qs = (Notification.objects
          .filter(content_type=ct_jobs)
        #   .select_related('content_type')
          .order_by('-created_at'))
    serializer = NotificationSerializer(qs, many=True)
    return Response(serializer.data)
