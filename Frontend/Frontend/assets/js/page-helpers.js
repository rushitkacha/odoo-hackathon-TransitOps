const PageHelpers = (() => {
  function statsCard(icon, label, value, tone = 'info') {
    const colors = { info: ['var(--color-info-light)', 'var(--color-info)'], success: ['var(--color-success-light)', 'var(--color-success)'], warning: ['var(--color-warning-light)', 'var(--color-warning)'], danger: ['var(--color-danger-light)', 'var(--color-danger)'] };
    const [bg, color] = colors[tone] || colors.info;
    return `<div class="card stat-card"><div class="stat-card-icon" style="background:${bg};color:${color}">${icon}</div><div class="stat-card-content"><div class="stat-card-label">${Utils.escapeHTML(label)}</div><div class="stat-card-value">${Utils.escapeHTML(value)}</div></div></div>`;
  }
  function pageHeader(title, subtitle, actions = '') {
    return `<div class="page-header"><div class="page-header-left"><h1 class="page-title">${Utils.escapeHTML(title)}</h1><p class="page-subtitle">${Utils.escapeHTML(subtitle)}</p></div><div class="page-header-actions">${actions}</div></div>`;
  }
  function option(value, label, selected) { return `<option value="${Utils.escapeAttr(value)}" ${String(value) === String(selected) ? 'selected' : ''}>${Utils.escapeHTML(label)}</option>`; }
  function required(value, message) { if (value === null || value === undefined || String(value).trim() === '') throw new Error(message); return value; }
  return { statsCard, pageHeader, option, required };
})();
