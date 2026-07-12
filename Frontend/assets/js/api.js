/** Central API client. Automatically uses MockApi while DEMO_MODE is true. */
const Api = (() => {
  async function request(method, endpoint, { params = {}, data = null } = {}) {
    if (AppConfig.DEMO_MODE) return MockApi.handle(method, endpoint, { params, data });

    const query = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')).toString();
    const url = `${AppConfig.API_BASE_URL}${endpoint}${query ? `?${query}` : ''}`;
    const token = Auth.getToken();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AppConfig.API_TIMEOUT);
    const headers = { Accept: 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;
    let body;
    if (data instanceof FormData) body = data;
    else if (data !== null) { headers['Content-Type'] = 'application/json'; body = JSON.stringify(data); }

    try {
      const response = await fetch(url, { method, headers, body, signal: controller.signal });
      clearTimeout(timeoutId);
      if (response.status === 401) { Auth.logout(); return null; }
      if (response.status === 204) return null;
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) { const error = new Error(payload.detail || payload.message || `Request failed (${response.status})`); error.status = response.status; throw error; }
      return payload;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') throw new Error('Request timed out.');
      if (error instanceof TypeError) throw new Error('Unable to reach FastAPI. Confirm backend, URL and CORS.');
      throw error;
    }
  }

  return {
    get: (endpoint, params = {}) => request('GET', endpoint, { params }),
    post: (endpoint, data) => request('POST', endpoint, { data }),
    put: (endpoint, data) => request('PUT', endpoint, { data }),
    patch: (endpoint, data) => request('PATCH', endpoint, { data }),
    delete: (endpoint) => request('DELETE', endpoint),
  };
})();
