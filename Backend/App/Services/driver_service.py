from crud.driver import (
    create_driver,
    get_drivers,
)


def add_driver(db, driver_data):
    """
    Create a new driver.
    """
    return create_driver(db, driver_data)


def list_drivers(db):
    """
    Return all drivers.
    """
    return get_drivers(db)