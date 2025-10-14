/**
 * @fileoverview API service module for handling HTTP requests to the backend
 * @module services/api
 * @requires axios
 */

import axios from 'axios'

/** @constant {string} BASE_URL - Base URL for API requests */
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

/**
 * Axios instance configured for the application API
 * @type {import('axios').AxiosInstance}
 */
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add any auth headers here if needed
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Don't log 401 errors for authentication checks - they're expected
    if (error.response?.status === 401) {
      // Silently handle unauthorized access - this is expected for auth checks
      // Only log if it's not the /auth/me endpoint
      if (!error.config?.url?.includes('/auth/me')) {
        console.warn('Unauthorized access detected for:', error.config?.url)
      }
    } else {
      // Log other errors normally
      console.error('API Error:', error.response?.status, error.response?.data || error.message)
    }
    
    return Promise.reject(error)
  }
)

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
   * @param {import('axios').AxiosRequestConfig} [config] - Additional Axios request configuration
   * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the response object
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
   * @param {import('axios').AxiosRequestConfig} [config] - Additional Axios request configuration
   * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the response object
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
      const response = await apiClient.get('/auth/me')
      return response.data
    } catch (error) {
      if (error.response?.status === 401) {
        // Return null for unauthorized without logging
        return null
      }
      throw error
    }
  }
}

export default apiClient