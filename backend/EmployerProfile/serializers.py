from rest_framework import serializers
from Accounts.models import *
from .models import EmployerProfile
from Jobs.models import Jobs


class EmployerPreRegisterSerializer(serializers.Serializer):
    email = serializers.EmailField(
        max_length=254,
        required=True
    )
    password = serializers.CharField(
        write_only=True,
        min_length=6,
        required=True,
        style={'input_type': 'password'}  # makes browsable API show as password
    )


class EmployerProfileSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=True)
    class Meta:
        model = EmployerProfile
        fields = ["id", "first_name", "last_name", "business_name","logo", "city","phone", "size", "website", "industry", "founded_year", "contact_email", "description",]

class EmployerRegisterSerializer(serializers.Serializer):
    # Only validate profile input
    profile = EmployerProfileSerializer(write_only=True)
    logo = serializers.ImageField(required=False,allow_null=True)

class EmployerUpdateProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model=EmployerProfile
        fields=["first_name", "last_name", "business_name", "city","logo","phone", "size", "website", "industry", "founded_year", "contact_email", "description",]
        read_only_fields = ["user"]

class CompanySerializer(serializers.ModelSerializer):
    job_count = serializers.IntegerField(read_only=True)
    class Meta:
        model=EmployerProfile
        fields=['id','first_name','last_name','business_name','city','phone','size','website','industry','logo','founded_year','contact_email','job_count', 'description',]

class JobcompanySerializer(serializers.ModelSerializer):
    
    class Meta:
        model=Jobs
        fields='__all__'

    