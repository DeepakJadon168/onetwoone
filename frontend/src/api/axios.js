import axios from "axios";

// In local dev this stays "/api" and Vite's proxy (vite.config.js) forwards it
// to http://localhost:5000. In production (Vercel), set VITE_API_URL to your
// deployed backend's URL, e.g. https://your-backend.vercel.app/api
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

// Attach the auth token to every request, if the user is logged in
api.interceptors.request.use((config) => {
  const userInfo = localStorage.getItem("userInfo");
  if (userInfo) {
    const { token } = JSON.parse(userInfo);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
