from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Float, Date, DateTime, Index
from app.database import Base

class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    employee_code = Column(String(20), unique=True, index=True, nullable=False)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    gender = Column(String(20), index=True, nullable=False)
    department = Column(String(50), index=True, nullable=False)
    job_title = Column(String(50), index=True, nullable=False)
    country = Column(String(50), index=True, nullable=False)
    currency = Column(String(3), index=True, nullable=False)
    salary_local = Column(Float, nullable=False)
    salary_usd = Column(Float, index=True, nullable=False)
    employment_status = Column(String(20), index=True, default="Active")
    joining_date = Column(Date, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        Index("idx_country_dept", "country", "department"),
        Index("idx_dept_gender", "department", "gender"),
        Index("idx_status_usd", "employment_status", "salary_usd"),
        Index("idx_search_text", "first_name", "last_name", "email"),
    )

class ExchangeRate(Base):
    __tablename__ = "exchange_rates"

    currency = Column(String(3), primary_key=True, index=True)
    rate_to_usd = Column(Float, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
