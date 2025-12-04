# jobs/signals.py
from django.db import transaction
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType
from .models import Jobs
from Application.models import Application
from Notification.models import Notification  # adjust if your app name is different

# -------- Job created -> notify employer --------
@receiver(post_save, sender=Jobs)
def notify_on_job_created(sender, instance, created, **kwargs):
    if not created:
        return
    # Who to notify? employer of this job
    target_user = instance.employer.user  # Jobs.employer -> EmployerProfile.user
    # Delay until transaction commits (prevents duplicates in admin or nested saves)
    transaction.on_commit(lambda: Notification.objects.create(
        user=target_user,
        message=f"Your job '{getattr(instance, 'title', instance.id)}' was created.",
        type="job_created",
        content_type=ContentType.objects.get_for_model(Jobs),
        object_id=instance.id,
    ))

# -------- Application created -> notify employer --------
@receiver(post_save, sender=Application)
def notify_on_application_created(sender, instance, created, **kwargs):
    if not created:
        return
    employer_user = instance.job.employer.user
    transaction.on_commit(lambda: Notification.objects.create(
        user=employer_user,
        message=f"New application submitted for '{getattr(instance.job, 'title', instance.job_id)}'.",
        type="application_created",
        content_type=ContentType.objects.get_for_model(Application),
        object_id=instance.id,
    ))


# -------- Track old status before save (for status-change detection) --------
@receiver(pre_save, sender=Application)
def cache_old_status(sender, instance, **kwargs):
    if not instance.pk:
        instance._old_status = None
        return
    try:
        old = Application.objects.get(pk=instance.pk)
        instance._old_status = getattr(old, "status", None)
    except Application.DoesNotExist:
        instance._old_status = None
        
# -------- Application status changed -> notify jobseeker --------
