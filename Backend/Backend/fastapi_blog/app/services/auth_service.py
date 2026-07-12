from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User

from app.schemas.auth import (
    LoginRequest,
    Token,
    UserCreate,
    UserResponse,
)

from app.crud.user import UserCRUD
from app.crud.role import RoleCRUD

from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)


class AuthService:

    @staticmethod
    def register(
        db: Session,
        data: UserCreate,
    ) -> UserResponse:

        # Check whether email already exists
        existing_user = UserCRUD.get_by_email(
            db=db,
            email=data.email,
        )

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email is already registered.",
            )

        # Check role
        role = RoleCRUD.get_by_id(
            db=db,
            role_id=data.role_id,
        )

        if role is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Selected role does not exist.",
            )

        # Create user
        user = User(
            full_name=data.full_name,
            email=data.email,
            password_hash=hash_password(data.password),
            role_id=role.id,
            is_active=True,
        )

        created_user = UserCRUD.create(
            db=db,
            user=user,
        )

        return UserResponse.model_validate(created_user)

    @staticmethod
    def login(
        db: Session,
        credentials: LoginRequest,
    ) -> Token:

        # Find user
        user = UserCRUD.get_by_email(
            db=db,
            email=credentials.email,
        )

        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
            )

        # Verify password
        if not verify_password(
            credentials.password,
            user.password_hash,
        ):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
            )

        # Verify account status
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account has been deactivated.",
            )

        # Create JWT
        access_token = create_access_token(
            {
                "sub": str(user.id),
                "user_id": user.id,
                "email": user.email,
                "role": user.role.name,
            }
        )

        return Token(
            access_token=access_token,
            token_type="Bearer",
        )

    @staticmethod
    def get_current_user(
        current_user: User,
    ) -> UserResponse:
        """
        Return the currently authenticated user.
        """

        return UserResponse.model_validate(current_user)
