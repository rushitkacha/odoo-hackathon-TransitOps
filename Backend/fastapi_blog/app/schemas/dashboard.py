from pydantic import BaseModel, ConfigDict


class DashboardStats(BaseModel):

    active_vehicles: int

    available_vehicles: int

    vehicles_in_maintenance: int

    retired_vehicles: int

    active_trips: int

    pending_trips: int

    completed_trips: int

    cancelled_trips: int

    available_drivers: int

    drivers_on_trip: int

    suspended_drivers: int

    fleet_utilization: float

    total_fuel_cost: float

    total_maintenance_cost: float

    total_operational_cost: float

    model_config = ConfigDict(
        from_attributes=True,
    )
