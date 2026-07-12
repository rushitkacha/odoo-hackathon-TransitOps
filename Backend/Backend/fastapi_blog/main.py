from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.auth import router as auth_router
from app.api.v1.vehicles import router as vehicles_router
from app.api.v1.drivers import router as drivers_router
from app.api.v1.trips import router as trips_router
from app.api.v1.maintenance import router as maintenance_router
from app.api.v1.fuel import router as fuel_router
from app.api.v1.expenses import router as expenses_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.reports import router as reports_router
from app.api.v1.users import router as users_router

from app.core.config import settings
from app.database.database import engine
from app.database.session import Base, SessionLocal

# Import models so they register on Base.metadata before create_all.
import app.models  # noqa: F401
from app.exceptions.handlers import register_exception_handlers
from app.middleware.logging import LoggingMiddleware
from app.seed.seed_database import seed_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    print(f"🚀 Starting {settings.APP_NAME}...")
    # Create tables and seed baseline data on startup.
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield
    print(f"🛑 Shutting down {settings.APP_NAME}...")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=settings.DEBUG,
    lifespan=lifespan,
)


# ---------------------------------------------------------
# CORS — allow the static frontend server to call the API.
# ---------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(LoggingMiddleware)

register_exception_handlers(app)


# ---------------------------------------------------------
# Routers
# ---------------------------------------------------------
app.include_router(auth_router)
app.include_router(vehicles_router)
app.include_router(drivers_router)
app.include_router(trips_router)
app.include_router(maintenance_router)
app.include_router(fuel_router)
app.include_router(expenses_router)
app.include_router(dashboard_router)
app.include_router(reports_router)
app.include_router(users_router)


@app.get("/", tags=["Home"])
def root():
    return {
        "success": True,
        "application": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "Running",
        "message": f"Welcome to {settings.APP_NAME}",
    }


@app.get("/health", tags=["Health"])
def health_check():
    return {
        "success": True,
        "status": "Healthy",
        "application": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }
