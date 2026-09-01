# System Architecture & Technical Design

## 1. Overview
The ACME Salary Management System is built using a decoupled, API-first architecture designed for low-latency reporting and seamless data management over 10,000 employee records.

```
+-------------------------------------------------------------+
|                      React 18 + Vite                        |
|   (Dashboard, Employee Grid, Pay Parity, Recharts Visuals)   |
+------------------------------+------------------------------+
                               | REST API (JSON)
                               v
+-------------------------------------------------------------+
|                     FastAPI (Python 3.11)                   |
|   Routers (Employees, Analytics, Rates) | Services | Models |
+------------------------------+------------------------------+
                               | SQLite / SQLAlchemy ORM
                               v
+-------------------------------------------------------------+
|                   SQLite Database (WAL Mode)                |
| Indexed Tables: employees, exchange_rates | 10k Seeded Rows |
+-------------------------------------------------------------+
```

---

## 2. Database Schema & Optimization Strategy

### 2.1 Schema Design (`employees`)
| Column | Type | Constraints / Indexes | Description |
| :--- | :--- | :--- | :--- |
| `id` | Integer | Primary Key, Auto Increment | Unique Employee ID |
| `employee_code` | String(20) | Unique, Indexed | Human readable code (e.g. `EMP-00001`) |
| `first_name` | String(50) | Not Null | First Name |
| `last_name` | String(50) | Not Null | Last Name |
| `email` | String(100) | Unique, Indexed | Email address |
| `gender` | String(20) | Indexed | Male, Female, Non-Binary, Prefer not to say |
| `department` | String(50) | Indexed | Engineering, Sales, Product, HR, Finance, etc. |
| `job_title` | String(50) | Indexed | Software Engineer, Data Scientist, Sales Exec, etc. |
| `country` | String(50) | Indexed | Country of residence (US, IN, UK, DE, JP, CA, AU, SG) |
| `currency` | String(3) | Indexed | ISO currency code (USD, INR, GBP, EUR, JPY, CAD, AUD, SGD) |
| `salary_local` | Float | Not Null | Salary in local native currency |
| `salary_usd` | Float | Indexed | Dynamic/Normalized salary equivalent in USD |
| `employment_status` | String(20) | Indexed | Active, Inactive, On Leave |
| `joining_date` | Date | Not Null | Date employee joined |
| `created_at` | DateTime | Default UTC now | Record timestamp |
| `updated_at` | DateTime | Default UTC now | Modification timestamp |

### 2.2 Composite & Selective Indexes
To guarantee sub-50ms queries across 10,000 rows, composite SQLite indexes are applied:
1. `idx_country_dept`: `(country, department)` — for filtered cross-country comp queries.
2. `idx_dept_gender`: `(department, gender)` — for fast pay equity computations.
3. `idx_status_usd`: `(employment_status, salary_usd)` — for active employee budget aggregations and percentile calculations.
4. `idx_search_text`: `(first_name, last_name, email)` — for debounced name/email search.

### 2.3 SQLite Performance Pragmas
- `PRAGMA journal_mode = WAL;` (Write-Ahead Logging for fast concurrent reads)
- `PRAGMA synchronous = NORMAL;`
- `PRAGMA cache_size = -64000;` (64MB memory cache for instant queries)

---

## 3. Core Business Services & Algorithms

### 3.1 Currency Normalization Service
$$\text{Salary}_{\text{USD}} = \frac{\text{Salary}_{\text{Local}}}{\text{Rate}_{\text{Local\_to\_USD}}}$$

- Exchange rates are loaded from the `exchange_rates` database table.
- Base Currency: **USD** (Rate = 1.0).
- Rates updated dynamically alter USD equivalent reporting without mutating native salaries.

### 3.2 Statistical Percentiles & Percentile Algorithm
Calculates $p_{10}, p_{25}, p_{50} (\text{Median}), p_{75}, p_{90}$, Minimum, Maximum, Mean, and Standard Deviation using NumPy / Python math module over indexed numeric streams.

### 3.3 Outlier Detection Algorithm
An employee is flagged as a compensation outlier if:
$$\text{Salary}_{\text{USD}} > \text{Median}_{\text{Dept}} + 2 \times \sigma_{\text{Dept}} \quad \text{or} \quad \text{Salary}_{\text{USD}} < \text{Median}_{\text{Dept}} - 2 \times \sigma_{\text{Dept}}$$

---

## 4. API Spec Overview

| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `GET /api/employees` | GET | Filtered, sorted, paginated employee list (10,000 records) |
| `GET /api/employees/{id}` | GET | Fetch single employee details |
| `POST /api/employees` | POST | Create new employee |
| `PUT /api/employees/{id}` | PUT | Update employee details or salary |
| `DELETE /api/employees/{id}` | DELETE | Soft-delete / deactivate employee |
| `GET /api/analytics/summary` | GET | Executive KPI summary (Total budget, headcount, percentiles) |
| `GET /api/analytics/department` | GET | Department payroll breakdown & average salaries |
| `GET /api/analytics/country` | GET | Country payroll breakdown (Native vs USD normalized) |
| `GET /api/analytics/pay-equity` | GET | Gender pay gap metrics by department & role level |
| `GET /api/analytics/outliers` | GET | Flagged salary outliers |
| `GET /api/exchange-rates` | GET | List currency conversion rates |
| `PUT /api/exchange-rates/{currency}` | PUT | Update conversion rate for currency |
| `POST /api/seed` | POST | Re-seed database with 10,000 realistic employees |
