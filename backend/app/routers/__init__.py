from app.routers.employees import router as employees_router
from app.routers.analytics import router as analytics_router
from app.routers.exchange_rates import router as exchange_rates_router

__all__ = ["employees_router", "analytics_router", "exchange_rates_router"]
