const Sidebar = (() => {
  const NAV_ITEMS = [
    { section: 'Operations', items: [
      { id: 'dashboard', label: 'Dashboard', icon: '📊', page: 'dashboard' },
      { id: 'trips', label: 'Trips & Dispatch', icon: '🗺️', page: 'trips' },
    ]},
    { section: 'Fleet', items: [
      { id: 'vehicles', label: 'Vehicles', icon: '🚛', page: 'vehicles' },
      { id: 'drivers', label: 'Drivers & Safety', icon: '👤', page: 'drivers' },
      { id: 'maintenance', label: 'Maintenance', icon: '🔧', page: 'maintenance' },
    ]},
    { section: 'Costs', items: [
      { id: 'fuel', label: 'Fuel Logs', icon: '⛽', page: 'fuel' },
      { id: 'expenses', label: 'Expenses', icon: '💰', page: 'expenses' },
    ]},
    { section: 'Administration', items: [
      { id: 'reports', label: 'Reports & Analytics', icon: '📈', page: 'reports' },
      { id: 'settings', label: 'Settings & Roles', icon: '⚙️', page: 'settings' },
    ]},
  ];

  function render() {
    const user = Auth.getUser() || { name: 'TransitOps User', role: 'User' };
    return `<aside class="sidebar" id="app-sidebar">
      <div class="sidebar-brand"><div class="sidebar-brand-icon">T</div><div class="sidebar-brand-text"><div class="sidebar-brand-name">${AppConfig.APP_NAME}</div><div class="sidebar-brand-subtitle">${AppConfig.APP_SUBTITLE}</div></div></div>
      <nav class="sidebar-nav">${NAV_ITEMS.map((section) => `<div class="sidebar-nav-section"><div class="sidebar-nav-label">${section.section}</div>${section.items.map((item) => `<a href="#${item.page}" class="sidebar-nav-item" data-page="${item.page}" id="nav-${item.id}"><span class="sidebar-nav-icon">${item.icon}</span><span class="sidebar-nav-text">${item.label}</span></a>`).join('')}</div>`).join('')}</nav>
      <div class="sidebar-footer"><div class="sidebar-user"><div class="sidebar-user-avatar">${Auth.getInitials(user.name || user.email)}</div><div class="sidebar-user-info"><div class="sidebar-user-name">${Utils.escapeHTML(user.name || user.email)}</div><div class="sidebar-user-role">${Utils.escapeHTML(user.role || '')}</div></div></div></div>
    </aside><div class="sidebar-overlay" id="sidebar-overlay"></div>`;
  }
  function init() {
    const sidebar = document.getElementById('app-sidebar');
    document.getElementById('sidebar-overlay')?.addEventListener('click', () => sidebar.classList.remove('mobile-open'));
    document.querySelectorAll('.sidebar-nav-item').forEach((item) => item.addEventListener('click', () => { if (window.innerWidth <= 1024) sidebar.classList.remove('mobile-open'); }));
  }
  function toggle() { const sidebar = document.getElementById('app-sidebar'); if (window.innerWidth <= 1024) sidebar.classList.toggle('mobile-open'); else sidebar.classList.toggle('collapsed'); }
  return { render, init, toggle };
})();
