from datetime import datetime

from sqlalchemy import DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.session import Base
from app.utils.helper import utc_now


class Driver(Base):

    __tablename__ = "drivers"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    name: Mapped[str] = mapped_column(String(120), nullable=False)
    license_number: Mapped[str] = mapped_column(
        String(60), unique=True, index=True, nullable=False
    )
    license_category: Mapped[str] = mapped_column(String(60), nullable=True)
    # Stored as ISO date string (YYYY-MM-DD) to match the frontend contract.
    license_expiry_date: Mapped[str] = mapped_column(String(10), nullable=True)
    contact_number: Mapped[str] = mapped_column(String(30), nullable=True)
    safety_score: Mapped[int] = mapped_column(Integer, default=0)

    # Available | On Trip | Off Duty | Suspended
    status: Mapped[str] = mapped_column(String(20), default="Available")

    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=utc_now, onupdate=utc_now
    )

    trips = relationship("Trip", back_populates="driver")

    def __repr__(self) -> str:
        return f"<Driver(name={self.name})>"
