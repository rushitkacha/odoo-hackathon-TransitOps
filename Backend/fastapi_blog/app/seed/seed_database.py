from sqlalchemy.orm import Session

from app.core.security import hash_password

from app.models.role import Role
from app.models.user import User

ROLES = [
    {
        "name": "Admin",
        "description": "System Administrator",
    },
    {
        "name": "Fleet Manager",
        "description": "Manages vehicles and maintenance",
    },
    {
        "name": "Dispatcher",
        "description": "Creates and manages trips",
    },
    {
        "name": "Safety Officer",
        "description": "Monitors drivers and safety",
    },
    {
        "name": "Financial Analyst",
        "description": "Handles expenses and reports",
    },
]


def seed_roles(db: Session):

    for role_data in ROLES:

        role = db.query(Role).filter(Role.name == role_data["name"]).first()

        if not role:

            db.add(
                Role(
                    name=role_data["name"],
                    description=role_data["description"],
                )
            )

    db.commit()


def seed_admin(db: Session):

    admin = db.query(User).filter(User.email == "admin@transitops.com").first()

    if admin:
        return

    admin_role = db.query(Role).filter(Role.name == "Admin").first()

    if not admin_role:
        raise RuntimeError("Admin role does not exist.")

    admin = User(
        full_name="System Administrator",
        email="admin@transitops.com",
        password_hash=hash_password("Admin@123"),
        role_id=admin_role.id,
        is_active=True,
    )

    db.add(admin)

    db.commit()


def seed_database(db: Session):

    seed_roles(db)

    seed_admin(db)

    print("Database seeded successfully.")
