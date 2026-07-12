"""
Model -> dict serializers producing the exact shapes the TransitOps
frontend expects (raw objects, ISO timestamps, and joined display names).
"""
from datetime import datetime


def _iso(value):
    if isinstance(value, datetime):
        return value.isoformat()
    return value


def vehicle_dict(v) -> dict:
    if v is None:
        return None
    return {
        "id": v.id,
        "registration_number": v.registration_number,
        "name_model": v.name_model,
        "vehicle_type": v.vehicle_type,
        "max_load_capacity_kg": v.max_load_capacity_kg,
        "odometer_km": v.odometer_km,
        "acquisition_cost": v.acquisition_cost,
        "region": v.region,
        "status": v.status,
        "created_at": _iso(v.created_at),
        "updated_at": _iso(v.updated_at),
    }


def driver_dict(d) -> dict:
    if d is None:
        return None
    return {
        "id": d.id,
        "name": d.name,
        "license_number": d.license_number,
        "license_category": d.license_category,
        "license_expiry_date": d.license_expiry_date,
        "contact_number": d.contact_number,
        "safety_score": d.safety_score,
        "status": d.status,
        "created_at": _iso(d.created_at),
        "updated_at": _iso(d.updated_at),
    }


def trip_dict(t, with_names: bool = True) -> dict:
    if t is None:
        return None
    data = {
        "id": t.id,
        "source": t.source,
        "destination": t.destination,
        "vehicle_id": t.vehicle_id,
        "driver_id": t.driver_id,
        "cargo_weight_kg": t.cargo_weight_kg,
        "planned_distance_km": t.planned_distance_km,
        "actual_distance_km": t.actual_distance_km,
        "revenue": t.revenue,
        "status": t.status,
        "created_at": _iso(t.created_at),
        "dispatched_at": _iso(t.dispatched_at),
        "completed_at": _iso(t.completed_at),
        "cancelled_at": _iso(t.cancelled_at),
    }
    if with_names:
        v = t.vehicle
        d = t.driver
        data["vehicle"] = vehicle_dict(v)
        data["vehicle_name"] = v.name_model if v else ""
        data["vehicle_reg"] = v.registration_number if v else ""
        data["driver"] = driver_dict(d)
        data["driver_name"] = d.name if d else ""
    return data


def maintenance_dict(m, with_names: bool = True) -> dict:
    if m is None:
        return None
    data = {
        "id": m.id,
        "vehicle_id": m.vehicle_id,
        "maintenance_type": m.maintenance_type,
        "description": m.description,
        "start_date": m.start_date,
        "end_date": m.end_date,
        "cost": m.cost,
        "status": m.status,
        "closing_notes": m.closing_notes,
        "created_at": _iso(m.created_at),
    }
    if with_names:
        v = m.vehicle
        data["vehicle"] = vehicle_dict(v)
        data["vehicle_name"] = v.name_model if v else ""
        data["vehicle_reg"] = v.registration_number if v else ""
    return data


def fuel_dict(f, with_names: bool = True) -> dict:
    if f is None:
        return None
    data = {
        "id": f.id,
        "vehicle_id": f.vehicle_id,
        "trip_id": f.trip_id,
        "liters": f.liters,
        "cost": f.cost,
        "date": f.date,
        "odometer_km": f.odometer_km,
        "created_at": _iso(f.created_at),
    }
    if with_names:
        v = f.vehicle
        data["vehicle"] = vehicle_dict(v)
        data["vehicle_name"] = v.name_model if v else ""
        data["vehicle_reg"] = v.registration_number if v else ""
        if f.trip_id and f.trip:
            data["trip"] = trip_dict(f.trip, with_names=False)
    return data


def expense_dict(e, with_names: bool = True) -> dict:
    if e is None:
        return None
    data = {
        "id": e.id,
        "vehicle_id": e.vehicle_id,
        "trip_id": e.trip_id,
        "expense_type": e.expense_type,
        "amount": e.amount,
        "expense_date": e.expense_date,
        "description": e.description,
        "created_at": _iso(e.created_at),
    }
    if with_names:
        v = e.vehicle
        data["vehicle"] = vehicle_dict(v)
        data["vehicle_name"] = v.name_model if v else ""
        data["vehicle_reg"] = v.registration_number if v else ""
        if e.trip_id and e.trip:
            data["trip"] = trip_dict(e.trip, with_names=False)
    return data


def user_dict(u) -> dict:
    if u is None:
        return None
    return {
        "id": u.id,
        "name": u.full_name,
        "email": u.email,
        "role": u.role.name if u.role else "",
        "status": "Active" if u.is_active else "Inactive",
    }
