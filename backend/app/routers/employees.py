from math import ceil
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, asc, desc

from app.database import get_db
from app.models import Employee, ExchangeRate
from app.schemas import EmployeeCreate, EmployeeUpdate, EmployeeResponse, PaginatedEmployeeResponse
from app.services.salary_service import convert_to_usd, DEFAULT_EXCHANGE_RATES

router = APIRouter(prefix="/api/employees", tags=["Employees"])

def get_current_rates(db: Session) -> dict:
    rates = db.query(ExchangeRate).all()
    if not rates:
        return DEFAULT_EXCHANGE_RATES
    return {r.currency: r.rate_to_usd for r in rates}

@router.get("", response_model=PaginatedEmployeeResponse)
def list_employees(
    query: Optional[str] = Query(None, description="Search by name, email, or employee code"),
    department: Optional[str] = Query(None),
    country: Optional[str] = Query(None),
    employment_status: Optional[str] = Query(None),
    currency: Optional[str] = Query(None),
    min_salary_usd: Optional[float] = Query(None),
    max_salary_usd: Optional[float] = Query(None),
    sort_by: str = Query("id", pattern="^(id|first_name|last_name|department|country|salary_usd|joining_date)$"),
    sort_order: str = Query("asc", pattern="^(asc|desc)$"),
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    db: Session = Depends(get_db)
):
    q = db.query(Employee)

    if query:
        search_pattern = f"%{query}%"
        q = q.filter(
            or_(
                Employee.first_name.ilike(search_pattern),
                Employee.last_name.ilike(search_pattern),
                Employee.email.ilike(search_pattern),
                Employee.employee_code.ilike(search_pattern),
            )
        )

    if department:
        q = q.filter(Employee.department == department)
    if country:
        q = q.filter(Employee.country == country)
    if employment_status:
        q = q.filter(Employee.employment_status == employment_status)
    if currency:
        q = q.filter(Employee.currency == currency)
    if min_salary_usd is not None:
        q = q.filter(Employee.salary_usd >= min_salary_usd)
    if max_salary_usd is not None:
        q = q.filter(Employee.salary_usd <= max_salary_usd)

    # Sorting
    sort_attr = getattr(Employee, sort_by)
    if sort_order.lower() == "desc":
        q = q.order_by(desc(sort_attr))
    else:
        q = q.order_by(asc(sort_attr))

    total = q.count()
    total_pages = ceil(total / page_size) if total > 0 else 1

    items = q.offset((page - 1) * page_size).limit(page_size).all()

    return PaginatedEmployeeResponse(
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
        items=items
    )

@router.get("/{employee_id}", response_model=EmployeeResponse)
def get_employee(employee_id: int, db: Session = Depends(get_db)):
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
    return emp

@router.post("", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
def create_employee(payload: EmployeeCreate, db: Session = Depends(get_db)):
    existing = db.query(Employee).filter(
        or_(Employee.employee_code == payload.employee_code, Employee.email == payload.email)
    ).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Employee code or email already exists")

    rates = get_current_rates(db)
    sal_usd = convert_to_usd(payload.salary_local, payload.currency, rates)

    emp = Employee(
        **payload.model_dump(),
        salary_usd=sal_usd
    )
    db.add(emp)
    db.commit()
    db.refresh(emp)
    return emp

@router.put("/{employee_id}", response_model=EmployeeResponse)
def update_employee(employee_id: int, payload: EmployeeUpdate, db: Session = Depends(get_db)):
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(emp, key, value)

    rates = get_current_rates(db)
    emp.salary_usd = convert_to_usd(emp.salary_local, emp.currency, rates)

    db.commit()
    db.refresh(emp)
    return emp

@router.delete("/{employee_id}", status_code=status.HTTP_200_OK)
def deactivate_employee(employee_id: int, db: Session = Depends(get_db)):
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")

    emp.employment_status = "Inactive"
    db.commit()
    return {"message": f"Employee {emp.employee_code} successfully deactivated"}
