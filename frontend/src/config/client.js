import axios from "axios";

// Get API base URL from environment variables or use defaults
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081/api";
const WS_URL = import.meta.env.VITE_WS_URL || "http://localhost:8081/ws";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

export { API_BASE_URL, WS_URL };
export default api;
