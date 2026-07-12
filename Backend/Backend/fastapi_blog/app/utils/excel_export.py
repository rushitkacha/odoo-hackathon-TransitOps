from io import BytesIO
from typing import Any

from fastapi.responses import StreamingResponse
from openpyxl import Workbook


class ExcelExporter:
    """
    Generic Excel Export Utility.

    Supports:
    - SQLAlchemy Model Objects
    - List of Dictionaries
    - Empty Data
    """

    @staticmethod
    def _convert_objects_to_dict(
        data: list[Any],
    ) -> list[dict]:

        converted = []

        for item in data:

            if isinstance(item, dict):
                converted.append(item)

            else:
                converted.append(
                    {
                        key: value
                        for key, value in vars(item).items()
                        if not key.startswith("_")
                    }
                )

        return converted

    @staticmethod
    def export(
        filename: str,
        data: list[Any],
    ) -> StreamingResponse:

        workbook = Workbook()
        worksheet = workbook.active
        worksheet.title = "Data"

        data = ExcelExporter._convert_objects_to_dict(data)

        if not data:

            worksheet.append(["No Data Available"])

        else:

            headers = list(data[0].keys())

            worksheet.append(headers)

            for row in data:

                worksheet.append([row.get(header) for header in headers])

        stream = BytesIO()

        workbook.save(stream)

        stream.seek(0)

        return StreamingResponse(
            stream,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )
