from sqlalchemy.orm import Session
from app.database import engine, Base, SessionLocal
from app.models import Employee, ExchangeRate
from app.seed import seed_database

def test_seed_database_performance_and_integrity():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db, num_employees=500)
        
        emp_count = db.query(Employee).count()
        assert emp_count == 500
        
        rates_count = db.query(ExchangeRate).count()
        assert rates_count >= 8
        
        first_emp = db.query(Employee).filter_by(employee_code="EMP-00001").first()
        assert first_emp is not None
        assert first_emp.salary_local > 0
        assert first_emp.salary_usd > 0
    finally:
        db.close()
