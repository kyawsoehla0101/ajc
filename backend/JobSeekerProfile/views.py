# Create your views here.
from rest_framework.decorators import api_view, permission_classes, throttle_classes,parser_classes
from rest_framework.parsers import MultiPartParser, FormParser,JSONParser
from rest_framework.permissions import IsAuthenticated,AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework.throttling import ScopedRateThrottle
from django.db import IntegrityError
from django.utils.crypto import get_random_string
from .serializers import *
from .utils import send_verification_code
from django.contrib.auth import get_user_model,login,logout
from Accounts.models import CustomUser
from django.views.decorators.csrf import csrf_exempt
from django_ratelimit.decorators import ratelimit
from datetime import datetime, timedelta
from django.utils import timezone
from django.conf import settings
from django.shortcuts import get_object_or_404
User = get_user_model()


@api_view(['POST'])
@permission_classes([AllowAny])
@ratelimit(key='ip', rate='5/m', block=False, method='POST')
def signin_jobseeker(request, role):
    # Rate limit check
    if getattr(request, 'limited', False):
        return Response(
            {"error": "Too many attempts, please wait one minute before trying again."},
            status=status.HTTP_429_TOO_MANY_REQUESTS
        )

    serializer = JobSeekerSignInSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    email = serializer.validated_data.get('email')
    if not email:
        return Response({"error": "Please enter your email."},
                        status=status.HTTP_400_BAD_REQUEST)
    
    # Create or get the user
    user, created = CustomUser.objects.get_or_create(
        email=email.lower(),
        defaults={
            "role": role,
            "is_active": True,
        }
    )
    if not user.is_active:
        return Response(
            {"error": "Your account is not active. Please contact support."},
            status=status.HTTP_403_FORBIDDEN
        )

    # Send OTP
    try:
        code = send_verification_code(user)
        print("OTP:", code)
    except Exception as e:
        print("Email Error:", e)
        return Response(
            {"error": "Failed to send verification code."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    # Save OTP session
    request.session['verification_code'] = code
    request.session['email'] = user.email
    request.session['user_id'] = str(user.id)
    request.session['otp_created_at'] = timezone.now().isoformat()
    message = (
        "Account created and verification code sent to "
        if created else
        "Verification code sent to "
    ) + user.email
    return Response(
        {
            "message": message,
            "user": {
                "id": str(user.id),
                "email": user.email,
                "role": user.role,
                "username": user.email.split('@')[0]
            }
        },
        status=status.HTTP_200_OK
    )

# job-seeker-signin-end

#job-seeker-email-verify 
@api_view(['POST'])
@ratelimit(key='ip', rate='5/m', block=False, method='POST')
def otp_verify_jobseeker(request):
    """
    Verifies jobseeker email using OTP stored in session.
    Automatically logs user in after successful verification.
    """

    # 1. Rate limit check
    if getattr(request, 'limited', False):
        return Response(
            {"detail": "Too many attempts. Try again in 1 minute."},
            status=status.HTTP_429_TOO_MANY_REQUESTS
        )

    # 2. Get OTP and session values
    input_code = str(request.data.get('code', '')).strip()
    session_code = str(request.session.get('verification_code', '')).strip()
    user_id = request.session.get('user_id')

    # Debug (optional)
    print("Submitted:", input_code, "Stored:", session_code, "UserID:", user_id)

    # 3. Check session existence
    if not session_code or not user_id:
        return Response(
            {"error": "Verification session expired. Please request a new code."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # 4. Validate OTP
    if input_code != session_code:
        return Response(
            {"error": "Invalid verification code."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # 5. Verify user and activate
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response(
            {"error": "User not found."},
            status=status.HTTP_404_NOT_FOUND
        )

    # 6. Mark user as verified
    user.is_verified = True
    user.save(update_fields=['is_verified'])

    # 7. Auto login
    login(request, user, backend='django.contrib.auth.backends.ModelBackend')

    # 8. Cleanup session
    request.session.pop('verification_code', None)
    request.session.pop('user_id', None)
    request.session.modified = True

    return Response(
        {
            "message": "Email verified successfully!",
            "session_key": request.session.session_key,
        },
        status=status.HTTP_200_OK
    )

# end job-seeker-email-verify

@api_view(['POST'])
@permission_classes([AllowAny])
@ratelimit(key='ip', rate='5/m', block=False, method='POST')   # use the scoped rate above
def otp_resend_jobseeker(request):
    """
    Resend the email verification code for jobseeker login.
    Priority for email source:
      1) session['email'] (from signin)
      2) request.data['email'] (fallback)
    Regenerates a code, overwrites session, and sends email again.
    """
    # 1) resolve email
    email = (request.session.get('email') or request.data.get('email') or "").strip().lower()
    if not email:
        return Response({"error": "Email required."}, status=status.HTTP_400_BAD_REQUEST)

    # 2) make sure user exists (you’re using CustomUser)
    try:
        user = CustomUser.objects.get(email__iexact=email)
    except CustomUser.DoesNotExist:
        # privacy-preserving: don't reveal account existence
        return Response({"message": "If your account exists, a code has been sent."},
                        status=status.HTTP_200_OK)

    # 3) (re)generate + send code
    try:
        code = send_verification_code(email)   # your existing util
    except Exception:
        return Response({"error": "Failed to send verification code."},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # 4) refresh session values
    request.session['verification_code'] = code
    request.session['email'] = email
    request.session['user_id'] = str(user.id)

    return Response(
        {"message": "Verification code resent.", "cooldown_seconds": 60},
        status=status.HTTP_200_OK
    )

def sigout_jobseeker(request):
    logout(request)
    return Response({"message": "Logged out successfully"},status=status.HTTP_200_OK)

    
@api_view(['GET'])
@permission_classes([AllowAny])
def current_user(request):
    u = request.user
    # if user not logged in or doesn't exist, return default safe response
    if not u or u.is_anonymous:
        return Response({
            "id": None,
            "email": None,
            "role": None,
            "is_verified": False,
            "username": None,
        }, status=200)

    # if user exists, return actual info
    return Response({
        "id": str(u.id),
        "email": u.email,
        "role": getattr(u, "role", None),
        "is_verified": getattr(u, "is_verified", False),
        "username": u.email.split("@")[0] if u.email else None,
    }, status=200)

#start jobseekerprofile
# Create + Read (List)
@api_view(['GET', 'POST'])
@parser_classes([ MultiPartParser, FormParser])
@permission_classes([IsAuthenticated])
def jobseekerprofile(request):

    if request.method == 'GET':   # READ all
        jobseekerprofiles = JobseekerProfile.objects.filter(user=request.user)
        serializer = JobseekerProfileSerializer(jobseekerprofiles,many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
         # CREATE
        serializer = JobseekerProfileSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Read (Single) + Update + Delete
@api_view(['GET', 'PUT'])
@parser_classes([ MultiPartParser, FormParser])
def jobseekerprofile_update(request, jp_id):
    try:
        jobseekerprofile = JobseekerProfile.objects.get(pk=jp_id)
    except JobseekerProfile.DoesNotExist:
        return Response({"error": "JobseekerProfile not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':   # READ one
        serializer = JobseekerProfileSerializer(jobseekerprofile)
        return Response(serializer.data)

    elif request.method == 'PUT':   # UPDATE
        serializer = JobseekerProfileSerializer(jobseekerprofile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#end jobseekerprofile

   
# Create + Read (skill-List)
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def skill_list(request):
    profile_id = request.query_params.get("profile")

    if request.method == 'GET':   # READ all
        if profile_id:
            skills = Skill.objects.filter(profile_id=profile_id)
        else:
            skills = Skill.objects.filter(profile__user=request.user)
        serializer = SkillSerializar(skills, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':   # CREATE
        try:
            profile = JobseekerProfile.objects.get(user=request.user)
        except JobseekerProfile.DoesNotExist:
            return Response({"error": "Profile not found"}, status=status.HTTP_400_BAD_REQUEST)

        serializer = SkillSerializar(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save(profile=profile)   # ✅ attach profile, not user
            return Response({"Message": "Skill Successfully Created", "data": serializer.data}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Read (Single) skill + Update + Delete
@api_view(['GET', 'PUT', 'DELETE'])
def skill_detail(request, s_id):
    try:
        skill = Skill.objects.get(profile__user=request.user,pk=s_id)
    except Skill.DoesNotExist:
        return Response({"error": "Skill not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':   # READ one
        serializer = SkillSerializar(skill)
        return Response(serializer.data)

    elif request.method == 'PUT':   # UPDATE
        serializer = SkillSerializar(skill, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':   # DELETE
        skill.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
#end skills

# Create + Read (List)
@api_view(['GET', 'POST'])
def education_list(request):
    profile_id = request.query_params.get("profile") 
    
    if request.method == 'GET':   # READ all
        if profile_id:
            educations = Education.objects.filter(profile_id=profile_id)
        else:
            educations = Education.objects.filter(profile__user=request.user)
        serializer = EducationSerializer(educations, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':   # CREATE
        try:
            profile = JobseekerProfile.objects.get(user=request.user)
        except JobseekerProfile.DoesNotExist:
            return Response({"error": "Profile not found"}, status=status.HTTP_400_BAD_REQUEST)

        serializer = EducationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(profile=profile)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


#Read (Single) + Update + Delete
@api_view(['GET', 'PUT', 'DELETE'])
def education_detail(request, e_id):
    try:
        education = Education.objects.get(profile__user=request.user,pk=e_id)
    except Education.DoesNotExist:
        return Response({"error": "Education not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':   # READ one
        serializer = EducationSerializer(education)
        return Response(serializer.data)

    elif request.method == 'PUT':   # UPDATE
        serializer = EducationSerializer(education, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':   # DELETE
        education.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

#end Education

#start Experience 
# Create + Read (List)
@api_view(['GET', 'POST'])
def experience_list(request):
    profile_id = request.query_params.get("profile")

    if request.method == 'GET':   # READ all
        if profile_id:
            experiences = Experience.objects.filter(profile_id=profile_id)
        else:
            experiences = Experience.objects.filter(profile__user=request.user)
        serializer = ExperienceSerializer(experiences, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':   # CREATE
        try:
            profile = JobseekerProfile.objects.get(user=request.user)
        except JobseekerProfile.DoesNotExist:
            return Response({"error": "Profile not found"}, status=status.HTTP_400_BAD_REQUEST)
        serializer = ExperienceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(profile=profile)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Read (Single) + Update + Delete
@api_view(['GET', 'PUT', 'DELETE'])
def experience_detail(request, ex_id):
    try:
        experience = Experience.objects.get(profile__user=request.user,pk=ex_id)
    except Experience.DoesNotExist:
        return Response({"error": "Experience not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':   # READ one
        serializer = ExperienceSerializer(experience)
        return Response(serializer.data)

    elif request.method == 'PUT':   # UPDATE
        serializer = ExperienceSerializer(experience, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':   # DELETE
        experience.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

#end experience

#start Language
# Create + Read (List)
@api_view(['GET', 'POST'])
def language_list(request):
    profile_id = request.query_params.get("profile")

    if request.method == 'GET':   # READ all
        if profile_id:
            languages = Language.objects.filter(profile_id=profile_id)
        else:
            languages = Language.objects.filter(profile__user=request.user)
        serializer = LanguageSerializar(languages, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':   # CREATE
        try:
            profile = JobseekerProfile.objects.get(user=request.user)
        except JobseekerProfile.DoesNotExist:
            return Response({"error": "Profile not found"}, status=status.HTTP_400_BAD_REQUEST)
        serializer = ExperienceSerializer(data=request.data)
        serializer = LanguageSerializar(data=request.data)
        if serializer.is_valid():
            serializer.save(profile=profile)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Read (Single) + Update + Delete
@api_view(['GET', 'PUT', 'DELETE'])
def language_detail(request, l_id):
    try:
        language = Language.objects.get(profile__user=request.user,pk=l_id)
    except Language.DoesNotExist:
        return Response({"error": "Language not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':   # READ one
        serializer = LanguageSerializar(language)
        return Response(serializer.data)

    elif request.method == 'PUT':   # UPDATE
        serializer = LanguageSerializar(language, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':   # DELETE
        language.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# end Language

#start Resume
# Create + Read (List)
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser, JSONParser]) 
def resume_list(request):
    profile=get_object_or_404(JobseekerProfile,user=request.user)
    if request.method == 'GET':   # READ all
        resumes = Resume.objects.filter(profile=profile).order_by("-created_at")
        serializer = ResumeSerializer(resumes, many=True, context={"request": request})
        return Response(serializer.data)

    elif request.method == 'POST':   # CREATE
        serializer = ResumeSerializer(data=request.data,context={"request": request, "profile": profile})
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(ResumeSerializer(serializer, context={"request": request}).data, status=status.HTTP_201_CREATED)


# Read (Single) + Update + Delete
@api_view(['GET', 'PUT', 'DELETE'])
@parser_classes([MultiPartParser, FormParser, JSONParser]) 
def resume_detail(request,r_id):
    try:
        resume = Resume.objects.get(id=r_id)
    except Resume.DoesNotExist:
        return Response({"error": "Resume not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':   # READ one
        serializer = ResumeSerializer(resume)
        return Response(serializer.data)

    elif request.method == 'PUT':   # UPDATE
        serializer = ResumeSerializer(resume, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':   # DELETE
        resume.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

