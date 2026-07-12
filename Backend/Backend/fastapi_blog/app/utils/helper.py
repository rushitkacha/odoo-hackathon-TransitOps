from datetime import datetime, timezone


def utc_now() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def today_iso() -> str:
    """Current date as an ISO string (YYYY-MM-DD) to match the frontend."""
    return datetime.now(timezone.utc).date().isoformat()
