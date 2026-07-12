from math import ceil

from sqlalchemy.orm import Query


class Pagination:

    @staticmethod
    def paginate(
        query: Query,
        page: int = 1,
        limit: int = 10,
    ) -> dict:

        if page < 1:
            page = 1

        if limit < 1:
            limit = 10

        total_records = query.count()

        total_pages = (
            ceil(
                total_records / limit,
            )
            if total_records
            else 1
        )

        results = query.offset((page - 1) * limit).limit(limit).all()

        return {
            "items": results,
            "meta": {
                "page": page,
                "limit": limit,
                "total_records": total_records,
                "total_pages": total_pages,
                "has_next": page < total_pages,
                "has_previous": page > 1,
            },
        }
