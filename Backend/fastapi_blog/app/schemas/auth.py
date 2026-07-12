from pydantic import BaseModel
from pydantic import ConfigDict
from pydantic import EmailStr
from pydantic import Field
from datetime import datetime

# -----------------------------
# Register Request
# -----------------------------


class UserCreate(BaseModel):

    full_name: str = Field(min_length=3, max_length=100)

    email: EmailStr

    password: str = Field(min_length=8, max_length=100)

    role_id: int


# -----------------------------
# Login Request
# -----------------------------


class LoginRequest(BaseModel):

    email: EmailStr

    password: str


# -----------------------------
# Token Response
# -----------------------------


class Token(BaseModel):

    access_token: str

    token_type: str


# -----------------------------
# User Response
# -----------------------------


class UserResponse(BaseModel):

    id: int

    full_name: str

    email: EmailStr

    is_active: bool

    role: str

    model_config = ConfigDict(
        from_attributes=True,
    )


class CurrentUser(BaseModel):

    model_config = ConfigDict(from_attributes=True)

    id: int

    full_name: str

    email: EmailStr

    role_id: int

    is_active: bool
