from typing import Annotated

from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.session import get_db
from app.models.fuel_log import FuelLog
from app.models.trip import Trip
from app.models.vehicle import Vehicle
from app.schemas.fleet import FuelCreate, FuelUpdate
from app.utils.query import paginate
from app.utils.records import get_or_404, unprocessable
from app.utils.serializers import fuel_dict

router = APIRouter(
    prefix="/api/v1/fuel-logs",
    tags=["Fuel Logs"],
    dependencies=[Depends(get_current_user)],
)

DBSession = Annotated[Session, Depends(get_db)]


@router.get("")
@router.get("/")
def list_fuel(request: Request, db: DBSession):
    rows = [fuel_dict(f) for f in db.query(FuelLog).all()]
    return paginate(rows, dict(request.query_params))


@router.get("/{fuel_id}")
def get_fuel(fuel_id: int, db: DBSession):
    return fuel_dict(get_or_404(db, FuelLog, fuel_id, "Fuel log"))


@router.post("", status_code=status.HTTP_201_CREATED)
@router.post("/", status_code=status.HTTP_201_CREATED)
def create_fuel(payload: FuelCreate, db: DBSession):
    vehicle = get_or_404(db, Vehicle, payload.vehicle_id, "Vehicle")
    if payload.liters <= 0:
        unprocessable("Fuel litres must be greater than zero.")
    if payload.trip_id:
        trip = get_or_404(db, Trip, payload.trip_id, "Trip")
        if trip.vehicle_id != vehicle.id:
            unprocessable("Selected trip does not belong to selected vehicle.")

    odometer = payload.odometer_km or 0
    if odometer and odometer < vehicle.odometer_km:
        unprocessable("Odometer cannot move backwards.")

    record = FuelLog(
        vehicle_id=vehicle.id,
        trip_id=payload.trip_id,
        liters=payload.liters,
        cost=payload.cost or 0,
        date=payload.date,
        odometer_km=odometer,
    )
    if odometer:
        vehicle.odometer_km = odometer
    db.add(record)
    db.commit()
    db.refresh(record)
    return fuel_dict(record)


@router.patch("/{fuel_id}")
def update_fuel(fuel_id: int, payload: FuelUpdate, db: DBSession):
    record = get_or_404(db, FuelLog, fuel_id, "Fuel log")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(record, key, value)
    db.commit()
    db.refresh(record)
    return fuel_dict(record)


@router.delete("/{fuel_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_fuel(fuel_id: int, db: DBSession):
    record = get_or_404(db, FuelLog, fuel_id, "Fuel log")
    db.delete(record)
    db.commit()
    return None
