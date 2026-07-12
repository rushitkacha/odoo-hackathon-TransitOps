from typing import Annotated

from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.session import get_db
from app.models.maintenance import Maintenance
from app.models.vehicle import Vehicle
from app.schemas.fleet import MaintenanceClose, MaintenanceCreate
from app.utils.helper import today_iso
from app.utils.query import paginate
from app.utils.records import conflict, get_or_404
from app.utils.serializers import maintenance_dict

router = APIRouter(
    prefix="/api/v1/maintenance",
    tags=["Maintenance"],
    dependencies=[Depends(get_current_user)],
)

DBSession = Annotated[Session, Depends(get_db)]


@router.get("")
@router.get("/")
def list_maintenance(request: Request, db: DBSession):
    rows = [maintenance_dict(m) for m in db.query(Maintenance).all()]
    return paginate(rows, dict(request.query_params))


@router.get("/{maintenance_id}")
def get_maintenance(maintenance_id: int, db: DBSession):
    return maintenance_dict(
        get_or_404(db, Maintenance, maintenance_id, "Maintenance record")
    )


@router.post("", status_code=status.HTTP_201_CREATED)
@router.post("/", status_code=status.HTTP_201_CREATED)
def create_maintenance(payload: MaintenanceCreate, db: DBSession):
    vehicle = get_or_404(db, Vehicle, payload.vehicle_id, "Vehicle")

    if vehicle.status == "On Trip":
        conflict("Vehicle is On Trip and cannot enter maintenance.")
    if vehicle.status == "Retired":
        conflict("Retired vehicles cannot enter maintenance.")

    active = (
        db.query(Maintenance)
        .filter(
            Maintenance.vehicle_id == vehicle.id, Maintenance.status == "Active"
        )
        .first()
    )
    if active:
        conflict("Vehicle already has active maintenance.")

    record = Maintenance(
        vehicle_id=vehicle.id,
        maintenance_type=payload.maintenance_type,
        description=payload.description,
        start_date=payload.start_date,
        cost=payload.cost or 0,
        status="Active",
        end_date=None,
    )
    db.add(record)
    vehicle.status = "In Shop"
    db.commit()
    db.refresh(record)
    return maintenance_dict(record)


@router.post("/{maintenance_id}/close")
def close_maintenance(maintenance_id: int, payload: MaintenanceClose, db: DBSession):
    record = get_or_404(db, Maintenance, maintenance_id, "Maintenance record")
    if record.status != "Active":
        conflict("Maintenance record is already closed.")

    record.status = "Closed"
    record.end_date = payload.end_date or today_iso()
    if payload.cost is not None:
        record.cost = payload.cost
    record.closing_notes = payload.closing_notes or None

    vehicle = get_or_404(db, Vehicle, record.vehicle_id, "Vehicle")
    if vehicle.status != "Retired":
        vehicle.status = "Available"

    db.commit()
    db.refresh(record)
    return maintenance_dict(record)
