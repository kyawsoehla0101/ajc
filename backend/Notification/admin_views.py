# Notification/adminviews.py
from django.contrib.admin.views.decorators import staff_member_required
from django.core.paginator import Paginator
from django.contrib import admin, messages
from django.http import JsonResponse, HttpResponseBadRequest, HttpResponseRedirect
from django.shortcuts import render, redirect, get_object_or_404
from django.utils import timezone
from django.urls import reverse
from django.views.decorators.http import require_POST
from django.contrib.contenttypes.models import ContentType
from django.template.response import TemplateResponse
from django.utils.http import urlencode, url_has_allowed_host_and_scheme

from .models import Notification
from Jobs.models import Jobs  # adjust if different app/model name


def _safe_next(request, default_name="admin-notifications"):
    """
    Returns a safe absolute/relative URL to redirect back to.
    Prefers POST 'next', then GET 'next'; falls back to the list route.
    """
    nxt = request.POST.get("next") or request.GET.get("next")
    if nxt and url_has_allowed_host_and_scheme(nxt, allowed_hosts={request.get_host()}):
        return nxt
    return reverse(default_name)


def _fmt_dt(dt):
    if not dt:
        return None
    try:
        dt = timezone.localtime(dt)
    except Exception:
        pass
    return dt.strftime("%b %d, %Y, %I:%M %p")


def _list_url(status_filter=None, page=None):
    """
    Build the notifications list URL with optional status/page query.
    """
    base = reverse("admin-notifications")
    q = {}
    if status_filter:
        q["status"] = status_filter
    if page:
        q["page"] = page
    if q:
        return f"{base}?{urlencode(q)}"
    return base


@staff_member_required
def admin_notifications_page(request):
    """
    Renders the notifications list. Also handles bulk actions via POST:
    - action=bulk_delete  -> delete selected notifications
    - action=bulk_mark_read -> mark selected notifications as read
    """
    status_filter = request.GET.get("status") or request.POST.get("status") or "unread"
    page_number = request.GET.get("page") or request.POST.get("page") or 1

    # Handle bulk actions
    if request.method == "POST":
        action = request.POST.get("action")
        ids = request.POST.getlist("ids")

        if not ids:
            messages.warning(request, "Please select at least one notification.")
            return redirect(_list_url(status_filter, page_number))

        qs = Notification.objects.filter(id__in=ids)

        if action == "bulk_delete":
            count = qs.count()
            qs.delete()
            messages.success(request, f"Deleted {count} notification(s).")
            return redirect(_list_url(status_filter, None))  # after delete, go to page 1

        elif action == "bulk_mark_read":
            count = qs.update(is_read=True)
            messages.success(request, f"Marked {count} notification(s) as read.")
            return redirect(_list_url(status_filter, page_number))

        else:
            messages.error(request, "Unknown action.")
            return redirect(_list_url(status_filter, page_number))

    # GET flow: render list
    ct_jobs = ContentType.objects.get_for_model(Jobs, for_concrete_model=False)
    qs = (
        Notification.objects
        .filter(content_type=ct_jobs)
        .select_related("content_type", "user")
        .order_by("-created_at")
    )
    if status_filter == "unread":
        qs = qs.filter(is_read=False)

    page_obj = Paginator(qs, 5).get_page(page_number)
    unread_count = Notification.objects.filter(content_type=ct_jobs, is_read=False).count()

    ctx = {
        **admin.site.each_context(request),  # required for admin sidebar
        "page_obj": page_obj,
        "status_filter": status_filter,
        "unread_count": unread_count,
    }
    return render(request, "admin/notifications_page.html", ctx)


@staff_member_required
@require_POST
def admin_notifications_mark_read(request, pk):
    """
    Mark a single notification as read, then redirect back.
    """
    try:
        notif = Notification.objects.get(pk=pk)
    except Notification.DoesNotExist:
        return HttpResponseBadRequest("Invalid notification")
    if not notif.is_read:
        notif.is_read = True
        notif.save(update_fields=["is_read"])
    return HttpResponseRedirect(request.META.get("HTTP_REFERER", reverse("admin-notifications")))


@staff_member_required
@require_POST
def admin_notification_mark_unread(request, pk):
    n = get_object_or_404(Notification, pk=pk)
    if n.is_read:
        n.is_read = False
        n.save(update_fields=["is_read"])
    return redirect(_safe_next(request))


@staff_member_required
@require_POST
def admin_notifications_mark_all(request):
    """
    Mark all Job notifications as read (respects 'status' filter on current tab).
    """
    status_filter = request.POST.get("status", "unread")
    ct_jobs = ContentType.objects.get_for_model(Jobs, for_concrete_model=False)
    qs = Notification.objects.filter(content_type=ct_jobs)
    if status_filter == "unread":
        qs = qs.filter(is_read=False)
    qs.update(is_read=True)
    return HttpResponseRedirect(request.META.get("HTTP_REFERER", reverse("admin-notifications")))


@staff_member_required
def admin_notifications_count(request):
    ct_jobs = ContentType.objects.get_for_model(Jobs, for_concrete_model=False)
    unread = Notification.objects.filter(content_type=ct_jobs, is_read=False).count()
    return JsonResponse({"unread": unread})


def _admin_change_url_for(obj):
    """Return admin change URL for any model instance, or None."""
    try:
        opts = obj._meta
        return reverse(f"admin:{opts.app_label}_{opts.model_name}_change", args=[obj.pk])
    except Exception:
        return None


@staff_member_required
def admin_notification_detail(request, pk):
    noti = get_object_or_404(Notification.objects.select_related("user"), pk=pk)

    # Resolve job if this notification is about a Job
    job = None
    job_admin_url = None
    if noti.content_type == ContentType.objects.get_for_model(Jobs):
        job = Jobs.objects.filter(pk=noti.object_id).select_related("employer", "employer__user").first()
        if job:
            job_admin_url = reverse(
                f"admin:{job._meta.app_label}_{job._meta.model_name}_change",
                args=[job.pk]
            )

    # Build a SAFE list of (label, value) rows for the template
    job_info = []
    if job:
        # Title
        if hasattr(job, "title"):
            job_info.append(("Title", job.title))

        # Employer (+ email if available)
        employer_txt = None
        if hasattr(job, "employer") and job.employer:
            employer_txt = str(job.employer)
            try:
                if getattr(job.employer, "user", None) and getattr(job.employer.user, "email", None):
                    employer_txt += f" ({job.employer.user.email})"
            except Exception:
                pass
        if employer_txt:
            job_info.append(("Employer", employer_txt))

        # Location
        if hasattr(job, "location") and getattr(job, "location"):
            job_info.append(("Location", job.location))

        # Type
        job_type_txt = None
        if hasattr(job, "get_job_type_display"):
            try:
                job_type_txt = job.get_job_type_display()
            except Exception:
                job_type_txt = None
        if not job_type_txt and hasattr(job, "job_type"):
            job_type_txt = getattr(job, "job_type")
        if job_type_txt:
            job_info.append(("Type", job_type_txt))

        # Salary range
        s_min = getattr(job, "salary_min", None)
        s_max = getattr(job, "salary_max", None)
        if s_min is not None or s_max is not None:
            if s_min is not None and s_max is not None:
                salary_txt = f"{s_min} – {s_max}"
            else:
                salary_txt = f"{s_min if s_min is not None else s_max}"
            job_info.append(("Salary", salary_txt))

        # Deadline
        if hasattr(job, "deadline") and getattr(job, "deadline", None):
            job_info.append(("Deadline", _fmt_dt(job.deadline)))

        # Status
        status_txt = None
        if hasattr(job, "get_status_display"):
            try:
                status_txt = job.get_status_display()
            except Exception:
                status_txt = None
        if not status_txt and hasattr(job, "status"):
            status_txt = getattr(job, "status")
        if status_txt:
            job_info.append(("Status", status_txt))

        # Created
        created_val = getattr(job, "created_at", None) or getattr(job, "created", None)
        if created_val:
            job_info.append(("Created", _fmt_dt(created_val)))

    # Related object admin URL (if any)
    related = getattr(noti, "content_object", None)
    related_admin_url = None
    if related:
        try:
            related_admin_url = reverse(
                f"admin:{related._meta.app_label}_{related._meta.model_name}_change",
                args=[related.pk]
            )
        except Exception:
            related_admin_url = None

    ctx = {
        "notification": noti,
        "related": related,
        "related_admin_url": related_admin_url,
        "back_query": request.GET.urlencode(),
        "job": job,
        "job_admin_url": job_admin_url,
        "job_info": job_info,
    }
    ctx.update(admin.site.each_context(request))
    ctx["available_apps"] = admin.site.get_app_list(request)
    return TemplateResponse(request, "admin/notification_detail.html", ctx)


@staff_member_required
def admin_notification_delete(request, pk):
    noti = get_object_or_404(Notification, pk=pk)
    noti.delete()
    messages.success(request, "Notification deleted successfully.")
    return redirect("admin-notifications")
