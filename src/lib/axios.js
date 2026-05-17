import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import utilities from "@/lib/utilities";

function normalizeBaseUrl(url) {
  return String(url || "").replace(/\/+$/, "");
}

const rawBaseUrl = import.meta.env.VITE_EAZY_VERIFICATION_API_BASE_URL;
const apiBaseUrl = `${normalizeBaseUrl(rawBaseUrl)}/api/v1`;

function getAuthToken() {
  return utilities.getAuthToken();
}

function defaultHeaders(contentType = "application/json") {
  const authToken = getAuthToken();

  return {
    "X-Request-Id": uuidv4(),
    Accept: "application/json",
    ...(contentType && { "Content-Type": contentType }),
    ...(authToken && { Authorization: `Bearer ${authToken}` }),
  };
}

function publicHeaders(contentType = "application/json") {
  return {
    "X-Request-Id": uuidv4(),
    Accept: "application/json",
    ...(contentType && { "Content-Type": contentType }),
  };
}

const apiClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 30000,
});

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();

  config.headers = config.headers || {};
  config.headers["X-Request-Id"] = config.headers["X-Request-Id"] || uuidv4();
  config.headers.Accept = config.headers.Accept || "application/json";

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      utilities.clearAuthStorage();

      if (window.location.pathname !== "/admin/login") {
        window.location.href = "/admin/login";
      }
    }

    return Promise.reject(error);
  },
);

const instance = {
  apiClient,
  defaultHeaders,
  publicHeaders,
  apiBaseUrl,
};

export default instance;
