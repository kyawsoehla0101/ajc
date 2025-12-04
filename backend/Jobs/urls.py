from django.urls import path
from . import views

urlpatterns = [

    # jobs category urls
    path('job-categories/', views.job_category_list, name='job-categories'),
    path('job-categories/create/', views.job_category_create, name='job-category-create'),
    path('job-categories/detail/<uuid:pk>/', views.job_category_detail, name='job-category-detail'),
    path('job-categories/update/<uuid:pk>/', views.job_category_update, name='job-category-update'),
    path('job-categories/delete/<uuid:pk>/', views.job_category_delete, name='job-category-delete'),
    
    #jobs urls
    path('jobs/', views.jobs_list, name='jobs-list'),
    path('jobs/create/', views.jobs_create, name='job-create'),
    path('jobs/detail/<uuid:pk>/', views.jobs_detail, name='job-detail'),
    path('jobs/update/<uuid:pk>/', views.jobs_update, name='job-update'),
    path('jobs/delete/<uuid:pk>/', views.jobs_delete, name='job-delete'),

    #search
    path('search/',views.search,name="search-list"),

    #quick search
    path('quick-search-city/',views.quick_search_by_location,name="quick-search"),
    path('quick-search-category/',views.quick_search_by_category,name="quick-search-category"),

]

