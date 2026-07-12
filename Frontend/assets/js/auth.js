/**
 * TransitOps – Auth Module
 * Login, logout, token management, and route guarding.
 */

const Auth = (() => {

  /**
   * Authenticate user with FastAPI backend.
   * @param {string} username
   * @param {string} password
   * @returns {Promise<object>} User data
   */
  async function login(username, password) {
    // FastAPI OAuth2 expects form-encoded data
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await fetch(`${AppConfig.API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Invalid username or password');
    }

    const data = await response.json();

    // Store tokens
    localStorage.setItem(AppConfig.AUTH_TOKEN_KEY, data.access_token);
    if (data.refresh_token) {
      localStorage.setItem(AppConfig.AUTH_REFRESH_KEY, data.refresh_token);
    }

    // Store user info
    if (data.user) {
      localStorage.setItem(AppConfig.AUTH_USER_KEY, JSON.stringify(data.user));
    }

    return data;
  }


  /**
   * Log out the current user and redirect to login.
   */
  function logout() {
    localStorage.removeItem(AppConfig.AUTH_TOKEN_KEY);
    localStorage.removeItem(AppConfig.AUTH_REFRESH_KEY);
    localStorage.removeItem(AppConfig.AUTH_USER_KEY);
    window.location.href = 'login.html';
  }


  /**
   * Check if the user is currently authenticated.
   * @returns {boolean}
   */
  function isAuthenticated() {
    return !!localStorage.getItem(AppConfig.AUTH_TOKEN_KEY);
  }


  /**
   * Get the current user object from localStorage.
   * @returns {object|null}
   */
  function getUser() {
    const raw = localStorage.getItem(AppConfig.AUTH_USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }


  /**
   * Get the stored access token.
   * @returns {string|null}
   */
  function getToken() {
    return localStorage.getItem(AppConfig.AUTH_TOKEN_KEY);
  }


  /**
   * Guard a page – redirect to login if not authenticated.
   * Call this at the top of every protected page's JS.
   */
  function requireAuth() {
    if (!isAuthenticated()) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  }


  /**
   * Get initials from a user name (for avatar).
   * @param {string} name
   * @returns {string}
   */
  function getInitials(name) {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }


  return {
    login,
    logout,
    isAuthenticated,
    getUser,
    getToken,
    requireAuth,
    getInitials,
  };
})();
