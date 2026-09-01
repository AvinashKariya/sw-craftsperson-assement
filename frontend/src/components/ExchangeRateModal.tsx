import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { ExchangeRate } from '../types';
import { X, DollarSign, Save } from 'lucide-react';

interface ExchangeRateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRatesUpdated?: () => void;
}

export const ExchangeRateModal: React.FC<ExchangeRateModalProps> = ({ isOpen, onClose, onRatesUpdated }) => {
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<string | null>(null);
  const [newRate, setNewRate] = useState<number>(1.0);

  useEffect(() => {
    if (isOpen) {
      fetchRates();
    }
  }, [isOpen]);

  const fetchRates = async () => {
    try {
      setLoading(true);
      const data = await api.getExchangeRates();
      setRates(data);
    } catch (err) {
      console.error('Failed to fetch exchange rates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRate = async (currency: string) => {
    if (newRate <= 0) {
      alert('Exchange rate must be greater than 0');
      return;
    }
    try {
      await api.updateExchangeRate(currency, newRate);
      setEditingCurrency(null);
      fetchRates();
      if (onRatesUpdated) onRatesUpdated();
    } catch (err) {
      alert('Failed to update exchange rate.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <h2 className="font-bold text-lg">Currency Conversion Rates</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-500">
            Updating an exchange rate automatically re-calculates normalized USD compensation for all employees in that currency.
          </p>

          {loading ? (
            <div className="py-8 text-center text-slate-500">Loading rates...</div>
          ) : (
            <div className="divide-y divide-slate-200 max-h-80 overflow-y-auto">
              {rates.map((r) => (
                <div key={r.currency} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 text-sm">{r.currency}</span>
                    <span className="text-xs text-slate-500 block">Base USD equivalent</span>
                  </div>

                  {editingCurrency === r.currency ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        step="0.01"
                        value={newRate}
                        onChange={(e) => setNewRate(parseFloat(e.target.value) || 0)}
                        className="w-24 px-2 py-1 border border-slate-300 rounded text-sm outline-none focus:ring-2 focus:ring-sky-500"
                      />
                      <button
                        onClick={() => handleUpdateRate(r.currency)}
                        className="p-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
                        title="Save Rate"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <span className="font-mono text-sm font-semibold text-slate-800">
                        1 USD = {r.rate_to_usd} {r.currency}
                      </span>
                      {r.currency !== 'USD' && (
                        <button
                          onClick={() => { setEditingCurrency(r.currency); setNewRate(r.rate_to_usd); }}
                          className="text-xs text-sky-600 font-semibold hover:underline"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-sm font-semibold transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
