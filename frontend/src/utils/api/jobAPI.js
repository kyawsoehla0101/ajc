// src/utils/api/jobAPI.js
import api from "../axiosInstance";
import {
  JOBS_ENDPOINT,
  JOB_CREATE,
  JOB_DETAIL,
  JOB_UPDATE,
  JOB_DELETE,
  JOB_CATEGORIES,
} from "../constants/apiJobendpoints";

// CSRF token function
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}
const csrfToken = () => getCookie("csrftoken");

// Create Job
export const createJob = (data) =>
  api.post(JOB_CREATE, data, {
    headers: {
      "X-CSRFToken": csrfToken(),
    },
    withCredentials: true,
  });

// Get Jobs
export const getJobs = () => api.get(JOBS_ENDPOINT, { withCredentials: true });

// Get Job Detail
export const getJobDetail = (id) =>
  api.get(JOB_DETAIL(id), { withCredentials: true });

// Update Job
export const updateJob = (id, data) =>
  api.put(JOB_UPDATE(id), data, {
    headers: {
      "X-CSRFToken": csrfToken(),
    },
    withCredentials: true,
  });

// Delete Job
export const deleteJob = (id) =>
  api.delete(JOB_DELETE(id), {
    headers: {
      "X-CSRFToken": csrfToken(),
    },
    withCredentials: true,
  });

// Get all job categories
export const getCategories = () =>
  api.get(JOB_CATEGORIES, { withCredentials: true });
