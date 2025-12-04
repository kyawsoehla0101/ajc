# applications/views.py
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated,AllowAny
from rest_framework.response import Response
import datetime
from rest_framework import status
from django.shortcuts import get_object_or_404  # see below
from django.db import IntegrityError, transaction
from .models import Jobs,JobseekerProfile
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from .models import *
from Application.models import *
from Notification.models import *
from Jobs.models import *
from .serializers import *
#hello wrold

@api_view(["POST"])
@permission_classes([IsAuthenticated])
@parser_classes([JSONParser, MultiPartParser, FormParser])
def apply_job(request, job_id):
    #Get job seeker profile & job
    profile = get_object_or_404(JobseekerProfile, user=request.user)
    job = get_object_or_404(Jobs, id=job_id)
    print(job.id)
    print("Max applicants:", job.max_applicants, type(job.max_applicants))
    
    # Duplicate application check
    if Application.objects.filter(job=job, job_seeker_profile=profile).exists():
        return Response(
            {"message": "You have already applied for this job."},
            status=status.HTTP_400_BAD_REQUEST
        )

    #Max applicants null-safe check
    max_limit = getattr(job, "max_applicants", None)
    total = Application.objects.filter(job=job).count()

    # Treat 0 or None as unlimited
    if max_limit is None or max_limit <= 0:
        max_limit = None

    if max_limit is not None and total >= max_limit:
        if job.is_active:
            job.is_active = False
            job.save(update_fields=["is_active"])
        
        return Response(
        {"message": "The maximum number of applicants for this job has been reached."},
        status=status.HTTP_400_BAD_REQUEST
    )

    

    #Serialize incoming data
    serializer = ApplicationCreateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    #Create application inside a transaction
    try:
        with transaction.atomic():
            application = Application.objects.create(
                job_seeker_profile=profile,
                job=job,
                status=serializer.validated_data.get("status", "P"),
                cover_letter_text=serializer.validated_data.get("cover_letter_text", "")
            )

            #Re-count AFTER creating; close job if hitting limit
            total_after = Application.objects.filter(job=job).count()
            if max_limit is not None and total_after >= max_limit and job.is_active:
                job.is_active = False
                job.save(update_fields=["is_active"])

            s_application = ApplicationDetailSerializer(application).data
            return Response({
                "success": True,
                "message": f"You have successfully applied for the job '{job.title}'.",
                "data": s_application
            }, status=status.HTTP_201_CREATED)

    except IntegrityError:
        return Response(
            {"message": "You have already applied for this job."},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def save_job(request,job_id):
    try:
        profile=JobseekerProfile.objects.get(user=request.user)
    except JobseekerProfile.DoesNotExist:
        return Response({"detail": "Ah! You have to create profile before save job"}, status=status.HTTP_404_NOT_FOUND)
    
    try:
        job=Jobs.objects.get(id=job_id)
    except Jobs.DoesNotExist:
        return Response({"detail": "This job does not exist"}, status=status.HTTP_404_NOT_FOUND)
    try:
        save_job=SaveJob.objects.create(profile=profile,job=job)
        s_save_job=SaveJobsSerializer(save_job).data
        return Response({
            "success": True,
            "message": f"Job '{job.title}' has been saved successfully.",
            "data": s_save_job
        }, status=status.HTTP_201_CREATED)
    except IntegrityError:
        return Response({"detail": "You have already saved this job"}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET',])
@permission_classes([IsAuthenticated])
def saved_jobs(request):
    try:
        profile=JobseekerProfile.objects.get(user=request.user)
    except JobseekerProfile.DoesNotExist:
        return Response({"detail": "Ah! You have to create profile before save job"}, status=status.HTTP_404_NOT_FOUND)
    
    savejobs=SaveJob.objects.filter(profile=profile)
    s_savejobs=SaveJobsSerializer(savejobs,many=True).data
    return Response({"s_savejobs":s_savejobs})

    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def saved_job_detail(request,sj_id):
    try:
        profile=JobseekerProfile.objects.get(user=request.user)
    except JobseekerProfile.DoesNotExist:
        return Response({"detail": "Ah! You have to create profile before save job"}, status=status.HTTP_404_NOT_FOUND)
    try:
        saved_job=SaveJob.objects.get(profile=profile,id=sj_id)
    except SaveJob.DoesNotExist:
        return Response({"detail": "This job is not saved."}, status=status.HTTP_404_NOT_FOUND)
    s_saved_job=SaveJobsSerializer(saved_job).data
    return Response({"saved_job":s_saved_job})

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def saved_job_remove(request,sj_id):
    if request.method == "DELETE":
        try:
            profile=JobseekerProfile.objects.get(user=request.user)
        except JobseekerProfile.DoesNotExist:
            return Response({"detail": "Ah! You have to create profile before save job"}, status=status.HTTP_404_NOT_FOUND)
        try:
            saved_job=SaveJob.objects.get(profile=profile,id=sj_id)
        except SaveJob.DoesNotExist:
            return Response({"detail": "This job is not saved."}, status=status.HTTP_404_NOT_FOUND)
        saved_job.delete()
        return Response({"Message":f"Job {saved_job.job.title} Succssfully Remove"},status=status.HTTP_200_OK)
    else:
        return Response({"Message":"Something Wrong Please try again"})

@api_view(['GET'])
def applied_jobs(request):
    applications = Application.objects.filter(job_seeker_profile__user=request.user)
    app_job=ApplicationListSerializer(applications,many=True).data
    return Response({"apply_jobs": app_job})

@api_view(['GET'])
def applied_job_detail(request,app_id):
    application = get_object_or_404(Application,id=app_id, job_seeker_profile__user=request.user)
    app_detail=ApplicationDetailSerializer(application).data
    return Response({"application_detail": app_detail})

@api_view(['DELETE'])
def applied_job_remove(request,app_id):
    if request.method == "DELETE":
        application=get_object_or_404(Application,id=app_id,job_seeker_profile__user=request.user)
        application.delete()
        return Response({"Message":f"Job {application.job.title} Succssfully Remove"},status=status.HTTP_200_OK)
    else:
        return Response({"Message":"Something Wrong Please try again"})
    

#applications for employer dashboard
@api_view(['GET'])
def applications(request):
    employer=get_object_or_404(EmployerProfile,user=request.user)
    query=Application.objects.applications_for_employer(employer)
    applications=ApplicationListSerializer(query,many=True).data
    return Response({"applications":applications})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def application_detail(request, app_id):
    app = get_object_or_404(Application, id=app_id, job__employer__user=request.user)
    s_app = ApplicationDetailSerializer(app).data
    return Response({"s_app": s_app}, status=status.HTTP_200_OK)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def application_delete(request,app_id):
    if request.method == "DELETE":
        app = get_object_or_404(Application, id=app_id, job__employer__user=request.user)
        app.delete()
        return Response({"Message":f"{app} Delete Successfully"})
    else:
        return Response({"Message":"Something Wrong Please try again"})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def pending_applications(request):
    apps = Application.objects.submitted_applications(request.user)
    s_apps=ApplicationListSerializer(apps,many=True).data
    return Response({
        "pending_apps":s_apps,
        "count": len(s_apps)
        })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def reviewed_applications(request):
    apps = Application.objects.reviewed_applications(request.user)
    s_apps=ApplicationListSerializer(apps,many=True).data
    return Response({
        "reviewed_apps":s_apps,
        "count": len(s_apps)
        })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def rejected_applications(request):
    apps = Application.objects.rejected_applications(request.user)
    s_apps=ApplicationListSerializer(apps,many=True).data
    return Response({
        "rejected_apps":s_apps,
        "count": len(s_apps)
        })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def shortlist_applications(request):
    apps = Application.objects.shortlist_applications(request.user)
    s_apps=ApplicationListSerializer(apps,many=True).data
    return Response({
        "shorlist_apps":s_apps,
        "count": len(s_apps)
        })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def hired_applications(request):
    apps = Application.objects.hired_applications(request.user)
    s_apps=ApplicationListSerializer(apps,many=True).data
    return Response({
        "hired_apps":s_apps,
        "count": len(s_apps)
        })



@api_view(["POST"])
@permission_classes([IsAuthenticated])
def update_application_status(request, app_id):
    """
    Employer updates application status.
    Sends notification + HTML email to jobseeker
    """
    employer = getattr(request.user, "employerprofile", None)
    if not employer:
        return Response(
            {"error": "Only employers can perform this action."},
            status=status.HTTP_403_FORBIDDEN,
        )

    # Get application
    app = get_object_or_404(Application, id=app_id, job__employer=employer)

    # Extract status
    new_status = request.data.get("new_status", "")

    # Map human → codes
    STATUS_MAP = {
        "pending": "P",
        "review": "R",
        "shortlist": "SL",
        "rejected": "RJ",
        "hired": "H",
    }
    new_status = STATUS_MAP.get(str(new_status).lower(), new_status)

    # Validate
    valid_statuses = [choice[0] for choice in Application.STATUS_CHOICES]
    if new_status not in valid_statuses:
        return Response(
            {"error": "Invalid status value.", "valid_statuses": valid_statuses},
            status=status.HTTP_400_BAD_REQUEST,
        )
    
    # Allowed workflow transitions
    ALLOWED_STATUS_FLOW = {
        "P":  ["R"],
        "R":  ["SL", "RJ"],
        "SL": ["H", "RJ"],
        "H":  [],
        "RJ": []
    }

    current_status = app.status

    #  Prevent backward or invalid transitions
    if new_status not in ALLOWED_STATUS_FLOW[current_status]:
        return Response(
            {
                "error": f"Cannot move application from '{app.get_status_display()}' "
                         f"to '{dict(Application.STATUS_CHOICES).get(new_status)}'.",
                "allowed_next": ALLOWED_STATUS_FLOW[current_status]
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # Update
    app.status = new_status
    app.save()

    # Create in-app notification
    Notification.objects.create(
        user=app.job_seeker_profile.user,
        message=(
            f"Your application for '{app.job.title}' has been updated to "
            f"'{app.get_status_display()}'."
        ),
        type="application_update",
        content_type=ContentType.objects.get_for_model(app),
        object_id=app.id,
    )

    #SEND EMAIL (ENGLISH ONLY)

    jobseeker = app.job_seeker_profile.user
    recipient = jobseeker.email

    if recipient:
        status_label = app.get_status_display()
        status_class = STATUS_MAP.get(status_label, "pending")
        job_title = app.job.title
        username = app.job_seeker_profile.full_name or jobseeker.email.split("@")[0]

        frontend_url = getattr(settings, "FRONTEND_URL", "http://127.0.0.1:8000")
        application_link = f"{frontend_url}/job-search/applications/{app.id}"


        subject = f"Your application status updated to '{status_label}' for {job_title}"

        # Plain-text version
        text_content = (
            f"Hello {username},\n\n"
            f"Your application for the position '{job_title}' has been updated.\n"
            f"New status: {status_label}\n\n"
            f"View your application here:\n{application_link}\n\n"
            f"Thank you for using Arakkha Job Connect."
        )

        # Render HTML from template file
        html_content = render_to_string(
        "emails/application_status_update.html",
        {
            "username": username,
            "job_title": job_title,
            "status_label": status_label,
            "status_class": status_class, 
            "application_link": application_link,
            "year":datetime.now().year,
            
        },
    )

        email = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=getattr(settings, "DEFAULT_FROM_EMAIL", "no-reply@arakkha-job-connect.com"),
            to=[recipient],
        )
        email.attach_alternative(html_content, "text/html")
        email.send(fail_silently=True)

    return Response(
        {
            "success": True,
            "new_status": new_status,
            "message": f"Application {app.id} updated to '{new_status}'."
        },
        status=status.HTTP_200_OK,
    )

@api_view(['GET'])
def recent_applications(request):
    recent_apps=Application.objects.recent_applications()
    s_recent_apps=ApplicationListSerializer(recent_apps,many=True).data
    return Response({
        "s_recent_apps":s_recent_apps
    })

# #update application notification by status
# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def application_notification_update_status(request,app_id):
#     user=request.user
#     app=get_object_or_404(Application,id=app_id,user=user)
#     status_param=request.data.get("status","read").lower() #read or unread

#     valid_statuses = ["H", "RJ"]
#     if status_param not in valid_statuses:
#         return Response(
#             {"error": "Invalid status. Use 'H' for Hired or 'RJ' for Rejected."},
#             status=status.HTTP_400_BAD_REQUEST,
#         )   
#     app.status=status_param 
#     app.save(update_fields=["status"])
    
#     Notification.objects.create(
#         user=app.job_seeker_profile.user,
#         message=f"Your application for '{app.job.title}' has been updated to '{app.get_status_display()}'.",
#         object_id=app.id,
#         content_type=ContentType.objects.get_for_model(app)
#         )





    
