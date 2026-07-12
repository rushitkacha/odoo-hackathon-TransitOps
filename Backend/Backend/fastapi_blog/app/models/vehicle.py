from datetime import datetime

from sqlalchemy import DateTime, Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.session import Base
from app.utils.helper import utc_now


class Vehicle(Base):

    __tablename__ = "vehicles"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    registration_number: Mapped[str] = mapped_column(
        String(50), unique=True, index=True, nullable=False
    )
    name_model: Mapped[str] = mapped_column(String(120), nullable=False)
    vehicle_type: Mapped[str] = mapped_column(String(60), nullable=False)
    max_load_capacity_kg: Mapped[float] = mapped_column(Float, default=0)
    odometer_km: Mapped[float] = mapped_column(Float, default=0)
    acquisition_cost: Mapped[float] = mapped_column(Float, default=0)
    region: Mapped[str] = mapped_column(String(80), nullable=True)

    # Available | On Trip | In Shop | Retired
    status: Mapped[str] = mapped_column(String(20), default="Available")

    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=utc_now, onupdate=utc_now
    )

    trips = relationship("Trip", back_populates="vehicle")
    maintenance_records = relationship("Maintenance", back_populates="vehicle")
    fuel_logs = relationship("FuelLog", back_populates="vehicle")
    expenses = relationship("Expense", back_populates="vehicle")

    def __repr__(self) -> str:
        return f"<Vehicle(reg={self.registration_number})>"
