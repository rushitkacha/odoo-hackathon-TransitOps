/** Login, token storage and frontend-only demo authentication. */
const Auth = (() => {
  function storeSession(data) {
    localStorage.setItem(AppConfig.AUTH_TOKEN_KEY, data.access_token);
    if (data.refresh_token) localStorage.setItem(AppConfig.AUTH_REFRESH_KEY, data.refresh_token);
    if (data.user) localStorage.setItem(AppConfig.AUTH_USER_KEY, JSON.stringify(data.user));
  }

  async function login(email, password) {
    if (AppConfig.DEMO_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 250));
      if (email !== AppConfig.DEMO_EMAIL || password !== AppConfig.DEMO_PASSWORD) {
        throw new Error(`Use ${AppConfig.DEMO_EMAIL} / ${AppConfig.DEMO_PASSWORD} while demo mode is enabled.`);
      }
      const data = {
        access_token: 'demo-access-token',
        token_type: 'bearer',
        user: { id: 1, name: 'Aarav Mehta', email, role: USER_ROLES.FLEET_MANAGER, status: 'Active' },
      };
      storeSession(data);
      return data;
    }

    // FastAPI OAuth2PasswordRequestForm contract.
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    let response;
    try {
      response = await fetch(`${AppConfig.API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData,
      });
    } catch {
      throw new Error('Cannot reach FastAPI. Start the backend on http://localhost:8000 and confirm CORS.');
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.detail || 'Invalid email or password.');
    if (!data.access_token) throw new Error('Login response is missing access_token.');
    storeSession(data);
    return data;
  }

  function logout() {
    localStorage.removeItem(AppConfig.AUTH_TOKEN_KEY);
    localStorage.removeItem(AppConfig.AUTH_REFRESH_KEY);
    localStorage.removeItem(AppConfig.AUTH_USER_KEY);
    window.location.href = 'login.html';
  }

  function isAuthenticated() {
    return Boolean(localStorage.getItem(AppConfig.AUTH_TOKEN_KEY));
  }

  function getUser() {
    try { return JSON.parse(localStorage.getItem(AppConfig.AUTH_USER_KEY)); }
    catch { return null; }
  }

  function getToken() { return localStorage.getItem(AppConfig.AUTH_TOKEN_KEY); }

  function requireAuth() {
    if (!isAuthenticated()) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  }

  function getInitials(name) { return Utils.getInitials(name); }

  return { login, logout, isAuthenticated, getUser, getToken, requireAuth, getInitials };
})();
