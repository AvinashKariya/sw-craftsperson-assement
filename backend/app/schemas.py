from datetime import date, datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict, Field

class EmployeeBase(BaseModel):
    employee_code: str
    first_name: str
    last_name: str
    email: str
    gender: str
    department: str
    job_title: str
    country: str
    currency: str
    salary_local: float = Field(..., gt=0)
    employment_status: str = "Active"
    joining_date: date

class EmployeeCreate(EmployeeBase):
    pass

class EmployeeUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    gender: Optional[str] = None
    department: Optional[str] = None
    job_title: Optional[str] = None
    country: Optional[str] = None
    currency: Optional[str] = None
    salary_local: Optional[float] = Field(None, gt=0)
    employment_status: Optional[str] = None
    joining_date: Optional[date] = None

class EmployeeResponse(EmployeeBase):
    id: int
    salary_usd: float
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class PaginatedEmployeeResponse(BaseModel):
    total: int
    page: int
    page_size: int
    total_pages: int
    items: List[EmployeeResponse]

class ExchangeRateSchema(BaseModel):
    currency: str
    rate_to_usd: float
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class AnalyticsSummaryResponse(BaseModel):
    total_employees: int
    active_employees: int
    total_payroll_usd: float
    average_salary_usd: float
    median_salary_usd: float
    percentiles: Dict[str, float]
    countries_count: int
    departments_count: int

class DepartmentBreakdown(BaseModel):
    department: str
    employee_count: int
    total_payroll_usd: float
    average_salary_usd: float
    median_salary_usd: float

class CountryBreakdown(BaseModel):
    country: str
    currency: str
    employee_count: int
    total_payroll_local: float
    total_payroll_usd: float
    average_salary_usd: float

class PayEquityResponse(BaseModel):
    by_gender: Dict[str, Any]
    gender_pay_gap_percentage: float
    department_gaps: List[Dict[str, Any]]
