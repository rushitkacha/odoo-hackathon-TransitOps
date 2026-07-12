from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime

from database import Base


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    description = Column(String(500), nullable=False)
    report_type = Column(String(50), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)