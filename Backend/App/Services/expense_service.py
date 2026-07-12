from crud.expense import (
    create_expense,
    get_expenses,
)


def add_expense(db, expense_data):
    """
    Create a new expense.
    """
    return create_expense(db, expense_data)


def list_expenses(db):
    """
    Return all expenses.
    """
    return get_expenses(db)