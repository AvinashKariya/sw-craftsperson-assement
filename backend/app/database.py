import psycopg2
from urllib.parse import urlparse
from sqlalchemy import create_engine, event
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

def ensure_database_exists(db_url: str = None):
    """Ensure the target PostgreSQL database exists. Creates it if missing."""
    if not db_url:
        db_url = settings.DATABASE_URL
    if "postgresql" not in db_url:
        return
    try:
        parsed = urlparse(db_url)
        dbname = parsed.path.lstrip('/')
        if not dbname or dbname == "postgres":
            return

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

        cursor.execute("SELECT 1 FROM pg_database WHERE datname = %s;", (dbname,))
        exists = cursor.fetchone()
        if not exists:
            cursor.execute(f'CREATE DATABASE "{dbname}";')
            print(f"PostgreSQL database '{dbname}' created successfully.")

        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Notice: PostgreSQL verify/create database: {e}")

def create_db_engine():
    """Create database engine with fallback to SQLite if local PostgreSQL is unreachable."""
    if "postgresql" in settings.DATABASE_URL:
        try:
            ensure_database_exists()
            pg_engine = create_engine(
                settings.DATABASE_URL,
                pool_size=10,
                max_overflow=20,
                pool_pre_ping=True,
                echo=False
            )
            with pg_engine.connect() as conn:
                pass
            print("Connected to PostgreSQL database successfully.")
            return pg_engine
        except Exception as err:
            print(f"PostgreSQL unreachable ({err}). Using SQLite fallback for local execution.")

    # SQLite fallback engine
    sqlite_url = "sqlite:///./salary_management.db"
    sqlite_engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})
    
    @event.listens_for(sqlite_engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL;")
        cursor.execute("PRAGMA synchronous=NORMAL;")
        cursor.close()

    return sqlite_engine

engine = create_db_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
