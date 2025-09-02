// src/lib/api.js
import axios from "axios";

// e.g. VITE_API_BASE="https://events-manager.shashank181204.workers.dev"
export const API_BASE = import.meta.env.VITE_API_BASE;

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

export const api = axios.create({
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

if (accessToken) {
  api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
}

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

// attach Authorization + cache-buster on GET
api.interceptors.request.use((config) => {
  config.headers = {
    ...(config.headers || {}),
    Accept: "application/json",
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    Pragma: "no-cache",
  };

  if (accessToken && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  const method = (config.method || "get").toLowerCase();
  if (method === "get") {
    const params = new URLSearchParams(config.params || {});
    params.set("_", String(Date.now()));
    config.params = params;
  }

  return config;
});

let refreshPromise = null;
async function refreshAccessTokenOnce() {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const r = await refreshClient.post("/auth/refresh");
        const newToken = r?.data?.accessToken;
        if (newToken) setAccessToken(newToken);
        return newToken;
      } finally {
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
    const isRefreshCall = config?.url?.includes("/auth/refresh");

    if (status === 401 && !config?._retry && !isRefreshCall) {
      try {
        const newToken = await refreshAccessTokenOnce();
        if (!newToken) throw err;

        config._retry = true;
        config.headers = {
          ...(config.headers || {}),
          Authorization: `Bearer ${newToken}`,
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
        };
        return api.request(config);
      } catch {
        clearAccessToken();
      }
    }

    const normalized = new Error(
      response?.data?.error || err.message || "Request failed"
    );
    normalized.status = status;
    normalized.body = response?.data;
    throw normalized;
  }
);

// convenience wrapper
export async function apiFetch(path, init = {}) {
  const { method = "GET", body, headers, ...rest } = init;
  const isAbs = /^https?:\/\//i.test(path);
  const url = isAbs ? path : path.startsWith("/") ? path : `/${path}`;

  let data = body;
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
