from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.v1.deps import get_current_user
from app.db.session import get_db
from app.models.five_element_record import FiveElementRecord
from app.models.user import User

router = APIRouter(prefix="/five-elements", tags=["five-element-records"])


@router.get("/records")
def list_records(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[dict]:
    records = (
        db.query(FiveElementRecord)
        .filter(FiveElementRecord.user_id == current_user.id)
        .order_by(FiveElementRecord.created_at.desc())
        .all()
    )
    return [
        {
            "id": r.id,
            "birth_date": str(r.birth_date),
            "gender": r.gender,
            "mbti_type": r.mbti_type,
            "dominant_key": r.dominant_key,
            "dominant_name": r.dominant_name,
            "created_at": r.created_at.isoformat(),
        }
        for r in records
    ]


@router.get("/records/{record_id}")
def get_record(
    record_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    record = (
        db.query(FiveElementRecord)
        .filter(
            FiveElementRecord.id == record_id,
            FiveElementRecord.user_id == current_user.id,
        )
        .first()
    )
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="记录不存在")
    return {**record.response_json, "record_id": record.id}


@router.delete("/records/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_record(
    record_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    record = (
        db.query(FiveElementRecord)
        .filter(
            FiveElementRecord.id == record_id,
            FiveElementRecord.user_id == current_user.id,
        )
        .first()
    )
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="记录不存在")
    db.delete(record)
    db.commit()
