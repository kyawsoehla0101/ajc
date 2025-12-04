from django.contrib import admin
from .models import *
from ckeditor.widgets import CKEditorWidget
from django import forms

# Register your models here.

class AboutUsAdminForm(forms.ModelForm):
    content = forms.CharField(widget=CKEditorWidget())
    mission_statement = forms.CharField(widget=CKEditorWidget())
    vision_statement = forms.CharField(widget=CKEditorWidget())

    class Meta:
        model = AboutUs
        fields = '__all__'

class AboutUsAdmin(admin.ModelAdmin):
    form = AboutUsAdminForm
admin.site.register(PrivacyPolicy)
admin.site.register(AboutUs,AboutUsAdmin)
