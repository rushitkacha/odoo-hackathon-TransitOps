from sqlalchemy import (
    Column,
    Integer,
    Float,
    Date,
    ForeignKey
)

from app.database import Base


class FuelLog(Base):

    __tablename__ = "fuel_logs"

    id = Column(Integer, primary_key=True)

    vehicle_id = Column(
        Integer,
        ForeignKey("vehicles.id")
    )

    trip_id = Column(
        Integer,
        nullable=True
    )

    liters = Column(
        Float,
        nullable=False
    )

    cost = Column(
        Float,
        nullable=False
    )

    odometer = Column(
        Float,
        nullable=False
    )

    date = Column(
        Date,
        nullable=False
    )