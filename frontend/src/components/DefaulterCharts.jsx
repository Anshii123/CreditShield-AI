import React from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  AreaChart, 
  Area, 
  LineChart,
  Line,
  Cell
} from 'recharts';
import { BarChart3, TrendingUp, HelpCircle } from 'lucide-react';

export default function DefaulterCharts({ stats }) {
  const datasetExists = stats?.dataset_exists ?? false;

  // Custom Glassmorphic Tooltip for charts
  const CustomTooltip = ({ active, payload, label, formatter }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl shadow-xl backdrop-blur-md text-xs">
          <p className="text-slate-400 mb-1 font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="font-semibold" style={{ color: entry.color }}>
              {entry.name}: {formatter ? formatter(entry.value) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!datasetExists) {
    return (
      <div className="border border-slate-800 border-dashed rounded-3xl p-8 text-center bg-slate-900/10 h-96 flex flex-col items-center justify-center">
        <BarChart3 className="h-10 w-10 text-slate-500/60 mb-2" />
        <p className="text-slate-300 text-sm font-medium">Visualizations Offline</p>
        <p className="text-slate-500 text-xs mt-1 max-w-sm font-light">
          Dashboard analytics and demographic trends will activate once a credit risk dataset is successfully loaded.
        </p>
      </div>
    );
  }

  // Formatting helpers
  const percentFormatter = (val) => `${(val * 100).toFixed(0)}%`;
  const incomeFormatter = (val) => `$${Math.round(val / 1000)}k`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* 1. Credit Score Bands Area Chart */}
      <div className="glassmorphism rounded-3xl p-6 border border-slate-800/80">
        <h4 className="text-slate-300 text-xs font-semibold uppercase tracking-wider mb-4">Credit Score Demographics</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.credit_bands} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCredit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="value" name="Applicants" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorCredit)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Avg Income by Education Bar Chart */}
      <div className="glassmorphism rounded-3xl p-6 border border-slate-800/80">
        <h4 className="text-slate-300 text-xs font-semibold uppercase tracking-wider mb-4">Average Income by Education Level</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.education_stats} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="level" stroke="#64748b" fontSize={10} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} tickFormatter={incomeFormatter} />
              <Tooltip content={<CustomTooltip formatter={(v) => `$${Number(v).toLocaleString()}`} />} />
              <Bar dataKey="avg_income" name="Avg Income" fill="#8b5cf6" radius={[6, 6, 0, 0]}>
                {stats.education_stats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#8b5cf6' : '#a78bfa'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Delinquency Rate by Debt to Income Ratio */}
      <div className="glassmorphism rounded-3xl p-6 border border-slate-800/80">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-slate-300 text-xs font-semibold uppercase tracking-wider">Default Risk vs Debt-To-Income Ratio</h4>
          <span className="flex items-center gap-1 text-[10px] text-rose-400 font-medium bg-rose-500/10 px-2 py-0.5 rounded-full">
            <TrendingUp className="h-3 w-3" />
            Positive Correlation
          </span>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats.debt_ratios} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="band" stroke="#64748b" fontSize={10} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} tickFormatter={percentFormatter} />
              <Tooltip content={<CustomTooltip formatter={percentFormatter} />} />
              <Line type="monotone" dataKey="rate" name="Delinquency Rate" stroke="#ef4444" strokeWidth={3} dot={{ fill: '#ef4444', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Delinquency Rate by Housing Status */}
      <div className="glassmorphism rounded-3xl p-6 border border-slate-800/80">
        <h4 className="text-slate-300 text-xs font-semibold uppercase tracking-wider mb-4">Default Risk by Housing Status</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.housing_stats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="status" stroke="#64748b" fontSize={10} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} tickFormatter={percentFormatter} />
              <Tooltip content={<CustomTooltip formatter={percentFormatter} />} />
              <Bar dataKey="rate" name="Delinquency Rate" fill="#06b6d4" radius={[6, 6, 0, 0]}>
                {stats.housing_stats.map((entry, index) => {
                  const colors = ['#f59e0b', '#10b981', '#ef4444'];
                  return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
