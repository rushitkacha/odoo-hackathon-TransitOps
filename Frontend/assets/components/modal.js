/**
 * TransitOps – Modal Component
 * Reusable modal dialogs.
 */

const Modal = (() => {

  let activeModal = null;

  /**
   * Open a modal dialog.
   * @param {object} options
   * @param {string} options.id        - Unique ID for the modal
   * @param {string} options.title     - Modal title
   * @param {string} options.content   - HTML content for the modal body
   * @param {string} [options.size]    - 'sm' | 'lg' | default
   * @param {string} [options.footer]  - HTML for modal footer. If omitted, no footer is rendered.
   * @param {function} [options.onOpen]  - Callback after modal opens
   * @param {function} [options.onClose] - Callback after modal closes
   */
  function open({ id = 'modal', title = '', content = '', size = '', footer = '', onOpen, onClose } = {}) {
    // Close any existing modal
    if (activeModal) {
      close(activeModal.id, false);
    }

    const sizeClass = size ? `modal-${size}` : '';

    const overlay = document.createElement('div');
    overlay.id = `${id}-overlay`;
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal ${sizeClass}" role="dialog" aria-modal="true" aria-labelledby="${id}-title">
        <div class="modal-header">
          <h3 class="modal-title" id="${id}-title">${title}</h3>
          <button class="modal-close" aria-label="Close modal" data-modal-close>✕</button>
        </div>
        <div class="modal-body" id="${id}-body">
          ${content}
        </div>
        ${footer ? `<div class="modal-footer" id="${id}-footer">${footer}</div>` : ''}
      </div>
    `;

    document.body.appendChild(overlay);

    // Trigger open animation
    requestAnimationFrame(() => {
      overlay.classList.add('open');
    });

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        close(id);
      }
    });

    // Close button
    overlay.querySelector('[data-modal-close]').addEventListener('click', () => {
      close(id);
    });

    // ESC key
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        close(id);
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    activeModal = { id, onClose, escHandler };

    if (onOpen) {
      onOpen(overlay);
    }

    return overlay;
  }

  /**
   * Close a modal by ID.
   * @param {string} id
   * @param {boolean} triggerCallback - Whether to call onClose
   */
  function close(id, triggerCallback = true) {
    const overlay = document.getElementById(`${id}-overlay`);
    if (!overlay) return;

    overlay.classList.remove('open');

    setTimeout(() => {
      overlay.remove();
      document.body.style.overflow = '';

      if (triggerCallback && activeModal && activeModal.onClose) {
        activeModal.onClose();
      }

      if (activeModal && activeModal.escHandler) {
        document.removeEventListener('keydown', activeModal.escHandler);
      }

      activeModal = null;
    }, 250);
  }

  /**
   * Update the body content of an open modal.
   * @param {string} id
   * @param {string} html
   */
  function updateBody(id, html) {
    const body = document.getElementById(`${id}-body`);
    if (body) body.innerHTML = html;
  }

  return { open, close, updateBody };
})();
