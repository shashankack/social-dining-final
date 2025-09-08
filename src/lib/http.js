import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8787";

export const http = axios.create({
  baseURL: BASE_URL, // e.g. https://<your-subdomain>.ngrok-free.app
  headers: { "Content-Type": "application/json" },
  // timeout: 15000,
});

// Attach auth token if you add auth later
http.interceptors.request.use((config) => {
  const token = localStorage.getItem("ss_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // Bypass ngrok safety interstitial for XHR/fetch requests
  config.headers["ngrok-skip-browser-warning"] = "true";

  return config;
});

// Normalize errors (so consumers can just use e.message / e.status / e.data)
http.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    const data = err?.response?.data;
    const message =
      data?.error || data?.message || err?.message || "Request failed";
    const e = new Error(message);
    e.status = status;
    e.data = data;
    throw e;
  }
);
