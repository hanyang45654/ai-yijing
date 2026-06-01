from fastapi import APIRouter, HTTPException

from app.schemas.five_element import FiveElementAnalyzeRequest, FiveElementAnalyzeResponse
from app.services.deepseek_service import (
    DeepSeekConfigError,
    DeepSeekService,
    DeepSeekServiceError,
)
from app.services.five_element_service import FiveElementService

router = APIRouter(prefix="/five-elements", tags=["five-elements"])


@router.post("/analyze", response_model=FiveElementAnalyzeResponse)
def analyze_five_elements(payload: FiveElementAnalyzeRequest) -> FiveElementAnalyzeResponse:
    analysis = FiveElementService().analyze(payload.birth_date, payload.gender)
    analysis_data = analysis.model_dump(mode="json")

    try:
        analysis.ai_markdown = DeepSeekService().interpret_five_elements(analysis_data)
    except DeepSeekConfigError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except DeepSeekServiceError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    return analysis
