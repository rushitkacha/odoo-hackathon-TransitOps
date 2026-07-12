import csv
from io import StringIO
from typing import Any

from fastapi.responses import StreamingResponse


class CSVExporter:
    """
    Generic CSV Export Utility.

    Supports:
    - SQLAlchemy Model Objects
    - List of Dictionaries
    - Empty Data
    """

    @staticmethod
    def _convert_objects_to_dict(
        data: list[Any],
    ) -> list[dict]:
        """
        Convert SQLAlchemy model instances into dictionaries.
        """

        converted_data = []

        for item in data:

            if isinstance(item, dict):
                converted_data.append(item)

            else:

                converted_data.append(
                    {
                        key: value
                        for key, value in vars(item).items()
                        if not key.startswith("_")
                    }
                )

        return converted_data

    @staticmethod
    def export(
        filename: str,
        data: list[Any],
    ) -> StreamingResponse:
        """
        Export data as CSV.

        Example:

        return CSVExporter.export(
            filename="vehicles.csv",
            data=vehicles,
        )
        """

        output = StringIO()

        data = CSVExporter._convert_objects_to_dict(data)

        if not data:

            writer = csv.writer(output)

            writer.writerow(
                [
                    "No Data Available",
                ]
            )

        else:

            fieldnames = list(data[0].keys())

            writer = csv.DictWriter(
                output,
                fieldnames=fieldnames,
                extrasaction="ignore",
            )

            writer.writeheader()

            writer.writerows(data)

        output.seek(0)

        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv; charset=utf-8",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
            },
        )
