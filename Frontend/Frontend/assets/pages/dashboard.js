const DashboardPage = (() => {
  function template() { return `<div id="dashboard-root"></div>`; }
  async function init() {
    const root = document.getElementById('dashboard-root');
    root.innerHTML = '<div class="empty-state"><div class="spinner"></div><div class="loader-text">Loading dashboard…</div></div>';
    try {
      const data = await Api.get('/dashboard');
      root.innerHTML = `${PageHelpers.pageHeader('Dashboard', 'Live operational snapshot of your fleet.', '<a class="btn btn-primary" href="#trips">+ Create Trip</a>')}
        <div class="stats-grid">
          ${PageHelpers.statsCard('🚛','Total Vehicles',data.total_vehicles,'info')}
          ${PageHelpers.statsCard('✅','Available Vehicles',data.available_vehicles,'success')}
          ${PageHelpers.statsCard('🗺️','Active Trips',data.active_trips,'info')}
          ${PageHelpers.statsCard('🔧','Vehicles In Shop',data.vehicles_in_shop,'warning')}
          ${PageHelpers.statsCard('👤','Available Drivers',data.available_drivers,'success')}
          ${PageHelpers.statsCard('📊','Fleet Utilization',`${data.fleet_utilization}%`,'info')}
          ${PageHelpers.statsCard('📝','Pending Trips',data.pending_trips,'warning')}
          ${PageHelpers.statsCard('💰','Operational Cost',Utils.formatCurrency(data.operational_cost),'danger')}
        </div>
        <div class="dashboard-two-column">
          <section class="card"><div class="card-header"><h3 class="card-title">Recent Trips</h3></div><div class="card-body">${data.recent_trips.length ? `<div class="simple-list">${data.recent_trips.map((t) => `<div class="simple-list-item"><div><strong>${Utils.escapeHTML(t.source)} → ${Utils.escapeHTML(t.destination)}</strong><span>${Utils.escapeHTML(t.vehicle_reg)} · ${Utils.escapeHTML(t.driver_name)}</span></div>${getStatusBadgeHTML(t.status)}</div>`).join('')}</div>` : '<div class="empty-state-text">No recent trips.</div>'}</div></section>
          <section class="card"><div class="card-header"><h3 class="card-title">Attention Required</h3></div><div class="card-body"><div class="simple-list">${data.maintenance_alerts.map((m) => `<div class="simple-list-item"><div><strong>${Utils.escapeHTML(m.vehicle_reg)}</strong><span>${Utils.escapeHTML(m.maintenance_type)}</span></div>${getStatusBadgeHTML(m.status)}</div>`).join('') || '<div class="empty-state-text">No active maintenance.</div>'}${data.expiring_licenses.map((d) => `<div class="simple-list-item"><div><strong>${Utils.escapeHTML(d.name)}</strong><span>Licence expires ${Utils.formatDate(d.license_expiry_date)}</span></div><span class="badge badge-warning">Expiring</span></div>`).join('')}</div></div></section>
        </div>`;
    } catch (error) { root.innerHTML = `<div class="empty-state"><div class="empty-state-title">Dashboard unavailable</div><div class="empty-state-text">${Utils.escapeHTML(error.message)}</div></div>`; }
  }
  return { template, init };
})();
