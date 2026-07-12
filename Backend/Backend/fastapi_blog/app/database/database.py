from sqlalchemy import create_engine

from app.core.config import settings

# SQLite needs a special connect arg for multi-threaded FastAPI use.
connect_args = {"check_same_thread": False} if settings.is_sqlite else {}

engine = create_engine(
    settings.DATABASE_URL,
    echo=False,  # set True to log SQL
    future=True,
    pool_pre_ping=True,
    connect_args=connect_args,
)
