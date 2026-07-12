/**
 * TransitOps – Data Table Component
 * Renders sortable, searchable, paginated data tables.
 */

const DataTable = (() => {

  /**
   * Create a data table instance.
   * @param {object} config
   * @param {string}   config.containerId  - DOM ID to render the table into
   * @param {Array}    config.columns      - Column definitions: [{ key, label, sortable, render }]
   * @param {function} config.fetchData    - Async function(params) → { items, total }
   * @param {function} [config.onRowClick] - Row click handler, receives the row data
   * @param {function} [config.actions]    - Function(row) → HTML string for action buttons
   * @param {string}   [config.searchPlaceholder] - Search input placeholder
   * @param {string}   [config.emptyIcon]
   * @param {string}   [config.emptyTitle]
   * @param {string}   [config.emptyText]
   */
  function create(config) {
    const state = {
      data: [],
      total: 0,
      page: 1,
      pageSize: AppConfig.DEFAULT_PAGE_SIZE,
      search: '',
      sortKey: '',
      sortDir: 'asc',
      loading: false,
      filters: {},
    };

    const instance = {
      state,
      config,
      refresh,
      setFilter,
      clearFilters,
      getState: () => ({ ...state }),
    };

    // Initial render structure
    renderShell(instance);

    // Load data
    refresh(instance);

    return instance;


    // --- Internal Methods ---

    async function refresh(inst = instance) {
      inst.state.loading = true;
      renderLoading(inst);

      try {
        const params = {
          skip: (inst.state.page - 1) * inst.state.pageSize,
          limit: inst.state.pageSize,
          search: inst.state.search || undefined,
          sort_by: inst.state.sortKey || undefined,
          sort_dir: inst.state.sortDir || undefined,
          ...inst.state.filters,
        };

        // Remove undefined params
        Object.keys(params).forEach((k) => params[k] === undefined && delete params[k]);

        const result = await inst.config.fetchData(params);

        inst.state.data = result.items || result.data || [];
        inst.state.total = result.total || inst.state.data.length;
        inst.state.loading = false;

        renderTable(inst);
        renderPagination(inst);
      } catch (err) {
        inst.state.loading = false;
        Toast.error('Error', err.message || 'Failed to load data');
        renderEmpty(inst);
      }
    }

    function setFilter(key, value) {
      instance.state.filters[key] = value;
      instance.state.page = 1;
      refresh();
    }

    function clearFilters() {
      instance.state.filters = {};
      instance.state.search = '';
      instance.state.page = 1;
      const searchInput = document.querySelector(`#${config.containerId} .table-search input`);
      if (searchInput) searchInput.value = '';
      refresh();
    }
  }


  // --- Rendering Functions ---

  function renderShell(inst) {
    const container = document.getElementById(inst.config.containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="table-wrapper">
        <div class="table-toolbar">
          <div class="table-toolbar-left">
            <div class="table-search">
              <span>🔍</span>
              <input type="text" placeholder="${inst.config.searchPlaceholder || 'Search...'}" />
            </div>
          </div>
          <div class="table-toolbar-right" id="${inst.config.containerId}-toolbar-right">
          </div>
        </div>
        <div id="${inst.config.containerId}-table-body"></div>
        <div id="${inst.config.containerId}-pagination" class="table-pagination"></div>
      </div>
    `;

    // Search handler with debounce
    let searchTimer;
    const searchInput = container.querySelector('.table-search input');
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        inst.state.search = e.target.value.trim();
        inst.state.page = 1;
        inst.refresh(inst);
      }, 350);
    });
  }

  function renderLoading(inst) {
    const body = document.getElementById(`${inst.config.containerId}-table-body`);
    if (!body) return;
    body.innerHTML = `
      <div class="empty-state" style="padding: var(--space-8);">
        <div class="spinner"></div>
        <div class="loader-text" style="margin-top: var(--space-3);">Loading data...</div>
      </div>
    `;
  }

  function renderEmpty(inst) {
    const body = document.getElementById(`${inst.config.containerId}-table-body`);
    if (!body) return;
    body.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">${inst.config.emptyIcon || '📋'}</div>
        <div class="empty-state-title">${inst.config.emptyTitle || 'No records found'}</div>
        <div class="empty-state-text">${inst.config.emptyText || 'Try adjusting your search or filters.'}</div>
      </div>
    `;

    // Clear pagination
    const pagination = document.getElementById(`${inst.config.containerId}-pagination`);
    if (pagination) pagination.innerHTML = '';
  }

  function renderTable(inst) {
    const body = document.getElementById(`${inst.config.containerId}-table-body`);
    if (!body) return;

    if (inst.state.data.length === 0) {
      renderEmpty(inst);
      return;
    }

    const cols = inst.config.columns;
    const hasActions = !!inst.config.actions;

    let html = `<table class="data-table">
      <thead>
        <tr>
          ${cols.map((col) => {
            const sortable = col.sortable !== false;
            const isSorted = inst.state.sortKey === col.key;
            const sortIcon = isSorted ? (inst.state.sortDir === 'asc' ? ' ↑' : ' ↓') : '';
            return `
              <th class="${sortable ? 'sortable' : ''} ${isSorted ? 'sorted' : ''}"
                  ${sortable ? `data-sort-key="${col.key}"` : ''}>
                ${col.label}${sortIcon}
              </th>
            `;
          }).join('')}
          ${hasActions ? '<th style="width: 80px;">Actions</th>' : ''}
        </tr>
      </thead>
      <tbody>
        ${inst.state.data.map((row, idx) => `
          <tr data-row-index="${idx}" ${inst.config.onRowClick ? 'class="cursor-pointer"' : ''}>
            ${cols.map((col) => {
              const value = getNestedValue(row, col.key);
              const rendered = col.render ? col.render(value, row) : escapeHTML(value);
              return `<td>${rendered}</td>`;
            }).join('')}
            ${hasActions ? `<td><div class="table-actions">${inst.config.actions(row)}</div></td>` : ''}
          </tr>
        `).join('')}
      </tbody>
    </table>`;

    body.innerHTML = html;

    // Sort click handlers
    body.querySelectorAll('th[data-sort-key]').forEach((th) => {
      th.addEventListener('click', () => {
        const key = th.dataset.sortKey;
        if (inst.state.sortKey === key) {
          inst.state.sortDir = inst.state.sortDir === 'asc' ? 'desc' : 'asc';
        } else {
          inst.state.sortKey = key;
          inst.state.sortDir = 'asc';
        }
        inst.refresh(inst);
      });
    });

    // Row click handlers
    if (inst.config.onRowClick) {
      body.querySelectorAll('tbody tr').forEach((tr) => {
        tr.addEventListener('click', (e) => {
          // Ignore if clicking action buttons
          if (e.target.closest('.table-actions')) return;
          const idx = parseInt(tr.dataset.rowIndex);
          inst.config.onRowClick(inst.state.data[idx]);
        });
      });
    }
  }

  function renderPagination(inst) {
    const el = document.getElementById(`${inst.config.containerId}-pagination`);
    if (!el) return;

    const totalPages = Math.ceil(inst.state.total / inst.state.pageSize) || 1;
    const from = ((inst.state.page - 1) * inst.state.pageSize) + 1;
    const to = Math.min(inst.state.page * inst.state.pageSize, inst.state.total);

    if (inst.state.total === 0) {
      el.innerHTML = '';
      return;
    }

    let pageButtons = '';
    const maxVisible = 5;
    let startPage = Math.max(1, inst.state.page - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageButtons += `
        <button class="pagination-btn ${i === inst.state.page ? 'active' : ''}" data-page="${i}">${i}</button>
      `;
    }

    el.innerHTML = `
      <div class="pagination-info">
        Showing ${from}–${to} of ${inst.state.total} records
      </div>
      <div class="pagination-controls">
        <button class="pagination-btn" data-page="prev" ${inst.state.page <= 1 ? 'disabled' : ''}>‹</button>
        ${pageButtons}
        <button class="pagination-btn" data-page="next" ${inst.state.page >= totalPages ? 'disabled' : ''}>›</button>
      </div>
    `;

    el.querySelectorAll('.pagination-btn[data-page]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const val = btn.dataset.page;
        if (val === 'prev') {
          inst.state.page = Math.max(1, inst.state.page - 1);
        } else if (val === 'next') {
          inst.state.page = Math.min(totalPages, inst.state.page + 1);
        } else {
          inst.state.page = parseInt(val);
        }
        inst.refresh(inst);
      });
    });
  }


  // --- Helpers ---

  function getNestedValue(obj, path) {
    return path.split('.').reduce((o, k) => (o || {})[k], obj) ?? '—';
  }

  function escapeHTML(str) {
    if (str === null || str === undefined) return '—';
    const text = String(str);
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }


  return { create };
})();
