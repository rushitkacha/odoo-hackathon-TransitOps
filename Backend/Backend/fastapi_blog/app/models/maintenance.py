from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.session import Base
from app.utils.helper import utc_now


class Maintenance(Base):

    __tablename__ = "maintenance"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    vehicle_id: Mapped[int] = mapped_column(ForeignKey("vehicles.id"), nullable=False)
    maintenance_type: Mapped[str] = mapped_column(String(80), nullable=False)
    description: Mapped[str] = mapped_column(String(255), nullable=True)

    # ISO date strings (YYYY-MM-DD) to match the frontend contract.
    start_date: Mapped[str] = mapped_column(String(10), nullable=True)
    end_date: Mapped[str] = mapped_column(String(10), nullable=True)

    cost: Mapped[float] = mapped_column(Float, default=0)

    # Active | Closed
    status: Mapped[str] = mapped_column(String(20), default="Active")
    closing_notes: Mapped[str] = mapped_column(String(255), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=utc_now, onupdate=utc_now
    )

    vehicle = relationship("Vehicle", back_populates="maintenance_records")

    def __repr__(self) -> str:
        return f"<Maintenance(vehicle_id={self.vehicle_id}, {self.status})>"
