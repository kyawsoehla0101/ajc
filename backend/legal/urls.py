from django.urls import path
from .views import *

urlpatterns = [
    path('api/privacy-policy/', privacy_policy, name='privacy-policy'),
    path('api/about-us/', about_us, name='about-us'),
]