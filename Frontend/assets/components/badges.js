/**
 * TransitOps – Badges Component
 * Helper functions for rendering status badges.
 * (Main logic is in constants.js — this file adds any extra badge utilities.)
 */

const Badges = (() => {

  /**
   * Render a count badge (e.g., for notifications or filter counts).
   * @param {number} count
   * @param {string} [type='neutral'] - 'success' | 'warning' | 'danger' | 'info' | 'neutral'
   * @returns {string} HTML string
   */
  function countBadge(count, type = 'neutral') {
    return `<span class="badge badge-${type}">${count}</span>`;
  }

  /**
   * Render a priority badge.
   * @param {string} priority - 'high' | 'medium' | 'low'
   * @returns {string} HTML string
   */
  function priorityBadge(priority) {
    const map = {
      high:   { class: 'badge-danger',  label: 'High' },
      medium: { class: 'badge-warning', label: 'Medium' },
      low:    { class: 'badge-info',    label: 'Low' },
    };
    const p = map[priority] || map.medium;
    return `<span class="badge ${p.class}"><span class="badge-dot"></span>${p.label}</span>`;
  }

  /**
   * Render a boolean badge (yes/no, active/inactive, etc.).
   * @param {boolean} value
   * @param {string} [trueLabel='Yes']
   * @param {string} [falseLabel='No']
   * @returns {string}
   */
  function boolBadge(value, trueLabel = 'Yes', falseLabel = 'No') {
    const cls = value ? 'badge-success' : 'badge-neutral';
    const label = value ? trueLabel : falseLabel;
    return `<span class="badge ${cls}"><span class="badge-dot"></span>${label}</span>`;
  }

  return { countBadge, priorityBadge, boolBadge };
})();
