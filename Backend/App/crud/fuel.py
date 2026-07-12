from sqlalchemy.orm import Session

from app.models.fuel_log import FuelLog


def create_fuel_log(db: Session, fuel_data):
    fuel = FuelLog(
        vehicle_id=fuel_data.vehicle_id,
        trip_id=fuel_data.trip_id,
        liters=fuel_data.liters,
        cost=fuel_data.cost,
        odometer=fuel_data.odometer,
        date=fuel_data.date
    )

    db.add(fuel)
    db.commit()
    db.refresh(fuel)

    return fuel


def get_fuel_logs(db: Session):
    return db.query(FuelLog).all()


def get_fuel_log_by_id(db: Session, fuel_id: int):
    return db.query(FuelLog).filter(
        FuelLog.id == fuel_id
    ).first()