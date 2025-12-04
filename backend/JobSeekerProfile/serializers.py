from rest_framework import serializers
from Accounts.models import *
from .models import *

class JobSeekerSignInSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True)
    username = serializers.SerializerMethodField(read_only=True)
    class Meta:
        model = CustomUser
        fields = ["id", "email","username"]

    def get_username(self, obj):
        return obj.email.split('@')[0] if obj.email else None
    

class JobseekerProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email", read_only=True)
    class Meta:
        model = JobseekerProfile
        fields = '__all__' 
        read_only_fields = ('user', 'id', 'created_at', 'updated_at')

    def update(self, instance, validated_data):
        # Only replace image if a new one is uploaded
        profile_picture = validated_data.get("profile_picture", None)
        if profile_picture is None or isinstance(profile_picture, str):
            validated_data.pop("profile_picture", None)
        return super().update(instance, validated_data)


class ResumeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resume
        fields = '__all__'
        

class EducationSerializer(serializers.ModelSerializer):
    profile = serializers.PrimaryKeyRelatedField(read_only=True)
    class Meta:
        model = Education
        fields = '__all__'
        

class ExperienceSerializer(serializers.ModelSerializer):
    profile = serializers.PrimaryKeyRelatedField(read_only=True)
    class Meta:
        model = Experience
        fields = '__all__'
        

class LanguageSerializar(serializers.ModelSerializer):
    profile = serializers.PrimaryKeyRelatedField(read_only=True)
    class Meta:
        model = Language
        fields = '__all__'
        

class SkillSerializar(serializers.ModelSerializer):
    profile = serializers.PrimaryKeyRelatedField(read_only=True)
    class Meta:
        model = Skill
        fields = '__all__'


