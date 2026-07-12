from datetime import date, datetime

from sqlalchemy.orm import Query


class Filters:
    """
    Reusable query filters for SQLAlchemy.

    Example:
        query = Filters.by_status(
            query,
            Vehicle.status,
            status,
        )
    """

    @staticmethod
    def by_status(
        query: Query,
        column,
        status: str | None,
    ) -> Query:

        if status:
            query = query.filter(column == status)

        return query

    @staticmethod
    def by_region(
        query: Query,
        column,
        region: str | None,
    ) -> Query:

        if region:
            query = query.filter(column == region)

        return query

    @staticmethod
    def by_vehicle_type(
        query: Query,
        column,
        vehicle_type: str | None,
    ) -> Query:

        if vehicle_type:
            query = query.filter(column == vehicle_type)

        return query

    @staticmethod
    def by_driver(
        query: Query,
        column,
        driver_id: int | None,
    ) -> Query:

        if driver_id:
            query = query.filter(column == driver_id)

        return query

    @staticmethod
    def by_vehicle(
        query: Query,
        column,
        vehicle_id: int | None,
    ) -> Query:

        if vehicle_id:
            query = query.filter(column == vehicle_id)

        return query

    @staticmethod
    def by_date_range(
        query: Query,
        column,
        start_date: date | datetime | None,
        end_date: date | datetime | None,
    ) -> Query:

        if start_date:
            query = query.filter(column >= start_date)

        if end_date:
            query = query.filter(column <= end_date)

        return query

    @staticmethod
    def by_boolean(
        query: Query,
        column,
        value: bool | None,
    ) -> Query:

        if value is not None:
            query = query.filter(column == value)

        return query
