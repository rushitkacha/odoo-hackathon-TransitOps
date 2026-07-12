from sqlalchemy.orm import Session

from models.route import Route
from schemas.route import RouteCreate


def create_route(db: Session, route: RouteCreate):
    new_route = Route(
        source=route.source,
        destination=route.destination,
        distance=route.distance
    )

    db.add(new_route)
    db.commit()
    db.refresh(new_route)

    return new_route


def get_routes(db: Session):
    return db.query(Route).all()