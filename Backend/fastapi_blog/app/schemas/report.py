from datetime import date

from pydantic import BaseModel, ConfigDict


class ReportFilter(BaseModel):

    start_date: date | None = None

    end_date: date | None = None

    vehicle_id: int | None = None

    driver_id: int | None = None

    status: str | None = None


class ReportRow(BaseModel):

    title: str

    value: float

    category: str


class ReportResponse(BaseModel):

    generated_at: str

    total_records: int

    data: list[ReportRow]

    model_config = ConfigDict(
        from_attributes=True,
    )
