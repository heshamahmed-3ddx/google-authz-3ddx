/**
 * @fileoverview API service module for handling HTTP requests to the backend
 * @module services/api
 * @author InsightHub Development Team
 * @copyright 2025 InsightHub. All rights reserved.
 * @requires axios
 */

import axios from "axios";

/**
 * Dynamically determine the API base URL based on the current window location
 *
 * This function allows the app to work both on localhost and network IP addresses
 * by automatically detecting the current hostname and protocol. In production,
 * it uses the VITE_API_URL environment variable.
 *
 * Priority:
 * 1. VITE_API_URL environment variable (production)
 * 2. Current window location (development - supports network IPs)
 * 3. Fallback to localhost:3001 (SSR or node context)
 *
 * @returns {string} The API base URL (e.g., 'http://localhost:3001' or 'https://api.example.com')
 *
 * @example
 * // In development on localhost
 * getApiBaseUrl(); // Returns: 'http://localhost:3001'
 *
 * @example
 * // In development on network IP
 * getApiBaseUrl(); // Returns: 'http://192.168.1.100:3001'
 *
 * @example
 * // In production with VITE_API_URL set
 * getApiBaseUrl(); // Returns: process.env.VITE_API_URL
 */
function getApiBaseUrl() {
  // If environment variable is set, use it (production)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // In development, dynamically construct the API URL based on current location
  if (typeof window !== "undefined") {
    const protocol = window.location.protocol; // http: or https:
    const hostname = window.location.hostname; // localhost or 192.168.100.3
    const apiPort = "3001"; // Backend port

    return `${protocol}//${hostname}:${apiPort}`;
  }

  // Fallback (SSR or node context)
  return "http://localhost:3001";
}

/** @constant {string} BASE_URL - Base URL for API requests */
const BASE_URL = getApiBaseUrl();

// Export BASE_URL for use in other modules (e.g., OAuth redirects)
export { BASE_URL };

// API logger removed to avoid client-side logging overhead

/**
 * Axios instance configured for the application API
 *
 * This instance is pre-configured with:
 * - Base URL (dynamically determined)
 * - 30-second timeout (for large report queries)
 * - Credentials enabled (for session cookies)
 * - JSON content type headers
 * - Request/response interceptors for error handling
 *
 * @typedef {Object} AxiosInstance
 * @property {Function} get - GET request method
 * @property {Function} post - POST request method
 * @property {Function} put - PUT request method
 * @property {Function} delete - DELETE request method
 * @property {Function} patch - PATCH request method
 * @property {Function} request - Generic request method
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

/**
 * Request interceptor for API client
 *
 * Currently a pass-through interceptor. Can be extended to add:
 * - Request headers
 * - Request logging
 * - Request transformation
 *
 * @param {Object} config - Axios request configuration
 * @returns {Object} Request configuration
 */
apiClient.interceptors.request.use(
  (config) => {
    // API request configuration - no loader logic needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

/**
 * Response interceptor with automatic authentication error handling
 *
 * Handles common HTTP error status codes:
 * - 401 (Unauthorized): Clears auth state and redirects to login
 * - 403 (Forbidden): Redirects to unauthorized page
 * - 404 (Not Found): Optionally redirects to 404 page (if enabled)
 *
 * All errors are propagated to callers for component-level handling.
 *
 * @param {Object} response - Successful Axios response
 * @returns {Object} Response object
 * @param {Error} error - Axios error object
 * @returns {Promise<Error>} Rejected promise with error
 */
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const status = error.response?.status;
    const config = error.config;

    // Handle authentication and authorization errors globally
    if (status === 401) {
      // 401 Unauthorized - User is not authenticated or token expired
      // Always redirect to login page when token expires (unless explicitly skipped)
      if (!config?._skipAuthRedirect) {
        // Import router dynamically to avoid circular dependencies
        const { default: router } = await import("@/router");
        const { useAuthStore } = await import("@/stores/auth");
        const authStore = useAuthStore();

        // Clear auth state and cached data
        authStore.user = null;
        authStore.tokens = null;
        authStore.cachedUserDetails = null;
        authStore.cachedUserRights = null;

        // Always redirect to login page when token expires
        router.push({ name: "Login" });
      }
    } else if (status === 403) {
      // 403 Forbidden - User is authenticated but doesn't have permission
      // Skip redirect if explicitly disabled
      if (!config?._skipAuthRedirect) {
        const { default: router } = await import("@/router");
        const currentPath = router.currentRoute.value.path;

        // Redirect to unauthorized page with context
        router.push({
          name: "Unauthorized",
          query: {
            from: currentPath,
            reason: error.response?.data?.message || "Access denied",
          },
        });
      }
    } else if (status === 404) {
      // 404 Not Found - Optional: redirect to 404 page for API endpoints
      // Only redirect if explicitly enabled in config
      if (config?._redirect404) {
        const { default: router } = await import("@/router");
        router.push({ name: "NotFound" });
      }
    }

    // Always propagate errors to callers for component-level handling
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
   * Perform a PUT request to update a resource on the server
   * @memberof apiService
   * @param {string} url - Endpoint path (relative to baseURL)
   * @param {Object} [data={}] - Request body data to send
   * @param {Object} [config={}] - Additional Axios request configuration
   * @returns {Promise<Object>} Promise resolving to the response object
   * @example
   * // Update user profile
   * const response = await apiService.put('/api/users/123', { name: 'Jane Doe' })
   */
  put: (url, data = {}, config = {}) => apiClient.put(url, data, config),

  /**
   * Perform a DELETE request to remove a resource from the server
   * @memberof apiService
   * @param {string} url - Endpoint path (relative to baseURL)
   * @param {Object} [config={}] - Additional Axios request configuration
   * @returns {Promise<Object>} Promise resolving to the response object
   * @example
   * // Delete a resource
   * const response = await apiService.delete('/api/users/123')
   */
  delete: (url, config = {}) => apiClient.delete(url, config),

  /**
   * Perform a PATCH request to partially update a resource on the server
   * @memberof apiService
   * @param {string} url - Endpoint path (relative to baseURL)
   * @param {Object} [data={}] - Request body data with partial updates
   * @param {Object} [config={}] - Additional Axios request configuration
   * @returns {Promise<Object>} Promise resolving to the response object
   * @example
   * // Partially update user profile
   * const response = await apiService.patch('/api/users/123', { email: 'new@example.com' })
   */
  patch: (url, data = {}, config = {}) => apiClient.patch(url, data, config),

  /**
   * Silent authentication check that calls `/auth/me` without triggering redirects
   *
   * This method is used for initial authentication probes to check if the user
   * is already authenticated without causing side effects like redirects or error logs.
   * Returns null for 401 responses instead of throwing an error.
   *
   * @memberof apiService
   * @returns {Promise<Object|null>} The response data when authenticated, or null when unauthorized
   * @throws {Error} For non-401 errors (network errors, server errors, etc.)
   *
   * @example
   * // Check if user is authenticated without side effects
   * const userData = await apiService.silentAuthCheck();
   * if (userData) {
   *   console.log('User is authenticated:', userData.user);
   * } else {
   *   console.log('User is not authenticated');
   * }
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

/**
 * Default export: Axios instance for direct use
 *
 * This is the configured Axios instance. For most use cases, prefer using
 * the `apiService` object methods which provide a cleaner API.
 *
 * @type {AxiosInstance}
 * @example
 * // Direct use of Axios instance
 * import apiClient from '@/services/api';
 * const response = await apiClient.get('/api/users');
 *
 * @example
 * // Preferred: Use apiService
 * import { apiService } from '@/services/api';
 * const response = await apiService.get('/api/users');
 */
export default apiClient;
