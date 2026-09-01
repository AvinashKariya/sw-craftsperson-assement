import psycopg2
from urllib.parse import urlparse
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

def ensure_database_exists(db_url: str = None):
    """Ensure the target PostgreSQL database exists. Creates it if missing."""
    if not db_url:
        db_url = settings.DATABASE_URL
    try:
        parsed = urlparse(db_url)
        dbname = parsed.path.lstrip('/')
        if not dbname or dbname == "postgres":
            return

        # Connect to default 'postgres' system database
        user = parsed.username or "postgres"
        password = parsed.password or "postgres"
        host = parsed.hostname or "localhost"
        port = parsed.port or 5432

        conn = psycopg2.connect(
            dbname="postgres",
            user=user,
            password=password,
            host=host,
            port=port
        )
        conn.autocommit = True
        cursor = conn.cursor()

        # Check if database exists
        cursor.execute("SELECT 1 FROM pg_database WHERE datname = %s;", (dbname,))
        exists = cursor.fetchone()
        if not exists:
            cursor.execute(f'CREATE DATABASE "{dbname}";')
            print(f"PostgreSQL database '{dbname}' created successfully.")

        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Warning: could not verify/create database: {e}")

# Pure PostgreSQL Engine Setup
engine = create_engine(
    settings.DATABASE_URL,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
