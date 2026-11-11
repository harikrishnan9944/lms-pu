import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    PROJECT_NAME: str = "LMS Backend API"
    VERSION: str = "1.0.0"
    
    # Database setting - defaults to local SQLite, or uses postgresql DATABASE_URL
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./lms.db")
    
    # JWT Authentication settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "lms_pu_super_secret_jwt_key_2026_change_in_production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 8  # 8 hours

    # CORS settings
    CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "*"
    ]

settings = Settings()

