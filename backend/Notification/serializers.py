# serializers.py
from rest_framework import serializers
from .models import Notification
from Jobs.models import *
from Application.models import *

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'  # id, user, message, type, is_read, created_at
        read_only_fields = ('id', 'user', 'created_at')  # Auto-generated fields


class JobsSerializer(serializers.ModelSerializer):
    class Meta:
        model=Jobs
        fields='__all__'
