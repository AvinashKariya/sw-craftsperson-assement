import axios from 'axios';
import {
  Employee,
  PaginatedResponse,
  AnalyticsSummary,
  DepartmentBreakdown,
  CountryBreakdown,
  PayEquityReport,
  Outlier,
  ExchangeRate
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export const api = {
  // Employee Endpoints
  getEmployees: async (params: {
    page?: number;
    page_size?: number;
    query?: string;
    department?: string;
    country?: string;
    employment_status?: string;
    currency?: string;
    min_salary_usd?: number;
    max_salary_usd?: number;
    sort_by?: string;
    sort_order?: string;
  }): Promise<PaginatedResponse<Employee>> => {
    const response = await axios.get(`${API_BASE}/employees`, { params });
    return response.data;
  },

  getEmployeeById: async (id: number): Promise<Employee> => {
    const response = await axios.get(`${API_BASE}/employees/${id}`);
    return response.data;
  },

  createEmployee: async (data: Partial<Employee>): Promise<Employee> => {
    const response = await axios.post(`${API_BASE}/employees`, data);
    return response.data;
  },

  updateEmployee: async (id: number, data: Partial<Employee>): Promise<Employee> => {
    const response = await axios.put(`${API_BASE}/employees/${id}`, data);
    return response.data;
  },

  deactivateEmployee: async (id: number): Promise<{ message: string }> => {
    const response = await axios.delete(`${API_BASE}/employees/${id}`);
    return response.data;
  },

  // Analytics Endpoints
  getAnalyticsSummary: async (): Promise<AnalyticsSummary> => {
    const response = await axios.get(`${API_BASE}/analytics/summary`);
    return response.data;
  },

  getDepartmentBreakdown: async (): Promise<DepartmentBreakdown[]> => {
    const response = await axios.get(`${API_BASE}/analytics/department`);
    return response.data;
  },

  getCountryBreakdown: async (): Promise<CountryBreakdown[]> => {
    const response = await axios.get(`${API_BASE}/analytics/country`);
    return response.data;
  },

  getPayEquityReport: async (): Promise<PayEquityReport> => {
    const response = await axios.get(`${API_BASE}/analytics/pay-equity`);
    return response.data;
  },

  getOutliers: async (): Promise<Outlier[]> => {
    const response = await axios.get(`${API_BASE}/analytics/outliers`);
    return response.data;
  },

  // Exchange Rates Endpoints
  getExchangeRates: async (): Promise<ExchangeRate[]> => {
    const response = await axios.get(`${API_BASE}/exchange-rates`);
    return response.data;
  },

  updateExchangeRate: async (currency: string, rate_to_usd: number): Promise<ExchangeRate> => {
    const response = await axios.put(`${API_BASE}/exchange-rates/${currency}`, null, {
      params: { rate_to_usd }
    });
    return response.data;
  }
};
