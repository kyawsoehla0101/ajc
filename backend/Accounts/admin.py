from django.contrib import admin
from .models import *

# Register your models here.
admin.site.register(CustomUser)
admin.site.site_header  = "JobSeeker Admin"
admin.site.site_title   = "JobSeeker Admin"
admin.site.index_title  = "Dashboard"
