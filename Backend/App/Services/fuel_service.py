from crud.fuel import (
    create_fuel_log,
    get_fuel_logs,
)


def add_fuel_log(db, fuel_data):
    """
    Create a fuel log.
    """
    return create_fuel_log(db, fuel_data)


def list_fuel_logs(db):
    """
    Return all fuel logs.
    """
    return get_fuel_logs(db)