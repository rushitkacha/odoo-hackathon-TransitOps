from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.vehicle import (
    VehicleCreate,
    VehicleUpdate,
    VehicleResponse
)
from app.services import vehicle_service

router = APIRouter()


# ==========================================================
# Get All Vehicles
# ==========================================================

@router.get(
    "/",
    response_model=list[VehicleResponse],
    summary="Get all vehicles"
)
def get_all_vehicles(
    search: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    vehicle_type: Optional[str] = None,
    region: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):

    return vehicle_service.get_all_vehicles(
        db=db,
        search=search,
        status=status_filter,
        vehicle_type=vehicle_type,
        region=region,
        skip=skip,
        limit=limit
    )


# ==========================================================
# Get Available Vehicles
# ==========================================================

@router.get(
    "/available",
    response_model=list[VehicleResponse],
    summary="Get available vehicles"
)
def get_available_vehicles(
    db: Session = Depends(get_db)
):

    return vehicle_service.get_available_vehicles(db)


# ==========================================================
# Get Vehicle By ID
# ==========================================================

@router.get(
    "/{vehicle_id}",
    response_model=VehicleResponse,
    summary="Get vehicle by ID"
)
def get_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db)
):

    vehicle = vehicle_service.get_vehicle(db, vehicle_id)

    if vehicle is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle not found"
        )

    return vehicle


# ==========================================================
# Create Vehicle
# ==========================================================

@router.post(
    "/",
    response_model=VehicleResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create vehicle"
)
def create_vehicle(
    vehicle: VehicleCreate,
    db: Session = Depends(get_db)
):

    try:
        return vehicle_service.create_vehicle(
            db=db,
            vehicle=vehicle
        )

    except ValueError as e:

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e)
        )


# ==========================================================
# Update Vehicle
# ==========================================================

@router.patch(
    "/{vehicle_id}",
    response_model=VehicleResponse,
    summary="Update vehicle"
)
def update_vehicle(
    vehicle_id: int,
    vehicle: VehicleUpdate,
    db: Session = Depends(get_db)
):

    try:

        updated_vehicle = vehicle_service.update_vehicle(
            db=db,
            vehicle_id=vehicle_id,
            vehicle=vehicle
        )

        if updated_vehicle is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Vehicle not found"
            )

        return updated_vehicle

    except ValueError as e:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


# ==========================================================
# Delete Vehicle
# ==========================================================

@router.delete(
    "/{vehicle_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete vehicle"
)
def delete_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db)
):

    try:

        deleted = vehicle_service.delete_vehicle(
            db=db,
            vehicle_id=vehicle_id
        )

        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Vehicle not found"
            )

        return

    except ValueError as e:

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e)
        )