from typing import Annotated

from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.session import get_db
from app.models.expense import Expense
from app.models.fuel_log import FuelLog
from app.models.maintenance import Maintenance
from app.models.trip import Trip
from app.models.vehicle import Vehicle
from app.utils.query import paginate
from app.utils.records import get_or_404

router = APIRouter(
    prefix="/api/v1/reports",
    tags=["Reports"],
    dependencies=[Depends(get_current_user)],
)

DBSession = Annotated[Session, Depends(get_db)]


def _report_rows(db: Session) -> list[dict]:
    rows = []
    vehicles = db.query(Vehicle).all()
    for v in vehicles:
        completed = [
            t
            for t in db.query(Trip).filter(Trip.vehicle_id == v.id).all()
            if t.status == "Completed"
        ]
        distance = sum(t.actual_distance_km or 0 for t in completed)
        revenue = sum(t.revenue or 0 for t in completed)

        fuel = db.query(FuelLog).filter(FuelLog.vehicle_id == v.id).all()
        liters = sum(f.liters or 0 for f in fuel)
        fuel_cost = sum(f.cost or 0 for f in fuel)

        maintenance_cost = sum(
            m.cost or 0
            for m in db.query(Maintenance).filter(Maintenance.vehicle_id == v.id).all()
        )
        other_expenses = sum(
            e.amount or 0
            for e in db.query(Expense).filter(Expense.vehicle_id == v.id).all()
        )
        operational_cost = fuel_cost + maintenance_cost

        rows.append(
            {
                "vehicle_id": v.id,
                "registration_number": v.registration_number,
                "name_model": v.name_model,
                "completed_trips": len(completed),
                "total_distance_km": distance,
                "total_fuel_liters": liters,
                "fuel_cost": fuel_cost,
                "maintenance_cost": maintenance_cost,
                "other_expenses": other_expenses,
                "operational_cost": operational_cost,
                "fuel_efficiency": round(distance / liters, 2) if liters else 0,
                "roi": round((revenue - operational_cost) / v.acquisition_cost * 100, 2)
                if v.acquisition_cost
                else 0,
            }
        )
    return rows


@router.get("/vehicles")
def vehicle_reports(request: Request, db: DBSession):
    return paginate(_report_rows(db), dict(request.query_params))


@router.get("/vehicles/{vehicle_id}")
def vehicle_report(vehicle_id: int, db: DBSession):
    get_or_404(db, Vehicle, vehicle_id, "Vehicle")
    rows = {r["vehicle_id"]: r for r in _report_rows(db)}
    return rows[vehicle_id]
