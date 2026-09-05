"""
Application Configuration Module
Loads settings via pydantic-settings with environment variable overrides.
"""

from pathlib import Path
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Core runtime settings for RAC Engine.
    Handles credentials, external service endpoints, and mock fallback values.
    """
    # Application & Environment
    APP_NAME: str = "Razorpay In-Chat Agentic Commerce Engine (RAC Engine)"
    APP_ENV: str = "development"
    DEBUG: bool = True
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Base URLs
    BACKEND_URL: str = "http://localhost:8000"
    STREAMLIT_URL: str = "http://localhost:8501"

    # OpenAI / LLM Credentials
    OPENAI_API_KEY: str = "sk-placeholder-openai-key-for-local-dev"
    OPENAI_MODEL: str = "gpt-4o-mini"
    LLM_TEMPERATURE: float = 0.2

    # Razorpay Credentials (Sandbox default fallbacks for testing)
    RAZORPAY_KEY_ID: str = "rzp_test_RAC991204DEMO"
    RAZORPAY_KEY_SECRET: str = "RAC_SecretKey_991204_DemoMode"
    RAZORPAY_WEBHOOK_SECRET: str = "rac_webhook_secret_hmac_2026"
    RAZORPAY_CURRENCY: str = "INR"
    PAYMENT_LINK_EXPIRE_MINUTES: int = 15

    # Redis Session Memory Cache
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_SESSION_TTL_SECONDS: int = 86400  # 24 hours

    # Database & Catalog Paths
    BASE_DIR: Path = Path(__file__).resolve().parent.parent
    CATALOG_JSON_PATH: Path = BASE_DIR / "data" / "catalog.json"
    DATABASE_PATH: Path = BASE_DIR / "rac_commerce.db"
    
    # Callback configuration for Razorpay Payment Links
    PAYMENT_CALLBACK_URL: str = "http://localhost:8501/?payment_status=success"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=True,
    )


settings = Settings()
