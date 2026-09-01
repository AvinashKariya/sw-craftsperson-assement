from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base, ensure_database_exists
from app.routers import employees, analytics, exchange_rates

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure PostgreSQL database exists and tables are initialized
    try:
        ensure_database_exists()
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"Warning on startup DB init: {e}")
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="ACME Employee Salary Management & Analytics API (PostgreSQL)",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(employees.router)
app.include_router(analytics.router)
app.include_router(exchange_rates.router)

@app.get("/health")
def health_check():
    return {"status": "healthy", "project": settings.PROJECT_NAME}
