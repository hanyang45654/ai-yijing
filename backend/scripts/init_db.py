from pathlib import Path
import sys

BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

from sqlalchemy import select

from app.core.seed_data import DAILY_SIGNS
from app.db.session import Base, SessionLocal, engine
from app.models import DailySign


def init_db() -> None:
    Base.metadata.create_all(bind=engine)

    with SessionLocal() as db:
        for item in DAILY_SIGNS:
            sign = db.scalar(select(DailySign).where(DailySign.sign_no == item["sign_no"]))
            if sign is None:
                db.add(DailySign(**item))
                continue

            for key, value in item.items():
                setattr(sign, key, value)

        db.commit()


if __name__ == "__main__":
    init_db()
    print("SQLite database initialized: ai_yijing.db")
