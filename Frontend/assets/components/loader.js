/**
 * TransitOps – Loader Component
 * Full-page loading overlay.
 */

const Loader = (() => {

  let overlay = null;

  /**
   * Show the full-page loader.
   * @param {string} [text='Loading...'] - Loading text
   */
  function show(text = 'Loading...') {
    if (overlay) return;

    overlay = document.createElement('div');
    overlay.className = 'loader-overlay';
    overlay.id = 'page-loader';
    overlay.innerHTML = `
      <div class="spinner spinner-lg"></div>
      <div class="loader-text">${text}</div>
    `;
    document.body.appendChild(overlay);
  }

  /**
   * Hide the full-page loader.
   */
  function hide() {
    if (overlay) {
      overlay.remove();
      overlay = null;
    }
  }

  return { show, hide };
})();
