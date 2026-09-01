from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import ExchangeRate, Employee
from app.schemas import ExchangeRateSchema
from app.services.salary_service import convert_to_usd

router = APIRouter(prefix="/exchange-rates", tags=["Exchange Rates"])

@router.get("", response_model=List[ExchangeRateSchema])
def list_exchange_rates(db: Session = Depends(get_db)):
    return db.query(ExchangeRate).all()

@router.put("/{currency}", response_model=ExchangeRateSchema)
def update_exchange_rate(currency: str, rate_to_usd: float, db: Session = Depends(get_db)):
    if rate_to_usd <= 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Exchange rate must be > 0")

    curr_upper = currency.upper()
    rate_obj = db.query(ExchangeRate).filter(ExchangeRate.currency == curr_upper).first()
    if not rate_obj:
        rate_obj = ExchangeRate(currency=curr_upper, rate_to_usd=rate_to_usd)
        db.add(rate_obj)
    else:
        rate_obj.rate_to_usd = rate_to_usd

    db.commit()
    db.refresh(rate_obj)

    affected_employees = db.query(Employee).filter(Employee.currency == curr_upper).all()
    for emp in affected_employees:
        emp.salary_usd = convert_to_usd(emp.salary_local, curr_upper, {curr_upper: rate_to_usd})
    db.commit()

    return rate_obj
