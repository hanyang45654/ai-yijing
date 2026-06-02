import os
from pathlib import Path

from dotenv import load_dotenv

ROOT_DIR = Path(__file__).resolve().parents[3]
BACKEND_DIR = Path(__file__).resolve().parents[2]

load_dotenv(ROOT_DIR / ".env")
load_dotenv(BACKEND_DIR / ".env")


def normalize_chat_completions_url(url: str) -> str:
    normalized_url = url.rstrip("/")
    if normalized_url.endswith("/chat/completions"):
        return normalized_url
    return f"{normalized_url}/chat/completions"


class Settings:
    deepseek_api_key: str = os.getenv("DEEPSEEK_API_KEY", "")
    deepseek_api_url: str = normalize_chat_completions_url(
        os.getenv(
            "DEEPSEEK_API_URL",
            "https://api.deepseek.com",
        )
    )
    deepseek_model: str = os.getenv("DEEPSEEK_MODEL", "deepseek-chat")
    secret_key: str = os.getenv("JWT_SECRET", "yi-jing-dev-secret-change-in-production")
    algorithm: str = "HS256"
    access_token_expire_minutes: int = int(
        os.getenv("JWT_EXPIRE_MINUTES", "1440")
    )


settings = Settings()
