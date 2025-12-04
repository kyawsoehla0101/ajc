from django.db import models
from JobSeekerProfile.models import JobseekerProfile,Resume
from Jobs.models import Jobs
from django.db.models import Q
from django.core.exceptions import ValidationError
import uuid

class SaveJob(models.Model):
    id = models.UUIDField(
        primary_key=True,      # ဒီ field ကို primary key လုပ်မယ်
        default=uuid.uuid4,    # Auto-generate UUID v4
        editable=False         # User လက်နဲ့ မပြင်နိုင်အောင် lock
    )
    profile = models.ForeignKey(JobseekerProfile, on_delete=models.CASCADE,related_name='saved_jobs', null=True, blank=True)
    job = models.ForeignKey(Jobs, on_delete=models.CASCADE, null=True, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["profile", "job"],
                name="unique_save_job_per_jobseeker_job"
        )
    ]
    def __str__(self):
        return f"{self.profile} saved {self.job}"


class ApplicationManager(models.Manager):
    def applications_for_employer(self, employer):
        return self.filter(job__employer=employer)

    def submitted_applications(self,user):
        return self.filter(status="P",job__employer__user=user)
    
    def reviewed_applications(self,user):
        return self.filter(status="R",job__employer__user=user)
    
    def rejected_applications(self,user):
        return self.filter(status="RJ",job__employer__user=user)
    
    def shortlist_applications(self,user):
        return self.filter(status="SL",job__employer__user=user)
    
    def hired_applications(self,user):
        return self.filter(status="H",job__employer__user=user)
    
    def recent_applications(self,limit=2):
        return self.get_queryset().order_by('-applied_at')[:limit]
    
class Application(models.Model):
    STATUS_CHOICES = [
        ('P', 'Pending'),
        ('H', 'Hired'),
        ('RJ', 'Rejected'),
        ('R', 'Review'),
        ('SL', 'ShortList'),
        
    ]
    id = models.UUIDField(
        primary_key=True,      # ဒီ field ကို primary key လုပ်မယ်
        default=uuid.uuid4,    # Auto-generate UUID v4
        editable=False         # User လက်နဲ့ မပြင်နိုင်အောင် lock
    )
    job_seeker_profile = models.ForeignKey(JobseekerProfile,on_delete=models.CASCADE,null=True)
    job = models.ForeignKey(Jobs, on_delete=models.CASCADE,related_name='applications')
    status = models.CharField(max_length=50,choices=STATUS_CHOICES,default='P',null=True, blank=True)
    cover_letter_text = models.TextField(null=True)
    applied_at = models.DateTimeField(auto_now_add=True,null=True, blank=True)
    updated_at=models.DateTimeField(auto_now=True,null=True, blank=True)

    objects = ApplicationManager()

    def __str__(self):
        return f"{self.job_seeker_profile} applied for {self.job}"
        




