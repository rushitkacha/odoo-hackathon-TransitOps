from typing import Any


class APIResponse:
    """
    Standard API Response Builder

    Success Response:
    {
        "success": True,
        "status_code": 200,
        "message": "Operation successful.",
        "data": {...},
        "meta": {...}
    }

    Error Response:
    {
        "success": False,
        "status_code": 400,
        "message": "Something went wrong.",
        "data": None
    }
    """

    @staticmethod
    def success(
        message: str,
        data: Any = None,
        status_code: int = 200,
        meta: dict | None = None,
    ) -> dict:
        return {
            "success": True,
            "status_code": status_code,
            "message": message,
            "data": data,
            "meta": meta,
        }

    @staticmethod
    def error(
        message: str,
        status_code: int = 400,
        data: Any = None,
    ) -> dict:
        return {
            "success": False,
            "status_code": status_code,
            "message": message,
            "data": data,
        }
