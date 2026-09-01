import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Scale, DollarSign, Building2 } from 'lucide-react';

interface NavbarProps {
  onOpenExchangeModal: () => void;
}

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
    isActive
      ? 'bg-sky-600 text-white shadow'
      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
  }`;

export const Navbar: React.FC<NavbarProps> = ({ onOpenExchangeModal }) => {
  return (
    <header className="bg-slate-900 text-white shadow-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="bg-sky-500 p-2 rounded-lg">
              <Building2 className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight">ACME Corp</span>
              <span className="text-xs block text-slate-400">Global Salary Management</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex space-x-1">
            <NavLink to="/" end className={navLinkClass}>
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </NavLink>

            <NavLink to="/directory" className={navLinkClass}>
              <Users className="w-4 h-4" />
              <span>Employee Directory</span>
            </NavLink>

            <NavLink to="/equity" className={navLinkClass}>
              <Scale className="w-4 h-4" />
              <span>Pay Parity & Outliers</span>
            </NavLink>
          </nav>

          {/* Exchange Rates button */}
          <button
            onClick={onOpenExchangeModal}
            className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
          >
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Exchange Rates</span>
          </button>

        </div>
      </div>
    </header>
  );
};
