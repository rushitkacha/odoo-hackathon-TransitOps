from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.session import get_db
from app.models.driver import Driver
from app.models.maintenance import Maintenance
from app.models.trip import Trip
from app.models.vehicle import Vehicle
from app.utils.helper import today_iso
from app.utils.serializers import driver_dict, maintenance_dict, trip_dict

router = APIRouter(
    prefix="/api/v1/dashboard",
    tags=["Dashboard"],
    dependencies=[Depends(get_current_user)],
)

DBSession = Annotated[Session, Depends(get_db)]


@router.get("")
@router.get("/")
def dashboard(request: Request, db: DBSession):
    params = dict(request.query_params)

    vehicles = db.query(Vehicle).all()
    if params.get("vehicle_type"):
        vehicles = [v for v in vehicles if v.vehicle_type == params["vehicle_type"]]
    if params.get("region"):
        vehicles = [v for v in vehicles if v.region == params["region"]]
    if params.get("status"):
        vehicles = [v for v in vehicles if v.status == params["status"]]

    vehicle_ids = {v.id for v in vehicles}
    trips = db.query(Trip).all()
    drivers = db.query(Driver).all()
    maintenance = db.query(Maintenance).all()

    active_trips = [
        t for t in trips if t.status == "Dispatched" and t.vehicle_id in vehicle_ids
    ]
    pending_trips = [
        t for t in trips if t.status == "Draft" and t.vehicle_id in vehicle_ids
    ]

    fuel_cost = sum(
        f.cost or 0
        for v in vehicles
        for f in v.fuel_logs
    )
    maintenance_cost = sum(
        m.cost or 0 for m in maintenance if m.vehicle_id in vehicle_ids
    )

    on_trip = [v for v in vehicles if v.status == "On Trip"]
    today = today_iso()

    recent = sorted(
        trips, key=lambda t: (t.created_at or ""), reverse=True
    )[:5]

    expiring = []
    for d in drivers:
        if not d.license_expiry_date:
            continue
        try:
            days = (date.fromisoformat(d.license_expiry_date) - date.today()).days
        except ValueError:
            continue
        if 0 <= days <= 60:
            expiring.append(driver_dict(d))

    return {
        "total_vehicles": len(vehicles),
        "available_vehicles": len([v for v in vehicles if v.status == "Available"]),
        "vehicles_on_trip": len(on_trip),
        "vehicles_in_shop": len([v for v in vehicles if v.status == "In Shop"]),
        "active_trips": len(active_trips),
        "pending_trips": len(pending_trips),
        "available_drivers": len(
            [
                d
                for d in drivers
                if d.status == "Available" and (d.license_expiry_date or "") >= today
            ]
        ),
        "fleet_utilization": round(len(on_trip) / len(vehicles) * 100)
        if vehicles
        else 0,
        "operational_cost": fuel_cost + maintenance_cost,
        "recent_trips": [trip_dict(t) for t in recent],
        "maintenance_alerts": [
            maintenance_dict(m) for m in maintenance if m.status == "Active"
        ],
        "expiring_licenses": expiring,
    }
