import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8001";
export const API_BASE_URL = baseURL;

const api = axios.create({
  baseURL,
});

// Attach token automatically if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
