import pytest
from app.services.salary_service import (
    convert_to_usd,
    convert_from_usd,
    calculate_percentiles,
    calculate_gender_pay_equity,
    detect_salary_outliers
)

def test_convert_to_usd():
    rates = {"USD": 1.0, "INR": 83.0, "EUR": 0.92, "GBP": 0.79}
    assert convert_to_usd(83000.0, "INR", rates) == pytest.approx(1000.0)
    assert convert_to_usd(100.0, "USD", rates) == 100.0
    assert convert_to_usd(92.0, "EUR", rates) == pytest.approx(100.0)

def test_convert_from_usd():
    rates = {"USD": 1.0, "INR": 83.0, "EUR": 0.92}
    assert convert_from_usd(1000.0, "INR", rates) == pytest.approx(83000.0)
    assert convert_from_usd(100.0, "USD", rates) == 100.0

def test_calculate_percentiles_empty():
    res = calculate_percentiles([])
    assert res["count"] == 0
    assert res["average"] == 0.0
    assert res["median"] == 0.0

def test_calculate_percentiles_normal_dataset():
    salaries = [50000, 60000, 70000, 80000, 90000, 100000, 150000]
    res = calculate_percentiles(salaries)
    assert res["count"] == 7
    assert res["min"] == 50000.0
    assert res["max"] == 150000.0
    assert res["median"] == 80000.0
    assert res["average"] == pytest.approx(85714.28, rel=1e-3)
    assert res["p25"] <= res["median"] <= res["p75"]

def test_calculate_gender_pay_equity():
    employees = [
        {"gender": "Male", "salary_usd": 100000.0, "department": "Engineering"},
        {"gender": "Male", "salary_usd": 120000.0, "department": "Engineering"},
        {"gender": "Female", "salary_usd": 110000.0, "department": "Engineering"},
        {"gender": "Female", "salary_usd": 90000.0, "department": "Engineering"},
    ]
    res = calculate_gender_pay_equity(employees)
    assert res["Male"]["count"] == 2
    assert res["Male"]["average"] == 110000.0
    assert res["Female"]["count"] == 2
    assert res["Female"]["average"] == 100000.0
    assert res["gender_pay_gap_percentage"] == pytest.approx(9.09, rel=1e-2)

def test_detect_salary_outliers():
    # Engineering department with standard salaries around 100k, plus one 300k extreme outlier
    employees = [
        {"id": 1, "name": "Alice", "department": "Engineering", "salary_usd": 100000.0},
        {"id": 2, "name": "Bob", "department": "Engineering", "salary_usd": 102000.0},
        {"id": 3, "name": "Charlie", "department": "Engineering", "salary_usd": 98000.0},
        {"id": 4, "name": "David", "department": "Engineering", "salary_usd": 101000.0},
        {"id": 5, "name": "Eve", "department": "Engineering", "salary_usd": 99000.0},
        {"id": 6, "name": "Extreme Outlier", "department": "Engineering", "salary_usd": 350000.0},
    ]
    outliers = detect_salary_outliers(employees)
    assert len(outliers) == 1
    assert outliers[0]["id"] == 6
    assert outliers[0]["reason"] in ["HIGH_OUTLIER", "LOW_OUTLIER"]
