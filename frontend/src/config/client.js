import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
const WS_URL = import.meta.env.VITE_WS_URL || "/ws";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 30000,
});

// Response interceptor: catch HTML error pages and network errors
// before they reach component-level error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the response body is HTML (e.g. nginx 502 page), replace it
    // with a structured error so getErrorMessage() never shows raw HTML
    if (error.response && typeof error.response.data === 'string') {
      const trimmed = error.response.data.trim().toLowerCase();
      if (
        trimmed.startsWith('<!doctype') ||
        trimmed.startsWith('<html') ||
        trimmed.startsWith('<head')
      ) {
        error.response.data = {
          message: "Service temporarily unavailable. Please try again shortly.",
        };
      }
    }
    return Promise.reject(error);
  }
);

export { API_BASE_URL, WS_URL };
export default api;
