import React, { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, keepPreviousData, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { Employee } from '../types';
import {
  Search, Plus, Download, ChevronLeft, ChevronRight,
  ArrowUpDown, UserX, Edit2
} from 'lucide-react';

interface EmployeeDirectoryProps {
  onAddEmployee: () => void;
  onEditEmployee: (emp: Employee) => void;
}

const COUNTRIES   = ["United States", "India", "United Kingdom", "Germany", "Japan", "Canada", "Australia", "Singapore"];
const DEPARTMENTS = ["Engineering", "Product", "Sales", "Marketing", "Human Resources", "Finance", "Legal", "Customer Support"];
const STATUSES    = ["Active", "Inactive", "On Leave"];

export const EmployeeDirectory: React.FC<EmployeeDirectoryProps> = ({ onAddEmployee, onEditEmployee }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  // Filter state — initialised from URL so they persist across navigation
  const [search,        setSearch]        = React.useState(searchParams.get('q')       || '');
  const [deptFilter,    setDeptFilter]    = React.useState(searchParams.get('dept')    || '');
  const [countryFilter, setCountryFilter] = React.useState(searchParams.get('country') || '');
  const [statusFilter,  setStatusFilter]  = React.useState(searchParams.get('status')  || '');
  const [sortBy,        setSortBy]        = React.useState(searchParams.get('sort')    || 'id');
  const [sortOrder,     setSortOrder]     = React.useState<'asc' | 'desc'>((searchParams.get('order') as 'asc' | 'desc') || 'asc');
  const [page,          setPage]          = React.useState(Number(searchParams.get('page') || '1'));
  const [pageSize,      setPageSize]      = React.useState(Number(searchParams.get('size') || '25'));

  // Debounced URL sync — keeps URL in sync for bookmark/back-button persistence
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => {
      const p: Record<string, string> = {};
      if (search)          p.q       = search;
      if (deptFilter)      p.dept    = deptFilter;
      if (countryFilter)   p.country = countryFilter;
      if (statusFilter)    p.status  = statusFilter;
      if (sortBy !== 'id') p.sort    = sortBy;
      if (sortOrder !== 'asc') p.order = sortOrder;
      if (page > 1)        p.page    = String(page);
      if (pageSize !== 25) p.size    = String(pageSize);
      setSearchParams(p, { replace: true });
    }, 150);
    return () => { if (syncTimer.current) clearTimeout(syncTimer.current); };
  }, [search, deptFilter, countryFilter, statusFilter, sortBy, sortOrder, page, pageSize, setSearchParams]);

  // React Query — keepPreviousData = no flash/blank on filter change (shows old rows while new ones load)
  const qp = {
    page, page_size: pageSize,
    query: search || undefined,
    department: deptFilter || undefined,
    country: countryFilter || undefined,
    employment_status: statusFilter || undefined,
    sort_by: sortBy, sort_order: sortOrder,
  };
  const { data, isFetching, isLoading } = useQuery({
    queryKey: ['employees', qp],
    queryFn: () => api.getEmployees(qp),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30, // 30 s
  });

  const handleSort = (field: string) => {
    setSortBy(f => {
      if (f === field) setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
      else { setSortOrder('asc'); }
      return field;
    });
    setPage(1);
  };

  const handleFilter = (setter: (v: string) => void) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { setter(e.target.value); setPage(1); };

  const handleDeactivate = async (emp: Employee) => {
    if (!window.confirm(`Deactivate ${emp.first_name} ${emp.last_name} (${emp.employee_code})?`)) return;
    try {
      await api.deactivateEmployee(emp.id);
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    } catch {
      alert('Failed to deactivate employee.');
    }
  };

  const handleExportCSV = () => {
    if (!data?.items) return;
    const headers = ["Code", "First Name", "Last Name", "Email", "Department", "Job Title", "Country", "Currency", "Local Salary", "USD Salary", "Status"];
    const rows = data.items.map(e => [e.employee_code, e.first_name, e.last_name, e.email, e.department, e.job_title, e.country, e.currency, e.salary_local, e.salary_usd, e.employment_status]);
    const csv = "data:text/csv;charset=utf-8," + [headers, ...rows].map(r => r.join(",")).join("\n");
    const a = Object.assign(document.createElement("a"), { href: encodeURI(csv), download: `employees_p${page}.csv` });
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const SortIcon = ({ field }: { field: string }) => (
    <ArrowUpDown className={`w-3.5 h-3.5 flex-shrink-0 ${sortBy === field ? 'text-sky-300' : ''}`} />
  );

  return (
    <div className="space-y-6">

      {/* Top Action Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {data ? `${data.total.toLocaleString()} Employees` : 'Employee Directory'}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {data ? `Page ${data.page} of ${data.total_pages.toLocaleString()} · server-side paginated & indexed` : 'Loading…'}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={handleExportCSV}
            className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold border border-slate-300 transition-colors">
            <Download className="w-4 h-4" /><span>Export CSV</span>
          </button>
          <button onClick={onAddEmployee}
            className="flex items-center space-x-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-colors">
            <Plus className="w-4 h-4" /><span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="relative lg:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input type="text" placeholder="Search by code, name, or email…" value={search}
            onChange={handleFilter(setSearch)}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none" />
        </div>
        <select value={deptFilter} onChange={handleFilter(setDeptFilter)}
          className="w-full py-2 px-3 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-sky-500 outline-none">
          <option value="">All Departments</option>
          {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={countryFilter} onChange={handleFilter(setCountryFilter)}
          className="w-full py-2 px-3 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-sky-500 outline-none">
          <option value="">All Countries</option>
          {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={statusFilter} onChange={handleFilter(setStatusFilter)}
          className="w-full py-2 px-3 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-sky-500 outline-none">
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-opacity duration-150 ${isFetching && !isLoading ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>
        <div className={`h-0.5 bg-sky-500 transition-opacity duration-200 ${isFetching ? 'opacity-100' : 'opacity-0'}`} />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900 text-slate-200 font-semibold">
              <tr>
                <th className="py-3.5 px-4 cursor-pointer hover:text-white whitespace-nowrap" onClick={() => handleSort('id')}>
                  <div className="flex items-center space-x-1"><span>Code</span><SortIcon field="id" /></div>
                </th>
                <th className="py-3.5 px-4 cursor-pointer hover:text-white whitespace-nowrap" onClick={() => handleSort('first_name')}>
                  <div className="flex items-center space-x-1"><span>Name</span><SortIcon field="first_name" /></div>
                </th>
                <th className="py-3.5 px-4 cursor-pointer hover:text-white whitespace-nowrap" onClick={() => handleSort('department')}>
                  <div className="flex items-center space-x-1"><span>Department & Title</span><SortIcon field="department" /></div>
                </th>
                <th className="py-3.5 px-4 cursor-pointer hover:text-white whitespace-nowrap" onClick={() => handleSort('country')}>
                  <div className="flex items-center space-x-1"><span>Country</span><SortIcon field="country" /></div>
                </th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">Local Salary</th>
                <th className="py-3.5 px-4 text-right cursor-pointer hover:text-white whitespace-nowrap" onClick={() => handleSort('salary_usd')}>
                  <div className="flex items-center justify-end space-x-1"><span>USD Equiv.</span><SortIcon field="salary_usd" /></div>
                </th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap">Status</th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-500">
                    <div className="inline-flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-sky-600" />
                      <span>Loading employees…</span>
                    </div>
                  </td>
                </tr>
              ) : data && data.items.length > 0 ? (
                data.items.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs font-semibold text-slate-500 whitespace-nowrap">{emp.employee_code}</td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900">{emp.first_name} {emp.last_name}</div>
                      <div className="text-xs text-slate-400">{emp.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{emp.department}</div>
                      <div className="text-xs text-slate-500">{emp.job_title}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700 whitespace-nowrap">{emp.country}</td>
                    <td className="py-3 px-4 text-right font-medium text-slate-700 whitespace-nowrap">
                      {new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(emp.salary_local)} {emp.currency}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-sky-700 whitespace-nowrap">
                      ${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(emp.salary_usd)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        emp.employment_status === 'Active'   ? 'bg-emerald-100 text-emerald-800' :
                        emp.employment_status === 'On Leave' ? 'bg-amber-100 text-amber-800'     :
                                                               'bg-rose-100 text-rose-800'
                      }`}>{emp.employment_status}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button onClick={() => onEditEmployee(emp)} className="p-1 text-slate-400 hover:text-sky-600 rounded" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {emp.employment_status === 'Active' && (
                          <button onClick={() => handleDeactivate(emp)} className="p-1 text-slate-400 hover:text-rose-600 rounded" title="Deactivate">
                            <UserX className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">No employees match the selected filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && (
          <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-600">
            <div>
              Showing <span className="font-semibold text-slate-900">{((page - 1) * pageSize) + 1}</span>–<span className="font-semibold text-slate-900">{Math.min(page * pageSize, data.total)}</span> of <span className="font-semibold text-slate-900">{data.total.toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1.5">
                <span className="text-xs">Rows:</span>
                <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
                  className="py-1 px-2 border border-slate-300 rounded bg-white text-xs outline-none">
                  {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div className="flex items-center space-x-1">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                  className="p-1 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-semibold px-2">Page {page} of {data.total_pages}</span>
                <button disabled={page >= data.total_pages} onClick={() => setPage(p => p + 1)}
                  className="p-1 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed">
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
