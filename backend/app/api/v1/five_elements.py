from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.v1.deps import get_current_user
from app.db.session import get_db
from app.models.five_element_record import FiveElementRecord
from app.models.user import User
from app.schemas.five_element import (
    FiveElementAnalyzeRequest,
    FiveElementAnalyzeResponse,
    PersonalityTag,
)
from app.services.deepseek_service import (
    DeepSeekConfigError,
    DeepSeekService,
    DeepSeekServiceError,
)
from app.services.five_element_service import FiveElementService
from app.services.tag_library import get_combination, get_personality_label

router = APIRouter(prefix="/five-elements", tags=["five-elements"])


@router.post("/analyze")
def analyze_five_elements(
    payload: FiveElementAnalyzeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> FiveElementAnalyzeResponse:
    analysis = FiveElementService().analyze(payload.birth_date, payload.gender, payload.mbti_type)
    analysis_data = analysis.model_dump(mode="json")

    try:
        analysis.ai_markdown = DeepSeekService().interpret_five_elements(analysis_data)
        if payload.mbti_type:
            fusion_result = DeepSeekService().interpret_five_elements_mbti(
                analysis_data, payload.mbti_type
            )
            analysis.fusion_markdown = fusion_result.get("fusion_markdown")
            if fusion_result.get("personality_tag"):
                tag = PersonalityTag(**fusion_result["personality_tag"])
                dominant_key = analysis.dominant_element.key
                tag.label = get_personality_label(dominant_key, payload.mbti_type)
                tag.combination = get_combination(dominant_key, payload.mbti_type)
                analysis.personality_tag = tag
    except DeepSeekConfigError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except DeepSeekServiceError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    # Auto-save record
    record = FiveElementRecord(
        user_id=current_user.id,
        birth_date=payload.birth_date,
        gender=payload.gender,
        mbti_type=payload.mbti_type,
        dominant_key=analysis.dominant_element.key,
        dominant_name=analysis.dominant_element.name,
        response_json=analysis.model_dump(mode="json"),
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    if record.id is not None:
        analysis.record_id = record.id
    return analysis
