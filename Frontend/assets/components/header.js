/**
 * TransitOps – Header Component
 * Renders and manages the top navbar/header.
 */

const Header = (() => {

  /**
   * Render the header HTML.
   * @param {string} pageTitle - Current page title for breadcrumb
   * @returns {string}
   */
  function render(pageTitle = 'Dashboard') {
    return `
      <header class="app-header" id="app-header">
        <div class="header-left">
          <button class="header-toggle-btn" id="sidebar-toggle" aria-label="Toggle sidebar">
            <span>☰</span>
          </button>
          <div class="header-breadcrumb">
            <span>${AppConfig.APP_NAME}</span>
            <span class="header-breadcrumb-separator">/</span>
            <span class="header-breadcrumb-current">${pageTitle}</span>
          </div>
        </div>

        <div class="header-right">
          <div class="header-search" id="global-search">
            <span class="header-search-icon">🔍</span>
            <input type="text" placeholder="Search anything..." id="global-search-input" />
          </div>

          <button class="header-icon-btn" id="btn-notifications" aria-label="Notifications">
            <span>🔔</span>
            <span class="badge-dot"></span>
          </button>

          <button class="header-icon-btn" id="btn-fullscreen" aria-label="Toggle fullscreen">
            <span>⛶</span>
          </button>
        </div>
      </header>
    `;
  }

  /**
   * Initialize header event listeners.
   */
  function init() {
    // Sidebar toggle
    const toggleBtn = document.getElementById('sidebar-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => Sidebar.toggle());
    }

    // Fullscreen toggle
    const fullscreenBtn = document.getElementById('btn-fullscreen');
    if (fullscreenBtn) {
      fullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      });
    }
  }

  return { render, init };
})();
