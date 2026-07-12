/**
 * TransitOps – Confirm Dialog Component
 * Reusable confirmation dialogs built on top of Modal.
 */

const ConfirmDialog = (() => {

  /**
   * Show a confirmation dialog.
   * @param {object} options
   * @param {string} options.title      - Dialog title
   * @param {string} options.message    - Dialog message
   * @param {string} [options.type]     - 'danger' | 'warning' (icon style)
   * @param {string} [options.confirmText] - Confirm button label
   * @param {string} [options.cancelText]  - Cancel button label
   * @param {function} options.onConfirm - Called when user confirms
   * @param {function} [options.onCancel] - Called when user cancels
   */
  function show({
    title = 'Are you sure?',
    message = '',
    type = 'danger',
    confirmText = 'Delete',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
  } = {}) {
    const iconMap = {
      danger: '🗑️',
      warning: '⚠️',
    };

    const btnClass = type === 'danger' ? 'btn-danger' : 'btn-primary';

    Modal.open({
      id: 'confirm-dialog',
      title: '',
      size: 'sm',
      content: `
        <div class="confirm-dialog-icon ${type}">
          ${iconMap[type] || '❓'}
        </div>
        <div class="confirm-dialog-text">
          <div class="confirm-dialog-title">${title}</div>
          <div class="confirm-dialog-message">${message}</div>
        </div>
      `,
      footer: `
        <button class="btn btn-outline" id="confirm-cancel">${cancelText}</button>
        <button class="btn ${btnClass}" id="confirm-ok">${confirmText}</button>
      `,
      onOpen: () => {
        document.getElementById('confirm-cancel').addEventListener('click', () => {
          Modal.close('confirm-dialog');
          if (onCancel) onCancel();
        });

        document.getElementById('confirm-ok').addEventListener('click', () => {
          Modal.close('confirm-dialog');
          if (onConfirm) onConfirm();
        });
      },
    });
  }

  return { show };
})();
