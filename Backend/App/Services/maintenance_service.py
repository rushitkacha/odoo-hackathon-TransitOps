from crud.maintenance import (
    create_maintenance,
    get_maintenance_logs,
)


def add_maintenance(db, maintenance_data):
    """
    Create a maintenance record.
    """
    return create_maintenance(db, maintenance_data)


def list_maintenance(db):
    """
    Return all maintenance records.
    """
    return get_maintenance_logs(db)