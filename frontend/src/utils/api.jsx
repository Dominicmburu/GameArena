import axios from 'axios';
import { REACT_APP_API_URL } from './constants';

// Helper to read a cookie value (handles URI-encoded values)
const getCookie = (name) => {
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split('=')[1]) : undefined;
};

const api = axios.create({
  baseURL: REACT_APP_API_URL,
  withCredentials: true, // send HttpOnly session cookies
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  // Let axios auto-attach CSRF header from cookie when present
  xsrfCookieName: 'XSRF-TOKEN',   // adjust if your server uses a different name (e.g. "csrfToken" or "_csrf")
  xsrfHeaderName: 'X-XSRF-TOKEN', // common header name; server can also accept "X-CSRF-Token"
});

// Since auth is cookie-based, we DO NOT read/write tokens in localStorage.
// Optionally attach a CSRF header if your backend expects a specific name.
api.interceptors.request.use(
  (config) => {
    const csrf =
      getCookie('XSRF-TOKEN') || getCookie('csrfToken') || getCookie('_csrf');
    if (csrf) {
      // Ensure both common header names are set to be backend-agnostic
      if (!config.headers['X-XSRF-TOKEN']) config.headers['X-XSRF-TOKEN'] = csrf;
      if (!config.headers['X-CSRF-Token']) config.headers['X-CSRF-Token'] = csrf;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Centralized error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;

    if (status === 401) {
      // Not authenticated / session expired
      if (window.location.pathname !== '/auth') {
        window.location.href = '/auth';
      }
    }

    // Optional: handle CSRF mismatch/expired token (framework-specific)
    // If your backend exposes a CSRF-refresh endpoint, you can try:
    // if (status === 403 || status === 419) {
    //   try {
    //     await api.get('/auth/csrf'); // e.g., refresh CSRF cookie
    //     return api(error.config);    // retry original request once
    //   } catch (_) {}
    // }

    return Promise.reject(error);
  }
);

export default api;
