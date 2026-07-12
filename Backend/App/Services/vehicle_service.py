from crud.vehicle import (
    create_vehicle,
    get_vehicles,
)


def add_vehicle(db, vehicle_data):
    """
    Create a new vehicle.
    """
    return create_vehicle(db, vehicle_data)


def list_vehicles(db):
    """
    Return all vehicles.
    """
    return get_vehicles(db)