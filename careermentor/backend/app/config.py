import os


class Settings:
    database_url: str = os.getenv(
        "DATABASE_URL",
        "sqlite+pysqlite:///./careermentor.db",
    )
    redis_url: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")


settings = Settings()
