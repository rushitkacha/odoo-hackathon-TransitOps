from typing import Annotated, Optional

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    status
)

from sqlalchemy.orm import Session

from app.database import get_db

from app.schemas.driver import (
    DriverCreate,
    DriverUpdate,
    DriverResponse,
    DriverEligibilityResponse
)

from app.services import driver_service

router = APIRouter()


# ----------------------------------------------------------
# Get All Drivers
# ----------------------------------------------------------

@router.get(
    "/",
    response_model=list[DriverResponse],
    summary="Get all drivers"
)
def get_all_drivers(

    db: Annotated[Session, Depends(get_db)],

    search: Optional[str] = Query(
        default=None,
        description="Search by driver name"
    ),

    status_filter: Optional[str] = Query(
        default=None,
        alias="status"
    ),

    license_category: Optional[str] = Query(
        default=None
    ),

    skip: int = Query(
        default=0,
        ge=0
    ),

    limit: int = Query(
        default=100,
        ge=1,
        le=100
    )

):

    return driver_service.get_all_drivers(
        db=db,
        search=search,
        status=status_filter,
        license_category=license_category,
        skip=skip,
        limit=limit
    )


# ----------------------------------------------------------
# Get Available Drivers
# ----------------------------------------------------------

@router.get(
    "/available",
    response_model=list[DriverResponse],
    summary="Get available drivers"
)
def get_available_drivers(

    db: Annotated[Session, Depends(get_db)]

):

    return driver_service.get_available_drivers(db)


# ----------------------------------------------------------
# Check Driver Eligibility
# ----------------------------------------------------------

@router.get(
    "/{driver_id}/eligibility",
    response_model=DriverEligibilityResponse,
    summary="Check driver eligibility"
)
def check_driver_eligibility(

    driver_id: int,

    db: Annotated[Session, Depends(get_db)]

):

    result = driver_service.check_driver_eligibility(
        db,
        driver_id
    )

    if result is None:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Driver not found"
        )

    return result


# ----------------------------------------------------------
# Get Driver By ID
# ----------------------------------------------------------

@router.get(
    "/{driver_id}",
    response_model=DriverResponse,
    summary="Get driver"
)
def get_driver(

    driver_id: int,

    db: Annotated[Session, Depends(get_db)]

):

    driver = driver_service.get_driver(
        db,
        driver_id
    )

    if driver is None:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Driver not found"
        )

    return driver


# ----------------------------------------------------------
# Create Driver
# ----------------------------------------------------------

@router.post(
    "/",
    response_model=DriverResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create driver"
)
def create_driver(

    driver: DriverCreate,

    db: Annotated[Session, Depends(get_db)]

):

    try:

        return driver_service.create_driver(
            db,
            driver
        )

    except ValueError as e:

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e)
        )


# ----------------------------------------------------------
# Update Driver
# ----------------------------------------------------------

@router.patch(
    "/{driver_id}",
    response_model=DriverResponse,
    summary="Update driver"
)
def update_driver(

    driver_id: int,

    driver: DriverUpdate,

    db: Annotated[Session, Depends(get_db)]

):

    try:

        updated = driver_service.update_driver(
            db,
            driver_id,
            driver
        )

        if updated is None:

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Driver not found"
            )

        return updated

    except ValueError as e:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


# ----------------------------------------------------------
# Delete Driver
# ----------------------------------------------------------

@router.delete(
    "/{driver_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete driver"
)
def delete_driver(

    driver_id: int,

    db: Annotated[Session, Depends(get_db)]

):

    try:

        deleted = driver_service.delete_driver(
            db,
            driver_id
        )

        if not deleted:

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Driver not found"
            )

        return

    except ValueError as e:

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e)
        )