import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Employee } from '../types';
import { X } from 'lucide-react';

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeToEdit?: Employee | null;
  onSaved: () => void;
}

const COUNTRIES_CURRENCIES: Record<string, string> = {
  "United States": "USD",
  "India": "INR",
  "United Kingdom": "GBP",
  "Germany": "EUR",
  "Japan": "JPY",
  "Canada": "CAD",
  "Australia": "AUD",
  "Singapore": "SGD"
};

const DEPARTMENTS = [
  "Engineering", "Product", "Sales", "Marketing",
  "Human Resources", "Finance", "Legal", "Customer Support"
];

export const EmployeeModal: React.FC<EmployeeModalProps> = ({ isOpen, onClose, employeeToEdit, onSaved }) => {
  const [code, setCode] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('Male');
  const [department, setDepartment] = useState('Engineering');
  const [jobTitle, setJobTitle] = useState('Software Engineer');
  const [country, setCountry] = useState('United States');
  const [salaryLocal, setSalaryLocal] = useState<number>(100000);
  const [joiningDate, setJoiningDate] = useState('2024-01-01');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (employeeToEdit) {
      setCode(employeeToEdit.employee_code);
      setFirstName(employeeToEdit.first_name);
      setLastName(employeeToEdit.last_name);
      setEmail(employeeToEdit.email);
      setGender(employeeToEdit.gender);
      setDepartment(employeeToEdit.department);
      setJobTitle(employeeToEdit.job_title);
      setCountry(employeeToEdit.country);
      setSalaryLocal(employeeToEdit.salary_local);
      setJoiningDate(employeeToEdit.joining_date);
    } else {
      setCode(`EMP-${Math.floor(10000 + Math.random() * 90000)}`);
      setFirstName('');
      setLastName('');
      setEmail('');
      setGender('Male');
      setDepartment('Engineering');
      setJobTitle('Software Engineer');
      setCountry('United States');
      setSalaryLocal(100000);
      setJoiningDate(new Date().toISOString().split('T')[0]);
    }
  }, [employeeToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        employee_code: code,
        first_name: firstName,
        last_name: lastName,
        email,
        gender,
        department,
        job_title: jobTitle,
        country,
        currency: COUNTRIES_CURRENCIES[country] || 'USD',
        salary_local: salaryLocal,
        joining_date: joiningDate
      };

      if (employeeToEdit) {
        await api.updateEmployee(employeeToEdit.id, payload);
      } else {
        await api.createEmployee(payload);
      }

      onSaved();
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to save employee.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <h2 className="font-bold text-lg">{employeeToEdit ? 'Edit Employee Salary & Details' : 'Add New Employee'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Employee Code</label>
              <input
                type="text"
                required
                disabled={!!employeeToEdit}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded text-sm outline-none focus:ring-2 focus:ring-sky-500 disabled:bg-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded text-sm outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">First Name</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded text-sm outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Last Name</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded text-sm outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded text-sm outline-none focus:ring-2 focus:ring-sky-500"
              >
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Job Title</label>
              <input
                type="text"
                required
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded text-sm outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Country</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded text-sm outline-none focus:ring-2 focus:ring-sky-500"
              >
                {Object.keys(COUNTRIES_CURRENCIES).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Local Salary ({COUNTRIES_CURRENCIES[country] || 'USD'})
              </label>
              <input
                type="number"
                required
                min={1}
                value={salaryLocal}
                onChange={(e) => setSalaryLocal(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-300 rounded text-sm outline-none focus:ring-2 focus:ring-sky-500 font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded text-sm outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-Binary">Non-Binary</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Joining Date</label>
              <input
                type="date"
                required
                value={joiningDate}
                onChange={(e) => setJoiningDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded text-sm outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Employee'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
