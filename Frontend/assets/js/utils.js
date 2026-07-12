/**
 * TransitOps – Shared Utilities
 * Common helper functions used across multiple page modules.
 * Eliminates code duplication for escaping, formatting, etc.
 */

const Utils = (() => {

  /**
   * Escape HTML entities to prevent XSS in rendered content.
   * @param {*} str - Value to escape
   * @returns {string} Safe HTML string
   */
  function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    const div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
  }

  /**
   * Escape a value for safe use inside HTML attributes.
   * @param {*} str - Value to escape
   * @returns {string} Safe attribute string
   */
  function escapeAttr(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /**
   * Format an ISO date string to display format (DD MMM YYYY).
   * @param {string} dateStr - ISO date string (YYYY-MM-DD)
   * @returns {string} Formatted date or '—'
   */
  function formatDate(dateStr) {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  }

  /**
   * Format a numeric amount as Indian Rupees.
   * @param {number|null} amount
   * @returns {string} Formatted currency or '—'
   */
  function formatCurrency(amount) {
    if (amount === null || amount === undefined) return '—';
    return `${AppConfig.CURRENCY_SYMBOL}${Number(amount).toLocaleString('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  }

  /**
   * Get initials from a name string.
   * @param {string} name
   * @returns {string} Up to 2 uppercase initials
   */
  function getInitials(name) {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  return { escapeHTML, escapeAttr, formatDate, formatCurrency, getInitials };
})();
