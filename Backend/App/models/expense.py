from sqlalchemy import (
    Column,
    Integer,
    Float,
    String,
    Date,
    ForeignKey,
    Enum
)

from app.database import Base
from app.constants.enums import ExpenseType


class Expense(Base):

    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True)

    vehicle_id = Column(
        Integer,
        ForeignKey("vehicles.id")
    )

    trip_id = Column(
        Integer,
        nullable=True
    )

    expense_type = Column(
        Enum(ExpenseType),
        nullable=False
    )

    amount = Column(
        Float,
        nullable=False
    )

    description = Column(
        String
    )

    expense_date = Column(
        Date,
        nullable=False
    )
    