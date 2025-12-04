from django.shortcuts import render

# Create your views here.
from django.shortcuts import render

def frontend(request, path=None):
    """
    Serve the React index.html file for any non-API route.
    """
    return render(request, 'frontend/index.html')