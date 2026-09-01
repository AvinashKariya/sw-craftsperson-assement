export interface Employee {
  id: number;
  employee_code: string;
  first_name: string;
  last_name: string;
  email: string;
  gender: string;
  department: string;
  job_title: string;
  country: string;
  currency: string;
  salary_local: number;
  salary_usd: number;
  employment_status: string;
  joining_date: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  items: T[];
}

export interface AnalyticsSummary {
  total_employees: number;
  active_employees: number;
  total_payroll_usd: number;
  average_salary_usd: number;
  median_salary_usd: number;
  percentiles: {
    count: number;
    min: number;
    p10: number;
    p25: number;
    median: number;
    p75: number;
    p90: number;
    max: number;
    average: number;
    std_dev: number;
  };
  countries_count: number;
  departments_count: number;
}

export interface DepartmentBreakdown {
  department: string;
  employee_count: number;
  total_payroll_usd: number;
  average_salary_usd: number;
  median_salary_usd: number;
}

export interface CountryBreakdown {
  country: string;
  currency: string;
  employee_count: number;
  total_payroll_local: number;
  total_payroll_usd: number;
  average_salary_usd: number;
}

export interface PayEquityReport {
  by_gender: Record<string, any>;
  gender_pay_gap_percentage: number;
  department_gaps: Array<{
    department: string;
    gender_pay_gap_percentage: number;
    male_average_usd: number;
    female_average_usd: number;
  }>;
}

export interface Outlier {
  id: number;
  employee_code: string;
  name: string;
  department: string;
  job_title: string;
  country: string;
  salary_usd: number;
  salary_local: number;
  currency: string;
  reason: "HIGH_OUTLIER" | "LOW_OUTLIER";
  z_score: number;
}

export interface ExchangeRate {
  currency: string;
  rate_to_usd: number;
  updated_at?: string;
}
