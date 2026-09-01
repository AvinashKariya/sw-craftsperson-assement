import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.config import settings
from app.database import Base
from app.models import Employee, ExchangeRate
from app.seed import seed_database

def test_seed_database_performance_and_integrity():
    try:
        engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
        with engine.connect() as conn:
            pass
    except Exception:
        pytest.skip("PostgreSQL database server is not accessible")

    Session = sessionmaker(bind=engine)
    db = Session()
    try:
        seed_database(db, num_employees=200)
        
        emp_count = db.query(Employee).count()
        assert emp_count == 200
        
        rates_count = db.query(ExchangeRate).count()
        assert rates_count >= 8
        
        first_emp = db.query(Employee).filter_by(employee_code="EMP-00001").first()
        assert first_emp is not None
        assert first_emp.salary_local > 0
        assert first_emp.salary_usd > 0
    finally:
        db.close()
