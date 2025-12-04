from rest_framework import serializers
import json
from uuid import UUID
from datetime import date, datetime
from .models import *
from Jobs.serializers import JobsSerializer
from Application.models import Resume
from JobSeekerProfile.models import Education, Experience, Skill, Language

# ---------- Serializers ----------
class ResumeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resume
        fields = "__all__"

class ApplicationListSerializer(serializers.ModelSerializer):
    job = JobsSerializer(read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    jobseeker_name = serializers.CharField(source="job_seeker_profile.full_name", read_only=True)
    jobseeker_email = serializers.CharField(source="job_seeker_profile.user.email", read_only=True)
    
    class Meta:
        model=Application
        fields = ["id", "job_seeker_profile","jobseeker_email","jobseeker_name", "job","status_display", "status", "applied_at","cover_letter_text"]

class ApplicationDetailSerializer(serializers.ModelSerializer):
    job = JobsSerializer(read_only=True)
    job_title = serializers.CharField(source="job.title", read_only=True)
    employer_company = serializers.CharField(source="job.employer.business_name", read_only=True)

    class Meta:
        model = Application
        fields = "__all__"

class SaveJobsSerializer(serializers.ModelSerializer):
    job=JobsSerializer(read_only=True)
    job_id=serializers.UUIDField(write_only=True)
    is_applied = serializers.SerializerMethodField()
    class Meta:
        model=SaveJob
        fields='__all__'

    def get_is_applied(self, obj):
        user_profile = obj.profile
        if not user_profile:
            return False
        # Check if this user already applied to this job
        return Application.objects.filter(
            job=obj.job,
            job_seeker_profile=user_profile
        ).exists()

class ApplicationCreateSerializer(serializers.ModelSerializer):

    class Meta:
        model = Application
        fields = ["id", "status", "cover_letter_text"]
        read_only_fields = ["id"]

    
   