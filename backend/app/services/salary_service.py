import numpy as np
from typing import List, Dict, Any

DEFAULT_EXCHANGE_RATES = {
    "USD": 1.0,
    "INR": 83.0,
    "EUR": 0.92,
    "GBP": 0.79,
    "JPY": 155.0,
    "CAD": 1.36,
    "AUD": 1.52,
    "SGD": 1.35
}

def convert_to_usd(amount: float, currency: str, rates: Dict[str, float] = None) -> float:
    """Convert an amount from a native currency into USD."""
    if rates is None:
        rates = DEFAULT_EXCHANGE_RATES
    rate = rates.get(currency.upper(), 1.0)
    if rate <= 0:
        return amount
    return round(amount / rate, 2)

def convert_from_usd(amount_usd: float, target_currency: str, rates: Dict[str, float] = None) -> float:
    """Convert an amount from USD into a target currency."""
    if rates is None:
        rates = DEFAULT_EXCHANGE_RATES
    rate = rates.get(target_currency.upper(), 1.0)
    return round(amount_usd * rate, 2)

def calculate_percentiles(salaries: List[float]) -> Dict[str, float]:
    """Calculate statistical distribution metrics for a list of USD salaries."""
    if not salaries:
        return {
            "count": 0,
            "min": 0.0,
            "p10": 0.0,
            "p25": 0.0,
            "median": 0.0,
            "p75": 0.0,
            "p90": 0.0,
            "max": 0.0,
            "average": 0.0,
            "std_dev": 0.0
        }
    
    arr = np.array(salaries, dtype=float)
    return {
        "count": len(salaries),
        "min": round(float(np.min(arr)), 2),
        "p10": round(float(np.percentile(arr, 10)), 2),
        "p25": round(float(np.percentile(arr, 25)), 2),
        "median": round(float(np.median(arr)), 2),
        "p75": round(float(np.percentile(arr, 75)), 2),
        "p90": round(float(np.percentile(arr, 90)), 2),
        "max": round(float(np.max(arr)), 2),
        "average": round(float(np.mean(arr)), 2),
        "std_dev": round(float(np.std(arr)), 2)
    }

def calculate_gender_pay_equity(employees: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Calculate gender pay equity metrics and gender pay gap percentage.
    Gap % = ((Male_Avg - Female_Avg) / Male_Avg) * 100
    """
    gender_groups: Dict[str, List[float]] = {}
    for emp in employees:
        gender = emp.get("gender", "Other")
        sal = emp.get("salary_usd", 0.0)
        gender_groups.setdefault(gender, []).append(sal)

    result = {}
    for gender, sals in gender_groups.items():
        arr = np.array(sals, dtype=float) if sals else np.array([0.0])
        result[gender] = {
            "count": len(sals),
            "average": round(float(np.mean(arr)), 2),
            "median": round(float(np.median(arr)), 2),
        }

    male_avg = result.get("Male", {}).get("average", 0.0)
    female_avg = result.get("Female", {}).get("average", 0.0)

    gap = 0.0
    if male_avg > 0:
        gap = round(((male_avg - female_avg) / male_avg) * 100, 2)

    result["gender_pay_gap_percentage"] = gap
    return result

def detect_salary_outliers(employees: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Detect salary outliers in each department (> 2 std_dev or < -2 std_dev from median).
    """
    dept_salaries: Dict[str, List[float]] = {}
    for emp in employees:
        dept = emp.get("department", "General")
        dept_salaries.setdefault(dept, []).append(emp.get("salary_usd", 0.0))

    dept_stats = {}
    for dept, sals in dept_salaries.items():
        if len(sals) >= 3:
            arr = np.array(sals, dtype=float)
            dept_stats[dept] = {
                "median": float(np.median(arr)),
                "std": float(np.std(arr))
            }

    outliers = []
    for emp in employees:
        dept = emp.get("department", "General")
        sal = emp.get("salary_usd", 0.0)
        if dept in dept_stats:
            stats = dept_stats[dept]
            median = stats["median"]
            std = stats["std"]
            if std > 0:
                z_score = (sal - median) / std
                if z_score > 2.0:
                    emp_copy = dict(emp)
                    emp_copy["reason"] = "HIGH_OUTLIER"
                    emp_copy["z_score"] = round(z_score, 2)
                    outliers.append(emp_copy)
                elif z_score < -2.0:
                    emp_copy = dict(emp)
                    emp_copy["reason"] = "LOW_OUTLIER"
                    emp_copy["z_score"] = round(z_score, 2)
                    outliers.append(emp_copy)

    return outliers
