from sqlalchemy.orm import Session

from models.user import User
from schemas.user import UserCreate


def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()


def create_user(db: Session, user: UserCreate):
    new_user = User(
        name=user.name,
        email=user.email,
        password=user.password  # Later this will be hashed
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user