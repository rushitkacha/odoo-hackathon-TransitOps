from typing import Annotated

from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.crud.role import RoleCRUD
from app.database.session import get_db
from app.models.user import User
from app.schemas.fleet import UserUpdate
from app.utils.query import paginate
from app.utils.records import get_or_404
from app.utils.serializers import user_dict

router = APIRouter(
    prefix="/api/v1/users",
    tags=["Users"],
    dependencies=[Depends(get_current_user)],
)

DBSession = Annotated[Session, Depends(get_db)]


@router.get("")
@router.get("/")
def list_users(request: Request, db: DBSession):
    rows = [user_dict(u) for u in db.query(User).all()]
    return paginate(rows, dict(request.query_params))


@router.patch("/{user_id}")
def update_user(user_id: int, payload: UserUpdate, db: DBSession):
    user = get_or_404(db, User, user_id, "User")
    data = payload.model_dump(exclude_unset=True)

    if data.get("role"):
        role = RoleCRUD.get_by_name(db=db, name=data["role"])
        if role:
            user.role_id = role.id
    if data.get("status"):
        user.is_active = data["status"] == "Active"

    db.commit()
    db.refresh(user)
    return user_dict(user)
