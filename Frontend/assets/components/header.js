const Header = (() => {
  function render(pageTitle = 'Dashboard') {
    const user = Auth.getUser() || { name: 'TransitOps User', role: 'User' };
    return `
      <header class="app-header" id="app-header">
        <div class="header-left">
          <button class="header-toggle-btn" id="sidebar-toggle" aria-label="Toggle sidebar"><span>☰</span></button>
          <div class="header-breadcrumb"><span>${AppConfig.APP_NAME}</span><span class="header-breadcrumb-separator">/</span><span class="header-breadcrumb-current">${Utils.escapeHTML(pageTitle)}</span></div>
        </div>
        <div class="header-right">
          ${AppConfig.DEMO_MODE ? '<span class="demo-mode-chip">Frontend Demo</span>' : ''}
          <div class="header-user-compact"><strong>${Utils.escapeHTML(user.name || user.email)}</strong><span>${Utils.escapeHTML(user.role || '')}</span></div>
          <button class="btn btn-outline btn-sm" id="btn-logout">Logout</button>
          <button class="header-icon-btn" id="btn-fullscreen" aria-label="Toggle fullscreen"><span>⛶</span></button>
        </div>
      </header>`;
  }

  function init() {
    document.getElementById('sidebar-toggle')?.addEventListener('click', () => Sidebar.toggle());
    document.getElementById('btn-logout')?.addEventListener('click', Auth.logout);
    document.getElementById('btn-fullscreen')?.addEventListener('click', () => {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
      else document.exitFullscreen().catch(() => {});
    });
  }
  return { render, init };
})();
