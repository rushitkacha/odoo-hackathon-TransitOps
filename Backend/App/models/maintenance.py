from sqlalchemy import (
    Column,
    Integer,
    Float,
    String,
    Date,
    Enum,
    ForeignKey
)

from app.database import Base
from app.constants.enums import MaintenanceStatus


class Maintenance(Base):

    __tablename__ = "maintenance"

    id = Column(Integer, primary_key=True, index=True)

    vehicle_id = Column(
        Integer,
        ForeignKey("vehicles.id")
    )

    maintenance_type = Column(
        String,
        nullable=False
    )

    description = Column(
        String
    )

    start_date = Column(
        Date,
        nullable=False
    )

    end_date = Column(
        Date,
        nullable=True
    )

    cost = Column(
        Float,
        default=0
    )

    status = Column(
        Enum(MaintenanceStatus),
        default=MaintenanceStatus.ACTIVE
    )