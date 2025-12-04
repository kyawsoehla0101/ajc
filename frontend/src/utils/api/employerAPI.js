import axios from "axios";
import { EMPLOYER_API } from "../constants/employerConstants";

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

// Vit API_URL
const API_URL = import.meta.env.VITE_API_URL;

// Register employer
export const registerEmployer = async (email, password) => {
  const csrftoken = getCookie("csrftoken");
  const response = await axios.post(
    `${API_URL}${EMPLOYER_API.REGISTER}`,
    { email, password },
    {
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrftoken,
      },
      withCredentials: true,
    }
  );
  return response.data;
};

// Register employer detail
export const registerEmployerDetail = async (formData) => {
  const csrftoken = getCookie("csrftoken");
  const response = await axios.post(
    `${API_URL}${EMPLOYER_API.REGISTER_DETAIL}`,
    formData,
    {
      headers: {
        
        "X-CSRFToken": csrftoken,
      },
      withCredentials: true,
    }
  );
  return response.data;
};

// Signin (token-based, CSRF included)
export const signinEmployer = async ({ email, password }) => {
  const csrftoken = getCookie("csrftoken");
  try {
    const response = await axios.post(
      `${API_URL}${EMPLOYER_API.SIGNIN}`,
      { email, password },
      {
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrftoken,
        },
        withCredentials: true,
      }
    );
    // returns { id, email, username, is_verified, access, refresh }
    return response.data;
  } catch (error) {
    if (error.response) {
      // Attach response data and headers to the error for rate limit handling
      error.status = error.response.status;
      error.data = error.response.data;
      error.headers = error.response.headers;
    }
    throw error;
  }
};

// Fetch current employer
export const fetchCurrentEmployer = async () => {
  const csrftoken = getCookie("csrftoken");
  const response = await axios.get(`${API_URL}${EMPLOYER_API.CURRENT_USER}`, {
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrftoken,
    },
    withCredentials: true,
  });
  return response.data;
};

// Employer logout
export const employerLogout = async (refreshToken) => {
  const csrftoken = getCookie("csrftoken");
  const response = await axios.post(
    `${API_URL}${EMPLOYER_API.LOGOUT}`,
    { refresh: refreshToken },
    {
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrftoken,
      },
      withCredentials: true,
    }
  );
  return response.data;
};

// Resend verification email
export const resendVerificationEmail = async (email) => {
  const csrftoken = getCookie("csrftoken");
  const response = await axios.post(
    `${API_URL}${EMPLOYER_API.RESEND_EMAIL}`,
    { email },
    {
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrftoken,
      },
      withCredentials: true,
    }
  );
  return response.data;
};