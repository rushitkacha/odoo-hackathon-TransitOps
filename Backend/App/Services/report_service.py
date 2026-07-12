from crud.expense import get_expenses
from crud.fuel import get_fuel_logs
from crud.maintenance import get_maintenance_logs
from crud.vehicle import get_vehicles
from crud.driver import get_drivers


def generate_report(db):
    """
    Return a simple summary report.
    """
    return {
        "total_vehicles": len(get_vehicles(db)),
        "total_drivers": len(get_drivers(db)),
        "total_maintenance": len(get_maintenance_logs(db)),
        "total_fuel_logs": len(get_fuel_logs(db)),
        "total_expenses": len(get_expenses(db)),
    }