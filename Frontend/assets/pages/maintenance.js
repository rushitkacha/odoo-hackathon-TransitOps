/**
 * TransitOps – Maintenance Page
 * Full CRUD with workflow: schedule → start → close.
 * Uses: DataTable, Modal, ConfirmDialog, Toast, Api, constants.
 *
 * API Endpoints (FastAPI):
 *   GET    /maintenance            → list   (query: page, page_size, search, status, type, sort_by, sort_dir)
 *   GET    /maintenance/:id        → single record
 *   POST   /maintenance            → create (schedule)
 *   PUT    /maintenance/:id        → update
 *   PATCH  /maintenance/:id/start  → start maintenance  (status → in_progress)
 *   PATCH  /maintenance/:id/close  → close maintenance   (status → completed)
 *   DELETE /maintenance/:id        → delete
 *   GET    /maintenance/stats      → summary counts
 */

const MaintenancePage = (() => {

  /* ---- state ---- */
  let table = null;
  let activeFilter = 'all';

  /* ============================================================
     PRIORITY LEVELS
     ============================================================ */
  const PRIORITY_LEVELS = ['low', 'medium', 'high'];


  /* ============================================================
     TEMPLATE
     ============================================================ */
  function template() {
    return `
      <!-- Page Header -->
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">Maintenance</h1>
          <p class="page-subtitle">Schedule, track, and close vehicle maintenance jobs</p>
        </div>
        <div class="page-header-actions">
          <button class="btn btn-outline" id="btn-export-maintenance">
            <span>📥</span> Export
          </button>
          <button class="btn btn-primary" id="btn-add-maintenance">
            <span>+</span> Schedule Maintenance
          </button>
        </div>
      </div>

      <!-- Summary Stat Cards -->
      <div class="stats-grid" id="maintenance-stats">
        <div class="card stat-card">
          <div class="stat-card-icon" style="background: var(--color-info-light); color: var(--color-info);">🔧</div>
          <div class="stat-card-content">
            <div class="stat-card-label">Total Records</div>
            <div class="stat-card-value" id="stat-maint-total">—</div>
          </div>
        </div>
        <div class="card stat-card">
          <div class="stat-card-icon" style="background: var(--color-info-light); color: var(--color-info);">📅</div>
          <div class="stat-card-content">
            <div class="stat-card-label">Scheduled</div>
            <div class="stat-card-value" id="stat-maint-scheduled">—</div>
          </div>
        </div>
        <div class="card stat-card">
          <div class="stat-card-icon" style="background: var(--color-warning-light); color: var(--color-warning);">⚙️</div>
          <div class="stat-card-content">
            <div class="stat-card-label">In Progress</div>
            <div class="stat-card-value" id="stat-maint-progress">—</div>
          </div>
        </div>
        <div class="card stat-card">
          <div class="stat-card-icon" style="background: var(--color-danger-light); color: var(--color-danger);">⏰</div>
          <div class="stat-card-content">
            <div class="stat-card-label">Overdue</div>
            <div class="stat-card-value" id="stat-maint-overdue">—</div>
          </div>
        </div>
      </div>

      <!-- Status Filter Tabs -->
      <div class="d-flex items-center justify-between mb-4 gap-4" style="flex-wrap: wrap;">
        <div class="filter-tabs" id="maintenance-filter-tabs">
          <button class="filter-tab active" data-filter="all">All</button>
          <button class="filter-tab" data-filter="scheduled">Scheduled</button>
          <button class="filter-tab" data-filter="in_progress">In Progress</button>
          <button class="filter-tab" data-filter="completed">Completed</button>
          <button class="filter-tab" data-filter="overdue">Overdue</button>
          <button class="filter-tab" data-filter="cancelled">Cancelled</button>
        </div>
      </div>

      <!-- Data Table -->
      <div id="maintenance-table"></div>
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
      const stats = await Api.get('/maintenance/stats');
      document.getElementById('stat-maint-total').textContent     = stats.total ?? 0;
      document.getElementById('stat-maint-scheduled').textContent = stats.scheduled ?? 0;
      document.getElementById('stat-maint-progress').textContent  = stats.in_progress ?? 0;
      document.getElementById('stat-maint-overdue').textContent   = stats.overdue ?? 0;
    } catch {
      document.getElementById('stat-maint-total').textContent     = '0';
      document.getElementById('stat-maint-scheduled').textContent = '0';
      document.getElementById('stat-maint-progress').textContent  = '0';
      document.getElementById('stat-maint-overdue').textContent   = '0';
    }
  }


  /* ============================================================
     HELPERS
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

  /**
   * Build inline action buttons based on current status.
   * Scheduled → can Start or Delete
   * In Progress → can Close or Delete
   * Completed/Cancelled → can only Delete
   */
  function getRowActions(row) {
    let html = '';

    // Start button – only for scheduled
    if (row.status === MAINTENANCE_STATUS.SCHEDULED) {
      html += `<button class="table-action-btn maint-action-start" title="Start Maintenance" onclick="MaintenancePage.startMaintenance('${row.id}')">▶️</button>`;
    }

    // Close button – only for in_progress
    if (row.status === MAINTENANCE_STATUS.IN_PROGRESS) {
      html += `<button class="table-action-btn maint-action-close" title="Close / Complete" onclick="MaintenancePage.closeMaintenance('${row.id}')">✅</button>`;
    }

    // Edit – only for scheduled or in_progress
    if (row.status === MAINTENANCE_STATUS.SCHEDULED || row.status === MAINTENANCE_STATUS.IN_PROGRESS) {
      html += `<button class="table-action-btn" title="Edit" onclick="MaintenancePage.openEditModal('${row.id}')">✏️</button>`;
    }

    // Delete – always
    html += `<button class="table-action-btn danger" title="Delete" onclick="MaintenancePage.confirmDelete('${row.id}')">🗑️</button>`;

    return html;
  }


  /* ============================================================
     DATA TABLE
     ============================================================ */
  function initTable() {
    table = DataTable.create({
      containerId: 'maintenance-table',
      searchPlaceholder: 'Search by vehicle, type, description…',
      emptyIcon: '🔧',
      emptyTitle: 'No maintenance records',
      emptyText: 'Schedule your first maintenance job to get started.',

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
          key: 'maintenance_type',
          label: 'Type',
          render: (val) => {
            const iconMap = {
              preventive: '🛡️',
              corrective: '🔩',
              emergency:  '🚨',
              inspection: '🔍',
            };
            const icon = iconMap[val] || '🔧';
            return `<span class="badge badge-neutral">${icon} ${formatStatusLabel(val)}</span>`;
          },
        },
        {
          key: 'description',
          label: 'Description',
          render: (val) => {
            if (!val) return '<span class="text-muted">—</span>';
            const truncated = val.length > 40 ? val.substring(0, 40) + '…' : val;
            return `<span class="text-secondary" title="${escapeAttr(val)}">${escapeHTML(truncated)}</span>`;
          },
        },
        {
          key: 'scheduled_date',
          label: 'Date',
          render: (val, row) => {
            const scheduled = formatDate(val);
            const completed = row.completed_date ? formatDate(row.completed_date) : null;

            if (completed) {
              return `
                <div class="maint-dates">
                  <div class="maint-date-line">
                    <span class="maint-date-label">Scheduled</span>
                    <span>${scheduled}</span>
                  </div>
                  <div class="maint-date-line completed">
                    <span class="maint-date-label">Completed</span>
                    <span>${completed}</span>
                  </div>
                </div>`;
            }

            // Check if overdue
            if (val && row.status !== MAINTENANCE_STATUS.COMPLETED && row.status !== MAINTENANCE_STATUS.CANCELLED) {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const schedDate = new Date(val);
              schedDate.setHours(0, 0, 0, 0);
              if (schedDate < today) {
                return `<span class="maint-date-overdue">${scheduled}</span>`;
              }
            }

            return `<span>${scheduled}</span>`;
          },
        },
        {
          key: 'cost',
          label: 'Cost',
          render: (val) => {
            if (val === null || val === undefined || val === 0) return '<span class="text-muted">—</span>';
            return `<span class="font-semibold">${formatCurrency(val)}</span>`;
          },
        },
        {
          key: 'status',
          label: 'Status',
          render: (val) => getStatusBadgeHTML(val),
        },
      ],

      actions: (row) => getRowActions(row),

      fetchData: async (params) => {
        if (activeFilter && activeFilter !== 'all') {
          params.status = activeFilter;
        }
        return Api.get('/maintenance', params);
      },
    });
  }


  /* ============================================================
     EVENT BINDINGS
     ============================================================ */
  function bindEvents() {
    document.getElementById('btn-add-maintenance').addEventListener('click', openAddModal);
    document.getElementById('btn-export-maintenance').addEventListener('click', exportMaintenance);

    // Status filter tabs
    document.getElementById('maintenance-filter-tabs').addEventListener('click', (e) => {
      const tab = e.target.closest('.filter-tab');
      if (!tab) return;

      document.querySelectorAll('#maintenance-filter-tabs .filter-tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      activeFilter = tab.dataset.filter;
      if (table) {
        table.state.page = 1;
        table.refresh();
      }
    });
  }


  /* ============================================================
     START MAINTENANCE (scheduled → in_progress)
     ============================================================ */
  function startMaintenance(id) {
    ConfirmDialog.show({
      title: 'Start Maintenance?',
      message: 'This will mark the maintenance job as "In Progress". The vehicle status may also be updated.',
      type: 'warning',
      confirmText: 'Start Now',
      cancelText: 'Not Yet',
      onConfirm: async () => {
        try {
          await Api.patch(`/maintenance/${id}/start`, {});
          Toast.success('Maintenance Started', 'The job is now in progress.');
          refreshPage();
        } catch (err) {
          Toast.error('Error', err.message || 'Failed to start maintenance');
        }
      },
    });
  }


  /* ============================================================
     CLOSE MAINTENANCE (in_progress → completed)
     ============================================================ */
  function closeMaintenance(id) {
    // Open a small modal asking for completion details (cost, notes)
    Modal.open({
      id: 'close-maint-modal',
      title: 'Close Maintenance',
      size: 'sm',
      content: `
        <form id="close-maint-form" novalidate>
          <div class="confirm-dialog-icon" style="background: var(--color-success-light); color: var(--color-success); width: 56px; height: 56px; border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; font-size: var(--font-size-2xl); margin: 0 auto var(--space-4);">
            ✅
          </div>
          <p class="text-center text-secondary mb-4" style="font-size: var(--font-size-sm);">
            Enter final cost and any completion notes before closing this job.
          </p>
          <div class="form-group">
            <label class="form-label" for="close-cost">Final Cost (${AppConfig.CURRENCY_SYMBOL})</label>
            <input class="form-input" type="number" id="close-cost" name="cost"
                   placeholder="e.g. 5000" min="0" step="0.01" />
          </div>
          <div class="form-group">
            <label class="form-label" for="close-notes">Completion Notes</label>
            <textarea class="form-textarea" id="close-notes" name="notes"
                      placeholder="Summary of work done…" rows="3"></textarea>
          </div>
        </form>
      `,
      footer: `
        <button class="btn btn-outline" onclick="Modal.close('close-maint-modal')">Cancel</button>
        <button class="btn btn-success" id="btn-confirm-close">
          <span>✅</span> Mark Complete
        </button>
      `,
      onOpen: () => {
        document.getElementById('btn-confirm-close').addEventListener('click', async () => {
          const btn = document.getElementById('btn-confirm-close');
          btn.classList.add('loading');
          btn.disabled = true;

          try {
            const data = {
              cost: parseFloat(document.getElementById('close-cost').value) || null,
              completion_notes: document.getElementById('close-notes').value.trim() || null,
              completed_date: new Date().toISOString().split('T')[0],
            };
            await Api.patch(`/maintenance/${id}/close`, data);

            Modal.close('close-maint-modal');
            Toast.success('Maintenance Completed', 'The job has been closed successfully.');
            refreshPage();
          } catch (err) {
            Toast.error('Error', err.message || 'Failed to close maintenance');
          } finally {
            btn.classList.remove('loading');
            btn.disabled = false;
          }
        });
      },
    });
  }


  /* ============================================================
     ADD (SCHEDULE) MODAL
     ============================================================ */
  function openAddModal() {
    Modal.open({
      id: 'maint-modal',
      title: 'Schedule Maintenance',
      size: 'lg',
      content: getFormHTML(),
      footer: `
        <button class="btn btn-outline" onclick="Modal.close('maint-modal')">Cancel</button>
        <button class="btn btn-primary" id="btn-save-maint">
          <span>+</span> Schedule
        </button>
      `,
      onOpen: () => {
        document.getElementById('btn-save-maint').addEventListener('click', handleCreate);
      },
    });
  }


  /* ============================================================
     EDIT MODAL
     ============================================================ */
  async function openEditModal(id) {
    try {
      Loader.show('Loading maintenance record…');
      const record = await Api.get(`/maintenance/${id}`);
      Loader.hide();

      Modal.open({
        id: 'maint-modal',
        title: 'Edit Maintenance',
        size: 'lg',
        content: getFormHTML(record),
        footer: `
          <button class="btn btn-outline" onclick="Modal.close('maint-modal')">Cancel</button>
          <button class="btn btn-primary" id="btn-save-maint">
            <span>💾</span> Save Changes
          </button>
        `,
        onOpen: () => {
          document.getElementById('btn-save-maint').addEventListener('click', () => handleUpdate(id));
        },
      });
    } catch (err) {
      Loader.hide();
      Toast.error('Error', err.message || 'Failed to load maintenance record');
    }
  }


  /* ============================================================
     DELETE CONFIRMATION
     ============================================================ */
  function confirmDelete(id) {
    ConfirmDialog.show({
      title: 'Delete Maintenance Record?',
      message: 'Are you sure you want to delete this maintenance record? This action cannot be undone.',
      type: 'danger',
      confirmText: 'Delete Record',
      onConfirm: () => handleDelete(id),
    });
  }


  /* ============================================================
     FORM HTML
     ============================================================ */
  function getFormHTML(record = {}) {
    const typeOptions = Object.entries(MAINTENANCE_TYPE).map(([, val]) =>
      `<option value="${val}" ${record.maintenance_type === val ? 'selected' : ''}>${formatStatusLabel(val)}</option>`
    ).join('');

    const statusOptions = Object.entries(MAINTENANCE_STATUS).map(([, val]) =>
      `<option value="${val}" ${record.status === val ? 'selected' : ''}>${formatStatusLabel(val)}</option>`
    ).join('');

    const priorityOptions = PRIORITY_LEVELS.map((p) =>
      `<option value="${p}" ${record.priority === p ? 'selected' : ''}>${p.charAt(0).toUpperCase() + p.slice(1)}</option>`
    ).join('');

    const today = new Date().toISOString().split('T')[0];

    return `
      <form id="maint-form" class="maint-form" novalidate>
        <div class="form-section-label">Vehicle & Schedule</div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="m-vehicle">Vehicle Name <span class="required">*</span></label>
            <input class="form-input" type="text" id="m-vehicle" name="vehicle_name"
                   placeholder="e.g. Tata Ace – MH12AB1234"
                   value="${escapeAttr(record.vehicle_name)}" required />
            <div class="form-error d-none" id="m-vehicle-error"></div>
            <div class="form-hint">Enter vehicle name or registration number</div>
          </div>
          <div class="form-group">
            <label class="form-label" for="m-vehicle-id">Vehicle ID</label>
            <input class="form-input" type="text" id="m-vehicle-id" name="vehicle_id"
                   placeholder="Auto-linked from vehicle"
                   value="${escapeAttr(record.vehicle_id)}" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="m-date">Scheduled Date <span class="required">*</span></label>
            <input class="form-input" type="date" id="m-date" name="scheduled_date"
                   value="${record.scheduled_date || today}" required />
            <div class="form-error d-none" id="m-date-error"></div>
          </div>
          <div class="form-group">
            <label class="form-label" for="m-type">Maintenance Type <span class="required">*</span></label>
            <select class="form-select" id="m-type" name="maintenance_type" required>
              <option value="">Select type</option>
              ${typeOptions}
            </select>
            <div class="form-error d-none" id="m-type-error"></div>
          </div>
        </div>

        <div class="form-section-label">Details</div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="m-priority">Priority</label>
            <select class="form-select" id="m-priority" name="priority">
              <option value="">Select priority</option>
              ${priorityOptions}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="m-status">Status</label>
            <select class="form-select" id="m-status" name="status">
              ${statusOptions}
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="m-cost">Estimated Cost (${AppConfig.CURRENCY_SYMBOL})</label>
            <input class="form-input" type="number" id="m-cost" name="cost"
                   placeholder="e.g. 5000" min="0" step="0.01"
                   value="${record.cost ?? ''}" />
          </div>
          <div class="form-group">
            <label class="form-label" for="m-odometer">Odometer at Service (km)</label>
            <input class="form-input" type="number" id="m-odometer" name="odometer_at_service"
                   placeholder="e.g. 25000" min="0"
                   value="${record.odometer_at_service ?? ''}" />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="m-description">Description <span class="required">*</span></label>
          <textarea class="form-textarea" id="m-description" name="description"
                    placeholder="Describe the maintenance work to be done…"
                    rows="3">${escapeAttr(record.description)}</textarea>
          <div class="form-error d-none" id="m-description-error"></div>
        </div>

        <div class="form-group">
          <label class="form-label" for="m-vendor">Vendor / Workshop</label>
          <input class="form-input" type="text" id="m-vendor" name="vendor"
                 placeholder="e.g. AutoCare Service Center"
                 value="${escapeAttr(record.vendor)}" />
        </div>

        <div class="form-group">
          <label class="form-label" for="m-notes">Notes</label>
          <textarea class="form-textarea" id="m-notes" name="notes"
                    placeholder="Any additional notes…" rows="2">${escapeAttr(record.notes)}</textarea>
        </div>
      </form>
    `;
  }


  /* ============================================================
     FORM VALIDATION
     ============================================================ */
  function validateForm() {
    let valid = true;
    const fields = [
      { id: 'm-vehicle',     errorId: 'm-vehicle-error',     message: 'Vehicle name is required' },
      { id: 'm-date',        errorId: 'm-date-error',        message: 'Scheduled date is required' },
      { id: 'm-type',        errorId: 'm-type-error',        message: 'Please select a maintenance type' },
      { id: 'm-description', errorId: 'm-description-error', message: 'Description is required' },
    ];

    document.querySelectorAll('#maint-form .form-input, #maint-form .form-select, #maint-form .form-textarea').forEach((el) => {
      el.classList.remove('error');
    });
    document.querySelectorAll('#maint-form .form-error').forEach((el) => {
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
      vehicle_name:       document.getElementById('m-vehicle').value.trim(),
      vehicle_id:         document.getElementById('m-vehicle-id').value.trim() || null,
      scheduled_date:     document.getElementById('m-date').value,
      maintenance_type:   document.getElementById('m-type').value,
      priority:           document.getElementById('m-priority').value || null,
      status:             document.getElementById('m-status').value || MAINTENANCE_STATUS.SCHEDULED,
      cost:               parseFloat(document.getElementById('m-cost').value) || null,
      odometer_at_service: parseInt(document.getElementById('m-odometer').value) || null,
      description:        document.getElementById('m-description').value.trim(),
      vendor:             document.getElementById('m-vendor').value.trim() || null,
      notes:              document.getElementById('m-notes').value.trim() || null,
    };
  }


  /* ============================================================
     API HANDLERS
     ============================================================ */
  async function handleCreate() {
    if (!validateForm()) return;

    const btn = document.getElementById('btn-save-maint');
    btn.classList.add('loading');
    btn.disabled = true;

    try {
      const data = collectFormData();
      await Api.post('/maintenance', data);

      Modal.close('maint-modal');
      Toast.success('Maintenance Scheduled', `A ${data.maintenance_type} job has been scheduled for ${data.vehicle_name}.`);
      refreshPage();
    } catch (err) {
      Toast.error('Error', err.message || 'Failed to schedule maintenance');
    } finally {
      btn.classList.remove('loading');
      btn.disabled = false;
    }
  }

  async function handleUpdate(id) {
    if (!validateForm()) return;

    const btn = document.getElementById('btn-save-maint');
    btn.classList.add('loading');
    btn.disabled = true;

    try {
      const data = collectFormData();
      await Api.put(`/maintenance/${id}`, data);

      Modal.close('maint-modal');
      Toast.success('Record Updated', 'The maintenance record has been updated.');
      refreshPage();
    } catch (err) {
      Toast.error('Error', err.message || 'Failed to update maintenance');
    } finally {
      btn.classList.remove('loading');
      btn.disabled = false;
    }
  }

  async function handleDelete(id) {
    try {
      await Api.delete(`/maintenance/${id}`);
      Toast.success('Record Deleted', 'The maintenance record has been removed.');
      refreshPage();
    } catch (err) {
      Toast.error('Error', err.message || 'Failed to delete maintenance record');
    }
  }


  /* ============================================================
     EXPORT
     ============================================================ */
  function exportMaintenance() {
    if (!table || !table.state.data.length) {
      Toast.warning('No Data', 'There are no maintenance records to export.');
      return;
    }

    const headers = ['Vehicle', 'Type', 'Description', 'Scheduled Date', 'Cost', 'Status'];
    const rows = table.state.data.map((m) => [
      m.vehicle_name || '',
      formatStatusLabel(m.maintenance_type),
      m.description || '',
      m.scheduled_date || '',
      m.cost ?? '',
      formatStatusLabel(m.status),
    ]);

    let csv = headers.join(',') + '\n';
    rows.forEach((row) => {
      csv += row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `maintenance_export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    Toast.success('Exported', 'Maintenance data has been downloaded as CSV.');
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
    startMaintenance,
    closeMaintenance,
  };

})();
