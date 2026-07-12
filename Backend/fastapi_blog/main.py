from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.v1.auth import router as auth_router
from app.api.v1.reports import router as reports_router

from app.core.config import settings

from app.exceptions.handlers import register_exception_handlers
from app.middleware.logging import LoggingMiddleware

# ==========================================================
# Application Lifespan
# ==========================================================


@asynccontextmanager
async def lifespan(app: FastAPI):
    print(f"🚀 Starting {settings.APP_NAME}...")
    yield
    print(f"🛑 Shutting down {settings.APP_NAME}...")


# ==========================================================
# FastAPI Application
# ==========================================================

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=settings.DEBUG,
    lifespan=lifespan,
)


# ==========================================================
# Register Middleware
# ==========================================================

app.add_middleware(LoggingMiddleware)


# ==========================================================
# Register Exception Handlers
# ==========================================================

register_exception_handlers(app)


# ==========================================================
# Register Routers
# ==========================================================

app.include_router(auth_router)
app.include_router(reports_router)

# Future Routers
# app.include_router(vehicle_router)
# app.include_router(driver_router)
# app.include_router(trip_router)
# app.include_router(maintenance_router)
# app.include_router(fuel_router)
# app.include_router(expense_router)
# app.include_router(dashboard_router)


# ==========================================================
# Root Endpoint
# ==========================================================


@app.get(
    "/",
    tags=["Home"],
)
def root():
    return {
        "success": True,
        "application": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "Running",
        "message": f"Welcome to {settings.APP_NAME}",
    }


# ==========================================================
# Health Check
# ==========================================================


@app.get(
    "/health",
    tags=["Health"],
)
def health_check():
    return {
        "success": True,
        "status": "Healthy",
        "application": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }


# ==========================================================
# Version Information
# ==========================================================


@app.get(
    "/version",
    tags=["Health"],
)
def version():
    return {
        "success": True,
        "application": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }
