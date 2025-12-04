from django.urls import path
from .import views

urlpatterns = [

    #employer authentication paths
    path('employer/preregister/',views.preregister_employer,name="employer-preregisterpage"),
    path('employer/register/<str:role>/',views.register_employer,name="employer-registerpage"),
    path('employer/login/',views.login_employer,name="employer-loginpage"),
    path('employer/logout/',views.logout_employer,name="employer-logoutpage"),
    path('employer/emailverify/<uidb64>/<token>/',views.emailverify_employer,name="employer-emailverifypage"),
    path('employer/resend-verification-email/',views.resend_verification,name="employer-resend-verification-emailpage"),

    #employer dashboard paths
    path('employer/dashboard/', views.dashboard, name='employer-dashboard'),
    path('employer/profile/', views.employer_profile, name='employer-profile'),
    path('employer/profile-update/<str:pk>/',views.update_employer_profile,name="empployer-profile-update"),

    #company list
    path('company/',views.company_list,name="company-list"),
    path('job/company/<uuid:com_id>/',views.jobs_in_company,name='job-in-company'),

    #company search
    path('company/search/',views.company_search,name="company-search"),

    # path('job/filter/',views.job_filter_by_status,name="job-filter"),
    # path('application/filter/',views.application_filter_by_status,name="application-filter"),
    

]