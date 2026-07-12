/**
 * TransitOps – Vehicles Page
 * Full CRUD: list, search, status filter, add, edit, delete.
 * Uses: DataTable, Modal, ConfirmDialog, Toast, Api, constants.
 *
 * API Endpoints (FastAPI):
 *   GET    /vehicles         → list vehicles  (query: page, page_size, search, status, sort_by, sort_dir)
 *   GET    /vehicles/:id     → single vehicle
 *   POST   /vehicles         → create vehicle
 *   PUT    /vehicles/:id     → update vehicle
 *   DELETE /vehicles/:id     → delete vehicle
 *   GET    /vehicles/stats   → summary counts
 */

const VehiclesPage = (() => {

  /* ---- state ---- */
  let table = null;
  let activeFilter = 'all';

  /* ============================================================
     VEHICLE TYPES – used in forms & table rendering
     ============================================================ */
  const VEHICLE_TYPES = [
    'Bus', 'Mini Bus', 'Van', 'Truck', 'Sedan', 'SUV', 'Tempo', 'Auto', 'Other',
  ];


  /* ============================================================
     TEMPLATE – page HTML skeleton
     ============================================================ */
  function template() {
    return `
      <!-- Stats Row -->
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">Vehicles</h1>
          <p class="page-subtitle">Manage and monitor your entire fleet</p>
        </div>
        <div class="page-header-actions">
          <button class="btn btn-outline" id="btn-export-vehicles">
            <span>📥</span> Export
          </button>
          <button class="btn btn-primary" id="btn-add-vehicle">
            <span>+</span> Add Vehicle
          </button>
        </div>
      </div>

      <!-- Summary Stat Cards -->
      <div class="stats-grid" id="vehicles-stats">
        <div class="card stat-card" id="stat-total">
          <div class="stat-card-icon" style="background: var(--color-info-light); color: var(--color-info);">🚛</div>
          <div class="stat-card-content">
            <div class="stat-card-label">Total Vehicles</div>
            <div class="stat-card-value" id="stat-total-value">—</div>
          </div>
        </div>
        <div class="card stat-card" id="stat-active">
          <div class="stat-card-icon" style="background: var(--color-success-light); color: var(--color-success);">✅</div>
          <div class="stat-card-content">
            <div class="stat-card-label">Active</div>
            <div class="stat-card-value" id="stat-active-value">—</div>
          </div>
        </div>
        <div class="card stat-card" id="stat-maintenance">
          <div class="stat-card-icon" style="background: var(--color-warning-light); color: var(--color-warning);">🔧</div>
          <div class="stat-card-content">
            <div class="stat-card-label">In Maintenance</div>
            <div class="stat-card-value" id="stat-maintenance-value">—</div>
          </div>
        </div>
        <div class="card stat-card" id="stat-out">
          <div class="stat-card-icon" style="background: var(--color-danger-light); color: var(--color-danger);">⛔</div>
          <div class="stat-card-content">
            <div class="stat-card-label">Out of Service</div>
            <div class="stat-card-value" id="stat-out-value">—</div>
          </div>
        </div>
      </div>

      <!-- Status Filter Tabs -->
      <div class="d-flex items-center justify-between mb-4 gap-4" style="flex-wrap: wrap;">
        <div class="filter-tabs" id="vehicles-filter-tabs">
          <button class="filter-tab active" data-filter="all">All</button>
          <button class="filter-tab" data-filter="active">Active</button>
          <button class="filter-tab" data-filter="in_maintenance">In Maintenance</button>
          <button class="filter-tab" data-filter="out_of_service">Out of Service</button>
          <button class="filter-tab" data-filter="retired">Retired</button>
        </div>
      </div>

      <!-- Data Table Container -->
      <div id="vehicles-table"></div>
    `;
  }


  /* ============================================================
     INIT – called when the page is navigated to
     ============================================================ */
  function init() {
    loadStats();
    initTable();
    bindEvents();
  }


  /* ============================================================
     STATS – load summary counts
     ============================================================ */
  async function loadStats() {
    try {
      const stats = await Api.get('/vehicles/stats');
      document.getElementById('stat-total-value').textContent       = stats.total ?? 0;
      document.getElementById('stat-active-value').textContent      = stats.active ?? 0;
      document.getElementById('stat-maintenance-value').textContent = stats.in_maintenance ?? 0;
      document.getElementById('stat-out-value').textContent         = stats.out_of_service ?? 0;
    } catch {
      // Fallback: show dashes (API might not be connected yet)
      document.getElementById('stat-total-value').textContent       = '0';
      document.getElementById('stat-active-value').textContent      = '0';
      document.getElementById('stat-maintenance-value').textContent = '0';
      document.getElementById('stat-out-value').textContent         = '0';
    }
  }


  /* ============================================================
     DATA TABLE – create the sortable, searchable, paginated table
     ============================================================ */
  function initTable() {
    table = DataTable.create({
      containerId: 'vehicles-table',
      searchPlaceholder: 'Search by registration, name, type…',
      emptyIcon: '🚛',
      emptyTitle: 'No vehicles found',
      emptyText: 'Add your first vehicle to get started, or adjust your search and filters.',

      columns: [
        {
          key: 'registration_number',
          label: 'Reg. Number',
          render: (val, row) => `
            <div class="table-cell-flex">
              <div class="table-avatar">🚛</div>
              <div>
                <div class="table-cell-primary">${escapeHTML(val)}</div>
                <div class="table-cell-secondary">${escapeHTML(row.vehicle_name || '')}</div>
              </div>
            </div>
          `,
        },
        {
          key: 'vehicle_name',
          label: 'Vehicle Name',
        },
        {
          key: 'vehicle_type',
          label: 'Type',
          render: (val) => `<span class="badge badge-neutral">${escapeHTML(val)}</span>`,
        },
        {
          key: 'capacity',
          label: 'Capacity',
          render: (val) => val ? `${val} seats` : '—',
        },
        {
          key: 'odometer',
          label: 'Odometer',
          render: (val) => val != null ? `${Number(val).toLocaleString()} km` : '—',
        },
        {
          key: 'status',
          label: 'Status',
          render: (val) => getStatusBadgeHTML(val),
        },
      ],

      actions: (row) => `
        <button class="table-action-btn" title="Edit" onclick="VehiclesPage.openEditModal('${row.id}')">✏️</button>
        <button class="table-action-btn danger" title="Delete" onclick="VehiclesPage.confirmDelete('${row.id}', '${escapeHTML(row.registration_number)}')">🗑️</button>
      `,

      fetchData: async (params) => {
        // Attach current status filter
        if (activeFilter && activeFilter !== 'all') {
          params.status = activeFilter;
        }
        return Api.get('/vehicles', params);
      },
    });
  }


  /* ============================================================
     EVENT BINDINGS
     ============================================================ */
  function bindEvents() {
    // Add Vehicle button
    document.getElementById('btn-add-vehicle').addEventListener('click', openAddModal);

    // Export button
    document.getElementById('btn-export-vehicles').addEventListener('click', exportVehicles);

    // Status filter tabs
    document.getElementById('vehicles-filter-tabs').addEventListener('click', (e) => {
      const tab = e.target.closest('.filter-tab');
      if (!tab) return;

      // Update active tab
      document.querySelectorAll('#vehicles-filter-tabs .filter-tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      // Apply filter
      activeFilter = tab.dataset.filter;
      if (table) {
        table.state.page = 1;
        table.refresh();
      }
    });
  }


  /* ============================================================
     ADD VEHICLE MODAL
     ============================================================ */
  function openAddModal() {
    Modal.open({
      id: 'vehicle-modal',
      title: 'Add New Vehicle',
      size: 'lg',
      content: getFormHTML(),
      footer: `
        <button class="btn btn-outline" onclick="Modal.close('vehicle-modal')">Cancel</button>
        <button class="btn btn-primary" id="btn-save-vehicle">
          <span>+</span> Add Vehicle
        </button>
      `,
      onOpen: () => {
        document.getElementById('btn-save-vehicle').addEventListener('click', handleCreate);
      },
    });
  }


  /* ============================================================
     EDIT VEHICLE MODAL
     ============================================================ */
  async function openEditModal(vehicleId) {
    try {
      Loader.show('Loading vehicle…');
      const vehicle = await Api.get(`/vehicles/${vehicleId}`);
      Loader.hide();

      Modal.open({
        id: 'vehicle-modal',
        title: 'Edit Vehicle',
        size: 'lg',
        content: getFormHTML(vehicle),
        footer: `
          <button class="btn btn-outline" onclick="Modal.close('vehicle-modal')">Cancel</button>
          <button class="btn btn-primary" id="btn-save-vehicle">
            <span>💾</span> Save Changes
          </button>
        `,
        onOpen: () => {
          document.getElementById('btn-save-vehicle').addEventListener('click', () => handleUpdate(vehicleId));
        },
      });
    } catch (err) {
      Loader.hide();
      Toast.error('Error', err.message || 'Failed to load vehicle details');
    }
  }


  /* ============================================================
     DELETE CONFIRMATION
     ============================================================ */
  function confirmDelete(vehicleId, regNumber) {
    ConfirmDialog.show({
      title: 'Delete Vehicle?',
      message: `Are you sure you want to delete vehicle "${regNumber}"? This action cannot be undone.`,
      type: 'danger',
      confirmText: 'Delete Vehicle',
      onConfirm: () => handleDelete(vehicleId),
    });
  }


  /* ============================================================
     FORM HTML – shared between add & edit
     ============================================================ */
  function getFormHTML(vehicle = {}) {
    const typeOptions = VEHICLE_TYPES.map((t) =>
      `<option value="${t}" ${vehicle.vehicle_type === t ? 'selected' : ''}>${t}</option>`
    ).join('');

    const statusOptions = Object.entries(VEHICLE_STATUS).map(([, val]) =>
      `<option value="${val}" ${vehicle.status === val ? 'selected' : ''}>${formatStatusLabel(val)}</option>`
    ).join('');

    return `
      <form id="vehicle-form" class="vehicle-form" novalidate>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="v-reg">Registration Number <span class="required">*</span></label>
            <input class="form-input" type="text" id="v-reg" name="registration_number"
                   placeholder="e.g. MH-12-AB-1234"
                   value="${escapeAttr(vehicle.registration_number)}" required />
            <div class="form-error d-none" id="v-reg-error"></div>
          </div>
          <div class="form-group">
            <label class="form-label" for="v-name">Vehicle Name <span class="required">*</span></label>
            <input class="form-input" type="text" id="v-name" name="vehicle_name"
                   placeholder="e.g. Tata Ace"
                   value="${escapeAttr(vehicle.vehicle_name)}" required />
            <div class="form-error d-none" id="v-name-error"></div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="v-type">Vehicle Type <span class="required">*</span></label>
            <select class="form-select" id="v-type" name="vehicle_type" required>
              <option value="">Select type</option>
              ${typeOptions}
            </select>
            <div class="form-error d-none" id="v-type-error"></div>
          </div>
          <div class="form-group">
            <label class="form-label" for="v-capacity">Seating Capacity</label>
            <input class="form-input" type="number" id="v-capacity" name="capacity"
                   placeholder="e.g. 40" min="1" max="200"
                   value="${vehicle.capacity ?? ''}" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="v-odometer">Odometer (km)</label>
            <input class="form-input" type="number" id="v-odometer" name="odometer"
                   placeholder="e.g. 15000" min="0"
                   value="${vehicle.odometer ?? ''}" />
          </div>
          <div class="form-group">
            <label class="form-label" for="v-status">Status <span class="required">*</span></label>
            <select class="form-select" id="v-status" name="status" required>
              ${statusOptions}
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="v-fuel">Fuel Type</label>
            <select class="form-select" id="v-fuel" name="fuel_type">
              <option value="">Select fuel type</option>
              ${Object.entries(FUEL_TYPE).map(([, val]) =>
                `<option value="${val}" ${vehicle.fuel_type === val ? 'selected' : ''}>${formatStatusLabel(val)}</option>`
              ).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="v-year">Year of Manufacture</label>
            <input class="form-input" type="number" id="v-year" name="year_of_manufacture"
                   placeholder="e.g. 2022" min="1990" max="${new Date().getFullYear()}"
                   value="${vehicle.year_of_manufacture ?? ''}" />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="v-notes">Notes</label>
          <textarea class="form-textarea" id="v-notes" name="notes"
                    placeholder="Any additional notes about this vehicle…"
                    rows="3">${escapeAttr(vehicle.notes)}</textarea>
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
      { id: 'v-reg',  errorId: 'v-reg-error',  message: 'Registration number is required' },
      { id: 'v-name', errorId: 'v-name-error', message: 'Vehicle name is required' },
      { id: 'v-type', errorId: 'v-type-error', message: 'Please select a vehicle type' },
    ];

    // Clear all previous errors
    document.querySelectorAll('#vehicle-form .form-input, #vehicle-form .form-select').forEach((el) => {
      el.classList.remove('error');
    });
    document.querySelectorAll('#vehicle-form .form-error').forEach((el) => {
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
      registration_number: document.getElementById('v-reg').value.trim(),
      vehicle_name:        document.getElementById('v-name').value.trim(),
      vehicle_type:        document.getElementById('v-type').value,
      capacity:            parseInt(document.getElementById('v-capacity').value) || null,
      odometer:            parseInt(document.getElementById('v-odometer').value) || 0,
      status:              document.getElementById('v-status').value,
      fuel_type:           document.getElementById('v-fuel').value || null,
      year_of_manufacture: parseInt(document.getElementById('v-year').value) || null,
      notes:               document.getElementById('v-notes').value.trim() || null,
    };
  }


  /* ============================================================
     API HANDLERS
     ============================================================ */
  async function handleCreate() {
    if (!validateForm()) return;

    const btn = document.getElementById('btn-save-vehicle');
    btn.classList.add('loading');
    btn.disabled = true;

    try {
      const data = collectFormData();
      await Api.post('/vehicles', data);

      Modal.close('vehicle-modal');
      Toast.success('Vehicle Added', `${data.registration_number} has been added successfully.`);
      refreshPage();
    } catch (err) {
      Toast.error('Error', err.message || 'Failed to add vehicle');
    } finally {
      btn.classList.remove('loading');
      btn.disabled = false;
    }
  }

  async function handleUpdate(vehicleId) {
    if (!validateForm()) return;

    const btn = document.getElementById('btn-save-vehicle');
    btn.classList.add('loading');
    btn.disabled = true;

    try {
      const data = collectFormData();
      await Api.put(`/vehicles/${vehicleId}`, data);

      Modal.close('vehicle-modal');
      Toast.success('Vehicle Updated', `${data.registration_number} has been updated successfully.`);
      refreshPage();
    } catch (err) {
      Toast.error('Error', err.message || 'Failed to update vehicle');
    } finally {
      btn.classList.remove('loading');
      btn.disabled = false;
    }
  }

  async function handleDelete(vehicleId) {
    try {
      await Api.delete(`/vehicles/${vehicleId}`);
      Toast.success('Vehicle Deleted', 'The vehicle has been removed from your fleet.');
      refreshPage();
    } catch (err) {
      Toast.error('Error', err.message || 'Failed to delete vehicle');
    }
  }


  /* ============================================================
     EXPORT
     ============================================================ */
  function exportVehicles() {
    Toast.info('Export', 'Preparing vehicle data for export…');
    // In production, this would call an API endpoint that returns CSV/Excel
    // For now, export the current table data as CSV
    if (!table || !table.state.data.length) {
      Toast.warning('No Data', 'There are no vehicles to export.');
      return;
    }

    const headers = ['Registration Number', 'Vehicle Name', 'Type', 'Capacity', 'Odometer (km)', 'Status'];
    const rows = table.state.data.map((v) => [
      v.registration_number,
      v.vehicle_name,
      v.vehicle_type,
      v.capacity || '',
      v.odometer || '',
      formatStatusLabel(v.status),
    ]);

    let csv = headers.join(',') + '\n';
    rows.forEach((row) => {
      csv += row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vehicles_export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    Toast.success('Exported', 'Vehicle data has been downloaded as CSV.');
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
     PUBLIC API – expose for onclick handlers and Router
     ============================================================ */
  return {
    template,
    init,
    openEditModal,
    confirmDelete,
  };

})();
