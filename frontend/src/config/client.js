import axios from "axios";


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
const WS_URL = import.meta.env.VITE_WS_URL || "/ws";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

export { API_BASE_URL, WS_URL };
export default api;
