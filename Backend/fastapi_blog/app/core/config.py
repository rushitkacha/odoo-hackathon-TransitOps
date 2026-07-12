from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):

    APP_NAME: str = Field(default="TransitOps")
    APP_VERSION: str = Field(default="1.0.0")

    DEBUG: bool = Field(default=True)

    HOST: str = Field(default="127.0.0.1")
    PORT: int = Field(default=8000)

    DATABASE_URL: str = Field(
        default="postgresql+psycopg2://postgres:your_password@localhost:5432/transitops_db"
    )

    SECRET_KEY: str = Field(default="change-me")
    ALGORITHM: str = Field(default="HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=60)

    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()
