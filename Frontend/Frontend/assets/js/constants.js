/** TransitOps values. These strings must match the FastAPI enums exactly. */
const VEHICLE_STATUS = Object.freeze({
  AVAILABLE: 'Available',
  ON_TRIP: 'On Trip',
  IN_SHOP: 'In Shop',
  RETIRED: 'Retired',
});

const DRIVER_STATUS = Object.freeze({
  AVAILABLE: 'Available',
  ON_TRIP: 'On Trip',
  OFF_DUTY: 'Off Duty',
  SUSPENDED: 'Suspended',
});

const TRIP_STATUS = Object.freeze({
  DRAFT: 'Draft',
  DISPATCHED: 'Dispatched',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
});

const MAINTENANCE_STATUS = Object.freeze({
  ACTIVE: 'Active',
  CLOSED: 'Closed',
});

const EXPENSE_TYPE = Object.freeze({
  TOLL: 'Toll',
  PARKING: 'Parking',
  REPAIR: 'Repair',
  OTHER: 'Other',
});

const USER_ROLES = Object.freeze({
  FLEET_MANAGER: 'Fleet Manager',
  DISPATCHER: 'Dispatcher',
  SAFETY_OFFICER: 'Safety Officer',
  FINANCIAL_ANALYST: 'Financial Analyst',
});

const STATUS_BADGE_MAP = Object.freeze({
  Available: 'badge-success',
  Completed: 'badge-success',
  Closed: 'badge-success',
  Active: 'badge-info',
  'On Trip': 'badge-info',
  Dispatched: 'badge-info',
  Draft: 'badge-warning',
  'In Shop': 'badge-warning',
  'Off Duty': 'badge-neutral',
  Retired: 'badge-neutral',
  Cancelled: 'badge-neutral',
  Suspended: 'badge-danger',
  Inactive: 'badge-danger',
});

function formatStatusLabel(status) {
  return status || '—';
}

function getStatusBadgeHTML(status) {
  const safe = Utils ? Utils.escapeHTML(status || 'Unknown') : String(status || 'Unknown');
  const badgeClass = STATUS_BADGE_MAP[status] || 'badge-neutral';
  return `<span class="badge ${badgeClass}"><span class="badge-dot"></span>${safe}</span>`;
}
