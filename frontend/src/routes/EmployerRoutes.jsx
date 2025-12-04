import React from "react";
import { Route } from "react-router-dom";

import EmployerDashboardLayout from "../pages/employer/dashboard/EmployerDashboard";
import Overview from "../pages/employer/dashboard/OverView";

import MyJobs from "../pages/employer/jobs-page/MyJobs";
import EditJob from "../pages/employer/jobs-page/EditJob";
import PostJob from "../pages/employer/jobs-page/PostJob";
import JobDetail from "../components/employer/jobs/JobDetail";

import JobCategoryListPage from "../pages/employer/job-categories-page/JobCategoryListPage";
import JobCategoryCreatePage from "../pages/employer/job-categories-page/JobCategoryCreatePage";
import JobCategoryEditPage from "../pages/employer/job-categories-page/JobCategoryEditPage";
import JobCategoryDetailPage from "../pages/employer/job-categories-page/JobCategoryDetailPage";

import EmployerProfile from "../pages/employer/profile/EmployerProfile";
import EmployerProfileEditPage from "../pages/employer/profile/EmployerProfileEditPage";

import JobApplication from "../pages/employer/job-application/JobApplication";
import JobApplicationProfileDetail from "../pages/employer/job-application/JobApplicationProfileDetail";

export const EmployerRoutes = (
  <Route path="/employer/dashboard" element={<EmployerDashboardLayout />}>
    <Route index element={<Overview />} />

    {/* job */}
    <Route path="my-jobs" element={<MyJobs />} />
    <Route path="job-create" element={<PostJob />} />
    <Route path="my-jobs/:id/edit" element={<EditJob />} />
    <Route path="my-jobs/:id/detail" element={<JobDetail />} />

    {/* job-category */}
    <Route path="job-category" element={<JobCategoryListPage />} />
    <Route path="job-category/create" element={<JobCategoryCreatePage />} />
    <Route path="job-categories/:id/edit" element={<JobCategoryEditPage />} />
    <Route path="job-categories/:id" element={<JobCategoryDetailPage />} />

    {/* Profile */}
    <Route path="profile" element={<EmployerProfile />} />
    <Route path="profile/edit" element={<EmployerProfileEditPage />} />

    {/* Application */}
    <Route path="applications" element={<JobApplication />} />
    <Route path="applications/:id" element={<JobApplicationProfileDetail />} />
  </Route>
);
