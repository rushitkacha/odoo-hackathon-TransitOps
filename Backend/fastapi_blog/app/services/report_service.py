from datetime import datetime

from app.schemas.report import (
    ReportFilter,
    ReportResponse,
)


class ReportService:

    @staticmethod
    def generate_report(
        filters: ReportFilter,
    ) -> ReportResponse:
        """
        Placeholder implementation.

        Once Vehicle, Trip, Fuel and Expense
        models are available, this method
        will calculate real analytics.
        """

        return ReportResponse(
            generated_at=datetime.utcnow().isoformat(),
            total_records=0,
            data=[],
        )
