/**
 * TransitOps – Toast Notification Component
 * Global toast/snackbar notifications.
 */

const Toast = (() => {

  let container = null;

  /**
   * Ensure the toast container exists in the DOM.
   */
  function ensureContainer() {
    if (!container) {
      container = document.getElementById('toast-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
      }
    }
    return container;
  }

  /**
   * Show a toast notification.
   * @param {object} options
   * @param {string} options.type     - 'success' | 'error' | 'warning' | 'info'
   * @param {string} options.title    - Toast title
   * @param {string} options.message  - Toast message body
   * @param {number} [options.duration] - Auto-dismiss duration in ms
   */
  function show({ type = 'info', title = '', message = '', duration = AppConfig.TOAST_DURATION } = {}) {
    const wrapper = ensureContainer();

    const iconMap = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ',
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.style.position = 'relative';
    toast.innerHTML = `
      <div class="toast-icon">${iconMap[type] || 'ℹ'}</div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        ${message ? `<div class="toast-message">${message}</div>` : ''}
      </div>
      <button class="toast-close" aria-label="Close">✕</button>
      <div class="toast-progress" style="animation-duration: ${duration}ms;"></div>
    `;

    // Close button
    toast.querySelector('.toast-close').addEventListener('click', () => dismiss(toast));

    wrapper.appendChild(toast);

    // Auto-dismiss
    if (duration > 0) {
      setTimeout(() => dismiss(toast), duration);
    }

    return toast;
  }

  /**
   * Dismiss a toast with animation.
   */
  function dismiss(toast) {
    if (!toast || toast.classList.contains('removing')) return;
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }

  // --- Convenience methods ---
  function success(title, message) { return show({ type: 'success', title, message }); }
  function error(title, message)   { return show({ type: 'error', title, message }); }
  function warning(title, message) { return show({ type: 'warning', title, message }); }
  function info(title, message)    { return show({ type: 'info', title, message }); }

  return { show, success, error, warning, info };
})();
