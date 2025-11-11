/**
 * @fileoverview API service module for handling HTTP requests to the backend
 * @module services/api
 * @requires axios
 */

import axios from "axios";

/** @constant {string} BASE_URL - Base URL for API requests */
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

// API logger removed to avoid client-side logging overhead

/**
 * Axios instance configured for the application API
 * @typedef {Object} AxiosInstance
 * @property {Function} get
 * @property {Function} post
 * @property {Function} put
 * @property {Function} delete
 * @type {AxiosInstance}
 */
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // Increased to 30 seconds for large report queries
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});
// URL patterns that should not trigger the global loader by default.
// Authentication endpoints are excluded to avoid showing loader during sign-in
const SUPPRESS_LOADER_PATTERNS = [
  // All authentication endpoints (sign-in, login, logout, callback)
  "/auth/",
  "/auth/google",
  "/auth/google/callback",
  "/auth/me",
  "/auth/logout",
  // Session and health check endpoints
  "/api/session",
  "/api/session/info",
  "/api/health",
  "/api/ping",
  "/api/status",
];

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Show global loader for API requests unless explicitly suppressed.
    try {
      const suppressHeader =
        config.headers &&
        (config.headers["X-Suppress-Loader"] === "1" ||
          config.headers["x-suppress-loader"] === "1");
      const suppressExplicit = Boolean(
        config._suppressLoader || config.suppressLoader || suppressHeader,
      );
      // Auto-suppress for quick/background endpoints unless explicitly overridden
      const url = (config.url || "").toString();
      
      // Check if URL matches suppress patterns
      const matchesPattern = SUPPRESS_LOADER_PATTERNS.some(
        (p) => url.startsWith(p) || url.includes(p),
      );
      
      // Check if it's a static asset
      const isStaticAsset = /\.(png|jpg|jpeg|svg|gif|ico|css|js)(\?.*)?$/.test(
        url,
      );
      
      // IMPORTANT: Disable automatic loader for API requests
      // Loader now only shows once during initial page load
      // Individual API requests should not trigger the loader
      const isApiEndpoint = url.startsWith("/api/");
      const isAuthEndpoint = url.startsWith("/auth/");
      
      const forceLoader = Boolean(config.forceLoader || config._forceLoader);
      
      // Always suppress loader for API requests (unless explicitly forced)
      // The loader is now only shown during initial page load
      const suppress = forceLoader
        ? false
        : true; // Suppress all automatic loaders - only show on initial page load

      if (!suppress) {
        // Show the global loader for this request. We don't use per-request ids
        // with the plugin; instead mark that we showed the loader so the
        // response handler knows to hide it.
        try {
          // eslint-disable-next-line no-param-reassign
          config._loaderShown = true;
        } catch (e) {
          void e;
        }
      } else {
        // mark explicitly suppressed so response handler doesn't try to hide
        // eslint-disable-next-line no-param-reassign
        config._loaderSuppressed = true;
      }
    } catch (e) {
      // ignore loader failures
    }
    // Disabled API request logging to reduce console noise
    // logApiCall(config.method?.toUpperCase() || 'GET', config.url || '', {
    //   baseURL: config.baseURL,
    //   timeout: config.timeout
    // }, 'request');

    return config;
  },
  (error) => {
    try {
      if (error.config && error.config._loaderShown) {
      }
    } catch (e) {
      void e;
    }
    return Promise.reject(error);
  },
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Hide loader on response only if a loader id was attached
    try {
      if (response.config && response.config._loaderShown) {
      }
      // If suppressed or no marker present, don't touch the loader stack
    } catch (e) {
      void e;
    }
    // Logging disabled - earlier implementation recorded API calls here

    return response;
  },
  (error) => {
    // Hide loader on error only if a loader id was attached
    try {
      if (error.config && error.config._loaderShown) {
      }
    } catch (e) {
      void e;
    }
    // Logging disabled - errors are still propagated to callers

    return Promise.reject(error);
  },
);

/**
 * API service object providing HTTP methods for backend communication
 * All methods return Axios promises and include automatic error handling
 * @namespace apiService
 */
export const apiService = {
  /**
   * Perform a GET request to retrieve data from the server
   * @memberof apiService
   * @param {string} url - Endpoint path (relative to baseURL)
   * @param {Object} [config] - Additional Axios request configuration
   * @returns {Promise<Object>} Promise resolving to the response object
   * @example
   * // Get user profile
   * const response = await apiService.get('/auth/me')
   * console.log(response.data.user)
   */
  get: (url, config = {}) => apiClient.get(url, config),

  /**
   * Perform a POST request to send data to the server
   * @memberof apiService
   * @param {string} url - Endpoint path (relative to baseURL)
   * @param {Object} [data] - Request body data to send
   * @param {Object} [config] - Additional Axios request configuration
   * @returns {Promise<Object>} Promise resolving to the response object
   * @example
   * // Create a new resource
   * const response = await apiService.post('/api/users', { name: 'John Doe' })
   */
  post: (url, data = {}, config = {}) => apiClient.post(url, data, config),

  /**
   * Perform a PUT request.
   * @param {string} url - Endpoint path.
   * @param {object} [data] - Request body.
   * @param {object} [config] - Axios request config.
   * @returns {Promise<AxiosResponse>}
   */
  put: (url, data = {}, config = {}) => apiClient.put(url, data, config),

  /**
   * Perform a DELETE request.
   * @param {string} url - Endpoint path.
   * @param {object} [config] - Axios request config.
   * @returns {Promise<AxiosResponse>}
   */
  delete: (url, config = {}) => apiClient.delete(url, config),

  /**
   * Perform a PATCH request.
   * @param {string} url - Endpoint path.
   * @param {object} [data] - Request body.
   * @param {object} [config] - Axios request config.
   * @returns {Promise<AxiosResponse>}
   */
  patch: (url, data = {}, config = {}) => apiClient.patch(url, data, config),

  /**
   * Silent auth check that calls `/auth/me` but suppresses logging for 401
   * responses (used for initial auth probes).
   *
   * @returns {Promise<Object|null>} The response data when authenticated, or null when unauthorized.
   * @throws {Error} For non-401 errors.
   */
  silentAuthCheck: async () => {
    try {
      const response = await apiClient.get("/auth/me");
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        // Return null for unauthorized without logging
        return null;
      }
      throw error;
    }
  },
};

export default apiClient;
