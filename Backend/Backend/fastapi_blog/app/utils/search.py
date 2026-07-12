from sqlalchemy import or_


class Search:

    @staticmethod
    def apply(
        query,
        search: str | None,
        *columns,
    ):
        """
        Apply case-insensitive search on multiple columns.

        Example:
            query = Search.apply(
                query,
                search,
                Vehicle.registration_number,
                Vehicle.model,
            )
        """

        if not search:
            return query

        conditions = []

        for column in columns:
            conditions.append(column.ilike(f"%{search}%"))

        return query.filter(or_(*conditions))
