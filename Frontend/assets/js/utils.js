/** Shared formatting and safe rendering helpers. */
const Utils = (() => {
  function escapeHTML(value) {
    if (value === null || value === undefined) return '';
    const div = document.createElement('div');
    div.textContent = String(value);
    return div.innerHTML;
  }

  function escapeAttr(value) {
    return escapeHTML(value).replace(/`/g, '&#96;');
  }

  function formatDate(value) {
    if (!value) return '—';
    const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function formatCurrency(value) {
    if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
    return `${AppConfig.CURRENCY_SYMBOL}${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  }

  function toNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function getInitials(name) {
    return String(name || '?').split(/\s+/).filter(Boolean).map((part) => part[0]).join('').toUpperCase().slice(0, 2);
  }

  function downloadCSV(filename, headers, rows) {
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  function todayISO() {
    return new Date().toISOString().slice(0, 10);
  }

  return { escapeHTML, escapeAttr, formatDate, formatCurrency, toNumber, getInitials, downloadCSV, todayISO };
})();
