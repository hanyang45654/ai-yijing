import logging

from fastapi import APIRouter, Depends
from sqlalchemy import select

from app.api.v1.deps import admin_only
from app.core.seed_data import DAILY_SIGNS
from app.db.session import get_db
from app.models.daily_sign import DailySign

logger = logging.getLogger("uvicorn")

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/health")
def admin_health(_admin=Depends(admin_only)) -> dict[str, str]:
    return {"status": "ok", "message": "管理员权限验证通过"}


@router.post("/seed-daily-signs")
def seed_daily_signs(_admin=Depends(admin_only)) -> dict:
    from app.db.session import SessionLocal
    db = SessionLocal()
    try:
        before = db.query(DailySign).count()
        seeded = 0
        updated = 0
        for item in DAILY_SIGNS:
            existing = db.scalar(
                select(DailySign).where(DailySign.sign_no == item["sign_no"])
            )
            if existing is None:
                db.add(DailySign(**item))
                seeded += 1
            else:
                for key, value in item.items():
                    setattr(existing, key, value)
                updated += 1
        db.commit()
        after = db.query(DailySign).count()
        logger.info(
            "Admin re-seed: before=%d, new=%d, updated=%d, after=%d",
            before, seeded, updated, after,
        )
        return {
            "status": "ok",
            "before": before,
            "seeded": seeded,
            "updated": updated,
            "after": after,
        }
    except Exception:
        db.rollback()
        logger.exception("Admin re-seed failed")
        return {"status": "error", "message": "Seeding failed, check server logs"}
    finally:
        db.close()
