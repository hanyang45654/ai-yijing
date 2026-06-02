from datetime import date
from typing import Literal, Optional

from pydantic import BaseModel

Gender = Literal["male", "female", "other", "unspecified"]
ElementKey = Literal["wood", "fire", "earth", "metal", "water"]
MbtiType = Literal[
    "INTJ", "INTP", "ENTJ", "ENTP",
    "INFJ", "INFP", "ENFJ", "ENFP",
    "ISTJ", "ISFJ", "ESTJ", "ESFJ",
    "ISTP", "ISFP", "ESTP", "ESFP",
]


class FiveElementAnalyzeRequest(BaseModel):
    birth_date: date
    gender: Gender = "unspecified"
    mbti_type: Optional[MbtiType] = None


class FiveElementScore(BaseModel):
    key: ElementKey
    name: str
    score: int
    symbol: str


class FiveElementSummaryItem(BaseModel):
    key: ElementKey
    name: str
    score: int


class PersonalityTag(BaseModel):
    label: str
    combination: str
    explanation: str
    strengths: str
    risks: str
    suggestions: str


class FiveElementAnalyzeResponse(BaseModel):
    birth_date: date
    gender: Gender
    mbti_type: Optional[MbtiType] = None
    scores: dict[ElementKey, int]
    elements: list[FiveElementScore]
    dominant_element: FiveElementSummaryItem
    weak_element: FiveElementSummaryItem
    summary: str
    ai_markdown: str
    fusion_markdown: Optional[str] = None
    personality_tag: Optional[PersonalityTag] = None
    record_id: Optional[int] = None
    note: str = "以下内容为传统五行理论角度的文化解读与自我观察，不代表现实预测。"
