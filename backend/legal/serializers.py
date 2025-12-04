from rest_framework import serializers
from .models import *

class PrivacyPolicySerializer(serializers.ModelSerializer):
    class Meta:
        model = PrivacyPolicy
        fields = ['id', 'title', 'content', 'contact_email', 'contact_address', 'updated_at']

class AboutUsSerializer(serializers.ModelSerializer):
    class Meta:
        model = AboutUs
        fields = ['id', 'title', 'content', 'mission_statement', 'vision_statement', 'updated_at']