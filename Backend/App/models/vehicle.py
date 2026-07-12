from sqlalchemy import Column, Integer, String, Float, Enum

from app.database import Base
from app.constants.enums import VehicleStatus


class Vehicle(Base):

    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)

    registration_number = Column(
        String,
        unique=True,
        nullable=False,
        index=True
    )

    model = Column(
        String,
        nullable=False
    )

    vehicle_type = Column(
        String,
        nullable=False
    )

    max_load_capacity = Column(
        Float,
        nullable=False
    )

    odometer = Column(
        Float,
        default=0
    )

    acquisition_cost = Column(
        Float,
        default=0
    )

    region = Column(
        String,
        nullable=True
    )

    status = Column(
        Enum(VehicleStatus),
        default=VehicleStatus.AVAILABLE,
        nullable=False
    )