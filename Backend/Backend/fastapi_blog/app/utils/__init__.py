"""Utility package.

Submodules are imported explicitly where needed (e.g.
``from app.utils.helper import utc_now``) so that optional, heavier
utilities such as the Excel/CSV exporters do not become hard import-time
dependencies of the whole application.
"""
