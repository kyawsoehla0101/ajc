from rest_framework.decorators import api_view,permission_classes,parser_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.hashers import make_password
from django.shortcuts import redirect
from django.contrib.auth import get_user_model
from .utils import send_verification_email
from django.utils.http import urlsafe_base64_decode
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth import login,logout,authenticate
from django.db import IntegrityError
from django_ratelimit.decorators import ratelimit
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import JSONParser,MultiPartParser, FormParser
from django.utils import timezone
from django.db.models import Q,F
import json
from .serializers import *
from Jobs.serializers import *
from Application.serializers import ApplicationListSerializer
#models
from Jobs.models import Jobs
from Application.models import Application
from .models import EmployerProfile
from django.db.models import Count
User = get_user_model()

# Pre-register employer (collect email & password)
@api_view(['POST'])
def preregister_employer(request):
    serializer = EmployerPreRegisterSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        # Save temporarily in session (like original code)
        request.session['user_email'] = email
        request.session['user_password'] = password
        # Instead of redirect, return JSON response
        return Response(
            {
                "message": "Pre-registration successful",
                "next": "registeremployerpage",# frontend can redirect
                "role": "employer",
                "email": email
            },
            status=status.HTTP_200_OK
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
# Complete registration (collect profile info)


@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser])
def register_employer(request, role):
    data = request.data.copy()
    # --- Parse profile JSON ---
    profile_str = data.get("profile")
    if profile_str:
        try:
            profile_data = json.loads(profile_str)
        except json.JSONDecodeError:
            return Response({"profile": ["Invalid JSON format."]}, status=400)
    else:
        profile_data = {}
    logo_file = request.FILES.get("logo")
    serializer = EmployerRegisterSerializer(
        data={"profile": profile_data, "logo": logo_file}
    )
    serializer.is_valid(raise_exception=True)
    # Fetch from session
    email = request.session.get("user_email")
    raw_password = request.session.get("user_password")

    if not email or not raw_password:
        return Response(
            {"error": "Your session has expired. Please start registration again."},
            status=400
        )
    #Friendly User Exists Check
    if User.objects.filter(email=email).exists():
        return Response(
            {
                "error": "This email is already registered. Try logging in instead.",
                "code": "EMAIL_EXISTS",
            },
            status=409
        )

    #EmployerProfile Exists Check
    # (must check via user__email, not contact_email)
    if EmployerProfile.objects.filter(user__email=email).exists():
        return Response(
            {
                "error": "An employer profile already exists for this email.",
                "code": "PROFILE_EXISTS",
            },
            status=409
        )

    #Create User safely
    user = User.objects.create(
        email=email,
        role=role,
        is_active=False,
        is_verified=False,
    )
    user.set_password(raw_password)
    user.save()

    #Create Employer Profile
    profile_data = serializer.validated_data["profile"]
    logo = serializer.validated_data.get("logo")
    employer_profile = EmployerProfile.objects.create(
        user=user, logo=logo, **profile_data
    )

    # Login + send email
    login(request, user)
    send_verification_email(request, user)
    request.session["pending_activation"] = True
    return Response(
        {
            "message": "Employer registered successfully. Verification email sent.",
            "profile": {
                "id": str(employer_profile.id),
                "business_name": employer_profile.business_name,
                "city": employer_profile.city,
                "phone": employer_profile.phone,
                "logo": (
                    request.build_absolute_uri(employer_profile.logo.url)
                    if employer_profile.logo else None
                ),
            },
        },
        status=201
    )
# end register employerprofile

#sign in employer
@ratelimit(key='ip', rate='5/m', block=False)
@api_view(["POST"])
def login_employer(request):
    if getattr(request, 'limited', False):
        response = Response(
            {"detail": "Too many employer login attempts. Please wait one minute."},
            status=status.HTTP_429_TOO_MANY_REQUESTS
        )
        response['Retry-After'] = '60'
        return response
    email = request.data.get("email")
    password = request.data.get("password")
    user = authenticate(request, email=email, password=password)
    if user is not None:
        if not user.is_verified:
            return Response({"detail": "Please verify your email first."}, status=403)
        login(request, user)
        return Response({"detail": "Login successful"}, status=200)
    return Response({"detail": "Invalid credentials"}, status=400)

#end sign in employer

#sign out employer
@api_view(["POST"])
def logout_employer(request):
    logout(request)
    return Response({"detail": "Logged out successfully"}, status=status.HTTP_200_OK)
#end sign out employer

# employer Email verification
@api_view(["GET"])
def emailverify_employer(request, uidb64, token):
    try:
        uid = urlsafe_base64_decode(uidb64).decode()
        user = User.objects.get(pk=uid)
    except (User.DoesNotExist, ValueError, TypeError, OverflowError):
        user = None
    if user is not None and default_token_generator.check_token(user,token):
        if not user.is_active:
            user.is_active = True
            user.is_verified=True
            user.save()
        return redirect("/employer/dashboard")
    else:
        return Response(
            {"error": "Verification link is invalid or expired."},
            status=status.HTTP_400_BAD_REQUEST
        )
#end email verify

#resend verification email
@ratelimit(key='ip', rate='2/m', block=False)
@api_view(["POST"])
@permission_classes([AllowAny])  # not logged in — fine
def resend_verification(request):
    if getattr(request, 'limited', False):
        response = Response(
            {"detail": "Too many resend attempts. Please wait one minute."},
            status=status.HTTP_429_TOO_MANY_REQUESTS
        )
        response['Retry-After'] = '60'
        return response    
    email = (request.session.get("user_email") or "").strip()
    if not email:
        email = (request.data.get("email") or "").strip()
    if not email:
        return Response({"detail": "Email required."}, status=status.HTTP_400_BAD_REQUEST)
    try:
        user = User.objects.get(email__iexact=email)
    except User.DoesNotExist:
        return Response({"detail": "If your account exists, we sent a verification email."}, status=200)
    if getattr(user, "is_verified", False):
        return Response({"detail": "Your email is already verified."}, status=200)
    send_verification_email(request, user)
    return Response({"detail": "Verification email sent."}, status=200)
#end resend email verification link

#dashboard
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard(request):
    today=timezone.localdate()
    user=request.user
    total_jobs=Jobs.objects.filter(employer__user=user).count()
    total_applications=Application.objects.filter(job__employer__user=user).count()
    active_jobs=Jobs.objects.filter(Q(employer__user=user)&Q(deadline__gte=today) | Q(deadline__isnull=True)).count()
    expired_jobs=Jobs.objects.filter(Q(employer__user=user)&Q(deadline__lt=today)).count()
    
    return Response({
        'total_jobs':total_jobs,
        'total_applications':total_applications,
        'active_jobs':active_jobs,
        'expired_jobs':expired_jobs

        })
#end dashboard
    
#employer profile
@api_view(["GET", "PUT", "PATCH"])
@permission_classes([IsAuthenticated])
def employer_profile(request):
    user=request.user
    employer_profile=EmployerProfile.objects.filter(user=user)
    employer_profile=EmployerProfileSerializer(employer_profile,many=True).data
    return Response({
        "employer_profile":employer_profile
    })
#end employer profile

#start update employer profile
@api_view(["GET", "PATCH", "PUT"])
@permission_classes([IsAuthenticated])
@parser_classes([JSONParser, MultiPartParser, FormParser])
def update_employer_profile(request, pk):
    try:
        profile = EmployerProfile.objects.get(id=pk, user=request.user)
    except EmployerProfile.DoesNotExist:
        return Response(
            {"error": "Employer profile not found."},
            status=status.HTTP_404_NOT_FOUND
        )
    if request.method == "GET":
        serializer = EmployerProfileSerializer(profile)   # normal read serializer
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    # For PUT/PATCH
    partial = request.method == "PATCH"
    serializer = EmployerUpdateProfileSerializer(   # use update serializer here
        instance=profile,
        data=request.data,
        partial=partial
    )
    if serializer.is_valid():
        employer=serializer.save()
        profile.refresh_from_db()  # reload to be sure
        return Response(
            {
                "message": "Employer profile updated successfully.",
                "employer_profile": EmployerProfileSerializer(profile).data  # return with read serializer
            },
            status=status.HTTP_200_OK
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#end update employer profile

#start company list
@api_view(['GET'])
def company_list(request):
    companies_q = EmployerProfile.objects.annotate(job_count=Count("jobs"))
    companies_s=CompanySerializer(companies_q,many=True).data
    return Response({
        "companies":companies_s
    })
#end

#start jobs in company
@api_view(['GET'])
def jobs_in_company(request,com_id):
    company=EmployerProfile.objects.filter(id=com_id)
    if not company:
        return Response({"error":"Company not found"},status=status.HTTP_404_NOT_FOUND)
    jobs_in_com=Jobs.objects.filter(employer__id=com_id)
    jobs_in_com_s=JobcompanySerializer(jobs_in_com,many=True).data
    company_s=CompanySerializer(company,many=True).data
    return Response({"company_s":company_s,"jobs_in_com_s":jobs_in_com_s})
#end

#company serach
@api_view(['GET'])
def company_search(request):
    query=request.GET.get('q','')
    companies=EmployerProfile.objects.filter(business_name__icontains=query)
    companies_s=CompanySerializer(companies,many=True).data
    return Response({
        "companies":companies_s
    })

# #job search in employer dashboard
# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def job_filter_by_status(request):
#     user = request.user
#     status_param = request.GET.get('status', '').lower()
#     jobs = Jobs.objects.filter(employer__user=user)

#     if status_param == 'active':
#         jobs = jobs.filter(is_active=True)

#     elif status_param == 'closed':
#         jobs = jobs.annotate(
#             current_applicants=Count('applications')
#         ).filter(current_applicants__gte=F('max_applicants'))
    
#     elif status_param == 'expired':
#         today = timezone.localdate()
#         jobs = jobs.filter(deadline__lt=today)
    
#     else:
#         return Response({"error": "Invalid status"}, status=400)

#     jobs = jobs.order_by('-created_at')
#     return Response({
#         "jobs": JobcompanySerializer(jobs, many=True).data
#     })

#end job search in employer dashboard

# #application filter by status
# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def application_filter_by_status(request):
#     user = request.user
#     status_param = request.GET.get('status', '').lower()
#     applications = Application.objects.filter(job__employer__user=user)

#     if status_param == 'pending':
#         applications = applications.filter(status='P')

#     elif status_param == 'accepted':
#         applications = applications.filter(status='H')
    
#     elif status_param == 'rejected':
#         applications = applications.filter(status='RJ')
    
#     elif status_param == 'reviewed':
#         applications = applications.filter(status='R')

#     elif status_param == 'shortlist':
#         applications = applications.filter(status='SL')
    
#     else:
#         return Response({"error": "Invalid status"}, status=400)

#     applications = applications.order_by('-applied_at')
#     return Response({
#         "applications": ApplicationListSerializer(applications, many=True).data
#     })







