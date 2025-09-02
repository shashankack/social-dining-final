// src/lib/api.js (or wherever your api.js lives)
import axios from "axios";

// export const API_BASE = "https://events-manager.shashank181204.workers.dev";
// export const API_BASE = "http://localhost:8787";
export const API_BASE = import.meta.env.VITE_API_BASE;

// --- Token management ---
let accessToken = localStorage.getItem("accessToken") || null;

export function setAccessToken(token) {
  accessToken = token || null;
  if (token) localStorage.setItem("accessToken", token);
  else localStorage.removeItem("accessToken");

  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
}

export function getAccessToken() {
  return accessToken;
}

export function clearAccessToken() {
  setAccessToken(null);
}

// --- Axios instances ---
export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // send refresh cookie
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    // 🔒 hard-disable caches at the request layer
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    Pragma: "no-cache",
  },
  timeout: 20000,
});

// Initialize default Authorization header if we have a stored token
if (accessToken) {
  api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
}

// A bare client (no interceptors) for refresh endpoint to avoid loops
const refreshClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    Pragma: "no-cache",
  },
  timeout: 20000,
});

// --- Request interceptor: attach Authorization + kill caches ---
api.interceptors.request.use((config) => {
  // Ensure no-cache headers on every request
  config.headers = {
    ...(config.headers || {}),
    Accept: config.headers?.Accept || "application/json",
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    Pragma: "no-cache",
  };

  // Attach token if present
  if (accessToken && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  // Add a cache-buster to every GET (except refresh) so URLs are unique
  const method = (config.method || "get").toLowerCase();
  const isGet = method === "get";
  const isRefreshCall =
    typeof config.url === "string" && config.url.includes("/auth/refresh");

  if (isGet && !isRefreshCall) {
    const params = new URLSearchParams(config.params || {});
    // if a buster already exists, replace it
    params.set("_", String(Date.now()));
    config.params = params;
  }

  return config;
});

// --- Response interceptor: single-flight refresh on 401 ---
let refreshPromise = null; // single-flight guard

async function refreshAccessTokenOnce() {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const r = await refreshClient.post("/auth/refresh");
        const newToken = r?.data?.accessToken;
        if (newToken) setAccessToken(newToken);
        return newToken; // return token to caller
      } finally {
        // allow next refresh after this completes (success or failure)
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const { config, response } = err || {};
    const status = response?.status;

    // Don’t retry refresh endpoint itself
    const isRefreshCall = config?.url?.includes("/auth/refresh");

    if (status === 401 && !config?._retry && !isRefreshCall) {
      try {
        const newToken = await refreshAccessTokenOnce();
        if (!newToken) throw err;

        // retry original request with the new token
        config._retry = true;
        config.headers = {
          ...(config.headers || {}),
          Authorization: `Bearer ${newToken}`,
          // keep no-store on retry too
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
        };
        return api.request(config);
      } catch {
        // hard sign-out on refresh failure
        clearAccessToken();
      }
    }

    // Normalize error
    const normalized = new Error(
      response?.data?.error || err.message || "Request failed"
    );
    normalized.status = status;
    normalized.body = response?.data;
    throw normalized;
  }
);

// --- Compatibility wrapper: apiFetch(path, { method, body, headers }) ---
//   Uses the axios client above (already no-store + GET cache-buster).
export async function apiFetch(path, init = {}) {
  const { method = "GET", body, headers, ...rest } = init;
  const isAbs = /^https?:\/\//i.test(path);
  const url = isAbs ? path : path.startsWith("/") ? path : `/${path}`;

  let data = body;
  // accept both JSON-stringified and plain objects
  if (typeof body === "string") {
    try {
      data = JSON.parse(body);
    } catch {
      data = body;
    }
  }

  const res = await api.request({
    url,
    method,
    data,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      ...(headers || {}),
    },
    ...rest,
  });

  return res.data;
}
