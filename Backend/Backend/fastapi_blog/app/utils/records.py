from fastapi import HTTPException, status


def get_or_404(db, model, record_id, label: str):
    obj = db.query(model).filter(model.id == record_id).first()
    if obj is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{label} not found.",
        )
    return obj


def conflict(message: str):
    raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=message)


def unprocessable(message: str):
    raise HTTPException(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=message
    )
