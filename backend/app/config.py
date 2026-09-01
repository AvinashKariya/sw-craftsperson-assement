import os
from pydantic_settings import BaseSettings
from pydantic import ConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "ACME Salary Management System"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./salary_management.db")
    DEBUG: bool = True

    model_config = ConfigDict(case_sensitive=True)

settings = Settings()
