import React from 'react';
import { LayoutDashboard, Users, Scale, DollarSign, Building2 } from 'lucide-react';

interface NavbarProps {
  activeTab: 'dashboard' | 'directory' | 'equity';
  setActiveTab: (tab: 'dashboard' | 'directory' | 'equity') => void;
  onOpenExchangeModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenExchangeModal }) => {
  return (
    <header className="bg-slate-900 text-white shadow-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="bg-sky-500 p-2 rounded-lg text-slate-900 font-bold">
              <Building2 className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight">ACME Corp</span>
              <span className="text-xs block text-slate-400">Global Salary Management</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-sky-600 text-white shadow'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('directory')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'directory'
                  ? 'bg-sky-600 text-white shadow'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Employee Directory (10k)</span>
            </button>

            <button
              onClick={() => setActiveTab('equity')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'equity'
                  ? 'bg-sky-600 text-white shadow'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Scale className="w-4 h-4" />
              <span>Pay Parity & Outliers</span>
            </button>
          </nav>

          {/* Currency Settings Action */}
          <div>
            <button
              onClick={onOpenExchangeModal}
              className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            >
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Exchange Rates</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
