/**
 * TransitOps – Constants
 * Enums, status maps, and label/color mappings used across pages.
 */

const STATUS = Object.freeze({
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  IN_PROGRESS: 'in_progress',
  OVERDUE: 'overdue',
  APPROVED: 'approved',
  REJECTED: 'rejected',
});

const VEHICLE_STATUS = Object.freeze({
  ACTIVE: 'active',
  IN_MAINTENANCE: 'in_maintenance',
  OUT_OF_SERVICE: 'out_of_service',
  RETIRED: 'retired',
});

const DRIVER_STATUS = Object.freeze({
  AVAILABLE: 'available',
  ON_TRIP: 'on_trip',
  OFF_DUTY: 'off_duty',
  ON_LEAVE: 'on_leave',
  SUSPENDED: 'suspended',
});

const MAINTENANCE_STATUS = Object.freeze({
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled',
});

const MAINTENANCE_TYPE = Object.freeze({
  PREVENTIVE: 'preventive',
  CORRECTIVE: 'corrective',
  EMERGENCY: 'emergency',
  INSPECTION: 'inspection',
});

const FUEL_TYPE = Object.freeze({
  DIESEL: 'diesel',
  PETROL: 'petrol',
  CNG: 'cng',
  ELECTRIC: 'electric',
});

const EXPENSE_CATEGORY = Object.freeze({
  FUEL: 'fuel',
  MAINTENANCE: 'maintenance',
  INSURANCE: 'insurance',
  TOLL: 'toll',
  PARKING: 'parking',
  SALARY: 'salary',
  FINE: 'fine',
  OTHER: 'other',
});

const EXPENSE_STATUS = Object.freeze({
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  PAID: 'paid',
});

/**
 * Badge class mapping for statuses → CSS badge class
 */
const STATUS_BADGE_MAP = Object.freeze({
  active:          'badge-success',
  available:       'badge-success',
  completed:       'badge-success',
  approved:        'badge-success',
  paid:            'badge-success',
  on_trip:         'badge-info',
  in_progress:     'badge-info',
  scheduled:       'badge-info',
  in_maintenance:  'badge-warning',
  pending:         'badge-warning',
  off_duty:        'badge-neutral',
  on_leave:        'badge-neutral',
  out_of_service:  'badge-danger',
  overdue:         'badge-danger',
  suspended:       'badge-danger',
  rejected:        'badge-danger',
  retired:         'badge-neutral',
  inactive:        'badge-neutral',
  cancelled:       'badge-neutral',
});

/**
 * Formats a raw status string into a human-readable label.
 * e.g., "in_maintenance" → "In Maintenance"
 */
function formatStatusLabel(status) {
  if (!status) return '—';
  return status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Returns the badge HTML for a given status.
 */
function getStatusBadgeHTML(status) {
  const badgeClass = STATUS_BADGE_MAP[status] || 'badge-neutral';
  const label = formatStatusLabel(status);
  return `<span class="badge ${badgeClass}"><span class="badge-dot"></span>${label}</span>`;
}
