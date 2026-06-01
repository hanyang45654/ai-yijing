from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.daily_sign import DailySignRead, DrawSignRequest, TodaySignResponse
from app.services.daily_sign_service import DailySignService

router = APIRouter(prefix="/daily-signs", tags=["daily-signs"])


@router.get("", response_model=list[DailySignRead])
def list_daily_signs(db: Session = Depends(get_db)) -> list[DailySignRead]:
    return DailySignService(db).list_signs()


@router.get("/today", response_model=TodaySignResponse)
def get_today_sign(
    user_key: str = Query(min_length=1, max_length=80),
    db: Session = Depends(get_db),
) -> TodaySignResponse:
    service = DailySignService(db)
    try:
        _, sign = service.get_or_draw_today_sign(user_key=user_key, draw_date=date.today())
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return TodaySignResponse(draw_date=date.today(), sign=sign)


@router.post("/draw", response_model=TodaySignResponse)
def draw_today_sign(payload: DrawSignRequest, db: Session = Depends(get_db)) -> TodaySignResponse:
    service = DailySignService(db)
    try:
        record, sign = service.get_or_draw_today_sign(
            user_key=payload.user_key,
            draw_date=date.today(),
            question=payload.question,
        )
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return TodaySignResponse(draw_date=record.draw_date, sign=sign)
