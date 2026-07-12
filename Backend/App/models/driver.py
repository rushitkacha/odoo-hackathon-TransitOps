from sqlalchemy import Column, Integer, String, Date, Enum, Float

from app.database import Base
from app.constants.enums import DriverStatus


class Driver(Base):

    __tablename__ = "drivers"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(
        String,
        nullable=False
    )

    license_number = Column(
        String,
        unique=True,
        nullable=False
    )

    license_category = Column(
        String,
        nullable=False
    )

    license_expiry = Column(
        Date,
        nullable=False
    )

    contact_number = Column(
        String,
        nullable=False
    )

    safety_score = Column(
        Float,
        default=100
    )

    status = Column(
        Enum(DriverStatus),
        default=DriverStatus.AVAILABLE,
        nullable=False
    )