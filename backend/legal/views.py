from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from .models import *
from .serializers import *

@api_view(['GET'])
def privacy_policy(request):
    # Get all privacy policies, latest first
    policies = PrivacyPolicy.objects.all()
    serializer = PrivacyPolicySerializer(policies, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def about_us(request):
    try:
        about = AboutUs.objects.latest('updated_at')
    except AboutUs.DoesNotExist:
        return Response({"detail": "About Us information not found."}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = AboutUsSerializer(about)
    return Response(serializer.data)