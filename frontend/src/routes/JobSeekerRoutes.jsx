import React from "react";
import { Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

import JobSearch from "../pages/jobsearch/JobSearch";
import JobSearchAll from "../pages/jobsearch/JobSearchAll";
import JobDetailView from "../pages/jobsearch/JobDetailView";

import SaveJobs from "../components/Navbar/SaveJobs";
import SavedJobDetail from "../components/Navbar/SaveJobDetail";

import JobApplications from "../components/Navbar/JobApplication";
import JobApplicationDetail from "../components/Navbar/JobApplicationDetail";

import Profile from "../pages/profile/Profile";
import Companies from "../pages/companies/Companies";
import CompanyAbout from "../pages/companies/CompanyAbout";

import ProfileMe from "../pages/profile/ProfileMe";
import EditProfile from "../pages/profile/editprofile/EditProfile";
import ProtectedRoute from "../components/ProtectedRoute";

export const JobSeekerRoutes = (
  <Route path="/" element={<MainLayout />}>
    {/* Job Search */}
    <Route path="job-search">
      <Route index element={<JobSearch />} />
      <Route path=":id" element={<JobSearch />} />
      <Route path=":id" element={<JobDetailView />} />
      <Route path="all" element={<JobSearchAll />} />

      {/* Saved Jobs, Applications  */}
      <Route path="saved" element={<SaveJobs />} />
      <Route path="saved/:id" element={<SavedJobDetail />} />
      <Route path="applications" element={<JobApplications />} />
      <Route path="applications/:id" element={<JobApplicationDetail />} />
    </Route>

    {/* Public Profile */}
    <Route path="profile" element={<Profile />} />

    {/* Companies */}
    <Route path="companies" element={<Companies />} />
    <Route path="companies/:id" element={<CompanyAbout />} />

    {/* User Profile */}
    <Route
      path="profile/me"
      element={
        <ProtectedRoute>
          <ProfileMe />
        </ProtectedRoute>
      }
    />
    <Route
      path="profile/me/edit"
      element={
        <ProtectedRoute>
          <EditProfile />
        </ProtectedRoute>
      }
    />
  </Route>
);
