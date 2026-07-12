"""
List helper that mirrors the frontend MockApi.list() semantics so that
search, filtering, sorting and pagination behave identically to the
demo the frontend was validated against.
"""
import json
import re

RESERVED = {"search", "skip", "limit", "page", "page_size", "sort_by", "sort_dir"}

_num_re = re.compile(r"^-?\d+(\.\d+)?$")


def _natural_key(value):
    """Sort numbers numerically and everything else as lowercased strings."""
    s = "" if value is None else str(value)
    if _num_re.match(s):
        return (0, float(s), "")
    return (1, 0.0, s.lower())


def paginate(rows: list[dict], params: dict) -> dict:
    params = params or {}
    result = list(rows)

    # Full-text search across the serialized row (matches MockApi behaviour).
    search = str(params.get("search") or "").strip().lower()
    if search:
        result = [
            row
            for row in result
            if search in json.dumps(row, default=str).lower()
        ]

    # Exact-match field filters for any remaining query param.
    for key, value in params.items():
        if key in RESERVED:
            continue
        if value in (None, "", "all"):
            continue
        result = [row for row in result if str(row.get(key)) == str(value)]

    # Sorting.
    sort_by = params.get("sort_by")
    if sort_by:
        reverse = str(params.get("sort_dir") or "asc").lower() == "desc"
        result.sort(key=lambda r: _natural_key(r.get(sort_by)), reverse=reverse)

    total = len(result)

    # Pagination (skip/limit take priority, else page/page_size).
    default_size = 10
    if params.get("skip") is not None or params.get("limit") is not None:
        skip = int(params.get("skip") or 0)
        limit = int(params.get("limit") or default_size)
    else:
        page = int(params.get("page") or 1)
        page_size = int(params.get("page_size") or default_size)
        skip = (page - 1) * page_size
        limit = page_size

    items = result[skip: skip + limit]
    return {"items": items, "total": total}
