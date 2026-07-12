from sqlalchemy.orm import Session

from app.models.expense import Expense


def create_expense(db: Session, expense_data):
    expense = Expense(
        vehicle_id=expense_data.vehicle_id,
        trip_id=expense_data.trip_id,
        expense_type=expense_data.expense_type,
        amount=expense_data.amount,
        description=expense_data.description,
        expense_date=expense_data.expense_date
    )

    db.add(expense)
    db.commit()
    db.refresh(expense)

    return expense


def get_expenses(db: Session):
    return db.query(Expense).all()


def get_expense_by_id(db: Session, expense_id: int):
    return db.query(Expense).filter(
        Expense.id == expense_id
    ).first()