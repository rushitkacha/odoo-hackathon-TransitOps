from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.core.security import create_access_token, verify_password
from app.crud.user import UserCRUD
from app.database.session import get_db
from app.models.user import User
from app.schemas.auth import UserCreate
from app.services.auth_service import AuthService
from app.utils.serializers import user_dict

router = APIRouter(
    prefix="/api/v1/auth",
    tags=["Authentication"],
)

DBSession = Annotated[Session, Depends(get_db)]


@router.post(
    "/login",
    status_code=status.HTTP_200_OK,
    summary="Login (OAuth2 form)",
    description="Authenticate with form fields `username` (email) and `password`.",
)
def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: DBSession,
):
    """Returns the token and user at the top level, matching the frontend
    contract: { access_token, token_type, user }."""
    email = form_data.username
    password = form_data.password

    user = UserCRUD.get_by_email(db=db, email=email)
    if user is None or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated.",
        )

    access_token = create_access_token(
        {
            "sub": str(user.id),
            "user_id": user.id,
            "email": user.email,
            "role": user.role.name if user.role else None,
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_dict(user),
    }


@router.post(
    "/register",
    status_code=status.HTTP_201_CREATED,
    summary="Register User",
)
def register(user: UserCreate, db: DBSession):
    created = AuthService.register(db=db, data=user)
    return created


@router.get(
    "/me",
    status_code=status.HTTP_200_OK,
    summary="Current User",
)
def get_me(current_user: User = Depends(get_current_user)):
    return user_dict(current_user)
