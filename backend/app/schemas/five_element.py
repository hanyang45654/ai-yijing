from datetime import date
from typing import Literal

from pydantic import BaseModel

Gender = Literal["male", "female", "other", "unspecified"]
ElementKey = Literal["wood", "fire", "earth", "metal", "water"]


class FiveElementAnalyzeRequest(BaseModel):
    birth_date: date
    gender: Gender = "unspecified"


class FiveElementScore(BaseModel):
    key: ElementKey
    name: str
    score: int
    symbol: str


class FiveElementSummaryItem(BaseModel):
    key: ElementKey
    name: str
    score: int


class FiveElementAnalyzeResponse(BaseModel):
    birth_date: date
    gender: Gender
    scores: dict[ElementKey, int]
    elements: list[FiveElementScore]
    dominant_element: FiveElementSummaryItem
    weak_element: FiveElementSummaryItem
    summary: str
    ai_markdown: str
    note: str = "以下内容为传统五行理论角度的文化解读与自我观察，不代表现实预测。"
