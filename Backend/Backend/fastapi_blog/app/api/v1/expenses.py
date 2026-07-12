from typing import Annotated

from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.session import get_db
from app.models.expense import Expense
from app.models.trip import Trip
from app.models.vehicle import Vehicle
from app.schemas.fleet import ExpenseCreate, ExpenseUpdate
from app.utils.query import paginate
from app.utils.records import get_or_404, unprocessable
from app.utils.serializers import expense_dict

router = APIRouter(
    prefix="/api/v1/expenses",
    tags=["Expenses"],
    dependencies=[Depends(get_current_user)],
)

DBSession = Annotated[Session, Depends(get_db)]


@router.get("")
@router.get("/")
def list_expenses(request: Request, db: DBSession):
    rows = [expense_dict(e) for e in db.query(Expense).all()]
    return paginate(rows, dict(request.query_params))


@router.get("/{expense_id}")
def get_expense(expense_id: int, db: DBSession):
    return expense_dict(get_or_404(db, Expense, expense_id, "Expense"))


@router.post("", status_code=status.HTTP_201_CREATED)
@router.post("/", status_code=status.HTTP_201_CREATED)
def create_expense(payload: ExpenseCreate, db: DBSession):
    vehicle = get_or_404(db, Vehicle, payload.vehicle_id, "Vehicle")
    if payload.amount < 0:
        unprocessable("Expense amount cannot be negative.")
    if payload.trip_id:
        trip = get_or_404(db, Trip, payload.trip_id, "Trip")
        if trip.vehicle_id != vehicle.id:
            unprocessable("Selected trip does not belong to selected vehicle.")

    record = Expense(
        vehicle_id=vehicle.id,
        trip_id=payload.trip_id,
        expense_type=payload.expense_type,
        amount=payload.amount,
        expense_date=payload.expense_date,
        description=payload.description,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return expense_dict(record)


@router.patch("/{expense_id}")
def update_expense(expense_id: int, payload: ExpenseUpdate, db: DBSession):
    record = get_or_404(db, Expense, expense_id, "Expense")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(record, key, value)
    db.commit()
    db.refresh(record)
    return expense_dict(record)


@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(expense_id: int, db: DBSession):
    record = get_or_404(db, Expense, expense_id, "Expense")
    db.delete(record)
    db.commit()
    return None
