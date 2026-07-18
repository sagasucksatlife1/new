import axios from "axios";

// Vite-style env not supported in CRA — we mirror the intent via REACT_APP_API_BASE.
export const API_BASE =
  process.env.REACT_APP_API_BASE ||
  process.env.REACT_APP_BACKEND_URL ||
  "http://localhost:8000";

const TOKEN_KEY = "gd_nexus_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 60000,
});

api.interceptors.request.use((cfg) => {
  const t = getToken();
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

let onUnauth = () => {};
export const setUnauthHandler = (fn) => { onUnauth = fn; };
api.interceptors.response.use(
  (r) => r,
  (e) => {
    if (e?.response?.status === 401) {
      clearToken();
      onUnauth();
    }
    return Promise.reject(e);
  }
);

// EventSource does not carry Authorization headers reliably; append token as query.
export const streamUrl = (runId) => {
  const t = getToken();
  const u = new URL(`${API_BASE}/api/lab/run/stream`);
  u.searchParams.set("run_id", runId);
  if (t) u.searchParams.set("token", t);
  return u.toString();
};
