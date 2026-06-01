from fastapi import APIRouter, HTTPException

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


@router.post("/analyze", response_model=FiveElementAnalyzeResponse)
def analyze_five_elements(payload: FiveElementAnalyzeRequest) -> FiveElementAnalyzeResponse:
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
                # Override label + combination with deterministic library values
                dominant_key = analysis.dominant_element.key
                tag.label = get_personality_label(dominant_key, payload.mbti_type)
                tag.combination = get_combination(dominant_key, payload.mbti_type)
                analysis.personality_tag = tag
    except DeepSeekConfigError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except DeepSeekServiceError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    return analysis
