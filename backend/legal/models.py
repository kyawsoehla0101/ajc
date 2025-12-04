from django.db import models
from ckeditor.fields import RichTextField

class PrivacyPolicy(models.Model):
    title = models.CharField(max_length=255, default="Privacy Policy")
    content = RichTextField()
    contact_email = models.EmailField(default="support@jobseeker.com",null=True)
    contact_address = models.TextField(default="JobSeeker Inc., 123 Career Street, City, Country",null=True)
    created_at=models.DateField(auto_now_add=True,null=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class AboutUs(models.Model):
    title = models.CharField(max_length=255, default="About Us")
    content = RichTextField()
    mission_statement = RichTextField(default="To connect job seekers with their dream jobs.")
    vision_statement = RichTextField(default="To be the leading platform for job seekers worldwide.")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
