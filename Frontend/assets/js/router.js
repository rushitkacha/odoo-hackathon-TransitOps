/**
 * TransitOps – Client-Side Router
 * Hash-based SPA router for navigating between pages within app.html
 */

const Router = (() => {

  const routes = {};
  let currentRoute = null;
  let contentContainer = null;

  /**
   * Register a route.
   * @param {string} hash - e.g., 'dashboard', 'vehicles', 'drivers'
   * @param {object} config - { title, init, template }
   */
  function register(hash, config) {
    routes[hash] = config;
  }

  /**
   * Initialize the router.
   * @param {string} containerSelector - CSS selector for the page content container
   * @param {string} defaultRoute - Default hash route
   */
  function init(containerSelector, defaultRoute = 'dashboard') {
    contentContainer = document.querySelector(containerSelector);

    window.addEventListener('hashchange', () => {
      navigate(getHash());
    });

    // Navigate to current hash or default
    const initialHash = getHash() || defaultRoute;
    if (!window.location.hash) {
      window.location.hash = `#${initialHash}`;
    } else {
      navigate(initialHash);
    }
  }

  /**
   * Navigate to a route.
   * @param {string} hash
   */
  function navigate(hash) {
    const route = routes[hash];

    if (!route) {
      console.warn(`[Router] Unknown route: ${hash}`);
      return;
    }

    // Update active nav
    document.querySelectorAll('.sidebar-nav-item').forEach((item) => {
      item.classList.toggle('active', item.dataset.page === hash);
    });

    // Update page title
    document.title = `${route.title} – ${AppConfig.APP_NAME}`;

    // Update breadcrumb
    const breadcrumbCurrent = document.querySelector('.header-breadcrumb-current');
    if (breadcrumbCurrent) {
      breadcrumbCurrent.textContent = route.title;
    }

    // Load template into content area
    if (contentContainer && route.template) {
      contentContainer.innerHTML = route.template;
    }

    // Run page init function
    if (route.init && typeof route.init === 'function') {
      route.init();
    }

    currentRoute = hash;
  }

  /**
   * Get current hash without the # symbol.
   */
  function getHash() {
    return window.location.hash.replace('#', '').split('?')[0];
  }

  /**
   * Get the current route name.
   */
  function getCurrent() {
    return currentRoute;
  }

  return { register, init, navigate, getCurrent };
})();
