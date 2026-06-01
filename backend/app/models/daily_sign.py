from datetime import date, datetime

from sqlalchemy import JSON, Date, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class DailySign(Base):
    __tablename__ = "daily_signs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    sign_no: Mapped[int] = mapped_column(Integer, unique=True, index=True)
    title: Mapped[str] = mapped_column(String(80))
    original_text: Mapped[str] = mapped_column(Text)
    plain_explanation: Mapped[str] = mapped_column(Text)
    keywords: Mapped[list[str]] = mapped_column(JSON, default=list)
    cultural_source: Mapped[str] = mapped_column(String(120), default="易经意象")
    inspiration: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )


class UserDailySign(Base):
    __tablename__ = "user_daily_signs"
    __table_args__ = (UniqueConstraint("user_key", "draw_date", name="uq_user_daily_sign_once"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_key: Mapped[str] = mapped_column(String(80), index=True)
    sign_id: Mapped[int] = mapped_column(ForeignKey("daily_signs.id"))
    draw_date: Mapped[date] = mapped_column(Date, index=True)
    question: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
