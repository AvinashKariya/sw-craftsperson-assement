import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "ACME Salary Management System"
    DEBUG: bool = True
    PORT: int = 8000
    HOST: str = "0.0.0.0"

    # Postgres parameters
    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    DB_USER: str = "postgres"
    DB_PASSWORD: str = "postgres"
    DB_NAME: str = "acme_salary"

    # Full Database URL
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/acme_salary"
    TEST_DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/acme_salary_test"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
