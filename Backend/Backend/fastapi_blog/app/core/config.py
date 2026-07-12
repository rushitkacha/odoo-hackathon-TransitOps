from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):

    APP_NAME: str = Field(default="TransitOps")
    APP_VERSION: str = Field(default="1.1.0")

    DEBUG: bool = Field(default=True)

    HOST: str = Field(default="127.0.0.1")
    PORT: int = Field(default=8000)

    # SQLite by default; override via DATABASE_URL in .env for PostgreSQL.
    DATABASE_URL: str = Field(default="sqlite:///./transitops.db")

    SECRET_KEY: str = Field(default="change-me")
    ALGORITHM: str = Field(default="HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=60)

    # Comma-separated list of allowed CORS origins (kept as a plain string
    # so pydantic-settings does not try to JSON-decode it from .env).
    CORS_ORIGINS: str = Field(
        default=(
            "http://localhost:5500,http://127.0.0.1:5500,"
            "http://localhost:5501,http://127.0.0.1:5501"
        )
    )

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    @property
    def is_sqlite(self) -> bool:
        return self.DATABASE_URL.startswith("sqlite")

    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()
