import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import { Employee, PaginatedResponse } from '../types';
import {
  Search, Plus, Download, ChevronLeft, ChevronRight,
  ArrowUpDown, UserX, Edit2
} from 'lucide-react';

interface EmployeeDirectoryProps {
  onAddEmployee: () => void;
  onEditEmployee: (emp: Employee) => void;
}

const COUNTRIES = ["United States", "India", "United Kingdom", "Germany", "Japan", "Canada", "Australia", "Singapore"];
const DEPARTMENTS = ["Engineering", "Product", "Sales", "Marketing", "Human Resources", "Finance", "Legal", "Customer Support"];
const STATUSES = ["Active", "Inactive", "On Leave"];

export const EmployeeDirectory: React.FC<EmployeeDirectoryProps> = ({ onAddEmployee, onEditEmployee }) => {
  const [data, setData] = useState<PaginatedResponse<Employee> | null>(null);
  const [loading, setLoading] = useState(true);

  // Filter & Search state
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Sorting & Pagination state
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getEmployees({
        page,
        page_size: pageSize,
        query: search || undefined,
        department: deptFilter || undefined,
        country: countryFilter || undefined,
        employment_status: statusFilter || undefined,
        sort_by: sortBy,
        sort_order: sortOrder
      });
      setData(res);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, deptFilter, countryFilter, statusFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleDeactivate = async (emp: Employee) => {
    if (window.confirm(`Deactivate employee ${emp.first_name} ${emp.last_name} (${emp.employee_code})?`)) {
      try {
        await api.deactivateEmployee(emp.id);
        fetchEmployees();
      } catch (err) {
        alert('Failed to deactivate employee.');
      }
    }
  };

  const handleExportCSV = () => {
    if (!data || !data.items) return;
    const headers = ["Employee Code", "First Name", "Last Name", "Email", "Department", "Job Title", "Country", "Currency", "Local Salary", "USD Salary", "Status"];
    const rows = data.items.map(e => [
      e.employee_code, e.first_name, e.last_name, e.email, e.department, e.job_title, e.country, e.currency, e.salary_local, e.salary_usd, e.employment_status
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `employees_export_page_${page}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Action Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">10,000 Employee Directory</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Indexed, server-side paginated data grid with multi-column filtering and instant query response.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold border border-slate-300 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          
          <button
            onClick={onAddEmployee}
            className="flex items-center space-x-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        
        {/* Search Input */}
        <div className="relative lg:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by code, name, or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
          />
        </div>

        {/* Department Filter */}
        <div>
          <select
            value={deptFilter}
            onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }}
            className="w-full py-2 px-3 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
          >
            <option value="">All Departments</option>
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* Country Filter */}
        <div>
          <select
            value={countryFilter}
            onChange={(e) => { setCountryFilter(e.target.value); setPage(1); }}
            className="w-full py-2 px-3 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
          >
            <option value="">All Countries</option>
            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="w-full py-2 px-3 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
          >
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900 text-slate-200 font-semibold">
              <tr>
                <th className="py-3.5 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('employee_code')}>
                  <div className="flex items-center space-x-1">
                    <span>Code</span>
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th className="py-3.5 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('first_name')}>
                  <div className="flex items-center space-x-1">
                    <span>Name</span>
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th className="py-3.5 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('department')}>
                  <div className="flex items-center space-x-1">
                    <span>Department & Title</span>
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th className="py-3.5 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('country')}>
                  <div className="flex items-center space-x-1">
                    <span>Country</span>
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th className="py-3.5 px-4 text-right cursor-pointer hover:text-white" onClick={() => handleSort('salary_usd')}>
                  <div className="flex items-center justify-end space-x-1">
                    <span>Local Salary</span>
                  </div>
                </th>
                <th className="py-3.5 px-4 text-right cursor-pointer hover:text-white" onClick={() => handleSort('salary_usd')}>
                  <div className="flex items-center justify-end space-x-1">
                    <span>USD Equivalent</span>
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <div className="inline-flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-sky-600"></div>
                      <span>Querying PostgreSQL database...</span>
                    </div>
                  </td>
                </tr>
              ) : data && data.items.length > 0 ? (
                data.items.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs font-semibold text-slate-600">{emp.employee_code}</td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      <div>{emp.first_name} {emp.last_name}</div>
                      <div className="text-xs text-slate-400 font-normal">{emp.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{emp.department}</div>
                      <div className="text-xs text-slate-500">{emp.job_title}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{emp.country}</td>
                    <td className="py-3 px-4 text-right font-medium text-slate-800">
                      {new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(emp.salary_local)} {emp.currency}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-sky-700">
                      ${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(emp.salary_usd)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        emp.employment_status === 'Active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {emp.employment_status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => onEditEmployee(emp)}
                          className="p-1 text-slate-500 hover:text-sky-600 rounded transition-colors"
                          title="Edit Employee"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {emp.employment_status === 'Active' && (
                          <button
                            onClick={() => handleDeactivate(emp)}
                            className="p-1 text-slate-500 hover:text-rose-600 rounded transition-colors"
                            title="Deactivate Employee"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No employee records match the given criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {data && (
          <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-600">
            <div>
              Showing <span className="font-semibold text-slate-900">{((page - 1) * pageSize) + 1}</span> to{' '}
              <span className="font-semibold text-slate-900">{Math.min(page * pageSize, data.total)}</span> of{' '}
              <span className="font-semibold text-slate-900">{data.total.toLocaleString()}</span> employees
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1.5">
                <span className="text-xs">Rows per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                  className="py-1 px-2 border border-slate-300 rounded bg-white text-xs outline-none"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="p-1 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-semibold px-2">Page {page} of {data.total_pages}</span>
                <button
                  disabled={page >= data.total_pages}
                  onClick={() => setPage(page + 1)}
                  className="p-1 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
