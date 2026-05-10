from pydantic_settings import BaseSettings
from pydantic import field_validator


class Settings(BaseSettings):
    APP_ENV: str = "development"
    SECRET_KEY: str

    JWT_PRIVATE_KEY_PATH: str
    JWT_PUBLIC_KEY_PATH: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    RESET_TOKEN_EXPIRE_MINUTES: int = 15
    OTP_EXPIRE_MINUTES: int = 10

    DATABASE_URL: str
    REDIS_URL: str

    ALLOWED_ORIGINS: str = "http://localhost:3000"

    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE_MB: int = 5

    # Gmail SMTP
    GMAIL_USER: str | None = None
    GMAIL_APP_PASSWORD: str | None = None

    def get_allowed_origins(self) -> list[str]:
        """Parse ALLOWED_ORIGINS string into list."""
        if not self.ALLOWED_ORIGINS:
            return ["http://localhost:3000"]
        return [s.strip() for s in self.ALLOWED_ORIGINS.split(",") if s.strip()]

    class Config:
        env_file = ".env"


settings = Settings()
