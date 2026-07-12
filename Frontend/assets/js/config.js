/** TransitOps frontend configuration. */
const AppConfig = Object.freeze({
  APP_NAME: 'TransitOps',
  APP_SUBTITLE: 'Transport Operations',
  APP_VERSION: '1.1.0',

  // Keep true while the FastAPI backend is not available.
  // Change to false once the backend endpoints are ready.
  DEMO_MODE: true,

  API_BASE_URL: 'http://localhost:8000/api/v1',
  API_TIMEOUT: 15000,

  AUTH_TOKEN_KEY: 'transitops_token',
  AUTH_USER_KEY: 'transitops_user',
  AUTH_REFRESH_KEY: 'transitops_refresh_token',
  DEMO_DB_KEY: 'transitops_demo_db_v2',

  DEMO_EMAIL: 'fleet@transitops.com',
  DEMO_PASSWORD: 'password123',

  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50],
  TOAST_DURATION: 3500,

  CURRENCY_SYMBOL: '₹',
  CURRENCY_CODE: 'INR',
});
