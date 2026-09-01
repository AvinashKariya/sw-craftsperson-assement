import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { EmployeeDirectory } from './components/EmployeeDirectory';
import { PayEquityReport } from './components/PayEquityReport';
import { ExchangeRateModal } from './components/ExchangeRateModal';
import { EmployeeModal } from './components/EmployeeModal';
import { Employee } from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'directory' | 'equity'>('dashboard');
  const [isExchangeModalOpen, setIsExchangeModalOpen] = useState(false);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const handleOpenAddEmployee = () => {
    setSelectedEmployee(null);
    setIsEmployeeModalOpen(true);
  };

  const handleOpenEditEmployee = (emp: Employee) => {
    setSelectedEmployee(emp);
    setIsEmployeeModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenExchangeModal={() => setIsExchangeModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <ExecutiveDashboard />}
        {activeTab === 'directory' && (
          <EmployeeDirectory
            onAddEmployee={handleOpenAddEmployee}
            onEditEmployee={handleOpenEditEmployee}
          />
        )}
        {activeTab === 'equity' && <PayEquityReport />}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-6 text-center text-xs">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 ACME Corp — Global Employee Salary Management & Analytics System</p>
          <p className="mt-1 text-slate-500">Built with Python FastAPI, PostgreSQL, React 18, Vite & Tailwind CSS</p>
        </div>
      </footer>

      {/* Modals */}
      <ExchangeRateModal
        isOpen={isExchangeModalOpen}
        onClose={() => setIsExchangeModalOpen(false)}
        onRatesUpdated={() => {
          // Trigger refresh if needed
        }}
      />

      <EmployeeModal
        isOpen={isEmployeeModalOpen}
        onClose={() => setIsEmployeeModalOpen(false)}
        employeeToEdit={selectedEmployee}
        onSaved={() => {
          // Trigger refresh
        }}
      />

    </div>
  );
};

export default App;
