import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, RefreshCw, BarChart2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function TrainingControl({ modelStatus, onRetrain, isTraining }) {
  const isTrained = modelStatus?.trained ?? false;
  const metrics = modelStatus?.metrics;

  const metricCards = [
    { name: 'Accuracy', value: metrics?.accuracy, desc: 'Overall correct predictions' },
    { name: 'F1 Score', value: metrics?.f1_score, desc: 'Balance of precision & recall' },
    { name: 'Precision', value: metrics?.precision, desc: 'Reliability of positive risk calls' },
    { name: 'Recall', value: metrics?.recall, desc: 'Proportion of actual defaults found' }
  ];

  return (
    <div className="glassmorphism rounded-3xl p-6 lg:p-8 card-glow-brand h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-xl">
            <Cpu className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Model Management</h2>
            <p className="text-slate-400 text-xs font-light">Monitor model parameters and retrain on new data</p>
          </div>
        </div>

        <div>
          {isTrained ? (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-medium w-fit">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Active
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full text-xs font-medium w-fit">
              <AlertCircle className="h-3.5 w-3.5" />
              Untrained
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Run Training Section */}
        <div className="bg-slate-900/35 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-slate-200 text-sm font-semibold">Retrain Artificial Intelligence Model</h4>
            <p className="text-slate-400 text-xs mt-1 font-light">Re-optimizes random forest classifier on current credit_risk_dataset.csv</p>
          </div>
          <button
            onClick={onRetrain}
            disabled={isTraining}
            className="w-full md:w-auto shrink-0 bg-blue-500 hover:bg-blue-600 active:scale-95 text-white text-xs font-semibold py-2.5 px-5 rounded-xl transition-all shadow-md hover:shadow-blue-500/10 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isTraining ? 'animate-spin' : ''}`} />
            {isTraining ? 'Optimizing Parameters...' : 'Retrain Model'}
          </button>
        </div>

        {/* Metrics Grid */}
        {isTrained && metrics ? (
          <div className="space-y-5">
            <div>
              <h4 className="text-slate-300 text-xs font-semibold uppercase tracking-wider mb-3">Model Performance</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {metricCards.map((metric, i) => (
                  <div key={i} className="bg-slate-900/15 border border-slate-800/80 rounded-xl p-4 text-center">
                    <p className="text-slate-400 text-xs font-light">{metric.name}</p>
                    <p className="text-2xl font-bold text-white mt-1.5">
                      {metric.value !== undefined ? `${(metric.value * 100).toFixed(1)}%` : 'N/A'}
                    </p>
                    <p className="text-[10px] text-slate-500 font-light mt-1 leading-tight">{metric.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Feature Importance List */}
            {metrics.feature_importances && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <BarChart2 className="h-4 w-4 text-slate-400" />
                  <h4 className="text-slate-300 text-xs font-semibold uppercase tracking-wider">Feature Importance Indicators</h4>
                </div>
                <div className="space-y-3 bg-slate-900/15 border border-slate-800/80 rounded-2xl p-5">
                  {metrics.feature_importances.map((item, idx) => {
                    // Clean up feature name display (e.g. cat__Housing_Status_Rent -> Housing Status (Rent))
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
                          <span className="text-slate-400 font-medium">{(item.importance * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.importance * 100}%` }}
                            transition={{ duration: 1, ease: 'easeOut', delay: idx * 0.05 }}
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-900/15 border border-slate-800 rounded-2xl flex flex-col items-center">
            <AlertCircle className="h-8 w-8 text-amber-500/80 mb-2" />
            <p className="text-slate-300 text-sm font-medium">No Performance Data Available</p>
            <p className="text-slate-500 text-xs mt-1 max-w-sm font-light">The model hasn't been trained yet. retrain the model to evaluate metrics and review predictive signals.</p>
          </div>
        )}
      </div>
    </div>
  );
}
