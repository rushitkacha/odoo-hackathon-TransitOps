/**
 * TransitOps – API Service
 * Centralized HTTP client for FastAPI REST API integration.
 * All pages use this module to make API calls.
 */

const Api = (() => {

  /**
   * Core fetch wrapper with auth, timeout, and error handling.
   */
  async function request(endpoint, options = {}) {
    const url = `${AppConfig.API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem(AppConfig.AUTH_TOKEN_KEY);

    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      headers: { ...defaultHeaders, ...options.headers },
      ...options,
    };

    // Remove Content-Type for FormData (file uploads)
    if (config.body instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AppConfig.API_TIMEOUT);
    config.signal = controller.signal;

    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      // Handle 401 – redirect to login
      if (response.status === 401) {
        Auth.logout();
        return null;
      }

      // Handle non-OK responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.detail || errorData.message || `Request failed (${response.status})`);
        error.status = response.status;
        error.data = errorData;
        throw error;
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return null;
      }

      return await response.json();

    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.');
      }
      throw err;
    }
  }


  // --- Public HTTP Methods ---

  function get(endpoint, params = {}) {
    const query = new URLSearchParams(params).toString();
    const fullEndpoint = query ? `${endpoint}?${query}` : endpoint;
    return request(fullEndpoint, { method: 'GET' });
  }

  function post(endpoint, data) {
    return request(endpoint, {
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  }

  function put(endpoint, data) {
    return request(endpoint, {
      method: 'PUT',
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  }

  function patch(endpoint, data) {
    return request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  function del(endpoint) {
    return request(endpoint, { method: 'DELETE' });
  }


  // --- Expose Public API ---
  return { get, post, put, patch, delete: del };
})();
