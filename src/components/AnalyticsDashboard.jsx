// Replace line 1:
import { useEffect, useState } from 'react';
import axios from 'axios';

export const AnalyticsDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const headers = { Authorization: `Bearer ${token}` };

        const [summaryRes, forecastRes] = await Promise.all([
          axios.get('http://localhost:5000/api/analytics/overview', { headers }),
          axios.get('http://localhost:5000/api/analytics/forecast?days=7', { headers }),
        ]);

        setMetrics(summaryRes.data.summary);
        setForecast(forecastRes.data.data.forecast || []);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) return <div className="p-6 text-white">Loading Analytics Engine...</div>;

  return (
    <div className="p-6 bg-slate-900 text-white rounded-xl shadow-lg space-y-6">
      <h2 className="text-2xl font-bold border-b border-slate-700 pb-2">Business Analytics & Projections</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
          <p className="text-sm text-slate-400">Total Paid Revenue</p>
          <p className="text-2xl font-bold text-emerald-400">
            TSH {metrics?.totalPaidRevenue?.toLocaleString() || 0}
          </p>
        </div>
        <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
          <p className="text-sm text-slate-400">Pending Transactions</p>
          <p className="text-2xl font-bold text-amber-400">
            TSH {metrics?.totalPendingRevenue?.toLocaleString() || 0}
          </p>
        </div>
        <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
          <p className="text-sm text-slate-400">Catalog Products</p>
          <p className="text-2xl font-bold text-blue-400">{metrics?.totalCatalogProducts || 0}</p>
        </div>
      </div>

      {/* 7-Day Revenue Forecast */}
      <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
        <h3 className="text-lg font-semibold mb-3">7-Day Predictive Revenue Forecast</h3>
        <div className="space-y-2">
          {forecast.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm py-1 border-b border-slate-700/50">
              <span className="text-slate-300">{item.date}</span>
              <span className="font-mono text-emerald-300">TSH {item.projectedRevenue.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};