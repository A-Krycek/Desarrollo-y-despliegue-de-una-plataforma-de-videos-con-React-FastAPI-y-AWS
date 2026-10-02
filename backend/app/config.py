import os
import warnings
from typing import List
from dotenv import load_dotenv

load_dotenv()

class Settings:
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./video_platform.db")

    AWS_REGION: str = os.getenv("AWS_REGION", "us-east-1")
    AWS_ACCESS_KEY_ID: str = os.getenv("AWS_ACCESS_KEY_ID", "")
    AWS_SECRET_ACCESS_KEY: str = os.getenv("AWS_SECRET_ACCESS_KEY", "")
    S3_BUCKET_VIDEOS: str = os.getenv("S3_BUCKET_VIDEOS", "video-platform-videos-estudiante")
    S3_BUCKET_THUMBNAILS: str = os.getenv("S3_BUCKET_THUMBNAILS", "video-platform-thumbnails-estudiante")

    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "dev_secret_key_video_platform_2026")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

    CORS_ORIGINS: List[str] = [origin.strip() for origin in os.getenv("CORS_ORIGINS", "*").split(",") if origin.strip()]

    MAX_VIDEO_SIZE_MB: int = 100
    MAX_VIDEO_SIZE_BYTES: int = 100 * 1024 * 1024
    ALLOWED_VIDEO_EXTENSIONS: List[str] = [".mp4"]
    ALLOWED_THUMBNAIL_EXTENSIONS: List[str] = [".jpg", ".jpeg", ".png"]

    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))

    def __init__(self):
        if self.ENVIRONMENT == "production":
            if self.JWT_SECRET_KEY == "dev_secret_key_video_platform_2026":
                raise RuntimeError("ERROR DE SEGURIDAD: JWT_SECRET_KEY debe configurarse en entorno de producción.")
            if "*" in self.CORS_ORIGINS:
                warnings.warn("ADVERTENCIA DE SEGURIDAD: CORS_ORIGINS no debería permitir '*' en producción.")

settings = Settings()
