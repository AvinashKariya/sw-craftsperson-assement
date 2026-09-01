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

# Explicitly allowed CORS origins including Vercel frontend deployments
origins = [
    "https://frontend-opal-two-78uad6m7nu.vercel.app",
    "https://frontend-opal-two-78uad6m7nu.vercel.app/",
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "*"
]

# CORS Middleware setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all routers under /api namespace
app.include_router(employees_router, prefix="/api")
app.include_router(analytics_router, prefix="/api")
app.include_router(exchange_rates_router, prefix="/api")

@app.get("/health")
@app.get("/api/health")
def health_check():
    return {"status": "healthy", "project": settings.PROJECT_NAME}
