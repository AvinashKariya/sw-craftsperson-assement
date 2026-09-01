import time
import random
from datetime import date, timedelta
from faker import Faker
from sqlalchemy.orm import Session
from app.database import engine, Base, SessionLocal, ensure_database_exists
from app.models import Employee, ExchangeRate
from app.services.salary_service import DEFAULT_EXCHANGE_RATES, convert_to_usd

COUNTRY_CONFIG = [
    {"country": "United States", "currency": "USD", "min": 50000, "max": 250000, "weight": 25},
    {"country": "India", "currency": "INR", "min": 600000, "max": 4500000, "weight": 25},
    {"country": "United Kingdom", "currency": "GBP", "min": 30000, "max": 140000, "weight": 10},
    {"country": "Germany", "currency": "EUR", "min": 35000, "max": 150000, "weight": 10},
    {"country": "Japan", "currency": "JPY", "min": 4000000, "max": 20000000, "weight": 10},
    {"country": "Canada", "currency": "CAD", "min": 55000, "max": 220000, "weight": 8},
    {"country": "Australia", "currency": "AUD", "min": 60000, "max": 230000, "weight": 7},
    {"country": "Singapore", "currency": "SGD", "min": 50000, "max": 210000, "weight": 5},
]

DEPARTMENTS = [
    "Engineering", "Product", "Sales", "Marketing",
    "Human Resources", "Finance", "Legal", "Customer Support"
]

TITLES_BY_DEPT = {
    "Engineering": ["Software Engineer", "Senior Engineer", "Staff Engineer", "Engineering Manager", "VP of Engineering"],
    "Product": ["Product Specialist", "Product Manager", "Senior PM", "Director of Product"],
    "Sales": ["Sales Exec", "Account Executive", "Senior AE", "Sales Director"],
    "Marketing": ["Marketing Analyst", "Growth Specialist", "Marketing Lead", "CMO"],
    "Human Resources": ["HR Associate", "HR Business Partner", "Head of People"],
    "Finance": ["Financial Analyst", "Senior Accountant", "Finance Manager", "CFO"],
    "Legal": ["Legal Counsel", "Senior Counsel", "General Counsel"],
    "Customer Support": ["Support Agent", "Support Lead", "Customer Success Manager"]
}

GENDERS = ["Male", "Female", "Non-Binary"]
GENDER_WEIGHTS = [48, 48, 4]
STATUSES = ["Active", "Inactive", "On Leave"]
STATUS_WEIGHTS = [92, 5, 3]

def seed_database(db: Session, num_employees: int = 10000):
    """Seed the PostgreSQL database with exchange rates and N employees deterministically."""
    print(f"Starting seed process for {num_employees} employees...")
    start_time = time.time()

    bind_engine = db.get_bind()
    Base.metadata.drop_all(bind=bind_engine)
    Base.metadata.create_all(bind=bind_engine)

    # 1. Seed Exchange Rates
    rates_objects = [
        ExchangeRate(currency=curr, rate_to_usd=rate)
        for curr, rate in DEFAULT_EXCHANGE_RATES.items()
    ]
    db.add_all(rates_objects)
    db.commit()

    # 2. Seed Employees
    fake = Faker()
    Faker.seed(42)
    random.seed(42)

    country_pool = []
    for cfg in COUNTRY_CONFIG:
        country_pool.extend([cfg] * cfg["weight"])

    start_date = date(2018, 1, 1)
    date_range_days = (date.today() - start_date).days

    employees_data = []
    for i in range(1, num_employees + 1):
        country_info = random.choice(country_pool)
        dept = random.choice(DEPARTMENTS)
        title = random.choice(TITLES_BY_DEPT[dept])
        gender = random.choices(GENDERS, weights=GENDER_WEIGHTS)[0]
        status = random.choices(STATUSES, weights=STATUS_WEIGHTS)[0]

        sal_local = float(random.randint(country_info["min"], country_info["max"]))
        sal_usd = convert_to_usd(sal_local, country_info["currency"], DEFAULT_EXCHANGE_RATES)

        joining = start_date + timedelta(days=random.randint(0, date_range_days))
        
        emp_dict = {
            "employee_code": f"EMP-{i:05d}",
            "first_name": fake.first_name(),
            "last_name": fake.last_name(),
            "email": f"emp{i:05d}@acme.com",
            "gender": gender,
            "department": dept,
            "job_title": title,
            "country": country_info["country"],
            "currency": country_info["currency"],
            "salary_local": sal_local,
            "salary_usd": sal_usd,
            "employment_status": status,
            "joining_date": joining,
        }
        employees_data.append(emp_dict)

    db.bulk_insert_mappings(Employee, employees_data)
    db.commit()

    elapsed = time.time() - start_time
    print(f"Successfully seeded {num_employees} employees into PostgreSQL in {elapsed:.3f} seconds!")

if __name__ == "__main__":
    ensure_database_exists()
    db = SessionLocal()
    try:
        seed_database(db, 10000)
    finally:
        db.close()
