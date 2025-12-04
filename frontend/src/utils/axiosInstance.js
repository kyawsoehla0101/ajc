// src/utils/axiosInstance.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Request interceptor to attach employer token
api.interceptors.request.use((config) => {
  const savedEmployer = JSON.parse(localStorage.getItem("employerUser"));
  if (savedEmployer?.access) {
    config.headers.Authorization = `Bearer ${savedEmployer.access}`;
  }
  return config;
});

export default api;
