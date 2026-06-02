from fastapi import APIRouter, Depends

from app.api.v1.deps import admin_only

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/health")
def admin_health(_admin=Depends(admin_only)) -> dict[str, str]:
    return {"status": "ok", "message": "管理员权限验证通过"}
