import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { PayEquityReport as PayEquityType, Outlier } from '../types';
import { Scale, AlertTriangle, Users } from 'lucide-react';

export const PayEquityReport: React.FC = () => {
  const [equity, setEquity] = useState<PayEquityType | null>(null);
  const [outliers, setOutliers] = useState<Outlier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const [eqRes, outRes] = await Promise.all([
        api.getPayEquityReport(),
        api.getOutliers(),
      ]);
      setEquity(eqRes);
      setOutliers(outRes);
    } catch (err) {
      console.error('Failed to load pay equity report:', err);
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

  if (!equity) return null;

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Scale className="w-6 h-6 text-sky-600" />
          Pay Equity & Outlier Detection Audit
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Automated analysis of gender pay parity and statistical compensation outliers (outside ±2 standard deviations from median).
        </p>
      </div>

      {/* Gender Pay Gap Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Overall Gender Pay Gap</span>
            <Scale className="w-5 h-5 text-sky-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{equity.gender_pay_gap_percentage}%</p>
          <p className="text-xs text-slate-500 mt-1">
            Difference between male and female average USD compensation across org.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Male Average Salary</span>
            <Users className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">
            {formatCurrency(equity.by_gender.Male?.average || 0)}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Active male headcount: {equity.by_gender.Male?.count?.toLocaleString() || 0}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Female Average Salary</span>
            <Users className="w-5 h-5 text-pink-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">
            {formatCurrency(equity.by_gender.Female?.average || 0)}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Active female headcount: {equity.by_gender.Female?.count?.toLocaleString() || 0}
          </p>
        </div>

      </div>

      {/* Department Gender Pay Gap Breakdown */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Department Gender Pay Parity Gaps</h2>
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
                  <td className="py-3 px-4 text-right font-medium text-slate-800">{formatCurrency(dept.male_average_usd)}</td>
                  <td className="py-3 px-4 text-right font-medium text-slate-800">{formatCurrency(dept.female_average_usd)}</td>
                  <td className="py-3 px-4 text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      Math.abs(dept.gender_pay_gap_percentage) < 5
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
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

      {/* Salary Outliers Section */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Detected Salary Outliers (&gt; ±2 Standard Deviations)
          </h2>
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200">
            {outliers.length} Flagged Outliers
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
                <th className="py-3 px-4 text-right">USD Equivalent</th>
                <th className="py-3 px-4 text-center">Z-Score</th>
                <th className="py-3 px-4 text-center">Flag Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {outliers.length > 0 ? (
                outliers.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <div>{o.name}</div>
                      <div className="text-xs text-slate-400 font-mono">{o.employee_code}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{o.department}</div>
                      <div className="text-xs text-slate-500">{o.job_title}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{o.country}</td>
                    <td className="py-3 px-4 text-right font-medium text-slate-800">
                      {new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(o.salary_local)} {o.currency}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-sky-700">
                      {formatCurrency(o.salary_usd)}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-xs">
                      {o.z_score > 0 ? `+${o.z_score}` : o.z_score}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                        o.reason === 'HIGH_OUTLIER'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {o.reason}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No compensation outliers detected in current active dataset.
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
