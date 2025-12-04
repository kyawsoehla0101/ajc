from django.urls import path
from .import views

urlpatterns = [

    path('jobseeker/signin/<str:role>/',views.signin_jobseeker,name="jobseeker-sigin"),
    path('jobseeker/sigout/',views.sigout_jobseeker,name="jobseeker-sigout"),
    path('jobseeker/send/otp/',views.otp_verify_jobseeker,name="jobseeker-emailverify"),
    path("jobseeker/resend/otp/",views.otp_resend_jobseeker, name="jobseeker-otp-resend"),

    #current user for login user 
    path('jobseeker/currentuser/',views.current_user,name="jobseeker-currentuser"),

    # start jobseekerprofile
    path('jobseekerprofile/', views.jobseekerprofile, name='jobseeker-profile'),
    path('jobseekerprofile/<uuid:jp_id>/', views.jobseekerprofile_update, name='jobseekerprofile-detail'),
    # end JobseekerProfile
    
    # start skills
    path('skill/', views.skill_list, name='skill-list'),
    path('skill/<uuid:s_id>/', views.skill_detail, name='skill-detail'),
    # end skills
    
    # start education
    path('education/', views.education_list, name='education-list'),
    path('education/<uuid:e_id>/', views.education_detail, name='education-detail'),
    # end education
    
    # start Experience
    path('experience/', views.experience_list, name='experience-list'),
    path('experience/<uuid:ex_id>/', views.experience_detail, name='experience-detail'),
    # end Experience
    
    # start Language
    path('language/', views.language_list, name='language-list'),
    path('language/<uuid:l_id>/', views.language_detail, name='language-detail'),
    # end Language
    
    # start Resume
    path('resume/', views.resume_list, name='resume-list'),
    path('resume/<uuid:r_id>/', views.resume_detail, name='resume-detail'),
    # end Resume
]