import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { AnalyticsSummary, DepartmentBreakdown, CountryBreakdown } from '../types';
import { DollarSign, Users, Globe, Building, TrendingUp, BarChart2 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid
} from 'recharts';

export const ExecutiveDashboard: React.FC = () => {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [depts, setDepts] = useState<DepartmentBreakdown[]>([]);
  const [countries, setCountries] = useState<CountryBreakdown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [sumRes, deptRes, countryRes] = await Promise.all([
        api.getAnalyticsSummary(),
        api.getDepartmentBreakdown(),
        api.getCountryBreakdown(),
      ]);
      setSummary(sumRes);
      setDepts(deptRes);
      setCountries(countryRes);
    } catch (err) {
      console.error('Error loading dashboard analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  if (!summary) return null;

  const percentileData = [
    { label: 'Min', value: summary.percentiles.min },
    { label: 'P10', value: summary.percentiles.p10 },
    { label: 'P25', value: summary.percentiles.p25 },
    { label: 'Median (P50)', value: summary.percentiles.median },
    { label: 'P75', value: summary.percentiles.p75 },
    { label: 'P90', value: summary.percentiles.p90 },
    { label: 'Max', value: summary.percentiles.max },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex items-center justify-between bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Global Compensation Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time normalized salary analytics & budget breakdown across 10,000 global employees.
          </p>
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
          <span className="w-2 h-2 mr-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Live PostgreSQL Engine
        </span>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-sky-100 rounded-lg text-sky-700">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Payroll (USD)</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{formatCurrency(summary.total_payroll_usd)}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-indigo-100 rounded-lg text-indigo-700">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Headcount</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">
              {summary.active_employees.toLocaleString()} / {summary.total_employees.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-100 rounded-lg text-emerald-700">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Average Salary (USD)</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{formatCurrency(summary.average_salary_usd)}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-amber-100 rounded-lg text-amber-700">
            <BarChart2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Median Salary (USD)</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{formatCurrency(summary.median_salary_usd)}</p>
          </div>
        </div>

      </div>

      {/* Visual Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Department Payroll Distribution */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Building className="w-5 h-5 text-sky-600" />
              Department Payroll Budget (USD)
            </h2>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={depts} margin={{ top: 10, right: 10, left: 0, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="department" angle={-30} textAnchor="end" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => `$${(v / 1e6).toFixed(1)}M`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value: number) => [formatCurrency(value), 'Total Payroll']} />
                <Bar dataKey="total_payroll_usd" fill="#0284c7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Statistical Salary Percentiles */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Org Salary Distribution (Percentiles)
            </h2>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={percentileData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value: number) => [formatCurrency(value), 'Salary']} />
                <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Country Comp Breakdown Table */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-indigo-600" />
          Cross-Country Compensation Normalization
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Country</th>
                <th className="py-3 px-4">Currency</th>
                <th className="py-3 px-4 text-right">Headcount</th>
                <th className="py-3 px-4 text-right">Total Native Payroll</th>
                <th className="py-3 px-4 text-right">Total USD Payroll</th>
                <th className="py-3 px-4 text-right">Average USD Salary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {countries.map((c) => (
                <tr key={c.country} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900">{c.country}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-800">
                      {c.currency}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-medium">{c.employee_count.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right">
                    {new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(c.total_payroll_local)} {c.currency}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-sky-700">{formatCurrency(c.total_payroll_usd)}</td>
                  <td className="py-3 px-4 text-right font-semibold text-emerald-700">{formatCurrency(c.average_salary_usd)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
