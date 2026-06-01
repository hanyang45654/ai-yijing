from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import DailySign
from app.schemas.ai_interpretation import InterpretSignRequest, InterpretSignResponse
from app.services.deepseek_service import (
    DeepSeekConfigError,
    DeepSeekService,
    DeepSeekServiceError,
)

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/interpret-sign", response_model=InterpretSignResponse)
def interpret_sign(
    payload: InterpretSignRequest,
    db: Session = Depends(get_db),
) -> InterpretSignResponse:
    sign = db.get(DailySign, payload.sign_id)
    if sign is None:
        raise HTTPException(status_code=404, detail="签文不存在")

    try:
        markdown = DeepSeekService().interpret_sign(sign)
    except DeepSeekConfigError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except DeepSeekServiceError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    return InterpretSignResponse(sign_id=sign.id, markdown=markdown)
