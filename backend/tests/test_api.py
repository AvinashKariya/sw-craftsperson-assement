import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

from app.main import app
from app.database import Base, get_db
from app.seed import seed_database

# In-memory SQLite DB for fast deterministic API integration tests
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///:memory:"

test_engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

@pytest.fixture(scope="module", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=test_engine)
    db = TestingSessionLocal()
    try:
        seed_database(db, num_employees=100)
    finally:
        db.close()
    yield
    Base.metadata.drop_all(bind=test_engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_list_employees_pagination():
    response = client.get("/api/employees?page=1&page_size=10")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 100
    assert len(data["items"]) == 10

def test_list_employees_search_filter():
    response = client.get("/api/employees?department=Engineering")
    assert response.status_code == 200
    data = response.json()
    for item in data["items"]:
        assert item["department"] == "Engineering"

def test_create_and_get_employee():
    payload = {
        "employee_code": "EMP-TEST01",
        "first_name": "John",
        "last_name": "Doe",
        "email": "john.doe.test@acme.com",
        "gender": "Male",
        "department": "Engineering",
        "job_title": "Software Engineer",
        "country": "United States",
        "currency": "USD",
        "salary_local": 120000.0,
        "employment_status": "Active",
        "joining_date": "2024-01-15"
    }
    create_res = client.post("/api/employees", json=payload)
    assert create_res.status_code == 201
    created_data = create_res.json()
    assert created_data["employee_code"] == "EMP-TEST01"
    assert created_data["salary_usd"] == 120000.0

    emp_id = created_data["id"]
    get_res = client.get(f"/api/employees/{emp_id}")
    assert get_res.status_code == 200
    assert get_res.json()["email"] == "john.doe.test@acme.com"

def test_update_employee_salary():
    update_res = client.put("/api/employees/1", json={"salary_local": 150000.0})
    assert update_res.status_code == 200
    assert update_res.json()["salary_local"] == 150000.0

def test_deactivate_employee():
    del_res = client.delete("/api/employees/1")
    assert del_res.status_code == 200
    get_res = client.get("/api/employees/1")
    assert get_res.json()["employment_status"] == "Inactive"

def test_analytics_summary():
    response = client.get("/api/analytics/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["total_employees"] >= 100
    assert data["total_payroll_usd"] > 0
    assert "median" in data["percentiles"]

def test_analytics_department_breakdown():
    response = client.get("/api/analytics/department")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0

def test_analytics_country_breakdown():
    response = client.get("/api/analytics/country")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0

def test_exchange_rates():
    get_res = client.get("/api/exchange-rates")
    assert get_res.status_code == 200
    rates = get_res.json()
    assert len(rates) >= 8

    put_res = client.put("/api/exchange-rates/INR?rate_to_usd=85.0")
    assert put_res.status_code == 200
    assert put_res.json()["rate_to_usd"] == 85.0
