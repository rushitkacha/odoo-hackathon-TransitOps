/** LocalStorage-backed FastAPI simulator used only while DEMO_MODE is true. */
const MockApi = (() => {
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const now = () => new Date().toISOString();

  function seed() {
    const existing = localStorage.getItem(AppConfig.DEMO_DB_KEY);
    if (existing) return JSON.parse(existing);

    const db = {
      nextIds: { vehicles: 9, drivers: 9, trips: 7, maintenance: 4, fuel_logs: 7, expenses: 7, users: 5 },
      vehicles: [
        { id: 1, registration_number: 'GJ-15-AB-2345', name_model: 'Tata Ace', vehicle_type: 'Mini Truck', max_load_capacity_kg: 500, odometer_km: 42115, acquisition_cost: 800000, region: 'Gujarat', status: 'Available', created_at: now() },
        { id: 2, registration_number: 'GJ-05-KL-8821', name_model: 'Ashok Leyland Dost', vehicle_type: 'Truck', max_load_capacity_kg: 1500, odometer_km: 78350, acquisition_cost: 1250000, region: 'Gujarat', status: 'On Trip', created_at: now() },
        { id: 3, registration_number: 'MH-12-PQ-4410', name_model: 'Mahindra Bolero Pickup', vehicle_type: 'Pickup', max_load_capacity_kg: 1200, odometer_km: 61200, acquisition_cost: 980000, region: 'Maharashtra', status: 'In Shop', created_at: now() },
        { id: 4, registration_number: 'RJ-14-ZX-1022', name_model: 'Eicher Pro 2049', vehicle_type: 'Truck', max_load_capacity_kg: 2500, odometer_km: 145000, acquisition_cost: 1800000, region: 'Rajasthan', status: 'Retired', created_at: now() },
        { id: 5, registration_number: 'GJ-01-CD-7755', name_model: 'Force Traveller', vehicle_type: 'Van', max_load_capacity_kg: 900, odometer_km: 34200, acquisition_cost: 1450000, region: 'Gujarat', status: 'Available', created_at: now() },
        { id: 6, registration_number: 'MP-09-AA-7733', name_model: 'Tata 407', vehicle_type: 'Truck', max_load_capacity_kg: 2250, odometer_km: 89600, acquisition_cost: 1550000, region: 'Madhya Pradesh', status: 'Available', created_at: now() },
        { id: 7, registration_number: 'GJ-18-TR-5501', name_model: 'Maruti Eeco Cargo', vehicle_type: 'Van', max_load_capacity_kg: 600, odometer_km: 27540, acquisition_cost: 720000, region: 'Gujarat', status: 'Available', created_at: now() },
        { id: 8, registration_number: 'MH-04-HH-3320', name_model: 'BharatBenz 1217C', vehicle_type: 'Heavy Truck', max_load_capacity_kg: 8000, odometer_km: 110300, acquisition_cost: 3200000, region: 'Maharashtra', status: 'Available', created_at: now() },
      ],
      drivers: [
        { id: 1, name: 'Alex Patel', license_number: 'GJ2025005678', license_category: 'Commercial', license_expiry_date: '2027-12-10', contact_number: '9876501001', safety_score: 92, status: 'Available', created_at: now() },
        { id: 2, name: 'Rohan Shah', license_number: 'GJ2022003344', license_category: 'Heavy Commercial', license_expiry_date: '2028-05-18', contact_number: '9876501002', safety_score: 88, status: 'On Trip', created_at: now() },
        { id: 3, name: 'Mehul Joshi', license_number: 'MH2021008881', license_category: 'Commercial', license_expiry_date: '2026-08-02', contact_number: '9876501003', safety_score: 81, status: 'Available', created_at: now() },
        { id: 4, name: 'Imran Khan', license_number: 'RJ2020004412', license_category: 'Heavy Commercial', license_expiry_date: '2027-03-15', contact_number: '9876501004', safety_score: 76, status: 'Off Duty', created_at: now() },
        { id: 5, name: 'Nikhil Rao', license_number: 'MP2019007722', license_category: 'Commercial', license_expiry_date: '2025-12-30', contact_number: '9876501005', safety_score: 65, status: 'Suspended', created_at: now() },
        { id: 6, name: 'Sanjay Desai', license_number: 'GJ2023009900', license_category: 'Commercial', license_expiry_date: '2029-01-20', contact_number: '9876501006', safety_score: 95, status: 'Available', created_at: now() },
        { id: 7, name: 'Vikas Yadav', license_number: 'MH2024006611', license_category: 'Heavy Commercial', license_expiry_date: '2027-09-01', contact_number: '9876501007', safety_score: 89, status: 'Available', created_at: now() },
        { id: 8, name: 'Karan Singh', license_number: 'RJ2022001222', license_category: 'Commercial', license_expiry_date: '2028-02-09', contact_number: '9876501008', safety_score: 84, status: 'Available', created_at: now() },
      ],
      trips: [
        { id: 1, source: 'Ahmedabad', destination: 'Vadodara', vehicle_id: 1, driver_id: 1, cargo_weight_kg: 450, planned_distance_km: 115, actual_distance_km: 115, revenue: 5200, status: 'Completed', created_at: '2026-07-01T09:00:00Z', completed_at: '2026-07-01T16:00:00Z' },
        { id: 2, source: 'Surat', destination: 'Mumbai', vehicle_id: 2, driver_id: 2, cargo_weight_kg: 1100, planned_distance_km: 285, actual_distance_km: null, revenue: 18000, status: 'Dispatched', created_at: '2026-07-11T10:00:00Z' },
        { id: 3, source: 'Rajkot', destination: 'Ahmedabad', vehicle_id: 5, driver_id: 6, cargo_weight_kg: 650, planned_distance_km: 215, actual_distance_km: 220, revenue: 11000, status: 'Completed', created_at: '2026-06-28T08:00:00Z', completed_at: '2026-06-28T18:00:00Z' },
        { id: 4, source: 'Indore', destination: 'Bhopal', vehicle_id: 6, driver_id: 7, cargo_weight_kg: 1800, planned_distance_km: 195, actual_distance_km: 198, revenue: 14500, status: 'Completed', created_at: '2026-06-25T07:30:00Z', completed_at: '2026-06-25T17:30:00Z' },
        { id: 5, source: 'Pune', destination: 'Nashik', vehicle_id: 7, driver_id: 8, cargo_weight_kg: 500, planned_distance_km: 210, actual_distance_km: null, revenue: 8500, status: 'Draft', created_at: '2026-07-12T06:00:00Z' },
        { id: 6, source: 'Vadodara', destination: 'Anand', vehicle_id: 1, driver_id: 3, cargo_weight_kg: 300, planned_distance_km: 45, actual_distance_km: 46, revenue: 2800, status: 'Completed', created_at: '2026-06-20T09:00:00Z', completed_at: '2026-06-20T13:00:00Z' },
      ],
      maintenance: [
        { id: 1, vehicle_id: 3, maintenance_type: 'Oil Change', description: 'Replace oil and filters', start_date: '2026-07-10', end_date: null, cost: 4000, status: 'Active', closing_notes: null, created_at: now() },
        { id: 2, vehicle_id: 1, maintenance_type: 'Brake Inspection', description: 'Routine brake inspection', start_date: '2026-06-12', end_date: '2026-06-12', cost: 2200, status: 'Closed', closing_notes: 'No replacement required', created_at: now() },
        { id: 3, vehicle_id: 5, maintenance_type: 'Tyre Replacement', description: 'Replace front tyres', start_date: '2026-05-18', end_date: '2026-05-19', cost: 18000, status: 'Closed', closing_notes: 'Two tyres replaced', created_at: now() },
      ],
      fuel_logs: [
        { id: 1, vehicle_id: 1, trip_id: 1, liters: 12, cost: 1200, date: '2026-07-01', odometer_km: 42115, created_at: now() },
        { id: 2, vehicle_id: 5, trip_id: 3, liters: 24, cost: 2400, date: '2026-06-28', odometer_km: 34200, created_at: now() },
        { id: 3, vehicle_id: 6, trip_id: 4, liters: 28, cost: 2800, date: '2026-06-25', odometer_km: 89600, created_at: now() },
        { id: 4, vehicle_id: 1, trip_id: 6, liters: 5, cost: 500, date: '2026-06-20', odometer_km: 42000, created_at: now() },
        { id: 5, vehicle_id: 2, trip_id: 2, liters: 35, cost: 3500, date: '2026-07-11', odometer_km: 78350, created_at: now() },
        { id: 6, vehicle_id: 7, trip_id: null, liters: 20, cost: 2050, date: '2026-07-08', odometer_km: 27540, created_at: now() },
      ],
      expenses: [
        { id: 1, vehicle_id: 1, trip_id: 1, expense_type: 'Toll', amount: 350, expense_date: '2026-07-01', description: 'Expressway toll', created_at: now() },
        { id: 2, vehicle_id: 5, trip_id: 3, expense_type: 'Toll', amount: 620, expense_date: '2026-06-28', description: 'Highway tolls', created_at: now() },
        { id: 3, vehicle_id: 6, trip_id: 4, expense_type: 'Parking', amount: 180, expense_date: '2026-06-25', description: 'Loading bay parking', created_at: now() },
        { id: 4, vehicle_id: 3, trip_id: null, expense_type: 'Repair', amount: 1500, expense_date: '2026-07-10', description: 'Workshop inspection charge', created_at: now() },
        { id: 5, vehicle_id: 2, trip_id: 2, expense_type: 'Toll', amount: 850, expense_date: '2026-07-11', description: 'Surat to Mumbai tolls', created_at: now() },
        { id: 6, vehicle_id: 7, trip_id: null, expense_type: 'Other', amount: 300, expense_date: '2026-07-08', description: 'Vehicle cleaning', created_at: now() },
      ],
      users: [
        { id: 1, name: 'Aarav Mehta', email: 'fleet@transitops.com', role: 'Fleet Manager', status: 'Active' },
        { id: 2, name: 'Diya Shah', email: 'dispatch@transitops.com', role: 'Dispatcher', status: 'Active' },
        { id: 3, name: 'Kabir Singh', email: 'safety@transitops.com', role: 'Safety Officer', status: 'Active' },
        { id: 4, name: 'Meera Patel', email: 'finance@transitops.com', role: 'Financial Analyst', status: 'Active' },
      ],
    };
    save(db);
    return db;
  }

  function load() { return seed(); }
  function save(db) { localStorage.setItem(AppConfig.DEMO_DB_KEY, JSON.stringify(db)); }
  function error(message, status = 400) { const e = new Error(message); e.status = status; throw e; }
  function idOf(segment) { const id = Number(segment); if (!Number.isInteger(id)) error('Invalid record ID.', 422); return id; }
  function findOr404(list, id, label) { const item = list.find((x) => x.id === id); if (!item) error(`${label} not found.`, 404); return item; }
  function addNames(db, item) {
    const out = clone(item);
    if ('vehicle_id' in out) {
      const v = db.vehicles.find((x) => x.id === out.vehicle_id);
      out.vehicle = v || null; out.vehicle_name = v?.name_model || ''; out.vehicle_reg = v?.registration_number || '';
    }
    if ('driver_id' in out) {
      const d = db.drivers.find((x) => x.id === out.driver_id);
      out.driver = d || null; out.driver_name = d?.name || '';
    }
    if ('trip_id' in out && out.trip_id) {
      out.trip = db.trips.find((x) => x.id === out.trip_id) || null;
    }
    return out;
  }

  function list(data, params = {}) {
    let rows = data.map(clone);
    const search = String(params.search || '').toLowerCase();
    if (search) rows = rows.filter((row) => JSON.stringify(row).toLowerCase().includes(search));
    Object.entries(params).forEach(([key, value]) => {
      if (['search', 'skip', 'limit', 'page', 'page_size', 'sort_by', 'sort_dir'].includes(key) || value === '' || value == null || value === 'all') return;
      rows = rows.filter((row) => String(row[key]) === String(value));
    });
    if (params.sort_by) {
      const dir = params.sort_dir === 'desc' ? -1 : 1;
      rows.sort((a, b) => String(a[params.sort_by] ?? '').localeCompare(String(b[params.sort_by] ?? ''), undefined, { numeric: true }) * dir);
    }
    const total = rows.length;
    const skip = Number(params.skip ?? ((Number(params.page || 1) - 1) * Number(params.page_size || AppConfig.DEFAULT_PAGE_SIZE)));
    const limit = Number(params.limit ?? params.page_size ?? AppConfig.DEFAULT_PAGE_SIZE);
    return { items: rows.slice(skip, skip + limit), total };
  }

  function dashboard(db, params = {}) {
    let vehicles = db.vehicles;
    if (params.vehicle_type) vehicles = vehicles.filter((v) => v.vehicle_type === params.vehicle_type);
    if (params.region) vehicles = vehicles.filter((v) => v.region === params.region);
    if (params.status) vehicles = vehicles.filter((v) => v.status === params.status);
    const ids = new Set(vehicles.map((v) => v.id));
    const activeTrips = db.trips.filter((t) => t.status === 'Dispatched' && ids.has(t.vehicle_id));
    const pendingTrips = db.trips.filter((t) => t.status === 'Draft' && ids.has(t.vehicle_id));
    const fuelCost = db.fuel_logs.filter((x) => ids.has(x.vehicle_id)).reduce((s, x) => s + Number(x.cost || 0), 0);
    const maintenanceCost = db.maintenance.filter((x) => ids.has(x.vehicle_id)).reduce((s, x) => s + Number(x.cost || 0), 0);
    return {
      total_vehicles: vehicles.length,
      available_vehicles: vehicles.filter((v) => v.status === 'Available').length,
      vehicles_on_trip: vehicles.filter((v) => v.status === 'On Trip').length,
      vehicles_in_shop: vehicles.filter((v) => v.status === 'In Shop').length,
      active_trips: activeTrips.length,
      pending_trips: pendingTrips.length,
      available_drivers: db.drivers.filter((d) => d.status === 'Available' && d.license_expiry_date >= Utils.todayISO()).length,
      fleet_utilization: vehicles.length ? Math.round((vehicles.filter((v) => v.status === 'On Trip').length / vehicles.length) * 100) : 0,
      operational_cost: fuelCost + maintenanceCost,
      recent_trips: db.trips.slice().sort((a, b) => String(b.created_at).localeCompare(String(a.created_at))).slice(0, 5).map((x) => addNames(db, x)),
      maintenance_alerts: db.maintenance.filter((m) => m.status === 'Active').map((x) => addNames(db, x)),
      expiring_licenses: db.drivers.filter((d) => {
        const days = (new Date(d.license_expiry_date) - new Date()) / 86400000;
        return days >= 0 && days <= 60;
      }),
    };
  }

  function reportRows(db) {
    return db.vehicles.map((v) => {
      const trips = db.trips.filter((t) => t.vehicle_id === v.id && t.status === 'Completed');
      const distance = trips.reduce((s, t) => s + Number(t.actual_distance_km || 0), 0);
      const fuel = db.fuel_logs.filter((f) => f.vehicle_id === v.id);
      const liters = fuel.reduce((s, f) => s + Number(f.liters || 0), 0);
      const fuelCost = fuel.reduce((s, f) => s + Number(f.cost || 0), 0);
      const maintenanceCost = db.maintenance.filter((m) => m.vehicle_id === v.id).reduce((s, m) => s + Number(m.cost || 0), 0);
      const otherExpenses = db.expenses.filter((e) => e.vehicle_id === v.id).reduce((s, e) => s + Number(e.amount || 0), 0);
      const revenue = trips.reduce((s, t) => s + Number(t.revenue || 0), 0);
      const operationalCost = fuelCost + maintenanceCost;
      return {
        vehicle_id: v.id, registration_number: v.registration_number, name_model: v.name_model,
        completed_trips: trips.length, total_distance_km: distance, total_fuel_liters: liters,
        fuel_cost: fuelCost, maintenance_cost: maintenanceCost, other_expenses: otherExpenses,
        operational_cost: operationalCost, fuel_efficiency: liters ? Number((distance / liters).toFixed(2)) : 0,
        roi: v.acquisition_cost ? Number(((revenue - operationalCost) / v.acquisition_cost * 100).toFixed(2)) : 0,
      };
    });
  }

  async function handle(method, endpoint, { params = {}, data = null } = {}) {
    await new Promise((resolve) => setTimeout(resolve, 80));
    const db = load();
    const path = endpoint.split('?')[0].replace(/^\//, '');
    const parts = path.split('/').filter(Boolean);
    const resource = parts[0];

    if (method === 'GET' && resource === 'dashboard') return dashboard(db, params);

    if (resource === 'vehicles') {
      if (method === 'GET' && parts[1] === 'available') return db.vehicles.filter((v) => v.status === 'Available').map(clone);
      if (method === 'GET' && parts[1]) return clone(findOr404(db.vehicles, idOf(parts[1]), 'Vehicle'));
      if (method === 'GET') return list(db.vehicles, params);
      if (method === 'POST') {
        if (db.vehicles.some((v) => v.registration_number.toLowerCase() === String(data.registration_number).toLowerCase())) error('Vehicle registration number already exists.', 409);
        if (Number(data.max_load_capacity_kg) <= 0) error('Maximum load capacity must be greater than zero.', 422);
        const row = { id: db.nextIds.vehicles++, ...data, status: 'Available', created_at: now() };
        db.vehicles.push(row); save(db); return clone(row);
      }
      const row = findOr404(db.vehicles, idOf(parts[1]), 'Vehicle');
      if (method === 'PATCH' || method === 'PUT') {
        if (data.registration_number && db.vehicles.some((v) => v.id !== row.id && v.registration_number.toLowerCase() === data.registration_number.toLowerCase())) error('Vehicle registration number already exists.', 409);
        Object.assign(row, data, { updated_at: now() }); save(db); return clone(row);
      }
      if (method === 'DELETE') {
        if (['On Trip', 'In Shop'].includes(row.status)) error(`Vehicle is ${row.status} and cannot be deleted.`, 409);
        db.vehicles = db.vehicles.filter((x) => x.id !== row.id); save(db); return null;
      }
    }

    if (resource === 'drivers') {
      if (method === 'GET' && parts[1] === 'available') return db.drivers.filter((d) => d.status === 'Available' && d.license_expiry_date >= Utils.todayISO()).map(clone);
      if (method === 'GET' && parts[2] === 'eligibility') {
        const d = findOr404(db.drivers, idOf(parts[1]), 'Driver');
        const eligible = d.status === 'Available' && d.license_expiry_date >= Utils.todayISO();
        return { driver_id: d.id, eligible, reason: eligible ? null : (d.license_expiry_date < Utils.todayISO() ? 'Driver licence expired' : `Driver status is ${d.status}`) };
      }
      if (method === 'GET' && parts[1]) return clone(findOr404(db.drivers, idOf(parts[1]), 'Driver'));
      if (method === 'GET') return list(db.drivers, params);
      if (method === 'POST') {
        if (db.drivers.some((d) => d.license_number.toLowerCase() === String(data.license_number).toLowerCase())) error('Driver licence number already exists.', 409);
        if (Number(data.safety_score) < 0 || Number(data.safety_score) > 100) error('Safety score must be between 0 and 100.', 422);
        const row = { id: db.nextIds.drivers++, ...data, status: data.status || 'Available', created_at: now() };
        db.drivers.push(row); save(db); return clone(row);
      }
      const row = findOr404(db.drivers, idOf(parts[1]), 'Driver');
      if (method === 'PATCH' || method === 'PUT') { Object.assign(row, data, { updated_at: now() }); save(db); return clone(row); }
      if (method === 'DELETE') {
        if (row.status === 'On Trip') error('Driver is On Trip and cannot be deleted.', 409);
        db.drivers = db.drivers.filter((x) => x.id !== row.id); save(db); return null;
      }
    }

    if (resource === 'trips') {
      if (method === 'GET' && parts[1]) return addNames(db, findOr404(db.trips, idOf(parts[1]), 'Trip'));
      if (method === 'GET') return list(db.trips.map((x) => addNames(db, x)), params);
      if (method === 'POST' && parts.length === 1) {
        const vehicle = findOr404(db.vehicles, Number(data.vehicle_id), 'Vehicle');
        const driver = findOr404(db.drivers, Number(data.driver_id), 'Driver');
        if (vehicle.status !== 'Available') error(`Vehicle is ${vehicle.status} and cannot be selected.`, 409);
        if (driver.status !== 'Available') error(`Driver is ${driver.status} and cannot be selected.`, 409);
        if (driver.license_expiry_date < Utils.todayISO()) error('Driver licence has expired.', 409);
        if (Number(data.cargo_weight_kg) > Number(vehicle.max_load_capacity_kg)) error('Cargo weight exceeds vehicle maximum load capacity.', 422);
        const row = { id: db.nextIds.trips++, ...data, vehicle_id: Number(data.vehicle_id), driver_id: Number(data.driver_id), status: 'Draft', created_at: now() };
        db.trips.push(row); save(db); return addNames(db, row);
      }
      const trip = findOr404(db.trips, idOf(parts[1]), 'Trip');
      const action = parts[2];
      const vehicle = findOr404(db.vehicles, trip.vehicle_id, 'Vehicle');
      const driver = findOr404(db.drivers, trip.driver_id, 'Driver');
      if (method === 'POST' && action === 'dispatch') {
        if (trip.status !== 'Draft') error('Only Draft trips can be dispatched.', 409);
        if (vehicle.status !== 'Available') error(`Vehicle is ${vehicle.status}.`, 409);
        if (driver.status !== 'Available') error(`Driver is ${driver.status}.`, 409);
        if (driver.license_expiry_date < Utils.todayISO()) error('Driver licence has expired.', 409);
        if (trip.cargo_weight_kg > vehicle.max_load_capacity_kg) error('Cargo exceeds vehicle capacity.', 422);
        trip.status = 'Dispatched'; trip.dispatched_at = now(); vehicle.status = 'On Trip'; driver.status = 'On Trip'; save(db); return addNames(db, trip);
      }
      if (method === 'POST' && action === 'complete') {
        if (trip.status !== 'Dispatched') error('Only Dispatched trips can be completed.', 409);
        trip.status = 'Completed'; trip.completed_at = now(); trip.actual_distance_km = Number(data.actual_distance_km || trip.planned_distance_km); trip.revenue = Number(data.revenue || trip.revenue || 0);
        vehicle.status = 'Available'; driver.status = 'Available';
        if (data.final_odometer_km != null) vehicle.odometer_km = Math.max(vehicle.odometer_km, Number(data.final_odometer_km));
        if (Number(data.fuel_consumed_liters) > 0) db.fuel_logs.push({ id: db.nextIds.fuel_logs++, vehicle_id: vehicle.id, trip_id: trip.id, liters: Number(data.fuel_consumed_liters), cost: Number(data.fuel_cost || 0), date: Utils.todayISO(), odometer_km: vehicle.odometer_km, created_at: now() });
        save(db); return addNames(db, trip);
      }
      if (method === 'POST' && action === 'cancel') {
        if (!['Draft', 'Dispatched'].includes(trip.status)) error('Only Draft or Dispatched trips can be cancelled.', 409);
        if (trip.status === 'Dispatched') { vehicle.status = 'Available'; driver.status = 'Available'; }
        trip.status = 'Cancelled'; trip.cancelled_at = now(); save(db); return addNames(db, trip);
      }
    }

    if (resource === 'maintenance') {
      if (method === 'GET' && parts[1]) return addNames(db, findOr404(db.maintenance, idOf(parts[1]), 'Maintenance record'));
      if (method === 'GET') return list(db.maintenance.map((x) => addNames(db, x)), params);
      if (method === 'POST' && parts.length === 1) {
        const vehicle = findOr404(db.vehicles, Number(data.vehicle_id), 'Vehicle');
        if (vehicle.status === 'On Trip') error('Vehicle is On Trip and cannot enter maintenance.', 409);
        if (vehicle.status === 'Retired') error('Retired vehicles cannot enter maintenance.', 409);
        if (db.maintenance.some((m) => m.vehicle_id === vehicle.id && m.status === 'Active')) error('Vehicle already has active maintenance.', 409);
        const row = { id: db.nextIds.maintenance++, ...data, vehicle_id: Number(data.vehicle_id), cost: Number(data.cost || 0), status: 'Active', end_date: null, created_at: now() };
        db.maintenance.push(row); vehicle.status = 'In Shop'; save(db); return addNames(db, row);
      }
      if (method === 'POST' && parts[2] === 'close') {
        const row = findOr404(db.maintenance, idOf(parts[1]), 'Maintenance record');
        if (row.status !== 'Active') error('Maintenance record is already closed.', 409);
        row.status = 'Closed'; row.end_date = data.end_date || Utils.todayISO(); row.cost = Number(data.cost ?? row.cost); row.closing_notes = data.closing_notes || null;
        const vehicle = findOr404(db.vehicles, row.vehicle_id, 'Vehicle'); if (vehicle.status !== 'Retired') vehicle.status = 'Available'; save(db); return addNames(db, row);
      }
    }

    if (resource === 'fuel-logs') {
      if (method === 'GET' && parts[1]) return addNames(db, findOr404(db.fuel_logs, idOf(parts[1]), 'Fuel log'));
      if (method === 'GET') return list(db.fuel_logs.map((x) => addNames(db, x)), params);
      if (method === 'POST') {
        const vehicle = findOr404(db.vehicles, Number(data.vehicle_id), 'Vehicle');
        if (Number(data.liters) <= 0) error('Fuel litres must be greater than zero.', 422);
        if (data.trip_id) { const trip = findOr404(db.trips, Number(data.trip_id), 'Trip'); if (trip.vehicle_id !== vehicle.id) error('Selected trip does not belong to selected vehicle.', 422); }
        const row = { id: db.nextIds.fuel_logs++, ...data, vehicle_id: Number(data.vehicle_id), trip_id: data.trip_id ? Number(data.trip_id) : null, liters: Number(data.liters), cost: Number(data.cost || 0), odometer_km: Number(data.odometer_km || 0), created_at: now() };
        if (row.odometer_km && row.odometer_km < vehicle.odometer_km) error('Odometer cannot move backwards.', 422);
        if (row.odometer_km) vehicle.odometer_km = row.odometer_km;
        db.fuel_logs.push(row); save(db); return addNames(db, row);
      }
      const row = findOr404(db.fuel_logs, idOf(parts[1]), 'Fuel log');
      if (method === 'PATCH' || method === 'PUT') { Object.assign(row, data, { updated_at: now() }); save(db); return addNames(db, row); }
      if (method === 'DELETE') { db.fuel_logs = db.fuel_logs.filter((x) => x.id !== row.id); save(db); return null; }
    }

    if (resource === 'expenses') {
      if (method === 'GET' && parts[1]) return addNames(db, findOr404(db.expenses, idOf(parts[1]), 'Expense'));
      if (method === 'GET') return list(db.expenses.map((x) => addNames(db, x)), params);
      if (method === 'POST') {
        const vehicle = findOr404(db.vehicles, Number(data.vehicle_id), 'Vehicle');
        if (Number(data.amount) < 0) error('Expense amount cannot be negative.', 422);
        if (data.trip_id) { const trip = findOr404(db.trips, Number(data.trip_id), 'Trip'); if (trip.vehicle_id !== vehicle.id) error('Selected trip does not belong to selected vehicle.', 422); }
        const row = { id: db.nextIds.expenses++, ...data, vehicle_id: Number(data.vehicle_id), trip_id: data.trip_id ? Number(data.trip_id) : null, amount: Number(data.amount), created_at: now() };
        db.expenses.push(row); save(db); return addNames(db, row);
      }
      const row = findOr404(db.expenses, idOf(parts[1]), 'Expense');
      if (method === 'PATCH' || method === 'PUT') { Object.assign(row, data, { updated_at: now() }); save(db); return addNames(db, row); }
      if (method === 'DELETE') { db.expenses = db.expenses.filter((x) => x.id !== row.id); save(db); return null; }
    }

    if (resource === 'reports' && parts[1] === 'vehicles') {
      const rows = reportRows(db);
      if (parts[2]) return clone(findOr404(rows, idOf(parts[2]), 'Vehicle report'));
      return list(rows, params);
    }

    if (resource === 'users') {
      if (method === 'GET') return list(db.users, params);
      const row = findOr404(db.users, idOf(parts[1]), 'User');
      if (method === 'PATCH') { Object.assign(row, data); save(db); return clone(row); }
    }

    error(`Mock endpoint not implemented: ${method} /${path}`, 404);
  }

  function reset() { localStorage.removeItem(AppConfig.DEMO_DB_KEY); return seed(); }
  return { handle, reset };
})();
