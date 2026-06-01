import os
from collections.abc import Generator
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

DATA_DIR = Path(os.getenv("DATA_DIR", Path(__file__).resolve().parents[3]))
DATA_DIR.mkdir(parents=True, exist_ok=True)
DATABASE_PATH = DATA_DIR / "ai_yijing.db"
DATABASE_URL = f"sqlite:///{DATABASE_PATH.as_posix()}"


class Base(DeclarativeBase):
    pass


engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    pool_pre_ping=True,
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
