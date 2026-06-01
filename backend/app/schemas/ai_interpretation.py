from pydantic import BaseModel, Field


class InterpretSignRequest(BaseModel):
    sign_id: int = Field(gt=0)


class InterpretSignResponse(BaseModel):
    sign_id: int
    markdown: str
    note: str = "以下内容为传统文化角度的解读与启发，不代表现实预测。"
