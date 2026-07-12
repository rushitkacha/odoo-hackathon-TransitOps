/**
 * TransitOps – Application Configuration
 * Central configuration for the entire frontend application.
 */

const AppConfig = Object.freeze({
  // App metadata
  APP_NAME: 'TransitOps',
  APP_SUBTITLE: 'Transport Operations',
  APP_VERSION: '1.0.0',

  // API configuration
  API_BASE_URL: 'http://localhost:8000/api/v1',
  API_TIMEOUT: 15000,    // 15 seconds

  // Authentication
  AUTH_TOKEN_KEY: 'transitops_token',
  AUTH_USER_KEY: 'transitops_user',
  AUTH_REFRESH_KEY: 'transitops_refresh_token',

  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],

  // Toast notification duration (ms)
  TOAST_DURATION: 4000,

  // Date/time formats
  DATE_FORMAT: 'YYYY-MM-DD',
  DATETIME_FORMAT: 'YYYY-MM-DD HH:mm',
  DISPLAY_DATE_FORMAT: 'DD MMM YYYY',

  // Currency
  CURRENCY_SYMBOL: '₹',
  CURRENCY_CODE: 'INR',
});
