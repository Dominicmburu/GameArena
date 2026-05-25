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

// Public routes where a 401 should NOT force a redirect to /auth.
// Guests can browse these freely; auth probes are expected to 401.
const PUBLIC_PATHS = ['/', '/game-rules', '/auth'];

// Endpoints where a 401 is an expected response (auth-status probes etc.)
const isAuthProbe = (url) =>
  typeof url === 'string' && /\/auth\/me(?:\/|$|\?)/.test(url);

// Centralized error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const reqUrl = error.config?.url || '';
    const currentPath = window.location.pathname;

    if (status === 401) {
      // Skip the auto-redirect when:
      //  - the request is itself an auth probe (401 is informational, not a "kick out")
      //  - the user is already on a public page (don't yank guests off the homepage)
      //  - the user is already on /auth
      const skip = isAuthProbe(reqUrl) || PUBLIC_PATHS.includes(currentPath);
      if (!skip) {
        window.location.href = '/auth';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
