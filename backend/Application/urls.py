from django.urls import path
from .views import *

urlpatterns = [
    #apply jobs jobseeker
    path("application/apply/jobs/list/",applied_jobs,name="apply-jobs-list"),
    path("application/apply/job/detail/<uuid:app_id>/",applied_job_detail,name="apply-job-detail"),
    path("application/apply/job/remove/<uuid:app_id>/",applied_job_remove,name="apply-job-remove"),
    path("application/<uuid:job_id>/apply/",apply_job, name="apply-job"),

    #applications for employer dashboard
    path("employer/applications/",applications,name="employer-applications"),
    path("employer/application/detail/<uuid:app_id>/",application_detail,name="employer-application-detail"),
    path("employer/application/delete/<uuid:app_id>/",application_delete,name="employer-application-delete"),
    path("employer/application/pending/",pending_applications,name="employer-pending-applicatons"),
    path("employer/application/reviewed/",reviewed_applications,name="employer-reviewed-applicatons"),
    path("employer/application/rejected/",rejected_applications,name="employer-rejected-applicatons"),
    path("employer/application/shortlist/",shortlist_applications,name="employer-shortlist-applicatons"),
    path("employer/application/hired/",hired_applications,name="employer-hired-applicatons"),

    path("applications/<uuid:app_id>/update-status/", update_application_status, name="application-update-status"),
    path("applications/recent/",recent_applications,name="recent-applications"),
    
    #save jobs
    path("save/job/<uuid:job_id>/", save_job, name="save-job"), 
    path("saved/jobs/", saved_jobs, name="saved-job-list"),   
    path("saved/job/detail/<uuid:sj_id>/",saved_job_detail, name="saved-job-detail"),
    path("saved/job/remove/<uuid:sj_id>/",saved_job_remove,name="save-job-remove"),

]