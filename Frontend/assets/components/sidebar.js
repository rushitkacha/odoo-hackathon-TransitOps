/**
 * TransitOps – Sidebar Component
 * Renders and manages the sidebar navigation.
 */

const Sidebar = (() => {

  const NAV_ITEMS = [
    {
      section: 'Main',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: '📊', page: 'dashboard' },
        { id: 'trips',     label: 'Trips',     icon: '🗺️', page: 'trips' },
      ],
    },
    {
      section: 'Fleet Management',
      items: [
        { id: 'vehicles',    label: 'Vehicles',    icon: '🚛', page: 'vehicles' },
        { id: 'drivers',     label: 'Drivers',     icon: '👤', page: 'drivers' },
        { id: 'maintenance', label: 'Maintenance', icon: '🔧', page: 'maintenance' },
      ],
    },
    {
      section: 'Finance',
      items: [
        { id: 'fuel',     label: 'Fuel Logs', icon: '⛽', page: 'fuel' },
        { id: 'expenses', label: 'Expenses',  icon: '💰', page: 'expenses' },
      ],
    },
    {
      section: 'System',
      items: [
        { id: 'reports',  label: 'Reports',  icon: '📈', page: 'reports' },
        { id: 'settings', label: 'Settings', icon: '⚙️', page: 'settings' },
      ],
    },
  ];

  /**
   * Render the sidebar HTML.
   * @returns {string}
   */
  function render() {
    const user = Auth.getUser() || { name: 'Admin User', role: 'Administrator' };
    const initials = Auth.getInitials(user.name || 'Admin');

    let navHTML = '';
    NAV_ITEMS.forEach((section) => {
      navHTML += `
        <div class="sidebar-nav-section">
          <div class="sidebar-nav-label">${section.section}</div>
          ${section.items.map((item) => `
            <a href="#${item.page}" class="sidebar-nav-item" data-page="${item.page}" id="nav-${item.id}">
              <span class="sidebar-nav-icon">${item.icon}</span>
              <span class="sidebar-nav-text">${item.label}</span>
            </a>
          `).join('')}
        </div>
      `;
    });

    return `
      <aside class="sidebar" id="app-sidebar">
        <div class="sidebar-brand">
          <div class="sidebar-brand-icon">T</div>
          <div class="sidebar-brand-text">
            <div class="sidebar-brand-name">${AppConfig.APP_NAME}</div>
            <div class="sidebar-brand-subtitle">${AppConfig.APP_SUBTITLE}</div>
          </div>
        </div>

        <nav class="sidebar-nav">
          ${navHTML}
        </nav>

        <div class="sidebar-footer">
          <div class="sidebar-user" id="sidebar-user-menu">
            <div class="sidebar-user-avatar">${initials}</div>
            <div class="sidebar-user-info">
              <div class="sidebar-user-name">${user.name || 'Admin User'}</div>
              <div class="sidebar-user-role">${user.role || 'Administrator'}</div>
            </div>
          </div>
        </div>
      </aside>
      <div class="sidebar-overlay" id="sidebar-overlay"></div>
    `;
  }

  /**
   * Initialize sidebar event listeners.
   */
  function init() {
    const sidebar = document.getElementById('app-sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    // Overlay click closes mobile sidebar
    if (overlay) {
      overlay.addEventListener('click', () => {
        sidebar.classList.remove('mobile-open');
      });
    }

    // Nav item clicks
    document.querySelectorAll('.sidebar-nav-item').forEach((item) => {
      item.addEventListener('click', () => {
        // Close mobile sidebar on navigation
        if (window.innerWidth <= 1024) {
          sidebar.classList.remove('mobile-open');
        }
      });
    });
  }

  /**
   * Toggle sidebar collapse (desktop) or open (mobile).
   */
  function toggle() {
    const sidebar = document.getElementById('app-sidebar');
    if (window.innerWidth <= 1024) {
      sidebar.classList.toggle('mobile-open');
    } else {
      sidebar.classList.toggle('collapsed');
    }
  }

  return { render, init, toggle };
})();
