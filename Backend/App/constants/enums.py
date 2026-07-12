from enum import Enum


class VehicleStatus(str, Enum):
    AVAILABLE = "Available"
    ON_TRIP = "On Trip"
    IN_SHOP = "In Shop"
    RETIRED = "Retired"


class DriverStatus(str, Enum):
    AVAILABLE = "Available"
    ON_TRIP = "On Trip"
    OFF_DUTY = "Off Duty"
    SUSPENDED = "Suspended"


class MaintenanceStatus(str, Enum):
    ACTIVE = "Active"
    CLOSED = "Closed"


class ExpenseType(str, Enum):
    TOLL = "Toll"
    PARKING = "Parking"
    REPAIR = "Repair"
    OTHER = "Other"
    OTHER = "Other"