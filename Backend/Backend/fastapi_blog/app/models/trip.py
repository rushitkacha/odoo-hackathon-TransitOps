from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.session import Base
from app.utils.helper import utc_now


class Trip(Base):

    __tablename__ = "trips"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    source: Mapped[str] = mapped_column(String(120), nullable=False)
    destination: Mapped[str] = mapped_column(String(120), nullable=False)

    vehicle_id: Mapped[int] = mapped_column(ForeignKey("vehicles.id"), nullable=False)
    driver_id: Mapped[int] = mapped_column(ForeignKey("drivers.id"), nullable=False)

    cargo_weight_kg: Mapped[float] = mapped_column(Float, default=0)
    planned_distance_km: Mapped[float] = mapped_column(Float, default=0)
    actual_distance_km: Mapped[float] = mapped_column(Float, nullable=True)
    revenue: Mapped[float] = mapped_column(Float, default=0)

    # Draft | Dispatched | Completed | Cancelled
    status: Mapped[str] = mapped_column(String(20), default="Draft")

    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now)
    dispatched_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    completed_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    cancelled_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)

    vehicle = relationship("Vehicle", back_populates="trips")
    driver = relationship("Driver", back_populates="trips")

    def __repr__(self) -> str:
        return f"<Trip({self.source}->{self.destination})>"
