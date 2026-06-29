import React from 'react';
import { motion } from 'framer-motion';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  AreaChart, 
  Area, 
  LineChart,
  Line,
  Cell
} from 'recharts';
import { Cpu, BarChart2, TrendingUp, ShieldAlert, Award } from 'lucide-react';

export default function AnalyticsPage({ stats, modelStatus }) {
  const datasetExists = stats?.dataset_exists ?? false;
  const isTrained = modelStatus?.trained ?? false;
  const metrics = modelStatus?.metrics;

  // Custom Glassmorphic Tooltip for charts
  const CustomTooltip = ({ active, payload, label, formatter }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 border border-slate-800 p-3 rounded-xl shadow-xl backdrop-blur-md text-xs">
          <p className="text-slate-400 mb-1.5 font-semibold uppercase tracking-wider">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="font-medium" style={{ color: entry.color }}>
              {entry.name}: {formatter ? formatter(entry.value) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Convert model comparison object to Recharts flat array
  const getModelComparisonData = () => {
    if (!metrics?.model_comparison) return [];
    return Object.entries(metrics.model_comparison).map(([modelName, values]) => ({
      name: modelName,
      Accuracy: parseFloat((values.accuracy * 100).toFixed(1)),
      F1: parseFloat((values.f1_score * 100).toFixed(1)),
      'ROC-AUC': parseFloat((values.roc_auc * 100).toFixed(1))
    }));
  };

  const comparisonData = getModelComparisonData();

  // Metrics configurations
  const metricCards = [
    { name: 'Accuracy', value: metrics?.accuracy, desc: 'Overall correct classifications' },
    { name: 'F1 Score', value: metrics?.f1_score, desc: 'Weighted precision & recall' },
    { name: 'Precision', value: metrics?.precision, desc: 'Correct default assessments' },
    { name: 'Recall', value: metrics?.recall, desc: 'Captured actual defaults' },
    { name: 'ROC AUC', value: metrics?.roc_auc, desc: 'Model discrimination score' }
  ];

  const percentFormatter = (val) => `${(val * 100).toFixed(0)}%`;
  const yAxisPercentFormatter = (val) => `${val}%`;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Model Analytics & Performance</h1>
          <p className="text-slate-400 text-xs font-light">Explore algorithm comparisons, metrics, and demographic risk spreads.</p>
        </div>

        {isTrained && (
          <div className="flex items-center gap-2.5 px-4.5 py-2.5 bg-gradient-to-tr from-blue-500/10 to-indigo-500/10 border border-blue-500/25 rounded-2xl">
            <Award className="h-5 w-5 text-blue-400" />
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider leading-none">Best Model Selected</p>
              <h4 className="text-xs font-bold text-white mt-1">{metrics.selected_model}</h4>
            </div>
          </div>
        )}
      </div>

      {isTrained && metrics ? (
        <div className="space-y-10">
          {/* 1. Core Model Performance Metrics Cards */}
          <div className="space-y-4">
            <h3 className="text-slate-300 text-xs font-semibold uppercase tracking-wider px-1">Selected Model Metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {metricCards.map((m, i) => (
                <div key={i} className="glassmorphism border border-slate-800 rounded-2xl p-5 text-center">
                  <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider">{m.name}</p>
                  <p className="text-2xl font-extrabold text-white mt-2">
                    {m.value !== undefined ? `${(m.value * 100).toFixed(1)}%` : 'N/A'}
                  </p>
                  <p className="text-[9px] text-slate-500 font-light mt-1.5 leading-tight">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Comparison and Feature Importances charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Model Comparison Bar Chart */}
            <div className="glassmorphism rounded-3xl p-6 border border-slate-800">
              <div className="flex items-center gap-2 mb-6">
                <Cpu className="h-5 w-5 text-indigo-400" />
                <h4 className="text-slate-200 text-sm font-bold">Algorithms Performance Comparison</h4>
              </div>
              
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} tickFormatter={yAxisPercentFormatter} />
                    <Tooltip content={<CustomTooltip formatter={(v) => `${v}%`} />} />
                    <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '10px' }} />
                    <Bar dataKey="Accuracy" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="F1" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="ROC-AUC" fill="#ec4899" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Feature Importance Indicators */}
            <div className="glassmorphism rounded-3xl p-6 border border-slate-800">
              <div className="flex items-center gap-2 mb-6">
                <BarChart2 className="h-5 w-5 text-blue-400" />
                <h4 className="text-slate-200 text-sm font-bold">Feature Predictive Signals</h4>
              </div>

              {metrics.feature_importances ? (
                <div className="space-y-4">
                  {metrics.feature_importances.slice(0, 5).map((item, idx) => {
                    let cleanName = item.feature
                      .replace('num__', '')
                      .replace('cat__', '')
                      .replace('_', ' ');
                      
                    if (cleanName.includes('Status')) {
                      cleanName = cleanName.replace('Status ', 'Status ( ') + ' )';
                    }
                    if (cleanName.includes('Level')) {
                      cleanName = cleanName.replace('Level ', 'Level ( ') + ' )';
                    }

                    return (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-light">
                          <span className="text-slate-300 capitalize">{cleanName}</span>
                          <span className="text-slate-500 font-semibold">{(item.importance * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-slate-900/60 h-2 rounded-full overflow-hidden border border-slate-800">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.importance * 100}%` }}
                            transition={{ duration: 1, delay: idx * 0.05 }}
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 text-xs font-light">
                  Feature importances are not generated for this model.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="glassmorphism rounded-3xl p-10 text-center border border-slate-800 flex flex-col items-center justify-center h-64">
          <ShieldAlert className="h-10 w-10 text-slate-600 mb-2.5" />
          <h4 className="text-slate-300 text-sm font-semibold">Model Statistics Offline</h4>
          <p className="text-slate-500 text-xs mt-1 max-w-sm font-light">
            You must train the machine learning models on a credit dataset before evaluation statistics can be visualized.
          </p>
        </div>
      )}

      {/* 3. Demographic distributions from stats */}
      {datasetExists && stats && (
        <div className="space-y-4">
          <h3 className="text-slate-300 text-xs font-semibold uppercase tracking-wider px-1">Demographic Distributions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Risk vs. Debt to Income Ratio */}
            <div className="glassmorphism rounded-3xl p-6 border border-slate-800">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-slate-300 text-xs font-semibold uppercase tracking-wider">Default Risk vs Debt-To-Income</h4>
                <span className="flex items-center gap-1 text-[9px] text-rose-400 font-semibold bg-rose-500/10 px-2 py-0.5 rounded-full">
                  <TrendingUp className="h-3 w-3" />
                  Correlated
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

            {/* Default Risk by Housing Status */}
            <div className="glassmorphism rounded-3xl p-6 border border-slate-800">
              <h4 className="text-slate-300 text-xs font-semibold uppercase tracking-wider mb-6">Default Risk by Housing Status</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.housing_stats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="status" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} tickFormatter={percentFormatter} />
                    <Tooltip content={<CustomTooltip formatter={percentFormatter} />} />
                    <Bar dataKey="rate" name="Delinquency Rate" fill="#06b6d4" radius={[4, 4, 0, 0]}>
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
        </div>
      )}
    </div>
  );
}
