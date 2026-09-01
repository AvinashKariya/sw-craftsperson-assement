import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { DollarSign, Users, TrendingUp, BarChart2, Globe, Building } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

const fmt = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

export const ExecutiveDashboard: React.FC = () => {
  const { data: summary, isLoading: sumLoading } = useQuery({
    queryKey: ['analytics', 'summary'],
    queryFn: api.getAnalyticsSummary,
  });

  const { data: depts = [], isLoading: deptLoading } = useQuery({
    queryKey: ['analytics', 'department'],
    queryFn: api.getDepartmentBreakdown,
  });

  const { data: countries = [], isLoading: countryLoading } = useQuery({
    queryKey: ['analytics', 'country'],
    queryFn: api.getCountryBreakdown,
  });

  const loading = sumLoading || deptLoading || countryLoading;

  if (loading || !summary) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600" />
      </div>
    );
  }

  const percentileData = [
    { label: 'Min',    value: summary.percentiles.min },
    { label: 'P10',   value: summary.percentiles.p10 },
    { label: 'P25',   value: summary.percentiles.p25 },
    { label: 'Median',value: summary.percentiles.median },
    { label: 'P75',   value: summary.percentiles.p75 },
    { label: 'P90',   value: summary.percentiles.p90 },
    { label: 'Max',   value: summary.percentiles.max },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Global Compensation Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time normalized salary analytics across {summary.total_employees.toLocaleString()} global employees.
          </p>
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
          <span className="w-2 h-2 mr-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live PostgreSQL
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Total Payroll (USD)', value: fmt(summary.total_payroll_usd), icon: DollarSign, color: 'sky' },
          { label: 'Active Headcount',    value: `${summary.active_employees.toLocaleString()} / ${summary.total_employees.toLocaleString()}`, icon: Users, color: 'indigo' },
          { label: 'Average Salary (USD)',value: fmt(summary.average_salary_usd), icon: TrendingUp, color: 'emerald' },
          { label: 'Median Salary (USD)', value: fmt(summary.median_salary_usd),  icon: BarChart2, color: 'amber' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className={`p-3 bg-${color}-100 rounded-lg text-${color}-700`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
            <Building className="w-5 h-5 text-sky-600" /> Department Payroll (USD)
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={depts} margin={{ top: 10, right: 10, left: 0, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="department" angle={-30} textAnchor="end" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => `$${(v / 1e6).toFixed(1)}M`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => [fmt(v), 'Total Payroll']} />
                <Bar dataKey="total_payroll_usd" fill="#0284c7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-emerald-600" /> Salary Distribution (Percentiles)
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={percentileData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => [fmt(v), 'Salary']} />
                <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Country Table */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-indigo-600" /> Cross-Country Compensation
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Country</th>
                <th className="py-3 px-4">Currency</th>
                <th className="py-3 px-4 text-right">Headcount</th>
                <th className="py-3 px-4 text-right">Native Payroll</th>
                <th className="py-3 px-4 text-right">USD Payroll</th>
                <th className="py-3 px-4 text-right">Avg USD Salary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {countries.map((c) => (
                <tr key={c.country} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900">{c.country}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-800">{c.currency}</span>
                  </td>
                  <td className="py-3 px-4 text-right font-medium">{c.employee_count.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right">
                    {new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(c.total_payroll_local)} {c.currency}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-sky-700">{fmt(c.total_payroll_usd)}</td>
                  <td className="py-3 px-4 text-right font-semibold text-emerald-700">{fmt(c.average_salary_usd)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
