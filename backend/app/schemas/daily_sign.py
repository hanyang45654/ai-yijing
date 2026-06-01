from datetime import date

from pydantic import BaseModel, Field


class DailySignRead(BaseModel):
    id: int
    sign_no: int
    title: str
    original_text: str
    plain_explanation: str
    keywords: list[str]
    cultural_source: str
    inspiration: str

    model_config = {"from_attributes": True}


class DrawSignRequest(BaseModel):
    user_key: str = Field(min_length=1, max_length=80)
    question: str | None = Field(default=None, max_length=500)


class TodaySignResponse(BaseModel):
    draw_date: date
    sign: DailySignRead
    note: str = "以下内容为传统文化解读与自我启发，不代表现实预测。"
