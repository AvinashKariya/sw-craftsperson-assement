# ACME Employee Salary Management - Product Requirements Document (PRD)

## 1. Executive Summary & Goal
ACME Corp is a global enterprise with 10,000 employees spread across 8 countries. Previously, compensation data was managed via disparate spreadsheets, making payroll budget tracking, cross-country comp comparison, and pay equity analysis slow and error-prone. 

This product provides a centralized, web-based Employee Salary Management and Analytics platform designed specifically for the **HR Manager**. It enables real-time compensation insights, multi-currency reporting, salary distribution analysis, and pay equity audits across 10,000 employees.

---

## 2. Target User Persona
- **Persona**: HR Manager (Single authenticated organizational user)
- **Needs**:
  - Clear high-level visibility into global organization payroll spending.
  - Ability to normalize local native salaries into a single reporting currency (USD) for cross-country parity.
  - Fast search, filtering, and pagination over 10,000 employee records without UI latency.
  - Identification of compensation outliers and gender pay equity gaps.
  - Quick inline salary updates and employee status management.

---

## 3. Core Scope & Key Features

### 3.1 Global Executive Dashboard
- **Total Payroll Budget**: Aggregated total in normalized base currency (USD) and breakdown by native currencies.
- **Headcount Metrics**: Total active employees, country counts, and departmental distribution.
- **Salary Percentiles**: Statistical breakdown across the organization (p10, p25, median p50, p75, p90, min, max, average).

### 3.2 Employee Directory (10,000 Employees)
- **High-Performance Data Grid**: Server-side pagination (10, 25, 50, 100 per page), sorting by name, department, salary, joining date.
- **Multi-Parametric Filtering**: Instant search by Name/Email/ID, filter by Country, Department, Employment Status (Active/Inactive), Currency, and Salary Range.
- **CRUD Operations**: Add new employee, edit employee details/salary, soft delete (deactivate) employee.
- **CSV Export**: Export filtered employee lists for offline reporting.

### 3.3 Multi-Currency Normalization & Exchange Rate Management
- **Native Local Storage**: Each employee's compensation is stored in their native currency (USD, INR, GBP, EUR, JPY, CAD, AUD, SGD).
- **Normalized USD View**: Org-wide reporting dynamically converts native salaries to USD via a configurable exchange-rate dataset.
- **Exchange Rate Configuration**: Interactive UI to view and adjust mock currency conversion rates.

### 3.4 Pay Parity & Compensation Insights
- **Gender Pay Equity Analysis**: Compare average and median salaries between genders across departments and job titles.
- **Outlier Detection**: Automated identification of employees paid outside ±2 standard deviations of their department/role median.

---

## 4. Explicit Non-Goals & Omissions (MVP Trade-offs)

1. **Authentication & Multi-Tenant RBAC**:
   - *Omission*: User login, password hashing, and role-based permissions are excluded.
   - *Rationale*: Confirmed by product guidance. Focus is on core salary management and analytics for the HR Manager persona. Auth/SSO is noted for post-MVP production deployment.
2. **Historical Salary Revision Audit Log**:
   - *Omission*: Tracking historical salary changes over time is excluded; only the current active salary is maintained.
   - *Rationale*: Out of MVP scope as per clarifying guidance.
3. **In-App AI Chatbot Prompt Interface**:
   - *Omission*: Embedded LLM natural language querying is excluded.
   - *Rationale*: AI tool usage was focused on accelerating development, TDD, and software craftsmanship. Pre-calculated dashboard visualizations cover all operational requirements deterministically.

---

## 5. Non-Functional Requirements & Performance SLAs
- **Dataset Size**: 10,000 realistic employees seeded deterministically.
- **API Latency**: Aggregated analytics and paginated search queries must respond in `< 50ms`.
- **Seeding Speed**: Database seed script must populate 10,000 employees in `< 2 seconds`.
- **Code Quality & Testing**: > 90% backend test coverage using Pytest; clean modular architecture adhering to TDD.
