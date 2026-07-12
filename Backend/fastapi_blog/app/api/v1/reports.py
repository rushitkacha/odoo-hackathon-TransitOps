from typing import Annotated
from fastapi import APIRouter, Depends, status
from app.core.permissions import CurrentUser, require_roles
from app.schemas.report import ReportFilter, ReportResponse
from app.services.report_service import ReportService
from app.utils.response import APIResponse

router = APIRouter(
    prefix="/api/v1/reports",
    tags=["Reports"],
)


@router.post(
    "/summary",
    response_model=ReportResponse,
    status_code=status.HTTP_200_OK,
)
def generate_summary(
    filters: ReportFilter,
    current_user: CurrentUser,
):
    return APIResponse.success(
        message="Report generated successfully.",
        data=ReportService.generate_report(filters),
    )
