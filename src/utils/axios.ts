import axios from "axios";

// Get base URL and remove trailing slashes
const baseURL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8001").replace(/\/+$/, '');

export const API_BASE_URL = baseURL;
export const UPLOADS_BASE_URL = baseURL;

// Helper to get correct image URL
export const getImageUrl = (imagePath: string | undefined): string => {
  if (!imagePath) return "/placeholder-avatar.svg";

  // Remove leading slashes and "uploads/" prefix if exists
  const cleanPath = imagePath.replace(/^\/+/, '').replace(/^uploads\//, '');

  // Build correct URL with uploads prefix
  return `${UPLOADS_BASE_URL}/uploads/${cleanPath}`;
};

const api = axios.create({
  baseURL: `${baseURL}`,
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