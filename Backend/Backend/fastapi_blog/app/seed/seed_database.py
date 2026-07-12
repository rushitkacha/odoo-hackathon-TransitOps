from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.driver import Driver
from app.models.expense import Expense
from app.models.fuel_log import FuelLog
from app.models.maintenance import Maintenance
from app.models.role import Role
from app.models.trip import Trip
from app.models.user import User
from app.models.vehicle import Vehicle

ROLES = [
    {"name": "Admin", "description": "System Administrator"},
    {"name": "Fleet Manager", "description": "Manages vehicles and maintenance"},
    {"name": "Dispatcher", "description": "Creates and manages trips"},
    {"name": "Safety Officer", "description": "Monitors drivers and safety"},
    {"name": "Financial Analyst", "description": "Handles expenses and reports"},
]

# name, email, role, active
USERS = [
    ("System Administrator", "admin@transitops.com", "Admin", "Admin@123", True),
    ("Aarav Mehta", "fleet@transitops.com", "Fleet Manager", "password123", True),
    ("Diya Shah", "dispatch@transitops.com", "Dispatcher", "password123", True),
    ("Kabir Singh", "safety@transitops.com", "Safety Officer", "password123", True),
    ("Meera Patel", "finance@transitops.com", "Financial Analyst", "password123", True),
]

VEHICLES = [
    ("GJ-15-AB-2345", "Tata Ace", "Mini Truck", 500, 42115, 800000, "Gujarat", "Available"),
    ("GJ-05-KL-8821", "Ashok Leyland Dost", "Truck", 1500, 78350, 1250000, "Gujarat", "On Trip"),
    ("MH-12-PQ-4410", "Mahindra Bolero Pickup", "Pickup", 1200, 61200, 980000, "Maharashtra", "In Shop"),
    ("RJ-14-ZX-1022", "Eicher Pro 2049", "Truck", 2500, 145000, 1800000, "Rajasthan", "Retired"),
    ("GJ-01-CD-7755", "Force Traveller", "Van", 900, 34200, 1450000, "Gujarat", "Available"),
    ("MP-09-AA-7733", "Tata 407", "Truck", 2250, 89600, 1550000, "Madhya Pradesh", "Available"),
    ("GJ-18-TR-5501", "Maruti Eeco Cargo", "Van", 600, 27540, 720000, "Gujarat", "Available"),
    ("MH-04-HH-3320", "BharatBenz 1217C", "Heavy Truck", 8000, 110300, 3200000, "Maharashtra", "Available"),
]

DRIVERS = [
    ("Alex Patel", "GJ2025005678", "Commercial", "2027-12-10", "9876501001", 92, "Available"),
    ("Rohan Shah", "GJ2022003344", "Heavy Commercial", "2028-05-18", "9876501002", 88, "On Trip"),
    ("Mehul Joshi", "MH2021008881", "Commercial", "2026-08-02", "9876501003", 81, "Available"),
    ("Imran Khan", "RJ2020004412", "Heavy Commercial", "2027-03-15", "9876501004", 76, "Off Duty"),
    ("Nikhil Rao", "MP2019007722", "Commercial", "2025-12-30", "9876501005", 65, "Suspended"),
    ("Sanjay Desai", "GJ2023009900", "Commercial", "2029-01-20", "9876501006", 95, "Available"),
    ("Vikas Yadav", "MH2024006611", "Heavy Commercial", "2027-09-01", "9876501007", 89, "Available"),
    ("Karan Singh", "RJ2022001222", "Commercial", "2028-02-09", "9876501008", 84, "Available"),
]

# source, dest, vehicle_id, driver_id, cargo, planned, actual, revenue, status
TRIPS = [
    ("Ahmedabad", "Vadodara", 1, 1, 450, 115, 115, 5200, "Completed"),
    ("Surat", "Mumbai", 2, 2, 1100, 285, None, 18000, "Dispatched"),
    ("Rajkot", "Ahmedabad", 5, 6, 650, 215, 220, 11000, "Completed"),
    ("Indore", "Bhopal", 6, 7, 1800, 195, 198, 14500, "Completed"),
    ("Pune", "Nashik", 7, 8, 500, 210, None, 8500, "Draft"),
    ("Vadodara", "Anand", 1, 3, 300, 45, 46, 2800, "Completed"),
]

# vehicle_id, type, description, start, end, cost, status, notes
MAINTENANCE = [
    (3, "Oil Change", "Replace oil and filters", "2026-07-10", None, 4000, "Active", None),
    (1, "Brake Inspection", "Routine brake inspection", "2026-06-12", "2026-06-12", 2200, "Closed", "No replacement required"),
    (5, "Tyre Replacement", "Replace front tyres", "2026-05-18", "2026-05-19", 18000, "Closed", "Two tyres replaced"),
]

# vehicle_id, trip_id, liters, cost, date, odometer
FUEL = [
    (1, 1, 12, 1200, "2026-07-01", 42115),
    (5, 3, 24, 2400, "2026-06-28", 34200),
    (6, 4, 28, 2800, "2026-06-25", 89600),
    (1, 6, 5, 500, "2026-06-20", 42000),
    (2, 2, 35, 3500, "2026-07-11", 78350),
    (7, None, 20, 2050, "2026-07-08", 27540),
]

# vehicle_id, trip_id, type, amount, date, description
EXPENSES = [
    (1, 1, "Toll", 350, "2026-07-01", "Expressway toll"),
    (5, 3, "Toll", 620, "2026-06-28", "Highway tolls"),
    (6, 4, "Parking", 180, "2026-06-25", "Loading bay parking"),
    (3, None, "Repair", 1500, "2026-07-10", "Workshop inspection charge"),
    (2, 2, "Toll", 850, "2026-07-11", "Surat to Mumbai tolls"),
    (7, None, "Other", 300, "2026-07-08", "Vehicle cleaning"),
]


def seed_roles(db: Session):
    for role_data in ROLES:
        if not db.query(Role).filter(Role.name == role_data["name"]).first():
            db.add(Role(name=role_data["name"], description=role_data["description"]))
    db.commit()


def seed_users(db: Session):
    for full_name, email, role_name, password, active in USERS:
        if db.query(User).filter(User.email == email).first():
            continue
        role = db.query(Role).filter(Role.name == role_name).first()
        if not role:
            continue
        db.add(
            User(
                full_name=full_name,
                email=email,
                password_hash=hash_password(password),
                role_id=role.id,
                is_active=active,
            )
        )
    db.commit()


def seed_fleet(db: Session):
    # Only seed the operational data once (when there are no vehicles yet).
    if db.query(Vehicle).count() > 0:
        return

    for reg, model, vtype, cap, odo, cost, region, status in VEHICLES:
        db.add(
            Vehicle(
                registration_number=reg,
                name_model=model,
                vehicle_type=vtype,
                max_load_capacity_kg=cap,
                odometer_km=odo,
                acquisition_cost=cost,
                region=region,
                status=status,
            )
        )

    for name, lic, cat, expiry, contact, score, status in DRIVERS:
        db.add(
            Driver(
                name=name,
                license_number=lic,
                license_category=cat,
                license_expiry_date=expiry,
                contact_number=contact,
                safety_score=score,
                status=status,
            )
        )
    db.commit()

    for src, dest, vid, did, cargo, planned, actual, revenue, status in TRIPS:
        db.add(
            Trip(
                source=src,
                destination=dest,
                vehicle_id=vid,
                driver_id=did,
                cargo_weight_kg=cargo,
                planned_distance_km=planned,
                actual_distance_km=actual,
                revenue=revenue,
                status=status,
            )
        )

    for vid, mtype, desc, start, end, cost, status, notes in MAINTENANCE:
        db.add(
            Maintenance(
                vehicle_id=vid,
                maintenance_type=mtype,
                description=desc,
                start_date=start,
                end_date=end,
                cost=cost,
                status=status,
                closing_notes=notes,
            )
        )

    for vid, tid, liters, cost, dt, odo in FUEL:
        db.add(
            FuelLog(
                vehicle_id=vid,
                trip_id=tid,
                liters=liters,
                cost=cost,
                date=dt,
                odometer_km=odo,
            )
        )

    for vid, tid, etype, amount, dt, desc in EXPENSES:
        db.add(
            Expense(
                vehicle_id=vid,
                trip_id=tid,
                expense_type=etype,
                amount=amount,
                expense_date=dt,
                description=desc,
            )
        )
    db.commit()


def seed_database(db: Session):
    seed_roles(db)
    seed_users(db)
    seed_fleet(db)
    print("Database seeded successfully.")
