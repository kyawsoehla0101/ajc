// src/api.js
import axios from "axios";
import { API_URL } from "../constants/jobseekerConstants";

// Cookie getter (CSRF token)
export function getCookie(name) {
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

// SignIn API
export async function signInAPI(email) {
  const res = await fetch(`${API_URL}/accounts-jobseeker/jobseeker/signin/jobseeker/`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": getCookie("csrftoken"),
    },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) throw new Error(`Error: ${res.status}`);
  return res.json();
}


// Verify OTP API
export async function verifyOTPAPI(otp) {
  const res = await axios.post(
    `${API_URL}/accounts-jobseeker/jobseeker/send/otp/`,
    { code: otp },
    {
      withCredentials: true,
      headers: { "X-CSRFToken": getCookie("csrftoken") },
    }
  );
  return res.data;
}

// Current User
export async function fetchProfileAPI() {
  const token = localStorage.getItem("token");
  const res = await axios.get(`${API_URL}/accounts-jobseeker/jobseeker/currentuser/`,{
    headers: { Authorization: `Bearer ${token}` },
    withCredentials: true,
  });
  return res.data;
}

// Logout
export async function logoutAPI() {
  const csrftoken = getCookie("csrftoken");
  return axios.post(
    `${API_URL}/accounts-jobseeker/jobseeker/signout/`,
    {},
    {
      headers: { "X-CSRFToken": csrftoken },
      withCredentials: true,
    }
  );
}

// Resend OTP API
export async function resendOTPAPI(email) {
  const res = await axios.post(
    `${API_URL}/accounts-jobseeker/jobseeker/resend/otp/`,
    { email },
    {
      withCredentials: true,
      headers: { "X-CSRFToken": getCookie("csrftoken") },
    }
  );
  return res.data;
}