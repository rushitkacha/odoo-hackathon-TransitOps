from typing import Annotated

from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.session import get_db
from app.models.vehicle import Vehicle
from app.schemas.fleet import VehicleCreate, VehicleUpdate
from app.utils.query import paginate
from app.utils.records import conflict, get_or_404, unprocessable
from app.utils.serializers import vehicle_dict

router = APIRouter(
    prefix="/api/v1/vehicles",
    tags=["Vehicles"],
    dependencies=[Depends(get_current_user)],
)

DBSession = Annotated[Session, Depends(get_db)]


@router.get("/available")
def available_vehicles(db: DBSession):
    rows = db.query(Vehicle).filter(Vehicle.status == "Available").all()
    return [vehicle_dict(v) for v in rows]


@router.get("")
@router.get("/")
def list_vehicles(request: Request, db: DBSession):
    rows = [vehicle_dict(v) for v in db.query(Vehicle).all()]
    return paginate(rows, dict(request.query_params))


@router.get("/{vehicle_id}")
def get_vehicle(vehicle_id: int, db: DBSession):
    return vehicle_dict(get_or_404(db, Vehicle, vehicle_id, "Vehicle"))


@router.post("", status_code=status.HTTP_201_CREATED)
@router.post("/", status_code=status.HTTP_201_CREATED)
def create_vehicle(payload: VehicleCreate, db: DBSession):
    exists = (
        db.query(Vehicle)
        .filter(Vehicle.registration_number.ilike(payload.registration_number))
        .first()
    )
    if exists:
        conflict("Vehicle registration number already exists.")
    if payload.max_load_capacity_kg <= 0:
        unprocessable("Maximum load capacity must be greater than zero.")

    vehicle = Vehicle(**payload.model_dump(), status="Available")
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return vehicle_dict(vehicle)


@router.patch("/{vehicle_id}")
def update_vehicle(vehicle_id: int, payload: VehicleUpdate, db: DBSession):
    vehicle = get_or_404(db, Vehicle, vehicle_id, "Vehicle")
    data = payload.model_dump(exclude_unset=True)

    new_reg = data.get("registration_number")
    if new_reg:
        clash = (
            db.query(Vehicle)
            .filter(Vehicle.id != vehicle.id, Vehicle.registration_number.ilike(new_reg))
            .first()
        )
        if clash:
            conflict("Vehicle registration number already exists.")

    for key, value in data.items():
        setattr(vehicle, key, value)
    db.commit()
    db.refresh(vehicle)
    return vehicle_dict(vehicle)


@router.delete("/{vehicle_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vehicle(vehicle_id: int, db: DBSession):
    vehicle = get_or_404(db, Vehicle, vehicle_id, "Vehicle")
    if vehicle.status in ("On Trip", "In Shop"):
        conflict(f"Vehicle is {vehicle.status} and cannot be deleted.")
    db.delete(vehicle)
    db.commit()
    return None
