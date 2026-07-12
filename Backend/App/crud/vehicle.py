from sqlalchemy.orm import Session

from app.models.vehicle import Vehicle

 
def create_vehicle(db: Session, vehicle_data):
    vehicle = Vehicle(
        registration_number=vehicle_data.registration_number,
        model=vehicle_data.model,
        vehicle_type=vehicle_data.vehicle_type,
        max_load_capacity=vehicle_data.max_load_capacity,
        odometer=vehicle_data.odometer,
        acquisition_cost=vehicle_data.acquisition_cost,
        region=vehicle_data.region,
        status=vehicle_data.status
    )

    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)

    return vehicle


def get_vehicles(db: Session):
    return db.query(Vehicle).all()


def get_vehicle_by_id(db: Session, vehicle_id: int):
    return db.query(Vehicle).filter(
        Vehicle.id == vehicle_id
    ).first()