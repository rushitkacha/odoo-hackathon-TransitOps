"""Request schemas for fleet resources. Response shapes are produced by
app.utils.serializers to exactly match the frontend contract."""
from pydantic import BaseModel, ConfigDict, Field


class _Base(BaseModel):
    model_config = ConfigDict(extra="ignore")


# ----------------------------- Vehicles -----------------------------
class VehicleCreate(_Base):
    registration_number: str = Field(min_length=1)
    name_model: str = Field(min_length=1)
    vehicle_type: str = Field(min_length=1)
    max_load_capacity_kg: float = 0
    odometer_km: float = 0
    acquisition_cost: float = 0
    region: str | None = None


class VehicleUpdate(_Base):
    registration_number: str | None = None
    name_model: str | None = None
    vehicle_type: str | None = None
    max_load_capacity_kg: float | None = None
    odometer_km: float | None = None
    acquisition_cost: float | None = None
    region: str | None = None
    status: str | None = None


# ----------------------------- Drivers ------------------------------
class DriverCreate(_Base):
    name: str = Field(min_length=1)
    license_number: str = Field(min_length=1)
    license_category: str | None = None
    license_expiry_date: str | None = None
    contact_number: str | None = None
    safety_score: int = 0
    status: str | None = "Available"


class DriverUpdate(_Base):
    name: str | None = None
    license_number: str | None = None
    license_category: str | None = None
    license_expiry_date: str | None = None
    contact_number: str | None = None
    safety_score: int | None = None
    status: str | None = None


# ------------------------------ Trips -------------------------------
class TripCreate(_Base):
    source: str = Field(min_length=1)
    destination: str = Field(min_length=1)
    vehicle_id: int
    driver_id: int
    cargo_weight_kg: float = 0
    planned_distance_km: float = 0
    revenue: float = 0


class TripComplete(_Base):
    final_odometer_km: float | None = None
    actual_distance_km: float | None = None
    fuel_consumed_liters: float | None = 0
    fuel_cost: float | None = 0
    revenue: float | None = None


# --------------------------- Maintenance ----------------------------
class MaintenanceCreate(_Base):
    vehicle_id: int
    maintenance_type: str = Field(min_length=1)
    description: str | None = None
    start_date: str | None = None
    cost: float = 0


class MaintenanceClose(_Base):
    end_date: str | None = None
    cost: float | None = None
    closing_notes: str | None = None


# ----------------------------- Fuel ---------------------------------
class FuelCreate(_Base):
    vehicle_id: int
    trip_id: int | None = None
    liters: float
    cost: float = 0
    date: str | None = None
    odometer_km: float = 0


class FuelUpdate(_Base):
    vehicle_id: int | None = None
    trip_id: int | None = None
    liters: float | None = None
    cost: float | None = None
    date: str | None = None
    odometer_km: float | None = None


# ---------------------------- Expenses ------------------------------
class ExpenseCreate(_Base):
    vehicle_id: int
    trip_id: int | None = None
    expense_type: str = Field(min_length=1)
    amount: float
    expense_date: str | None = None
    description: str | None = None


class ExpenseUpdate(_Base):
    vehicle_id: int | None = None
    trip_id: int | None = None
    expense_type: str | None = None
    amount: float | None = None
    expense_date: str | None = None
    description: str | None = None


# ------------------------------ Users -------------------------------
class UserUpdate(_Base):
    role: str | None = None
    status: str | None = None
