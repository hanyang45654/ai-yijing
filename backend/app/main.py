import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import api_router

ALLOWED_ORIGINS = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173",
).split(",")

app = FastAPI(title="易境 API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.on_event("startup")
def on_startup() -> None:
    from app.db.session import Base, SessionLocal, engine
    Base.metadata.create_all(bind=engine)

    from passlib.context import CryptContext

    from app.models.user import User

    db = SessionLocal()
    try:
        if not db.query(User).first():
            pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")
            admin = User(
                username="admin",
                password_hash=pwd.hash("admin123"),
                role="admin",
            )
            db.add(admin)
            db.commit()

        # Auto-seed daily signs (idempotent)
        from app.models.daily_sign import DailySign
        if not db.query(DailySign).first():
            from app.core.seed_data import DAILY_SIGNS
            for item in DAILY_SIGNS:
                db.add(DailySign(**item))
            db.commit()
    finally:
        db.close()


@app.get("/api/v1/shared/result/{record_id}")
def get_shared_result(record_id: int) -> dict:
    from app.db.session import SessionLocal
    from app.models.five_element_record import FiveElementRecord

    db = SessionLocal()
    try:
        record = db.query(FiveElementRecord).filter(FiveElementRecord.id == record_id).first()
        if not record:
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="记录不存在")
        return {**record.response_json, "record_id": record.id}
    finally:
        db.close()


@app.get("/health")
def health_check() -> dict[str, str]:
    try:
        from sqlalchemy import text
        from app.db.session import SessionLocal
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        return {"status": "ok", "database": "connected"}
    except Exception:
        return {"status": "ok", "database": "disconnected"}
