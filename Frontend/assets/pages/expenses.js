/**
 * TransitOps – Expenses Page
 * Track operational expenses: vehicle, type, amount, description, date.
 * Uses: DataTable, Modal, ConfirmDialog, Toast, Api, constants.
 *
 * API Endpoints (FastAPI):
 *   GET    /expenses         → list   (query: page, page_size, search, category, status, sort_by, sort_dir)
 *   GET    /expenses/:id     → single record
 *   POST   /expenses         → create
 *   PUT    /expenses/:id     → update
 *   DELETE /expenses/:id     → delete
 *   GET    /expenses/stats   → summary (total_amount, pending_amount, approved_count, expense_count)
 */

const ExpensesPage = (() => {

  /* ---- state ---- */
  let table = null;
  let activeFilter = 'all';

  /* ============================================================
     CATEGORY ICONS
     ============================================================ */
  const CATEGORY_ICON = {
    fuel:        '⛽',
    maintenance: '🔧',
    insurance:   '🛡️',
    toll:        '🛣️',
    parking:     '🅿️',
    salary:      '💼',
    fine:        '📝',
    other:       '📦',
  };


  /* ============================================================
     TEMPLATE
     ============================================================ */
  function template() {
    return `
      <!-- Page Header -->
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">Expenses</h1>
          <p class="page-subtitle">Track and manage all operational expenses</p>
        </div>
        <div class="page-header-actions">
          <button class="btn btn-outline" id="btn-export-expenses">
            <span>📥</span> Export
          </button>
          <button class="btn btn-primary" id="btn-add-expense">
            <span>+</span> Add Expense
          </button>
        </div>
      </div>

      <!-- Summary Stat Cards -->
      <div class="stats-grid" id="expenses-stats">
        <div class="card stat-card">
          <div class="stat-card-icon" style="background: var(--color-info-light); color: var(--color-info);">💰</div>
          <div class="stat-card-content">
            <div class="stat-card-label">Total Expenses</div>
            <div class="stat-card-value" id="stat-exp-count">—</div>
          </div>
        </div>
        <div class="card stat-card">
          <div class="stat-card-icon" style="background: var(--color-danger-light); color: var(--color-danger);">💸</div>
          <div class="stat-card-content">
            <div class="stat-card-label">Total Amount</div>
            <div class="stat-card-value" id="stat-exp-total">—</div>
          </div>
        </div>
        <div class="card stat-card">
          <div class="stat-card-icon" style="background: var(--color-warning-light); color: var(--color-warning);">⏳</div>
          <div class="stat-card-content">
            <div class="stat-card-label">Pending Approval</div>
            <div class="stat-card-value" id="stat-exp-pending">—</div>
          </div>
        </div>
        <div class="card stat-card">
          <div class="stat-card-icon" style="background: var(--color-success-light); color: var(--color-success);">✅</div>
          <div class="stat-card-content">
            <div class="stat-card-label">Approved</div>
            <div class="stat-card-value" id="stat-exp-approved">—</div>
          </div>
        </div>
      </div>

      <!-- Category Filter Tabs -->
      <div class="d-flex items-center justify-between mb-4 gap-4" style="flex-wrap: wrap;">
        <div class="filter-tabs" id="expenses-filter-tabs">
          <button class="filter-tab active" data-filter="all">All</button>
          <button class="filter-tab" data-filter="fuel">⛽ Fuel</button>
          <button class="filter-tab" data-filter="maintenance">🔧 Maintenance</button>
          <button class="filter-tab" data-filter="insurance">🛡️ Insurance</button>
          <button class="filter-tab" data-filter="toll">🛣️ Toll</button>
          <button class="filter-tab" data-filter="salary">💼 Salary</button>
          <button class="filter-tab" data-filter="other">📦 Other</button>
        </div>
      </div>

      <!-- Data Table -->
      <div id="expenses-table"></div>
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
      const stats = await Api.get('/expenses/stats');
      document.getElementById('stat-exp-count').textContent    = stats.expense_count ?? 0;
      document.getElementById('stat-exp-total').textContent    = formatCurrency(stats.total_amount);
      document.getElementById('stat-exp-pending').textContent  = formatCurrency(stats.pending_amount);
      document.getElementById('stat-exp-approved').textContent = stats.approved_count ?? 0;
    } catch {
      document.getElementById('stat-exp-count').textContent    = '0';
      document.getElementById('stat-exp-total').textContent    = `${AppConfig.CURRENCY_SYMBOL}0`;
      document.getElementById('stat-exp-pending').textContent  = `${AppConfig.CURRENCY_SYMBOL}0`;
      document.getElementById('stat-exp-approved').textContent = '0';
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


  /* ============================================================
     DATA TABLE
     ============================================================ */
  function initTable() {
    table = DataTable.create({
      containerId: 'expenses-table',
      searchPlaceholder: 'Search by vehicle, category, description…',
      emptyIcon: '💰',
      emptyTitle: 'No expenses found',
      emptyText: 'Record your first expense to start tracking costs.',

      columns: [
        {
          key: 'vehicle_name',
          label: 'Vehicle',
          render: (val, row) => {
            if (!val) return '<span class="text-muted">General</span>';
            return `
              <div class="table-cell-flex">
                <div class="table-avatar">🚛</div>
                <div>
                  <div class="table-cell-primary">${escapeHTML(val)}</div>
                  <div class="table-cell-secondary">${escapeHTML(row.vehicle_reg || '')}</div>
                </div>
              </div>
            `;
          },
        },
        {
          key: 'category',
          label: 'Expense Type',
          render: (val) => {
            const icon = CATEGORY_ICON[val] || '📦';
            return `<span class="expense-category-chip">${icon} ${formatStatusLabel(val)}</span>`;
          },
        },
        {
          key: 'amount',
          label: 'Amount',
          render: (val) => {
            if (val === null || val === undefined) return '<span class="text-muted">—</span>';
            return `<span class="expense-amount">${formatCurrency(val)}</span>`;
          },
        },
        {
          key: 'description',
          label: 'Description',
          render: (val) => {
            if (!val) return '<span class="text-muted">—</span>';
            const truncated = val.length > 45 ? val.substring(0, 45) + '…' : val;
            return `<span class="text-secondary" title="${escapeAttr(val)}">${escapeHTML(truncated)}</span>`;
          },
        },
        {
          key: 'expense_date',
          label: 'Date',
          render: (val) => `<span>${formatDate(val)}</span>`,
        },
        {
          key: 'status',
          label: 'Status',
          render: (val) => getStatusBadgeHTML(val || 'pending'),
        },
      ],

      actions: (row) => `
        <button class="table-action-btn" title="Edit" onclick="ExpensesPage.openEditModal('${row.id}')">✏️</button>
        <button class="table-action-btn danger" title="Delete" onclick="ExpensesPage.confirmDelete('${row.id}')">🗑️</button>
      `,

      fetchData: async (params) => {
        if (activeFilter && activeFilter !== 'all') {
          params.category = activeFilter;
        }
        return Api.get('/expenses', params);
      },
    });
  }


  /* ============================================================
     EVENT BINDINGS
     ============================================================ */
  function bindEvents() {
    document.getElementById('btn-add-expense').addEventListener('click', openAddModal);
    document.getElementById('btn-export-expenses').addEventListener('click', exportExpenses);

    // Category filter tabs
    document.getElementById('expenses-filter-tabs').addEventListener('click', (e) => {
      const tab = e.target.closest('.filter-tab');
      if (!tab) return;

      document.querySelectorAll('#expenses-filter-tabs .filter-tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      activeFilter = tab.dataset.filter;
      if (table) {
        table.state.page = 1;
        table.refresh();
      }
    });
  }


  /* ============================================================
     ADD EXPENSE MODAL
     ============================================================ */
  function openAddModal() {
    Modal.open({
      id: 'expense-modal',
      title: 'Add Expense',
      content: getFormHTML(),
      footer: `
        <button class="btn btn-outline" onclick="Modal.close('expense-modal')">Cancel</button>
        <button class="btn btn-primary" id="btn-save-expense">
          <span>+</span> Add Expense
        </button>
      `,
      onOpen: () => {
        document.getElementById('btn-save-expense').addEventListener('click', handleCreate);
      },
    });
  }


  /* ============================================================
     EDIT EXPENSE MODAL
     ============================================================ */
  async function openEditModal(id) {
    try {
      Loader.show('Loading expense…');
      const record = await Api.get(`/expenses/${id}`);
      Loader.hide();

      Modal.open({
        id: 'expense-modal',
        title: 'Edit Expense',
        content: getFormHTML(record),
        footer: `
          <button class="btn btn-outline" onclick="Modal.close('expense-modal')">Cancel</button>
          <button class="btn btn-primary" id="btn-save-expense">
            <span>💾</span> Save Changes
          </button>
        `,
        onOpen: () => {
          document.getElementById('btn-save-expense').addEventListener('click', () => handleUpdate(id));
        },
      });
    } catch (err) {
      Loader.hide();
      Toast.error('Error', err.message || 'Failed to load expense');
    }
  }


  /* ============================================================
     DELETE CONFIRMATION
     ============================================================ */
  function confirmDelete(id) {
    ConfirmDialog.show({
      title: 'Delete Expense?',
      message: 'Are you sure you want to delete this expense record? This action cannot be undone.',
      type: 'danger',
      confirmText: 'Delete Expense',
      onConfirm: () => handleDelete(id),
    });
  }


  /* ============================================================
     FORM HTML
     ============================================================ */
  function getFormHTML(record = {}) {
    const categoryOptions = Object.entries(EXPENSE_CATEGORY).map(([, val]) => {
      const icon = CATEGORY_ICON[val] || '📦';
      return `<option value="${val}" ${record.category === val ? 'selected' : ''}>${icon} ${formatStatusLabel(val)}</option>`;
    }).join('');

    const statusOptions = Object.entries(EXPENSE_STATUS).map(([, val]) =>
      `<option value="${val}" ${record.status === val ? 'selected' : ''}>${formatStatusLabel(val)}</option>`
    ).join('');

    const today = new Date().toISOString().split('T')[0];

    return `
      <form id="expense-form" class="expense-form" novalidate>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="e-vehicle">Vehicle</label>
            <input class="form-input" type="text" id="e-vehicle" name="vehicle_name"
                   placeholder="e.g. Tata Ace – MH12AB1234"
                   value="${escapeAttr(record.vehicle_name)}" />
            <div class="form-hint">Leave blank for general / non-vehicle expenses</div>
          </div>
          <div class="form-group">
            <label class="form-label" for="e-category">Expense Type <span class="required">*</span></label>
            <select class="form-select" id="e-category" name="category" required>
              <option value="">Select category</option>
              ${categoryOptions}
            </select>
            <div class="form-error d-none" id="e-category-error"></div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="e-amount">Amount (${AppConfig.CURRENCY_SYMBOL}) <span class="required">*</span></label>
            <input class="form-input" type="number" id="e-amount" name="amount"
                   placeholder="e.g. 2500" min="0" step="0.01"
                   value="${record.amount ?? ''}" required />
            <div class="form-error d-none" id="e-amount-error"></div>
          </div>
          <div class="form-group">
            <label class="form-label" for="e-date">Date <span class="required">*</span></label>
            <input class="form-input" type="date" id="e-date" name="expense_date"
                   value="${record.expense_date || today}" required />
            <div class="form-error d-none" id="e-date-error"></div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="e-status">Status</label>
            <select class="form-select" id="e-status" name="status">
              ${statusOptions}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="e-reference">Reference / Invoice No.</label>
            <input class="form-input" type="text" id="e-reference" name="reference"
                   placeholder="e.g. INV-2026-0451"
                   value="${escapeAttr(record.reference)}" />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="e-description">Description <span class="required">*</span></label>
          <textarea class="form-textarea" id="e-description" name="description"
                    placeholder="Describe the expense…"
                    rows="3">${escapeAttr(record.description)}</textarea>
          <div class="form-error d-none" id="e-description-error"></div>
        </div>

        <div class="form-group">
          <label class="form-label" for="e-notes">Notes</label>
          <textarea class="form-textarea" id="e-notes" name="notes"
                    placeholder="Any additional notes or remarks…"
                    rows="2">${escapeAttr(record.notes)}</textarea>
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
      { id: 'e-category',    errorId: 'e-category-error',    message: 'Please select an expense type' },
      { id: 'e-amount',      errorId: 'e-amount-error',      message: 'Amount is required' },
      { id: 'e-date',        errorId: 'e-date-error',        message: 'Date is required' },
      { id: 'e-description', errorId: 'e-description-error', message: 'Description is required' },
    ];

    document.querySelectorAll('#expense-form .form-input, #expense-form .form-select, #expense-form .form-textarea').forEach((el) => {
      el.classList.remove('error');
    });
    document.querySelectorAll('#expense-form .form-error').forEach((el) => {
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
      vehicle_name: document.getElementById('e-vehicle').value.trim() || null,
      category:     document.getElementById('e-category').value,
      amount:       parseFloat(document.getElementById('e-amount').value) || 0,
      expense_date: document.getElementById('e-date').value,
      status:       document.getElementById('e-status').value || EXPENSE_STATUS.PENDING,
      reference:    document.getElementById('e-reference').value.trim() || null,
      description:  document.getElementById('e-description').value.trim(),
      notes:        document.getElementById('e-notes').value.trim() || null,
    };
  }


  /* ============================================================
     API HANDLERS
     ============================================================ */
  async function handleCreate() {
    if (!validateForm()) return;

    const btn = document.getElementById('btn-save-expense');
    btn.classList.add('loading');
    btn.disabled = true;

    try {
      const data = collectFormData();
      await Api.post('/expenses', data);

      Modal.close('expense-modal');
      Toast.success('Expense Added', `${formatCurrency(data.amount)} ${formatStatusLabel(data.category)} expense recorded.`);
      refreshPage();
    } catch (err) {
      Toast.error('Error', err.message || 'Failed to add expense');
    } finally {
      btn.classList.remove('loading');
      btn.disabled = false;
    }
  }

  async function handleUpdate(id) {
    if (!validateForm()) return;

    const btn = document.getElementById('btn-save-expense');
    btn.classList.add('loading');
    btn.disabled = true;

    try {
      const data = collectFormData();
      await Api.put(`/expenses/${id}`, data);

      Modal.close('expense-modal');
      Toast.success('Expense Updated', 'The expense record has been updated.');
      refreshPage();
    } catch (err) {
      Toast.error('Error', err.message || 'Failed to update expense');
    } finally {
      btn.classList.remove('loading');
      btn.disabled = false;
    }
  }

  async function handleDelete(id) {
    try {
      await Api.delete(`/expenses/${id}`);
      Toast.success('Expense Deleted', 'The expense record has been removed.');
      refreshPage();
    } catch (err) {
      Toast.error('Error', err.message || 'Failed to delete expense');
    }
  }


  /* ============================================================
     EXPORT
     ============================================================ */
  function exportExpenses() {
    if (!table || !table.state.data.length) {
      Toast.warning('No Data', 'There are no expenses to export.');
      return;
    }

    const headers = ['Vehicle', 'Category', 'Amount', 'Description', 'Date', 'Status', 'Reference'];
    const rows = table.state.data.map((e) => [
      e.vehicle_name || 'General',
      formatStatusLabel(e.category),
      e.amount ?? '',
      e.description || '',
      e.expense_date || '',
      formatStatusLabel(e.status),
      e.reference || '',
    ]);

    let csv = headers.join(',') + '\n';
    rows.forEach((row) => {
      csv += row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses_export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    Toast.success('Exported', 'Expense data has been downloaded as CSV.');
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
