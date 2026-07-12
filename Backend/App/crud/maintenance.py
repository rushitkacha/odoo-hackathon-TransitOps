from sqlalchemy.orm import Session

from app.models.maintenance import Maintenance


def create_maintenance(db: Session, maintenance_data):
    maintenance = Maintenance(
        vehicle_id=maintenance_data.vehicle_id,
        maintenance_type=maintenance_data.maintenance_type,
        description=maintenance_data.description,
        start_date=maintenance_data.start_date,
        end_date=maintenance_data.end_date,
        cost=maintenance_data.cost,
        status=maintenance_data.status
    )

    db.add(maintenance)
    db.commit()
    db.refresh(maintenance)

    return maintenance


def get_maintenance_logs(db: Session):
    return db.query(Maintenance).all()


def get_maintenance_by_id(db: Session, maintenance_id: int):
    return db.query(Maintenance).filter(
        Maintenance.id == maintenance_id
    ).first()