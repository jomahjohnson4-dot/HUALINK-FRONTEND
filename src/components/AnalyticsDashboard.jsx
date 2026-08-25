import { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Package, 
  Loader2, 
  AlertCircle,
  Calendar
} from 'lucide-react';

export const AnalyticsDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('authToken');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const [summaryRes, forecastRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/analytics/overview`, { headers }),
          axios.get(`${API_BASE_URL}/api/analytics/forecast?days=7`, { headers }),
        ]);

        setMetrics(summaryRes.data?.summary || summaryRes.data || {});
        setForecast(forecastRes.data?.data?.forecast || forecastRes.data?.forecast || []);
      } catch (err) {
        console.error('Failed to load analytics:', err);
        setError('Unable to load analytics metrics. Please check your network or server connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [API_BASE_URL]);

  if (loading) {
    return (
      <div className="p-12 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col items-center justify-center space-y-3 text-slate-400">
        <Loader2 size={28} className="animate-spin text-orange-500" />
        <span className="text-xs font-semibold uppercase tracking-wider">
          Initializing Central Analytics Engine...
        </span>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-2xl space-y-6">
      
      {/* Title Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
            <TrendingUp size={20} className="text-orange-500" />
            <span>Business Analytics & Projections</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time financial performance and automated revenue forecasting
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-slate-800/80 rounded-xl border border-slate-700/70 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Paid Revenue</p>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <DollarSign size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-400">
            TSH {metrics?.totalPaidRevenue?.toLocaleString() || '0'}
          </p>
        </div>

        <div className="p-5 bg-slate-800/80 rounded-xl border border-slate-700/70 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Transactions</p>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
              <Clock size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-400">
            TSH {metrics?.totalPendingRevenue?.toLocaleString() || '0'}
          </p>
        </div>

        <div className="p-5 bg-slate-800/80 rounded-xl border border-slate-700/70 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Catalog Products</p>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
              <Package size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-blue-400">
            {metrics?.totalCatalogProducts || '0'}
          </p>
        </div>
      </div>

      {/* 7-Day Revenue Forecast */}
      <div className="p-5 bg-slate-800/80 rounded-xl border border-slate-700/70 shadow-md">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-700/50">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <Calendar size={16} className="text-orange-500" />
            <span>7-Day Predictive Revenue Forecast</span>
          </h3>
          <span className="text-[10px] font-bold uppercase bg-slate-700 px-2.5 py-1 rounded-full text-slate-300">
            Automated Projection
          </span>
        </div>

        {forecast.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            No predictive forecast data available at this time.
          </p>
        ) : (
          <div className="divide-y divide-slate-700/50">
            {forecast.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs py-2.5 hover:bg-slate-700/30 px-2 rounded-lg transition-colors">
                <span className="text-slate-300 font-medium">{item.date}</span>
                <span className="font-mono font-bold text-emerald-400">
                  TSH {item.projectedRevenue?.toLocaleString() || '0'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default AnalyticsDashboard;