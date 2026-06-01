from datetime import date
from random import choice

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.daily_sign import DailySign, UserDailySign


class DailySignService:
    def __init__(self, db: Session):
        self.db = db

    def get_or_draw_today_sign(
        self,
        user_key: str,
        draw_date: date,
        question: str | None = None,
    ) -> tuple[UserDailySign, DailySign]:
        existing = self.db.scalar(
            select(UserDailySign)
            .where(UserDailySign.user_key == user_key)
            .where(UserDailySign.draw_date == draw_date)
        )
        if existing:
            sign = self.db.get(DailySign, existing.sign_id)
            if sign is None:
                raise ValueError("今日签记录关联的签文不存在")
            return existing, sign

        signs = list(self.db.scalars(select(DailySign)))
        if not signs:
            raise ValueError("签文库为空，请先导入示例签文")

        sign = choice(signs)
        record = UserDailySign(
            user_key=user_key,
            sign_id=sign.id,
            draw_date=draw_date,
            question=question,
        )
        self.db.add(record)
        self.db.commit()
        self.db.refresh(record)
        return record, sign

    def list_signs(self) -> list[DailySign]:
        return list(self.db.scalars(select(DailySign).order_by(DailySign.sign_no)))
