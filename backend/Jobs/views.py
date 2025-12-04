
from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import BasePermission,IsAuthenticated,AllowAny
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Q,F, Case, When, Value, IntegerField
from django.db.models import Count
from datetime import date
from django.db import IntegrityError
from django.db.models import (
    Q, F, Value, Func, Case, When, IntegerField, CharField
)

# import Application
from Application.models import Application
from .models import JobCategory, Jobs
from .serializers import JobCategorySerializer, JobsSerializer
from EmployerProfile.models import EmployerProfile
from django.shortcuts import get_object_or_404

# Create your views here.
# job category list
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def job_category_list(request):
    user = request.user
    if user.is_staff:  # Admin
        categories = JobCategory.objects.all().order_by('-id')
    elif hasattr(user, "role") and user.role == "employer":  # Employer
        categories = JobCategory.objects.filter(user=user).order_by('-created_at')
    else:  # Other users (e.g. job seekers) → no access
        return Response(
            {"error": "You do not have permission to view categories."},
            status=status.HTTP_403_FORBIDDEN,
        )
    serializer = JobCategorySerializer(categories, many=True)
    return Response(serializer.data)

# custom permission
class IsAdminOrEmployer(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and (request.user.is_staff or request.user.role == 'employer')
        )
    
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def job_category_create(request):
    serializer = JobCategorySerializer(
        data=request.data,
        context={"request": request}
    )
    if serializer.is_valid():
        try:
            category = serializer.save(user=request.user)
            return Response(JobCategorySerializer(category).data, status=201)
        except IntegrityError:
            return Response({
                    "error": "You already created this category name.",
                    "code": "CATEGORY_EXISTS"
                            },status=409)
    return Response(serializer.errors, status=400)



# Category Detail
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminOrEmployer])
def job_category_detail(request, pk):
    user = request.user
    if user.is_staff:  # Admin
        category = get_object_or_404(JobCategory, pk=pk)
    else:  # Employer
        category = get_object_or_404(JobCategory, pk=pk, user=user)
    serializer = JobCategorySerializer(category)
    return Response(serializer.data)

# Category Update
@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated, IsAdminOrEmployer])
def job_category_update(request, pk):
    user = request.user
    if user.is_staff:
        category = get_object_or_404(JobCategory, pk=pk)
    else:
        category = get_object_or_404(JobCategory, pk=pk, user=user)
        serializer = JobCategorySerializer(category, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Category Delete
@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsAdminOrEmployer])
def job_category_delete(request, pk):
    user = request.user
    if user.is_staff:
        category = get_object_or_404(JobCategory, pk=pk)
    else:
        category = get_object_or_404(JobCategory, pk=pk,user=user)
        category.delete()
    return Response({'message': 'Category deleted'}, status=status.HTTP_204_NO_CONTENT)

# jobs list
@api_view(['GET'])
@permission_classes([AllowAny])
def jobs_list(request):
    today = date.today()
    user = request.user
    Jobs.objects.filter(is_active=True, deadline__lt=today).update(is_active=False)
    if user.is_staff:  
        # Admin → All jobs
        jobs = Jobs.objects.all().order_by('-created_at')
    elif hasattr(user, "employerprofile"):
        # Employer → Only their own jobs
        jobs = Jobs.objects.filter(employer__user=user).order_by('-created_at')
    else:  
        jobs = Jobs.objects.filter(is_active=True).order_by('-created_at')
    serializer = JobsSerializer(jobs, many=True)
    return Response({
        "jobs":serializer.data,
    }, status=status.HTTP_200_OK)

# jobs create
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminOrEmployer])
def jobs_create(request):
    user = request.user
    # Check if user has an EmployerProfile
    try:
        employer_profile = EmployerProfile.objects.get(user=user)
    except EmployerProfile.DoesNotExist:
        return Response({'error': 'Employer profile not found'}, status=status.HTTP_404_NOT_FOUND)
    # Serializer validation
    serializer = JobsSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(employer=employer_profile)  # Automatically assign employer
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Job Detail (GET)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def jobs_detail(request, pk):
    try:
        job = Jobs.objects.get(pk=pk)
    except Jobs.DoesNotExist:
        return Response({"error": "Job not found"},status=status.HTTP_404_NOT_FOUND)
    user = request.user
    if user.is_staff:  
        serializer = JobsSerializer(job)
        return Response(serializer.data)   
    elif hasattr(user, "employerprofile") and job.employer.user == user:
        serializer = JobsSerializer(job)
        return Response(serializer.data)
    else:
        serializer = JobsSerializer(job)
        return Response(serializer.data)
    

# Job Update (PUT/PATCH)
@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated, IsAdminOrEmployer])
def jobs_update(request, pk):
    user = request.user

    # Admin = can edit all, Employer = his own job
    if user.is_staff:
        job = get_object_or_404(Jobs, pk=pk)
    else:
        job = get_object_or_404(Jobs, pk=pk, employer__user=user)

    old_max = job.max_applicants  # keep previous value

    serializer = JobsSerializer(job, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    updated_job = serializer.save()

    # ------------------------------------------
    # 🔥 AUTO REACTIVATE JOB IF MAX APPLICANTS INCREASED
    # ------------------------------------------
    total_apps = updated_job.applications.count()

    # If the new max is higher AND job is inactive → reactivate
    if updated_job.max_applicants and total_apps < updated_job.max_applicants:
        if not updated_job.is_active:
            updated_job.is_active = True
            updated_job.save(update_fields=["is_active"])

    return Response(JobsSerializer(updated_job).data, status=200)


# Job Delete (DELETE)
@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsAdminOrEmployer])
def jobs_delete(request, pk):
    user = request.user
    if user.is_staff:
        job = get_object_or_404(Jobs, pk=pk)
    else:
        job = get_object_or_404(Jobs, pk=pk, employer__user=user)
    job.delete()
    return Response({'message': 'Job deleted'}, status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search(request):
    q = (request.GET.get("q") or "").strip()
    loc = (request.GET.get("loc") or "").strip()
    today = date.today()

    # Not expired filter
    not_expired = Q(deadline__isnull=True) | Q(deadline__gte=today)

    # Base queryset
    qs = Jobs.objects.filter(is_active=True).filter(not_expired)

    # Ensure employer is joined
    qs = qs.select_related("employer")

    normalized_q = q.replace(" ", "")
    normalized_loc = loc.replace(" ", "")

    # Annotate everything we need
    qs = qs.annotate(
        title_nospace=Func(F("title"), Value(" "), Value(""), function="REPLACE", output_field=CharField()),
        location_nospace=Func(F("location"), Value(" "), Value(""), function="REPLACE", output_field=CharField()),
        category_name=F("category__name"),
        category_name_nospace=Func(F("category__name"), Value(" "), Value(""), function="REPLACE", output_field=CharField()),
        description_nospace=Func(F("description"), Value(" "), Value(""), function="REPLACE", output_field=CharField()),

        # ✔️ Annotated employer business name
        employer_business_name=F("employer__business_name"),
    )

    if q:
        qs = qs.filter(
            Q(title__icontains=q) |
            Q(location__icontains=q) |
            Q(category__name__icontains=q) |
            Q(description__icontains=q) |
            Q(title_nospace__icontains=normalized_q) |
            Q(location_nospace__icontains=normalized_q) |
            Q(category_name_nospace__icontains=normalized_q) |
            Q(description_nospace__icontains=normalized_q)
        )

    if loc:
        qs = qs.filter(
            Q(location__icontains=loc) |
            Q(location_nospace__icontains=normalized_loc)
        )

    qs = qs.annotate(
        priority_rank=Case(
            When(priority="FEATURED", then=Value(3)),
            When(priority="URGENT", then=Value(2)),
            default=Value(1),
            output_field=IntegerField(),
        )
    ).order_by("-priority_rank", "-created_at")

    # 🚨 FIXED: Use employer_business_name not employer__business_name
    data = list(
        qs.values(
            "id",
            "title",
            "location",
            "category_name",
            "employer_business_name",  # ← THE KEY FIX
            "description",
            "deadline",
            "created_at",
            "priority"
        )[:30]
    )

    return Response({
        "count": len(data),
        "results": data
    }, status=status.HTTP_200_OK)



#quck search 
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def quick_search_by_location(request):
   location=request.GET.get("city_name")
   jobs=Jobs.objects.quick_search_by_city(location)
   serializer=JobsSerializer(jobs,many=True)
   return Response({"jobs":serializer.data},status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def quick_search_by_category(request):
   category=request.GET.get("category")
   jobs=Jobs.objects.quick_search_by_category(category)
   serializer=JobsSerializer(jobs,many=True)
   return Response({"jobs":serializer.data},status=status.HTTP_200_OK)
        


