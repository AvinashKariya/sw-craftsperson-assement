import React, { useState, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { EmployeeDirectory } from './components/EmployeeDirectory';
import { PayEquityReport } from './components/PayEquityReport';
import { ExchangeRateModal } from './components/ExchangeRateModal';
import { EmployeeModal } from './components/EmployeeModal';
import { Employee } from './types';

export const App: React.FC = () => {
  const [isExchangeModalOpen, setIsExchangeModalOpen] = useState(false);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [directoryRefreshKey, setDirectoryRefreshKey] = useState(0);

  const handleOpenAddEmployee = () => {
    setSelectedEmployee(null);
    setIsEmployeeModalOpen(true);
  };

  const handleOpenEditEmployee = (emp: Employee) => {
    setSelectedEmployee(emp);
    setIsEmployeeModalOpen(true);
  };

  const handleEmployeeSaved = useCallback(() => {
    setIsEmployeeModalOpen(false);
    setDirectoryRefreshKey(k => k + 1);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">

      <Navbar onOpenExchangeModal={() => setIsExchangeModalOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<ExecutiveDashboard />} />
          <Route
            path="/directory"
            element={
              <EmployeeDirectory
                key={directoryRefreshKey}
                onAddEmployee={handleOpenAddEmployee}
                onEditEmployee={handleOpenEditEmployee}
              />
            }
          />
          <Route path="/equity" element={<PayEquityReport />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-6 text-center text-xs">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 ACME Corp — Global Employee Salary Management & Analytics System</p>
          <p className="mt-1 text-slate-500">Built with Python FastAPI · PostgreSQL · React 18 · Vite · Tailwind CSS v4</p>
        </div>
      </footer>

      <ExchangeRateModal
        isOpen={isExchangeModalOpen}
        onClose={() => setIsExchangeModalOpen(false)}
        onRatesUpdated={() => setDirectoryRefreshKey(k => k + 1)}
      />

      <EmployeeModal
        isOpen={isEmployeeModalOpen}
        onClose={() => setIsEmployeeModalOpen(false)}
        employeeToEdit={selectedEmployee}
        onSaved={handleEmployeeSaved}
      />
    </div>
  );
};

export default App;
