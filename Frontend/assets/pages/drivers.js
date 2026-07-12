/**
 * TransitOps – Drivers Page
 * Full CRUD: list, search, status filter, add, edit, delete.
 * Special: licence expiry highlighting (expired = red, ≤30 days = red, ≤90 days = amber).
 *
 * API Endpoints (FastAPI):
 *   GET    /drivers         → list   (query: page, page_size, search, status, sort_by, sort_dir)
 *   GET    /drivers/:id     → single driver
 *   POST   /drivers         → create
 *   PUT    /drivers/:id     → update
 *   DELETE /drivers/:id     → delete
 *   GET    /drivers/stats   → summary counts
 */

const DriversPage = (() => {

  /* ---- state ---- */
  let table = null;
  let activeFilter = 'all';

  /* ============================================================
     LICENCE CLASSES – for the form dropdown
     ============================================================ */
  const LICENCE_CLASSES = [
    'LMV', 'HMV', 'HGMV', 'HPMV', 'PSV',
    'Transport', 'Non-Transport', 'Other',
  ];


  /* ============================================================
     TEMPLATE
     ============================================================ */
  function template() {
    return `
      <!-- Page Header -->
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">Drivers</h1>
          <p class="page-subtitle">Manage driver profiles, licences, and availability</p>
        </div>
        <div class="page-header-actions">
          <button class="btn btn-outline" id="btn-export-drivers">
            <span>📥</span> Export
          </button>
          <button class="btn btn-primary" id="btn-add-driver">
            <span>+</span> Add Driver
          </button>
        </div>
      </div>

      <!-- Summary Stat Cards -->
      <div class="stats-grid" id="drivers-stats">
        <div class="card stat-card">
          <div class="stat-card-icon" style="background: var(--color-info-light); color: var(--color-info);">👤</div>
          <div class="stat-card-content">
            <div class="stat-card-label">Total Drivers</div>
            <div class="stat-card-value" id="stat-drivers-total">—</div>
          </div>
        </div>
        <div class="card stat-card">
          <div class="stat-card-icon" style="background: var(--color-success-light); color: var(--color-success);">✅</div>
          <div class="stat-card-content">
            <div class="stat-card-label">Available</div>
            <div class="stat-card-value" id="stat-drivers-available">—</div>
          </div>
        </div>
        <div class="card stat-card">
          <div class="stat-card-icon" style="background: var(--color-info-light); color: var(--color-info);">🚛</div>
          <div class="stat-card-content">
            <div class="stat-card-label">On Trip</div>
            <div class="stat-card-value" id="stat-drivers-on-trip">—</div>
          </div>
        </div>
        <div class="card stat-card">
          <div class="stat-card-icon" style="background: var(--color-danger-light); color: var(--color-danger);">⚠️</div>
          <div class="stat-card-content">
            <div class="stat-card-label">Licence Expiring Soon</div>
            <div class="stat-card-value" id="stat-drivers-expiring">—</div>
          </div>
        </div>
      </div>

      <!-- Status Filter Tabs -->
      <div class="d-flex items-center justify-between mb-4 gap-4" style="flex-wrap: wrap;">
        <div class="filter-tabs" id="drivers-filter-tabs">
          <button class="filter-tab active" data-filter="all">All</button>
          <button class="filter-tab" data-filter="available">Available</button>
          <button class="filter-tab" data-filter="on_trip">On Trip</button>
          <button class="filter-tab" data-filter="off_duty">Off Duty</button>
          <button class="filter-tab" data-filter="on_leave">On Leave</button>
          <button class="filter-tab" data-filter="suspended">Suspended</button>
        </div>
      </div>

      <!-- Data Table -->
      <div id="drivers-table"></div>
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
      const stats = await Api.get('/drivers/stats');
      document.getElementById('stat-drivers-total').textContent     = stats.total ?? 0;
      document.getElementById('stat-drivers-available').textContent = stats.available ?? 0;
      document.getElementById('stat-drivers-on-trip').textContent   = stats.on_trip ?? 0;
      document.getElementById('stat-drivers-expiring').textContent  = stats.expiring_soon ?? 0;
    } catch {
      document.getElementById('stat-drivers-total').textContent     = '0';
      document.getElementById('stat-drivers-available').textContent = '0';
      document.getElementById('stat-drivers-on-trip').textContent   = '0';
      document.getElementById('stat-drivers-expiring').textContent  = '0';
    }
  }


  /* ============================================================
     LICENCE EXPIRY HELPERS
     ============================================================ */

  /**
   * Calculate days remaining until a date.
   * @param {string} dateStr - ISO date string (YYYY-MM-DD)
   * @returns {number|null} Days remaining (negative = expired)
   */
  function daysUntil(dateStr) {
    if (!dateStr) return null;
    const target = new Date(dateStr);
    const today  = new Date();
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
  }

  /**
   * Get licence expiry badge HTML with colour coding.
   *  - Expired:        red badge
   *  - ≤ 30 days:      red badge + "X days left"
   *  - ≤ 90 days:      warning badge + "X days left"
   *  - > 90 days:      neutral / normal display
   */
  function licenceExpiryHTML(dateStr) {
    if (!dateStr) return '<span class="text-muted">—</span>';

    const days = daysUntil(dateStr);
    const formatted = formatDate(dateStr);

    if (days === null) return '<span class="text-muted">—</span>';

    if (days < 0) {
      return `
        <div class="licence-expiry expired">
          <span class="licence-date">${formatted}</span>
          <span class="badge badge-danger"><span class="badge-dot"></span>Expired</span>
        </div>`;
    }

    if (days <= 30) {
      return `
        <div class="licence-expiry critical">
          <span class="licence-date">${formatted}</span>
          <span class="badge badge-danger"><span class="badge-dot"></span>${days}d left</span>
        </div>`;
    }

    if (days <= 90) {
      return `
        <div class="licence-expiry warning">
          <span class="licence-date">${formatted}</span>
          <span class="badge badge-warning"><span class="badge-dot"></span>${days}d left</span>
        </div>`;
    }

    return `
      <div class="licence-expiry">
        <span class="licence-date">${formatted}</span>
      </div>`;
  }

  /**
   * Format ISO date to display format (DD MMM YYYY).
   */
  function formatDate(dateStr) {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  }


  /* ============================================================
     SAFETY SCORE RENDERER
     ============================================================ */
  function safetyScoreHTML(score) {
    if (score === null || score === undefined) return '<span class="text-muted">—</span>';

    const num = Number(score);
    let colorClass = '';
    let barColor = '';

    if (num >= 80) {
      colorClass = 'text-success';
      barColor   = 'var(--color-success)';
    } else if (num >= 60) {
      colorClass = 'text-warning';
      barColor   = 'var(--color-warning)';
    } else {
      colorClass = 'text-danger';
      barColor   = 'var(--color-danger)';
    }

    return `
      <div class="safety-score">
        <span class="safety-score-value ${colorClass}">${num}%</span>
        <div class="safety-score-bar">
          <div class="safety-score-fill" style="width: ${Math.min(num, 100)}%; background: ${barColor};"></div>
        </div>
      </div>`;
  }


  /* ============================================================
     DATA TABLE
     ============================================================ */
  function initTable() {
    table = DataTable.create({
      containerId: 'drivers-table',
      searchPlaceholder: 'Search by name, licence, phone…',
      emptyIcon: '👤',
      emptyTitle: 'No drivers found',
      emptyText: 'Add your first driver to get started, or adjust your search and filters.',

      columns: [
        {
          key: 'name',
          label: 'Driver Name',
          render: (val, row) => `
            <div class="table-cell-flex">
              <div class="table-avatar">${getInitials(val)}</div>
              <div>
                <div class="table-cell-primary">${escapeHTML(val)}</div>
                <div class="table-cell-secondary">${escapeHTML(row.email || '')}</div>
              </div>
            </div>
          `,
        },
        {
          key: 'licence_number',
          label: 'Licence Number',
          render: (val) => `<span class="font-medium">${escapeHTML(val)}</span>`,
        },
        {
          key: 'licence_expiry',
          label: 'Licence Expiry',
          render: (val) => licenceExpiryHTML(val),
        },
        {
          key: 'phone',
          label: 'Phone Number',
          render: (val) => val ? `<span class="text-secondary">${escapeHTML(val)}</span>` : '<span class="text-muted">—</span>',
        },
        {
          key: 'safety_score',
          label: 'Safety Score',
          render: (val) => safetyScoreHTML(val),
        },
        {
          key: 'status',
          label: 'Status',
          render: (val) => getStatusBadgeHTML(val),
        },
      ],

      actions: (row) => `
        <button class="table-action-btn" title="Edit" onclick="DriversPage.openEditModal('${row.id}')">✏️</button>
        <button class="table-action-btn danger" title="Delete" onclick="DriversPage.confirmDelete('${row.id}', '${escapeHTML(row.name)}')">🗑️</button>
      `,

      fetchData: async (params) => {
        if (activeFilter && activeFilter !== 'all') {
          params.status = activeFilter;
        }
        return Api.get('/drivers', params);
      },
    });
  }


  /* ============================================================
     EVENT BINDINGS
     ============================================================ */
  function bindEvents() {
    document.getElementById('btn-add-driver').addEventListener('click', openAddModal);
    document.getElementById('btn-export-drivers').addEventListener('click', exportDrivers);

    // Status filter tabs
    document.getElementById('drivers-filter-tabs').addEventListener('click', (e) => {
      const tab = e.target.closest('.filter-tab');
      if (!tab) return;

      document.querySelectorAll('#drivers-filter-tabs .filter-tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      activeFilter = tab.dataset.filter;
      if (table) {
        table.state.page = 1;
        table.refresh();
      }
    });
  }


  /* ============================================================
     ADD DRIVER MODAL
     ============================================================ */
  function openAddModal() {
    Modal.open({
      id: 'driver-modal',
      title: 'Add New Driver',
      size: 'lg',
      content: getFormHTML(),
      footer: `
        <button class="btn btn-outline" onclick="Modal.close('driver-modal')">Cancel</button>
        <button class="btn btn-primary" id="btn-save-driver">
          <span>+</span> Add Driver
        </button>
      `,
      onOpen: () => {
        document.getElementById('btn-save-driver').addEventListener('click', handleCreate);
      },
    });
  }


  /* ============================================================
     EDIT DRIVER MODAL
     ============================================================ */
  async function openEditModal(driverId) {
    try {
      Loader.show('Loading driver…');
      const driver = await Api.get(`/drivers/${driverId}`);
      Loader.hide();

      Modal.open({
        id: 'driver-modal',
        title: 'Edit Driver',
        size: 'lg',
        content: getFormHTML(driver),
        footer: `
          <button class="btn btn-outline" onclick="Modal.close('driver-modal')">Cancel</button>
          <button class="btn btn-primary" id="btn-save-driver">
            <span>💾</span> Save Changes
          </button>
        `,
        onOpen: () => {
          document.getElementById('btn-save-driver').addEventListener('click', () => handleUpdate(driverId));
        },
      });
    } catch (err) {
      Loader.hide();
      Toast.error('Error', err.message || 'Failed to load driver details');
    }
  }


  /* ============================================================
     DELETE CONFIRMATION
     ============================================================ */
  function confirmDelete(driverId, driverName) {
    ConfirmDialog.show({
      title: 'Delete Driver?',
      message: `Are you sure you want to remove "${driverName}" from your team? This action cannot be undone.`,
      type: 'danger',
      confirmText: 'Delete Driver',
      onConfirm: () => handleDelete(driverId),
    });
  }


  /* ============================================================
     FORM HTML
     ============================================================ */
  function getFormHTML(driver = {}) {
    const statusOptions = Object.entries(DRIVER_STATUS).map(([, val]) =>
      `<option value="${val}" ${driver.status === val ? 'selected' : ''}>${formatStatusLabel(val)}</option>`
    ).join('');

    const licenceOptions = LICENCE_CLASSES.map((lc) =>
      `<option value="${lc}" ${driver.licence_class === lc ? 'selected' : ''}>${lc}</option>`
    ).join('');

    return `
      <form id="driver-form" class="driver-form" novalidate>
        <!-- Personal Information -->
        <div class="form-section-label">Personal Information</div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="d-name">Full Name <span class="required">*</span></label>
            <input class="form-input" type="text" id="d-name" name="name"
                   placeholder="e.g. Rajesh Kumar"
                   value="${escapeAttr(driver.name)}" required />
            <div class="form-error d-none" id="d-name-error"></div>
          </div>
          <div class="form-group">
            <label class="form-label" for="d-phone">Phone Number <span class="required">*</span></label>
            <input class="form-input" type="tel" id="d-phone" name="phone"
                   placeholder="e.g. +91 98765 43210"
                   value="${escapeAttr(driver.phone)}" required />
            <div class="form-error d-none" id="d-phone-error"></div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="d-email">Email Address</label>
            <input class="form-input" type="email" id="d-email" name="email"
                   placeholder="e.g. rajesh@example.com"
                   value="${escapeAttr(driver.email)}" />
          </div>
          <div class="form-group">
            <label class="form-label" for="d-dob">Date of Birth</label>
            <input class="form-input" type="date" id="d-dob" name="date_of_birth"
                   value="${driver.date_of_birth || ''}" />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="d-address">Address</label>
          <textarea class="form-textarea" id="d-address" name="address"
                    placeholder="Full residential address" rows="2">${escapeAttr(driver.address)}</textarea>
        </div>

        <!-- Licence Details -->
        <div class="form-section-label">Licence Details</div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="d-licence">Licence Number <span class="required">*</span></label>
            <input class="form-input" type="text" id="d-licence" name="licence_number"
                   placeholder="e.g. MH-0320130012345"
                   value="${escapeAttr(driver.licence_number)}" required />
            <div class="form-error d-none" id="d-licence-error"></div>
          </div>
          <div class="form-group">
            <label class="form-label" for="d-licence-class">Licence Class</label>
            <select class="form-select" id="d-licence-class" name="licence_class">
              <option value="">Select class</option>
              ${licenceOptions}
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="d-licence-expiry">Licence Expiry <span class="required">*</span></label>
            <input class="form-input" type="date" id="d-licence-expiry" name="licence_expiry"
                   value="${driver.licence_expiry || ''}" required />
            <div class="form-error d-none" id="d-licence-expiry-error"></div>
          </div>
          <div class="form-group">
            <label class="form-label" for="d-experience">Experience (years)</label>
            <input class="form-input" type="number" id="d-experience" name="experience_years"
                   placeholder="e.g. 5" min="0" max="50"
                   value="${driver.experience_years ?? ''}" />
          </div>
        </div>

        <!-- Employment -->
        <div class="form-section-label">Employment</div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="d-status">Status <span class="required">*</span></label>
            <select class="form-select" id="d-status" name="status" required>
              ${statusOptions}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="d-safety">Safety Score (0-100)</label>
            <input class="form-input" type="number" id="d-safety" name="safety_score"
                   placeholder="e.g. 85" min="0" max="100"
                   value="${driver.safety_score ?? ''}" />
            <div class="form-hint">Auto-calculated from trip performance if left blank</div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="d-joining">Joining Date</label>
            <input class="form-input" type="date" id="d-joining" name="joining_date"
                   value="${driver.joining_date || ''}" />
          </div>
          <div class="form-group">
            <label class="form-label" for="d-emergency-contact">Emergency Contact</label>
            <input class="form-input" type="tel" id="d-emergency-contact" name="emergency_contact"
                   placeholder="e.g. +91 91234 56789"
                   value="${escapeAttr(driver.emergency_contact)}" />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="d-notes">Notes</label>
          <textarea class="form-textarea" id="d-notes" name="notes"
                    placeholder="Any additional notes…" rows="2">${escapeAttr(driver.notes)}</textarea>
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
      { id: 'd-name',           errorId: 'd-name-error',           message: 'Driver name is required' },
      { id: 'd-phone',          errorId: 'd-phone-error',          message: 'Phone number is required' },
      { id: 'd-licence',        errorId: 'd-licence-error',        message: 'Licence number is required' },
      { id: 'd-licence-expiry', errorId: 'd-licence-expiry-error', message: 'Licence expiry date is required' },
    ];

    // Clear previous errors
    document.querySelectorAll('#driver-form .form-input, #driver-form .form-select').forEach((el) => {
      el.classList.remove('error');
    });
    document.querySelectorAll('#driver-form .form-error').forEach((el) => {
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
      name:              document.getElementById('d-name').value.trim(),
      phone:             document.getElementById('d-phone').value.trim(),
      email:             document.getElementById('d-email').value.trim() || null,
      date_of_birth:     document.getElementById('d-dob').value || null,
      address:           document.getElementById('d-address').value.trim() || null,
      licence_number:    document.getElementById('d-licence').value.trim(),
      licence_class:     document.getElementById('d-licence-class').value || null,
      licence_expiry:    document.getElementById('d-licence-expiry').value,
      experience_years:  parseInt(document.getElementById('d-experience').value) || null,
      status:            document.getElementById('d-status').value,
      safety_score:      parseInt(document.getElementById('d-safety').value) || null,
      joining_date:      document.getElementById('d-joining').value || null,
      emergency_contact: document.getElementById('d-emergency-contact').value.trim() || null,
      notes:             document.getElementById('d-notes').value.trim() || null,
    };
  }


  /* ============================================================
     API HANDLERS
     ============================================================ */
  async function handleCreate() {
    if (!validateForm()) return;

    const btn = document.getElementById('btn-save-driver');
    btn.classList.add('loading');
    btn.disabled = true;

    try {
      const data = collectFormData();
      await Api.post('/drivers', data);

      Modal.close('driver-modal');
      Toast.success('Driver Added', `${data.name} has been added to the team.`);
      refreshPage();
    } catch (err) {
      Toast.error('Error', err.message || 'Failed to add driver');
    } finally {
      btn.classList.remove('loading');
      btn.disabled = false;
    }
  }

  async function handleUpdate(driverId) {
    if (!validateForm()) return;

    const btn = document.getElementById('btn-save-driver');
    btn.classList.add('loading');
    btn.disabled = true;

    try {
      const data = collectFormData();
      await Api.put(`/drivers/${driverId}`, data);

      Modal.close('driver-modal');
      Toast.success('Driver Updated', `${data.name}'s profile has been updated.`);
      refreshPage();
    } catch (err) {
      Toast.error('Error', err.message || 'Failed to update driver');
    } finally {
      btn.classList.remove('loading');
      btn.disabled = false;
    }
  }

  async function handleDelete(driverId) {
    try {
      await Api.delete(`/drivers/${driverId}`);
      Toast.success('Driver Removed', 'The driver has been removed from your team.');
      refreshPage();
    } catch (err) {
      Toast.error('Error', err.message || 'Failed to delete driver');
    }
  }


  /* ============================================================
     EXPORT
     ============================================================ */
  function exportDrivers() {
    if (!table || !table.state.data.length) {
      Toast.warning('No Data', 'There are no drivers to export.');
      return;
    }

    const headers = ['Name', 'Licence Number', 'Licence Expiry', 'Phone', 'Safety Score', 'Status'];
    const rows = table.state.data.map((d) => [
      d.name,
      d.licence_number,
      d.licence_expiry || '',
      d.phone || '',
      d.safety_score ?? '',
      formatStatusLabel(d.status),
    ]);

    let csv = headers.join(',') + '\n';
    rows.forEach((row) => {
      csv += row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `drivers_export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    Toast.success('Exported', 'Driver data has been downloaded as CSV.');
  }


  /* ============================================================
     HELPERS
     ============================================================ */
  function refreshPage() {
    loadStats();
    if (table) table.refresh();
  }

  function getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
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
