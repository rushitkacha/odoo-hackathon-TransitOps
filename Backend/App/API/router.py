# app/api/router.py

from fastapi import APIRouter

from app.api import (
    vehicles,
    drivers,
    maintenance,
    fuel,
    expenses,
    reports
)

api_router = APIRouter()

api_router.include_router(
    vehicles.router,
    prefix="/vehicles",
    tags=["Vehicles"]
)

api_router.include_router(
    drivers.router,
    prefix="/drivers",
    tags=["Drivers"]
)

api_router.include_router(
    maintenance.router,
    prefix="/maintenance",
    tags=["Maintenance"]
)

api_router.include_router(
    fuel.router,
    prefix="/fuel-logs",
    tags=["Fuel Logs"]
)

api_router.include_router(
    expenses.router,
    prefix="/expenses",
    tags=["Expenses"]
)

api_router.include_router(
    reports.router,
    prefix="/reports",
    tags=["Reports"]
)