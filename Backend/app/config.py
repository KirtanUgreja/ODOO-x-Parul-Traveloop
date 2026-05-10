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

    ALLOWED_ORIGINS: list[str] = ["http://localhost:3000"]

    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE_MB: int = 5

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def split_origins(cls, v):
        if isinstance(v, str):
            if not v.strip():
                return ["http://localhost:3000"]
            return [s.strip() for s in v.split(",") if s.strip()]
        return v

    class Config:
        env_file = ".env"


settings = Settings()
