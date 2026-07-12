from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.session import Base
from app.utils.helper import utc_now


class FuelLog(Base):

    __tablename__ = "fuel_logs"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    vehicle_id: Mapped[int] = mapped_column(ForeignKey("vehicles.id"), nullable=False)
    trip_id: Mapped[int] = mapped_column(ForeignKey("trips.id"), nullable=True)

    liters: Mapped[float] = mapped_column(Float, default=0)
    cost: Mapped[float] = mapped_column(Float, default=0)
    # ISO date string (YYYY-MM-DD)
    date: Mapped[str] = mapped_column(String(10), nullable=True)
    odometer_km: Mapped[float] = mapped_column(Float, default=0)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=utc_now, onupdate=utc_now
    )

    vehicle = relationship("Vehicle", back_populates="fuel_logs")
    trip = relationship("Trip")

    def __repr__(self) -> str:
        return f"<FuelLog(vehicle_id={self.vehicle_id}, liters={self.liters})>"
