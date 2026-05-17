import { jwtDecode } from "jwt-decode";

const TOKEN_KEY = "eazy-verification.admin.token";
const ADMIN_KEY = "eazy-verification.admin.user";
const LOGOUT_BCAST_KEY = "eazy-verification.logout_at";
const SKEW_MS = 2000;

let logoutTimerId = null;
let onExpireCallback = null;

function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setAuthToken(authToken) {
  localStorage.setItem(TOKEN_KEY, authToken);
}

function removeAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function getAdminData() {
  const raw = localStorage.getItem(ADMIN_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function setAdminData(adminData) {
  localStorage.setItem(ADMIN_KEY, JSON.stringify(adminData));
}

function removeAdminData() {
  localStorage.removeItem(ADMIN_KEY);
}

function decodeExpMs() {
  const token = getAuthToken();

  if (!token) {
    return null;
  }

  try {
    const { exp } = jwtDecode(token);

    if (!exp) {
      return null;
    }

    return exp * 1000;
  } catch {
    return null;
  }
}

function isAuthenticated() {
  return Boolean(getAuthToken());
}

function isExpired() {
  const expMs = decodeExpMs();

  if (!expMs) {
    return isAuthenticated();
  }

  return Date.now() >= expMs - SKEW_MS;
}

function clearLogoutTimer() {
  if (logoutTimerId) {
    clearTimeout(logoutTimerId);
    logoutTimerId = null;
  }
}

function broadcastLogout() {
  localStorage.setItem(LOGOUT_BCAST_KEY, String(Date.now()));
}

function clearAuthStorage() {
  clearLogoutTimer();
  removeAuthToken();
  removeAdminData();
}

function logout() {
  clearAuthStorage();
  broadcastLogout();

  if (typeof onExpireCallback === "function") {
    onExpireCallback();
  }
}

function scheduleAutoLogout() {
  clearLogoutTimer();

  if (!isAuthenticated()) {
    return;
  }

  const expMs = decodeExpMs();

  if (!expMs) {
    logout();
    return;
  }

  const remaining = expMs - Date.now() - SKEW_MS;

  if (remaining <= 0) {
    logout();
    return;
  }

  logoutTimerId = setTimeout(() => {
    logout();
  }, remaining);
}

function initAuthSession(handleExpire) {
  onExpireCallback = handleExpire;

  if (isExpired()) {
    logout();
  } else {
    scheduleAutoLogout();
  }

  window.addEventListener("storage", (event) => {
    if (event.key === LOGOUT_BCAST_KEY) {
      clearAuthStorage();

      if (typeof onExpireCallback === "function") {
        onExpireCallback();
      }
    }
  });
}

function getApiErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  return error?.response?.data?.message || error?.response?.data?.error || error?.message || fallback;
}

function getResponseData(response) {
  return response?.data?.data || response?.data || null;
}

function formatFullName(user) {
  if (!user) {
    return "-";
  }

  return [user.first_name, user.surname].filter(Boolean).join(" ") || "-";
}

function formatStatusLabel(status) {
  if (!status) {
    return "Unknown";
  }

  return String(status).replaceAll("_", " ");
}

function formatFileSize(bytes) {
  if (!bytes && bytes !== 0) {
    return "-";
  }

  const size = Number(bytes);

  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function isAllowedVerificationFile(file) {
  if (!file) {
    return false;
  }

  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
  return allowedTypes.includes(file.type);
}

function isFileWithinMaxSize(file, maxSizeMb = 5) {
  if (!file) {
    return false;
  }

  return file.size <= maxSizeMb * 1024 * 1024;
}

const utilities = {
  getAuthToken,
  setAuthToken,
  removeAuthToken,

  getAdminData,
  setAdminData,
  removeAdminData,

  isAuthenticated,
  isExpired,

  initAuthSession,
  scheduleAutoLogout,
  logout,
  clearAuthStorage,

  getApiErrorMessage,
  getResponseData,

  formatFullName,
  formatStatusLabel,
  formatFileSize,

  isAllowedVerificationFile,
  isFileWithinMaxSize,
};

export default utilities;
