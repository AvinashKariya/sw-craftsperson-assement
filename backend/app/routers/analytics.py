from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models import Employee
from app.schemas import AnalyticsSummaryResponse, DepartmentBreakdown, CountryBreakdown, PayEquityResponse
from app.services.salary_service import (
    calculate_percentiles,
    calculate_gender_pay_equity,
    detect_salary_outliers
)

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("/summary", response_model=AnalyticsSummaryResponse)
def get_analytics_summary(db: Session = Depends(get_db)):
    active_employees = db.query(Employee).filter(Employee.employment_status == "Active").all()
    total_count = db.query(Employee).count()
    active_count = len(active_employees)

    salaries_usd = [e.salary_usd for e in active_employees]
    stats = calculate_percentiles(salaries_usd)

    countries_count = db.query(func.count(func.distinct(Employee.country))).scalar() or 0
    depts_count = db.query(func.count(func.distinct(Employee.department))).scalar() or 0

    total_payroll = round(sum(salaries_usd), 2)
    avg_salary = stats["average"]
    median_salary = stats["median"]

    return AnalyticsSummaryResponse(
        total_employees=total_count,
        active_employees=active_count,
        total_payroll_usd=total_payroll,
        average_salary_usd=avg_salary,
        median_salary_usd=median_salary,
        percentiles=stats,
        countries_count=countries_count,
        departments_count=depts_count
    )

@router.get("/department", response_model=List[DepartmentBreakdown])
def get_department_breakdown(db: Session = Depends(get_db)):
    active_employees = db.query(Employee).filter(Employee.employment_status == "Active").all()
    dept_map: Dict[str, List[float]] = {}
    for emp in active_employees:
        dept_map.setdefault(emp.department, []).append(emp.salary_usd)

    res = []
    for dept, sals in dept_map.items():
        stats = calculate_percentiles(sals)
        res.append(DepartmentBreakdown(
            department=dept,
            employee_count=len(sals),
            total_payroll_usd=round(sum(sals), 2),
            average_salary_usd=stats["average"],
            median_salary_usd=stats["median"]
        ))
    res.sort(key=lambda x: x.total_payroll_usd, reverse=True)
    return res

@router.get("/country", response_model=List[CountryBreakdown])
def get_country_breakdown(db: Session = Depends(get_db)):
    active_employees = db.query(Employee).filter(Employee.employment_status == "Active").all()
    country_map: Dict[str, Dict[str, Any]] = {}
    for emp in active_employees:
        c = emp.country
        if c not in country_map:
            country_map[c] = {
                "country": c,
                "currency": emp.currency,
                "salaries_local": [],
                "salaries_usd": []
            }
        country_map[c]["salaries_local"].append(emp.salary_local)
        country_map[c]["salaries_usd"].append(emp.salary_usd)

    res = []
    for c, data in country_map.items():
        s_usd = data["salaries_usd"]
        s_loc = data["salaries_local"]
        stats = calculate_percentiles(s_usd)
        res.append(CountryBreakdown(
            country=c,
            currency=data["currency"],
            employee_count=len(s_usd),
            total_payroll_local=round(sum(s_loc), 2),
            total_payroll_usd=round(sum(s_usd), 2),
            average_salary_usd=stats["average"]
        ))
    res.sort(key=lambda x: x.total_payroll_usd, reverse=True)
    return res

@router.get("/pay-equity", response_model=PayEquityResponse)
def get_pay_equity_report(db: Session = Depends(get_db)):
    active_employees = db.query(Employee).filter(Employee.employment_status == "Active").all()
    emp_dicts = [
        {"gender": e.gender, "salary_usd": e.salary_usd, "department": e.department}
        for e in active_employees
    ]
    overall_equity = calculate_gender_pay_equity(emp_dicts)

    # Department-wise breakdown
    dept_map: Dict[str, List[Dict[str, Any]]] = {}
    for ed in emp_dicts:
        dept_map.setdefault(ed["department"], []).append(ed)

    dept_gaps = []
    for dept, emps in dept_map.items():
        eq = calculate_gender_pay_equity(emps)
        dept_gaps.append({
            "department": dept,
            "gender_pay_gap_percentage": eq["gender_pay_gap_percentage"],
            "male_average_usd": eq.get("Male", {}).get("average", 0.0),
            "female_average_usd": eq.get("Female", {}).get("average", 0.0),
        })

    dept_gaps.sort(key=lambda x: x["gender_pay_gap_percentage"], reverse=True)

    return PayEquityResponse(
        by_gender=overall_equity,
        gender_pay_gap_percentage=overall_equity["gender_pay_gap_percentage"],
        department_gaps=dept_gaps
    )

@router.get("/outliers", response_model=List[Dict[str, Any]])
def get_salary_outliers(db: Session = Depends(get_db)):
    active_employees = db.query(Employee).filter(Employee.employment_status == "Active").all()
    emp_dicts = [
        {
            "id": e.id,
            "employee_code": e.employee_code,
            "name": f"{e.first_name} {e.last_name}",
            "department": e.department,
            "job_title": e.job_title,
            "country": e.country,
            "salary_usd": e.salary_usd,
            "salary_local": e.salary_local,
            "currency": e.currency
        }
        for e in active_employees
    ]
    return detect_salary_outliers(emp_dicts)
