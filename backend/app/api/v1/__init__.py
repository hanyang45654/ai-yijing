from fastapi import APIRouter

from app.api.v1.admin import router as admin_router
from app.api.v1.ai_interpretations import router as ai_interpretations_router
from app.api.v1.auth import router as auth_router
from app.api.v1.daily_signs import router as daily_signs_router
from app.api.v1.five_element_records import router as five_element_records_router
from app.api.v1.five_elements import router as five_elements_router

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth_router)
api_router.include_router(admin_router)
api_router.include_router(ai_interpretations_router)
api_router.include_router(daily_signs_router)
api_router.include_router(five_element_records_router)
api_router.include_router(five_elements_router)
