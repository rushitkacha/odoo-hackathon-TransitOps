from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.session import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, UserCreate
from app.services.auth_service import AuthService
from app.utils.response import APIResponse

router = APIRouter(
    prefix="/api/v1/auth",
    tags=["Authentication"],
)

DBSession = Annotated[Session, Depends(get_db)]


@router.post(
    "/register",
    status_code=status.HTTP_201_CREATED,
    summary="Register User",
    description="Create a new user account.",
    responses={
        201: {"description": "User registered successfully."},
        409: {"description": "Email already registered."},
    },
)
def register(
    user: UserCreate,
    db: DBSession,
):
    return APIResponse.success(
        message="User registered successfully.",
        data=AuthService.register(
            db=db,
            data=user,
        ),
        status_code=201,
    )


@router.post(
    "/login",
    status_code=status.HTTP_200_OK,
    summary="Login User",
    description="Authenticate using email and password.",
    responses={
        200: {"description": "Login successful."},
        401: {"description": "Invalid email or password."},
        403: {"description": "Inactive account."},
    },
)
def login(
    credentials: LoginRequest,
    db: DBSession,
):
    return APIResponse.success(
        message="Login successful.",
        data=AuthService.login(
            db=db,
            credentials=credentials,
        ),
    )


@router.get(
    "/me",
    status_code=status.HTTP_200_OK,
    summary="Current User",
    description="Return the currently authenticated user.",
    responses={
        200: {"description": "Current user returned successfully."},
        401: {"description": "Unauthorized."},
    },
)
def get_me(
    current_user: User = Depends(get_current_user),
):
    return APIResponse.success(
        message="Current user fetched successfully.",
        data=AuthService.get_current_user(
            current_user,
        ),
    )
