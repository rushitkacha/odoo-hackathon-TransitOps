from typing import Annotated

from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.session import get_db
from app.models.driver import Driver
from app.models.fuel_log import FuelLog
from app.models.trip import Trip
from app.models.vehicle import Vehicle
from app.schemas.fleet import TripComplete, TripCreate
from app.utils.helper import today_iso, utc_now
from app.utils.query import paginate
from app.utils.records import conflict, get_or_404, unprocessable
from app.utils.serializers import trip_dict

router = APIRouter(
    prefix="/api/v1/trips",
    tags=["Trips"],
    dependencies=[Depends(get_current_user)],
)

DBSession = Annotated[Session, Depends(get_db)]


@router.get("")
@router.get("/")
def list_trips(request: Request, db: DBSession):
    rows = [trip_dict(t) for t in db.query(Trip).all()]
    return paginate(rows, dict(request.query_params))


@router.get("/{trip_id}")
def get_trip(trip_id: int, db: DBSession):
    return trip_dict(get_or_404(db, Trip, trip_id, "Trip"))


@router.post("", status_code=status.HTTP_201_CREATED)
@router.post("/", status_code=status.HTTP_201_CREATED)
def create_trip(payload: TripCreate, db: DBSession):
    vehicle = get_or_404(db, Vehicle, payload.vehicle_id, "Vehicle")
    driver = get_or_404(db, Driver, payload.driver_id, "Driver")

    if vehicle.status != "Available":
        conflict(f"Vehicle is {vehicle.status} and cannot be selected.")
    if driver.status != "Available":
        conflict(f"Driver is {driver.status} and cannot be selected.")
    if (driver.license_expiry_date or "") < today_iso():
        conflict("Driver licence has expired.")
    if payload.cargo_weight_kg > vehicle.max_load_capacity_kg:
        unprocessable("Cargo weight exceeds vehicle maximum load capacity.")

    trip = Trip(**payload.model_dump(), status="Draft")
    db.add(trip)
    db.commit()
    db.refresh(trip)
    return trip_dict(trip)


@router.post("/{trip_id}/dispatch")
def dispatch_trip(trip_id: int, db: DBSession):
    trip = get_or_404(db, Trip, trip_id, "Trip")
    vehicle = get_or_404(db, Vehicle, trip.vehicle_id, "Vehicle")
    driver = get_or_404(db, Driver, trip.driver_id, "Driver")

    if trip.status != "Draft":
        conflict("Only Draft trips can be dispatched.")
    if vehicle.status != "Available":
        conflict(f"Vehicle is {vehicle.status}.")
    if driver.status != "Available":
        conflict(f"Driver is {driver.status}.")
    if (driver.license_expiry_date or "") < today_iso():
        conflict("Driver licence has expired.")
    if trip.cargo_weight_kg > vehicle.max_load_capacity_kg:
        unprocessable("Cargo exceeds vehicle capacity.")

    trip.status = "Dispatched"
    trip.dispatched_at = utc_now()
    vehicle.status = "On Trip"
    driver.status = "On Trip"
    db.commit()
    db.refresh(trip)
    return trip_dict(trip)


@router.post("/{trip_id}/complete")
def complete_trip(trip_id: int, payload: TripComplete, db: DBSession):
    trip = get_or_404(db, Trip, trip_id, "Trip")
    vehicle = get_or_404(db, Vehicle, trip.vehicle_id, "Vehicle")
    driver = get_or_404(db, Driver, trip.driver_id, "Driver")

    if trip.status != "Dispatched":
        conflict("Only Dispatched trips can be completed.")

    trip.status = "Completed"
    trip.completed_at = utc_now()
    trip.actual_distance_km = (
        payload.actual_distance_km
        if payload.actual_distance_km is not None
        else trip.planned_distance_km
    )
    if payload.revenue is not None:
        trip.revenue = payload.revenue

    vehicle.status = "Available"
    driver.status = "Available"

    if payload.final_odometer_km is not None:
        vehicle.odometer_km = max(vehicle.odometer_km, payload.final_odometer_km)

    if payload.fuel_consumed_liters and payload.fuel_consumed_liters > 0:
        db.add(
            FuelLog(
                vehicle_id=vehicle.id,
                trip_id=trip.id,
                liters=payload.fuel_consumed_liters,
                cost=payload.fuel_cost or 0,
                date=today_iso(),
                odometer_km=vehicle.odometer_km,
            )
        )

    db.commit()
    db.refresh(trip)
    return trip_dict(trip)


@router.post("/{trip_id}/cancel")
def cancel_trip(trip_id: int, db: DBSession):
    trip = get_or_404(db, Trip, trip_id, "Trip")
    vehicle = get_or_404(db, Vehicle, trip.vehicle_id, "Vehicle")
    driver = get_or_404(db, Driver, trip.driver_id, "Driver")

    if trip.status not in ("Draft", "Dispatched"):
        conflict("Only Draft or Dispatched trips can be cancelled.")

    if trip.status == "Dispatched":
        vehicle.status = "Available"
        driver.status = "Available"

    trip.status = "Cancelled"
    trip.cancelled_at = utc_now()
    db.commit()
    db.refresh(trip)
    return trip_dict(trip)
