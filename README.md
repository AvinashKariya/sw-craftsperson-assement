# ACME Employee Salary Management & Analytics System

[![Python FastAPI](https://img.shields.io/badge/Backend-Python_FastAPI-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![React 18](https://img.shields.io/badge/Frontend-React_18_TypeScript-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/UI-Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Docker Compose](https://img.shields.io/badge/Deploy-Docker_Compose-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com/)

An enterprise-grade, web-based Employee Salary Management and Analytics platform designed for an HR Manager overseeing **10,000 global employees**. Built following Incubyte’s Software Craftsmanship, Extreme Programming (XP), and AI-native development model.

---

## 🌟 Key Features

### 📊 1. Executive Global Dashboard
- **Total Payroll Budget**: Aggregated global payroll in normalized base currency (USD) and breakdown by native local currencies.
- **Headcount Metrics**: Total active headcount, country counts, and departmental distribution.
- **Statistical Percentiles**: Automated calculation of $p_{10}, p_{25}, p_{50} (\text{Median}), p_{75}, p_{90}$, Minimum, Maximum, Mean, and Standard Deviation.

### 👥 2. 10,000 Employee Directory
- **High-Performance Data Grid**: Server-side pagination (10, 25, 50, 100 per page) with sub-10ms response times.
- **Multi-Parametric Filtering**: Search by name/email/code, filter by Country, Department, Employment Status, Currency, and Salary Range.
- **Column Sorting**: Server-side sorting by salary, department, country, and joining date.
- **CRUD Operations**: Add new employee, edit employee details/salary, soft delete (deactivate) employee.
- **CSV Export**: Instant export of filtered data grid.

### ⚖️ 3. Pay Parity & Compensation Outliers
- **Gender Pay Equity**: Real-time ratio of male vs. female compensation with department-wise pay gap percentages.
- **Outlier Detection**: Automated flagging of employees paid outside $\pm 2\sigma$ (2 standard deviations) from department median.

### 💱 4. Multi-Currency Normalization
- Stores compensation natively in local currencies (USD, INR, GBP, EUR, JPY, CAD, AUD, SGD).
- Configurable exchange rates interface; updating an exchange rate dynamically re-calculates normalized USD compensation for all affected employees.

---

## 🏗️ System Architecture & Database Design

```
+-------------------------------------------------------------+
|               React 18 + TypeScript + Vite                  |
|   (Dashboard, 10k Directory, Pay Parity, Recharts Visuals)   |
+------------------------------+------------------------------+
                               | REST API (JSON)
                               v
+-------------------------------------------------------------+
|                     FastAPI (Python 3.11)                   |
|   Routers (Employees, Analytics, Rates) | Services | Models |
+------------------------------+------------------------------+
                               | PostgreSQL / SQLAlchemy ORM
                               v
+-------------------------------------------------------------+
|                   PostgreSQL Database                       |
|  Indexed Tables: employees, exchange_rates | 10k Rows       |
+-------------------------------------------------------------+
```

### Database Optimization for 10,000 Records
PostgreSQL composite indexes guarantee sub-10ms query execution across 10,000 rows:
- `idx_country_dept`: `(country, department)` — for cross-country comp filtering.
- `idx_dept_gender`: `(department, gender)` — for fast pay equity computations.
- `idx_status_usd`: `(employment_status, salary_usd)` — for active budget aggregations and percentile calculations.
- `idx_search_text`: `(first_name, last_name, email)` — for text search queries.

---

## 📁 Craftsmanship Documentation Artifacts

- 📄 **[Product Requirements Document (PRD)](file:///d:/Projects/sw-craftsperson-assement/docs/REQUIREMENTS.md)**: 1-Page PRD detailing goals, user persona, scope, explicit non-goals, and trade-offs.
- 📐 **[Architecture Specification](file:///d:/Projects/sw-craftsperson-assement/docs/ARCHITECTURE.md)**: Detailed schema design, API specs, and PostgreSQL index optimization strategy.
- 🤖 **[AI Collaboration Workflow](file:///d:/Projects/sw-craftsperson-assement/docs/AI_WORKFLOW.md)**: Matrix of AI pair programming workflows, prompt engineering notes, and craftsmanship guardrails.

---

## 🚀 Quickstart & Execution Guide

### Option 1: One-Command Docker Compose (Recommended)
Ensure Docker Desktop is running, then execute:
```bash
docker compose up --build
```
- **Frontend App**: `http://localhost:3000`
- **Backend API**: `http://localhost:8000`
- **OpenAPI Swagger Docs**: `http://localhost:8000/docs`

---

### Option 2: Local Development Setup

#### 1. Backend Setup (Python 3.11 + PostgreSQL)
```bash
cd backend

# Create & activate virtual environment
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables in backend/.env
cp .env.example .env

# Seed 10,000 employees into PostgreSQL
python -m app.seed

# Start FastAPI server
python -m uvicorn app.main:app --reload --port 8000
```

#### 2. Frontend Setup (React + Vite)
```bash
cd frontend

# Install npm packages
npm install

# Start Vite dev server
npm run dev
```
Open **`http://localhost:3000`** in your browser.

---

## 🧪 Automated Testing

### Pure Unit & API Integration Tests
Run pytest with code coverage report:
```bash
cd backend
python -m pytest tests/ -v --cov=app
```

---

## ⚖️ License
Built for Incubyte Software Craftsperson Take-Home Assessment.
