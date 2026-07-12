from typing import Annotated

from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.session import get_db
from app.models.driver import Driver
from app.schemas.fleet import DriverCreate, DriverUpdate
from app.utils.helper import today_iso
from app.utils.query import paginate
from app.utils.records import conflict, get_or_404, unprocessable
from app.utils.serializers import driver_dict

router = APIRouter(
    prefix="/api/v1/drivers",
    tags=["Drivers"],
    dependencies=[Depends(get_current_user)],
)

DBSession = Annotated[Session, Depends(get_db)]


def _is_eligible(driver: Driver) -> bool:
    return driver.status == "Available" and (
        driver.license_expiry_date or ""
    ) >= today_iso()


@router.get("/available")
def available_drivers(db: DBSession):
    rows = db.query(Driver).all()
    return [driver_dict(d) for d in rows if _is_eligible(d)]


@router.get("")
@router.get("/")
def list_drivers(request: Request, db: DBSession):
    rows = [driver_dict(d) for d in db.query(Driver).all()]
    return paginate(rows, dict(request.query_params))


@router.get("/{driver_id}/eligibility")
def driver_eligibility(driver_id: int, db: DBSession):
    d = get_or_404(db, Driver, driver_id, "Driver")
    eligible = _is_eligible(d)
    if eligible:
        reason = None
    elif (d.license_expiry_date or "") < today_iso():
        reason = "Driver licence expired"
    else:
        reason = f"Driver status is {d.status}"
    return {"driver_id": d.id, "eligible": eligible, "reason": reason}


@router.get("/{driver_id}")
def get_driver(driver_id: int, db: DBSession):
    return driver_dict(get_or_404(db, Driver, driver_id, "Driver"))


@router.post("", status_code=status.HTTP_201_CREATED)
@router.post("/", status_code=status.HTTP_201_CREATED)
def create_driver(payload: DriverCreate, db: DBSession):
    exists = (
        db.query(Driver)
        .filter(Driver.license_number.ilike(payload.license_number))
        .first()
    )
    if exists:
        conflict("Driver licence number already exists.")
    if payload.safety_score < 0 or payload.safety_score > 100:
        unprocessable("Safety score must be between 0 and 100.")

    data = payload.model_dump()
    data["status"] = data.get("status") or "Available"
    driver = Driver(**data)
    db.add(driver)
    db.commit()
    db.refresh(driver)
    return driver_dict(driver)


@router.patch("/{driver_id}")
def update_driver(driver_id: int, payload: DriverUpdate, db: DBSession):
    driver = get_or_404(db, Driver, driver_id, "Driver")
    data = payload.model_dump(exclude_unset=True)

    new_license = data.get("license_number")
    if new_license:
        clash = (
            db.query(Driver)
            .filter(Driver.id != driver.id, Driver.license_number.ilike(new_license))
            .first()
        )
        if clash:
            conflict("Driver licence number already exists.")
    if "safety_score" in data and data["safety_score"] is not None:
        if data["safety_score"] < 0 or data["safety_score"] > 100:
            unprocessable("Safety score must be between 0 and 100.")

    for key, value in data.items():
        setattr(driver, key, value)
    db.commit()
    db.refresh(driver)
    return driver_dict(driver)


@router.delete("/{driver_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_driver(driver_id: int, db: DBSession):
    driver = get_or_404(db, Driver, driver_id, "Driver")
    if driver.status == "On Trip":
        conflict("Driver is On Trip and cannot be deleted.")
    db.delete(driver)
    db.commit()
    return None
