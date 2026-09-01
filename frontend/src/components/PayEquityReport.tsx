import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { Scale, AlertTriangle, Users } from 'lucide-react';

const fmt = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

export const PayEquityReport: React.FC = () => {
  const { data: equity, isLoading: eqLoading } = useQuery({
    queryKey: ['analytics', 'pay-equity'],
    queryFn: api.getPayEquityReport,
  });

  const { data: outliers = [], isLoading: outLoading } = useQuery({
    queryKey: ['analytics', 'outliers'],
    queryFn: api.getOutliers,
  });

  if (eqLoading || outLoading || !equity) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Scale className="w-6 h-6 text-sky-600" /> Pay Equity & Outlier Detection Audit
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Automated analysis of gender pay parity and statistical compensation outliers (±2σ from median).
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Overall Pay Gap</span>
            <Scale className="w-5 h-5 text-sky-600" />
          </div>
          <p className={`text-3xl font-extrabold ${Math.abs(equity.gender_pay_gap_percentage) > 10 ? 'text-rose-600' : 'text-slate-900'}`}>
            {equity.gender_pay_gap_percentage}%
          </p>
          <p className="text-xs text-slate-500 mt-1">Male vs female average USD salary gap</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Male Average</span>
            <Users className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{fmt(equity.by_gender.Male?.average || 0)}</p>
          <p className="text-xs text-slate-500 mt-1">Active headcount: {equity.by_gender.Male?.count?.toLocaleString() || 0}</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Female Average</span>
            <Users className="w-5 h-5 text-pink-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{fmt(equity.by_gender.Female?.average || 0)}</p>
          <p className="text-xs text-slate-500 mt-1">Active headcount: {equity.by_gender.Female?.count?.toLocaleString() || 0}</p>
        </div>
      </div>

      {/* Department Pay Gap Table */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Department Gender Pay Parity</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4 text-right">Male Avg (USD)</th>
                <th className="py-3 px-4 text-right">Female Avg (USD)</th>
                <th className="py-3 px-4 text-right">Pay Gap %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {equity.department_gaps.map((dept) => (
                <tr key={dept.department} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900">{dept.department}</td>
                  <td className="py-3 px-4 text-right font-medium">{fmt(dept.male_average_usd)}</td>
                  <td className="py-3 px-4 text-right font-medium">{fmt(dept.female_average_usd)}</td>
                  <td className="py-3 px-4 text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      Math.abs(dept.gender_pay_gap_percentage) < 5
                        ? 'bg-emerald-100 text-emerald-800'
                        : Math.abs(dept.gender_pay_gap_percentage) < 15
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {dept.gender_pay_gap_percentage}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Salary Outliers */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" /> Salary Outliers (&gt; ±2σ)
          </h2>
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200">
            {outliers.length} flagged
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Department & Title</th>
                <th className="py-3 px-4">Country</th>
                <th className="py-3 px-4 text-right">Local Salary</th>
                <th className="py-3 px-4 text-right">USD Equiv.</th>
                <th className="py-3 px-4 text-center">Z-Score</th>
                <th className="py-3 px-4 text-center">Flag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {outliers.length > 0 ? outliers.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{o.name}</div>
                    <div className="text-xs text-slate-400 font-mono">{o.employee_code}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-800">{o.department}</div>
                    <div className="text-xs text-slate-500">{o.job_title}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-700">{o.country}</td>
                  <td className="py-3 px-4 text-right font-medium">
                    {new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(o.salary_local)} {o.currency}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-sky-700">{fmt(o.salary_usd)}</td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-xs">
                    {o.z_score > 0 ? `+${o.z_score}` : o.z_score}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                      o.reason === 'HIGH_OUTLIER' ? 'bg-rose-100 text-rose-800' : 'bg-indigo-100 text-indigo-800'
                    }`}>
                      {o.reason}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No compensation outliers detected.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
