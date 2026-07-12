/**
 * TransitOps – Fuel Logs Page
 * Log fuel fill-ups: vehicle, trip, litres, cost, date.
 * Uses: DataTable, Modal, Toast, Api, constants.
 *
 * API Endpoints (FastAPI):
 *   GET    /fuel-logs         → list   (query: page, page_size, search, fuel_type, sort_by, sort_dir)
 *   GET    /fuel-logs/:id     → single record
 *   POST   /fuel-logs         → create
 *   PUT    /fuel-logs/:id     → update
 *   DELETE /fuel-logs/:id     → delete
 *   GET    /fuel-logs/stats   → summary (total_litres, total_cost, log_count, avg_cost_per_litre)
 */

const FuelPage = (() => {

  /* ---- state ---- */
  let table = null;
  let activeFilter = 'all';


  /* ============================================================
     TEMPLATE
     ============================================================ */
  function template() {
    return `
      <!-- Page Header -->
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">Fuel Logs</h1>
          <p class="page-subtitle">Track fuel consumption, costs, and efficiency</p>
        </div>
        <div class="page-header-actions">
          <button class="btn btn-outline" id="btn-export-fuel">
            <span>📥</span> Export
          </button>
          <button class="btn btn-primary" id="btn-add-fuel">
            <span>+</span> Add Fuel Log
          </button>
        </div>
      </div>

      <!-- Summary Stat Cards -->
      <div class="stats-grid" id="fuel-stats">
        <div class="card stat-card">
          <div class="stat-card-icon" style="background: var(--color-info-light); color: var(--color-info);">⛽</div>
          <div class="stat-card-content">
            <div class="stat-card-label">Total Logs</div>
            <div class="stat-card-value" id="stat-fuel-count">—</div>
          </div>
        </div>
        <div class="card stat-card">
          <div class="stat-card-icon" style="background: var(--color-warning-light); color: var(--color-warning);">🛢️</div>
          <div class="stat-card-content">
            <div class="stat-card-label">Total Litres</div>
            <div class="stat-card-value" id="stat-fuel-litres">—</div>
          </div>
        </div>
        <div class="card stat-card">
          <div class="stat-card-icon" style="background: var(--color-danger-light); color: var(--color-danger);">💰</div>
          <div class="stat-card-content">
            <div class="stat-card-label">Total Cost</div>
            <div class="stat-card-value" id="stat-fuel-cost">—</div>
          </div>
        </div>
        <div class="card stat-card">
          <div class="stat-card-icon" style="background: var(--color-success-light); color: var(--color-success);">📊</div>
          <div class="stat-card-content">
            <div class="stat-card-label">Avg Cost / Litre</div>
            <div class="stat-card-value" id="stat-fuel-avg">—</div>
          </div>
        </div>
      </div>

      <!-- Fuel Type Filter Tabs -->
      <div class="d-flex items-center justify-between mb-4 gap-4" style="flex-wrap: wrap;">
        <div class="filter-tabs" id="fuel-filter-tabs">
          <button class="filter-tab active" data-filter="all">All</button>
          <button class="filter-tab" data-filter="diesel">Diesel</button>
          <button class="filter-tab" data-filter="petrol">Petrol</button>
          <button class="filter-tab" data-filter="cng">CNG</button>
          <button class="filter-tab" data-filter="electric">Electric</button>
        </div>
      </div>

      <!-- Data Table -->
      <div id="fuel-table"></div>
    `;
  }


  /* ============================================================
     INIT
     ============================================================ */
  function init() {
    loadStats();
    initTable();
    bindEvents();
  }


  /* ============================================================
     STATS
     ============================================================ */
  async function loadStats() {
    try {
      const stats = await Api.get('/fuel-logs/stats');
      document.getElementById('stat-fuel-count').textContent  = stats.log_count ?? 0;
      document.getElementById('stat-fuel-litres').textContent = formatLitres(stats.total_litres);
      document.getElementById('stat-fuel-cost').textContent   = formatCurrency(stats.total_cost);
      document.getElementById('stat-fuel-avg').textContent    = stats.avg_cost_per_litre != null
        ? `${AppConfig.CURRENCY_SYMBOL}${Number(stats.avg_cost_per_litre).toFixed(2)}`
        : '—';
    } catch {
      document.getElementById('stat-fuel-count').textContent  = '0';
      document.getElementById('stat-fuel-litres').textContent = '0 L';
      document.getElementById('stat-fuel-cost').textContent   = `${AppConfig.CURRENCY_SYMBOL}0`;
      document.getElementById('stat-fuel-avg').textContent    = '—';
    }
  }


  /* ============================================================
     FORMATTERS
     ============================================================ */
  function formatDate(dateStr) {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  }

  function formatCurrency(amount) {
    if (amount === null || amount === undefined) return '—';
    return `${AppConfig.CURRENCY_SYMBOL}${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  }

  function formatLitres(val) {
    if (val === null || val === undefined) return '—';
    return `${Number(val).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} L`;
  }

  function fuelTypeIcon(type) {
    const icons = { diesel: '🟤', petrol: '🟡', cng: '🟢', electric: '🔵' };
    return icons[type] || '⛽';
  }


  /* ============================================================
     DATA TABLE
     ============================================================ */
  function initTable() {
    table = DataTable.create({
      containerId: 'fuel-table',
      searchPlaceholder: 'Search by vehicle, trip, station…',
      emptyIcon: '⛽',
      emptyTitle: 'No fuel logs found',
      emptyText: 'Record your first fuel fill-up to start tracking consumption.',

      columns: [
        {
          key: 'vehicle_name',
          label: 'Vehicle',
          render: (val, row) => `
            <div class="table-cell-flex">
              <div class="table-avatar">🚛</div>
              <div>
                <div class="table-cell-primary">${escapeHTML(val)}</div>
                <div class="table-cell-secondary">${escapeHTML(row.vehicle_reg || '')}</div>
              </div>
            </div>
          `,
        },
        {
          key: 'trip_reference',
          label: 'Trip',
          render: (val) => {
            if (!val) return '<span class="text-muted">—</span>';
            return `<span class="badge badge-info"><span class="badge-dot"></span>${escapeHTML(val)}</span>`;
          },
        },
        {
          key: 'fuel_type',
          label: 'Fuel Type',
          render: (val) => {
            if (!val) return '<span class="text-muted">—</span>';
            return `<span class="fuel-type-chip">${fuelTypeIcon(val)} ${formatStatusLabel(val)}</span>`;
          },
        },
        {
          key: 'litres',
          label: 'Litres',
          render: (val) => {
            if (val === null || val === undefined) return '<span class="text-muted">—</span>';
            return `<span class="fuel-litres-value">${Number(val).toLocaleString('en-IN', { maximumFractionDigits: 2 })} L</span>`;
          },
        },
        {
          key: 'cost',
          label: 'Cost',
          render: (val, row) => {
            if (val === null || val === undefined) return '<span class="text-muted">—</span>';
            const perLitre = (row.litres && val) ? (val / row.litres).toFixed(2) : null;
            return `
              <div>
                <div class="font-semibold">${formatCurrency(val)}</div>
                ${perLitre ? `<div class="table-cell-secondary">${AppConfig.CURRENCY_SYMBOL}${perLitre}/L</div>` : ''}
              </div>
            `;
          },
        },
        {
          key: 'fill_date',
          label: 'Date',
          render: (val) => `<span>${formatDate(val)}</span>`,
        },
      ],

      actions: (row) => `
        <button class="table-action-btn" title="Edit" onclick="FuelPage.openEditModal('${row.id}')">✏️</button>
        <button class="table-action-btn danger" title="Delete" onclick="FuelPage.confirmDelete('${row.id}')">🗑️</button>
      `,

      fetchData: async (params) => {
        if (activeFilter && activeFilter !== 'all') {
          params.fuel_type = activeFilter;
        }
        return Api.get('/fuel-logs', params);
      },
    });
  }


  /* ============================================================
     EVENT BINDINGS
     ============================================================ */
  function bindEvents() {
    document.getElementById('btn-add-fuel').addEventListener('click', openAddModal);
    document.getElementById('btn-export-fuel').addEventListener('click', exportFuelLogs);

    // Fuel type filter tabs
    document.getElementById('fuel-filter-tabs').addEventListener('click', (e) => {
      const tab = e.target.closest('.filter-tab');
      if (!tab) return;

      document.querySelectorAll('#fuel-filter-tabs .filter-tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      activeFilter = tab.dataset.filter;
      if (table) {
        table.state.page = 1;
        table.refresh();
      }
    });
  }


  /* ============================================================
     ADD FUEL LOG MODAL
     ============================================================ */
  function openAddModal() {
    Modal.open({
      id: 'fuel-modal',
      title: 'Add Fuel Log',
      content: getFormHTML(),
      footer: `
        <button class="btn btn-outline" onclick="Modal.close('fuel-modal')">Cancel</button>
        <button class="btn btn-primary" id="btn-save-fuel">
          <span>+</span> Add Log
        </button>
      `,
      onOpen: () => {
        document.getElementById('btn-save-fuel').addEventListener('click', handleCreate);
        setupAutoCalc();
      },
    });
  }


  /* ============================================================
     EDIT FUEL LOG MODAL
     ============================================================ */
  async function openEditModal(id) {
    try {
      Loader.show('Loading fuel log…');
      const record = await Api.get(`/fuel-logs/${id}`);
      Loader.hide();

      Modal.open({
        id: 'fuel-modal',
        title: 'Edit Fuel Log',
        content: getFormHTML(record),
        footer: `
          <button class="btn btn-outline" onclick="Modal.close('fuel-modal')">Cancel</button>
          <button class="btn btn-primary" id="btn-save-fuel">
            <span>💾</span> Save Changes
          </button>
        `,
        onOpen: () => {
          document.getElementById('btn-save-fuel').addEventListener('click', () => handleUpdate(id));
          setupAutoCalc();
        },
      });
    } catch (err) {
      Loader.hide();
      Toast.error('Error', err.message || 'Failed to load fuel log');
    }
  }


  /* ============================================================
     DELETE CONFIRMATION
     ============================================================ */
  function confirmDelete(id) {
    ConfirmDialog.show({
      title: 'Delete Fuel Log?',
      message: 'Are you sure you want to delete this fuel log entry? This action cannot be undone.',
      type: 'danger',
      confirmText: 'Delete Log',
      onConfirm: () => handleDelete(id),
    });
  }


  /* ============================================================
     FORM HTML
     ============================================================ */
  function getFormHTML(record = {}) {
    const fuelTypeOptions = Object.entries(FUEL_TYPE).map(([, val]) =>
      `<option value="${val}" ${record.fuel_type === val ? 'selected' : ''}>${formatStatusLabel(val)}</option>`
    ).join('');

    const today = new Date().toISOString().split('T')[0];

    return `
      <form id="fuel-form" class="fuel-form" novalidate>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="f-vehicle">Vehicle <span class="required">*</span></label>
            <input class="form-input" type="text" id="f-vehicle" name="vehicle_name"
                   placeholder="e.g. Tata Ace – MH12AB1234"
                   value="${escapeAttr(record.vehicle_name)}" required />
            <div class="form-error d-none" id="f-vehicle-error"></div>
          </div>
          <div class="form-group">
            <label class="form-label" for="f-trip">Trip Reference</label>
            <input class="form-input" type="text" id="f-trip" name="trip_reference"
                   placeholder="e.g. TRIP-2026-0145"
                   value="${escapeAttr(record.trip_reference)}" />
            <div class="form-hint">Link this log to a specific trip (optional)</div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="f-date">Fill Date <span class="required">*</span></label>
            <input class="form-input" type="date" id="f-date" name="fill_date"
                   value="${record.fill_date || today}" required />
            <div class="form-error d-none" id="f-date-error"></div>
          </div>
          <div class="form-group">
            <label class="form-label" for="f-fuel-type">Fuel Type <span class="required">*</span></label>
            <select class="form-select" id="f-fuel-type" name="fuel_type" required>
              <option value="">Select fuel type</option>
              ${fuelTypeOptions}
            </select>
            <div class="form-error d-none" id="f-fuel-type-error"></div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="f-litres">Litres <span class="required">*</span></label>
            <input class="form-input" type="number" id="f-litres" name="litres"
                   placeholder="e.g. 45.5" min="0" step="0.01"
                   value="${record.litres ?? ''}" required />
            <div class="form-error d-none" id="f-litres-error"></div>
          </div>
          <div class="form-group">
            <label class="form-label" for="f-price-per-litre">Price per Litre (${AppConfig.CURRENCY_SYMBOL})</label>
            <input class="form-input" type="number" id="f-price-per-litre" name="price_per_litre"
                   placeholder="e.g. 95.50" min="0" step="0.01"
                   value="${record.price_per_litre ?? ''}" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="f-cost">Total Cost (${AppConfig.CURRENCY_SYMBOL}) <span class="required">*</span></label>
            <input class="form-input" type="number" id="f-cost" name="cost"
                   placeholder="Auto-calculated or enter manually" min="0" step="0.01"
                   value="${record.cost ?? ''}" required />
            <div class="form-error d-none" id="f-cost-error"></div>
            <div class="form-hint" id="f-cost-hint">Enter litres + price per litre to auto-calculate</div>
          </div>
          <div class="form-group">
            <label class="form-label" for="f-odometer">Odometer (km)</label>
            <input class="form-input" type="number" id="f-odometer" name="odometer"
                   placeholder="e.g. 25430" min="0"
                   value="${record.odometer ?? ''}" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="f-station">Fuel Station</label>
            <input class="form-input" type="text" id="f-station" name="station"
                   placeholder="e.g. HP Petrol Pump, Andheri"
                   value="${escapeAttr(record.station)}" />
          </div>
          <div class="form-group">
            <label class="form-label" for="f-filled-by">Filled By</label>
            <input class="form-input" type="text" id="f-filled-by" name="filled_by"
                   placeholder="Driver or attendant name"
                   value="${escapeAttr(record.filled_by)}" />
          </div>
        </div>

        <div class="form-check mb-4">
          <input type="checkbox" id="f-full-tank" name="full_tank" ${record.full_tank ? 'checked' : ''} />
          <label class="form-check-label" for="f-full-tank">Full tank fill-up</label>
        </div>

        <div class="form-group">
          <label class="form-label" for="f-notes">Notes</label>
          <textarea class="form-textarea" id="f-notes" name="notes"
                    placeholder="Any additional notes…" rows="2">${escapeAttr(record.notes)}</textarea>
        </div>
      </form>
    `;
  }


  /* ============================================================
     AUTO-CALCULATE COST (litres × price per litre)
     ============================================================ */
  function setupAutoCalc() {
    const litresInput = document.getElementById('f-litres');
    const priceInput  = document.getElementById('f-price-per-litre');
    const costInput   = document.getElementById('f-cost');
    const hint        = document.getElementById('f-cost-hint');

    function recalc() {
      const litres = parseFloat(litresInput.value);
      const price  = parseFloat(priceInput.value);
      if (litres > 0 && price > 0) {
        costInput.value = (litres * price).toFixed(2);
        hint.textContent = `Auto: ${litres} L × ${AppConfig.CURRENCY_SYMBOL}${price} = ${AppConfig.CURRENCY_SYMBOL}${costInput.value}`;
        hint.style.color = 'var(--color-success)';
      }
    }

    litresInput.addEventListener('input', recalc);
    priceInput.addEventListener('input', recalc);
  }


  /* ============================================================
     FORM VALIDATION
     ============================================================ */
  function validateForm() {
    let valid = true;
    const fields = [
      { id: 'f-vehicle',   errorId: 'f-vehicle-error',    message: 'Vehicle is required' },
      { id: 'f-date',      errorId: 'f-date-error',       message: 'Fill date is required' },
      { id: 'f-fuel-type', errorId: 'f-fuel-type-error',  message: 'Select a fuel type' },
      { id: 'f-litres',    errorId: 'f-litres-error',     message: 'Litres is required' },
      { id: 'f-cost',      errorId: 'f-cost-error',       message: 'Total cost is required' },
    ];

    document.querySelectorAll('#fuel-form .form-input, #fuel-form .form-select').forEach((el) => {
      el.classList.remove('error');
    });
    document.querySelectorAll('#fuel-form .form-error').forEach((el) => {
      el.classList.add('d-none');
      el.textContent = '';
    });

    fields.forEach((f) => {
      const input = document.getElementById(f.id);
      const error = document.getElementById(f.errorId);
      if (!input.value.trim()) {
        input.classList.add('error');
        error.textContent = f.message;
        error.classList.remove('d-none');
        valid = false;
      }
    });

    return valid;
  }


  /* ============================================================
     COLLECT FORM DATA
     ============================================================ */
  function collectFormData() {
    return {
      vehicle_name:    document.getElementById('f-vehicle').value.trim(),
      trip_reference:  document.getElementById('f-trip').value.trim() || null,
      fill_date:       document.getElementById('f-date').value,
      fuel_type:       document.getElementById('f-fuel-type').value,
      litres:          parseFloat(document.getElementById('f-litres').value) || 0,
      price_per_litre: parseFloat(document.getElementById('f-price-per-litre').value) || null,
      cost:            parseFloat(document.getElementById('f-cost').value) || 0,
      odometer:        parseInt(document.getElementById('f-odometer').value) || null,
      station:         document.getElementById('f-station').value.trim() || null,
      filled_by:       document.getElementById('f-filled-by').value.trim() || null,
      full_tank:       document.getElementById('f-full-tank').checked,
      notes:           document.getElementById('f-notes').value.trim() || null,
    };
  }


  /* ============================================================
     API HANDLERS
     ============================================================ */
  async function handleCreate() {
    if (!validateForm()) return;

    const btn = document.getElementById('btn-save-fuel');
    btn.classList.add('loading');
    btn.disabled = true;

    try {
      const data = collectFormData();
      await Api.post('/fuel-logs', data);

      Modal.close('fuel-modal');
      Toast.success('Fuel Log Added', `${formatLitres(data.litres)} recorded for ${data.vehicle_name}.`);
      refreshPage();
    } catch (err) {
      Toast.error('Error', err.message || 'Failed to add fuel log');
    } finally {
      btn.classList.remove('loading');
      btn.disabled = false;
    }
  }

  async function handleUpdate(id) {
    if (!validateForm()) return;

    const btn = document.getElementById('btn-save-fuel');
    btn.classList.add('loading');
    btn.disabled = true;

    try {
      const data = collectFormData();
      await Api.put(`/fuel-logs/${id}`, data);

      Modal.close('fuel-modal');
      Toast.success('Fuel Log Updated', 'The fuel log entry has been updated.');
      refreshPage();
    } catch (err) {
      Toast.error('Error', err.message || 'Failed to update fuel log');
    } finally {
      btn.classList.remove('loading');
      btn.disabled = false;
    }
  }

  async function handleDelete(id) {
    try {
      await Api.delete(`/fuel-logs/${id}`);
      Toast.success('Log Deleted', 'The fuel log entry has been removed.');
      refreshPage();
    } catch (err) {
      Toast.error('Error', err.message || 'Failed to delete fuel log');
    }
  }


  /* ============================================================
     EXPORT
     ============================================================ */
  function exportFuelLogs() {
    if (!table || !table.state.data.length) {
      Toast.warning('No Data', 'There are no fuel logs to export.');
      return;
    }

    const headers = ['Vehicle', 'Trip', 'Fuel Type', 'Litres', 'Cost', 'Date', 'Station'];
    const rows = table.state.data.map((f) => [
      f.vehicle_name || '',
      f.trip_reference || '',
      formatStatusLabel(f.fuel_type),
      f.litres ?? '',
      f.cost ?? '',
      f.fill_date || '',
      f.station || '',
    ]);

    let csv = headers.join(',') + '\n';
    rows.forEach((row) => {
      csv += row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fuel_logs_export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    Toast.success('Exported', 'Fuel log data has been downloaded as CSV.');
  }


  /* ============================================================
     HELPERS
     ============================================================ */
  function refreshPage() {
    loadStats();
    if (table) table.refresh();
  }

  function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    const div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
  }

  function escapeAttr(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }


  /* ============================================================
     PUBLIC API
     ============================================================ */
  return {
    template,
    init,
    openEditModal,
    confirmDelete,
  };

})();
