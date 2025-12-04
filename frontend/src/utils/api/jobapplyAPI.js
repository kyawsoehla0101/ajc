// src/utils/api/jobapplyAPI.js
import axios from "axios";
import {
  JOB_APPLY_LIST_URL,
  JOB_APPLY_REMOVE_URL,
  JOB_APPLY_ENDPOINT,
  JOB_APPLY_DETAIL_URL,
  SAVE_JOB_LIST_URL,
  SAVE_JOB_ADD_URL,
  SAVE_JOB_REMOVE_URL,
} from "../constants/jobapplyConstants";

const API_BASE = import.meta.env.VITE_API_URL || "";

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

// CSRF token
export function getCookie(name = "csrftoken") {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.startsWith(name + "=")) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// Apply Jobs APIs
// Load application list
export async function fetchApplyJobs() {
  const csrftoken = getCookie();
  const res = await api.get(JOB_APPLY_LIST_URL, {
    headers: { "X-CSRFToken": csrftoken },
  });
  return res.data.apply_jobs || [];
}

// Delete applied job
export async function deleteApplyJob(id) {
  const csrftoken = getCookie();
  return api.delete(JOB_APPLY_REMOVE_URL(id), {
    headers: { "X-CSRFToken": csrftoken },
  });
}

// Apply Job
export async function applyForJob(jobId, coverLetter, token) {
  const csrftoken = getCookie();

  return api.post(
    JOB_APPLY_ENDPOINT(jobId),
    {
      cover_letter_text: coverLetter || "No cover letter provided.",
      resume_form: { basic: true },
    },
    {
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrftoken,
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    }
  );
}

// Apply Job Detail
export async function fetchApplicationDetail(id) {
  const csrftoken = getCookie();
  const res = await api.get(JOB_APPLY_DETAIL_URL(id), {
    headers: { "X-CSRFToken": csrftoken },
  });
  return res.data.application_detail;
}

// Save Job APIs
// Fetch all saved jobs
export async function fetchSavedJobs() {
  const csrftoken = getCookie();
  const token = localStorage.getItem("access");

  const url = `${API_BASE}${SAVE_JOB_LIST_URL}`;
  console.log("Final API calling:", url);

  const res = await axios.get(url, {
    withCredentials: true,
    headers: {
      "X-CSRFToken": csrftoken,
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
}

// Save a job (add bookmark)
export async function saveJob(jobId) {
  const csrftoken = getCookie();
  const res = await api.post(
    SAVE_JOB_ADD_URL(jobId),
    {},
    {
      headers: {
        "X-CSRFToken": csrftoken,
        "Content-Type": "application/json",
      },
    }
  );
  return res.data;
}

// Remove job from saved list
export async function removeSavedJob(savedJobId) {
  const csrftoken = getCookie();
  const res = await api.delete(SAVE_JOB_REMOVE_URL(savedJobId), {
    headers: {
      "X-CSRFToken": csrftoken,
      "Content-Type": "application/json",
    },
  });
  return res.data;
}
