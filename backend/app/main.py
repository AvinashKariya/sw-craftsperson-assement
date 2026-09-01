from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base, ensure_database_exists
from app.routers.employees import router as employees_router
from app.routers.analytics import router as analytics_router
from app.routers.exchange_rates import router as exchange_rates_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        ensure_database_exists()
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"Notice on DB init: {e}")
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="ACME Employee Salary Management & Analytics API",
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

# Explicitly register API routers
app.include_router(employees_router)
app.include_router(analytics_router)
app.include_router(exchange_rates_router)

@app.get("/health")
def health_check():
    return {"status": "healthy", "project": settings.PROJECT_NAME}
