from sqlalchemy.orm import Session

from models.report import Report
from schemas.report import ReportCreate


def create_report(db: Session, report: ReportCreate):
    new_report = Report(
        title=report.title,
        description=report.description,
        location=report.location
    )

    db.add(new_report)
    db.commit()
    db.refresh(new_report)

    return new_report


def get_reports(db: Session):
    return db.query(Report).all()