from sqlalchemy.orm import Session

from app.models.driver import Driver


def create_driver(db: Session, driver_data):
    driver = Driver(
        name=driver_data.name,
        license_number=driver_data.license_number,
        license_category=driver_data.license_category,
        license_expiry=driver_data.license_expiry,
        contact_number=driver_data.contact_number,
        safety_score=driver_data.safety_score,
        status=driver_data.status
    )

    db.add(driver)
    db.commit()
    db.refresh(driver)

    return driver


def get_drivers(db: Session):
    return db.query(Driver).all()


def get_driver_by_id(db: Session, driver_id: int):
    return db.query(Driver).filter(
        Driver.id == driver_id
    ).first()