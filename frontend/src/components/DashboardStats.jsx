import React from 'react';
import { motion } from 'framer-motion';
import { Users, AlertTriangle, Cpu, CreditCard } from 'lucide-react';

export default function DashboardStats({ stats, modelStatus }) {
  const datasetExists = stats?.dataset_exists ?? false;
  
  // Format percentage helper
  const formatPercent = (val) => {
    return `${(val * 100).toFixed(1)}%`;
  };

  // Format number helper
  const formatNumber = (val) => {
    if (val === undefined || val === null) return '0';
    return Number(val).toLocaleString();
  };

  const cards = [
    {
      title: 'Total Credit Records',
      value: datasetExists ? formatNumber(stats.total_applications) : 'N/A',
      subtext: datasetExists ? 'Active training dataset' : 'Dataset not loaded',
      icon: Users,
      color: 'text-blue-400 border-blue-500/20 bg-blue-500/5',
      glow: 'card-glow-brand'
    },
    {
      title: 'Average Defaulter Rate',
      value: datasetExists ? formatPercent(stats.defaulter_rate) : 'N/A',
      subtext: datasetExists ? `${formatNumber(stats.defaulter_count)} historical defaults` : 'No default metric',
      icon: AlertTriangle,
      color: stats?.defaulter_rate > 0.25 ? 'text-rose-400 border-rose-500/20 bg-rose-500/5' : 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
      glow: stats?.defaulter_rate > 0.25 ? 'card-glow-red' : 'card-glow-green'
    },
    {
      title: 'AI Model Accuracy',
      value: modelStatus?.trained ? `${(modelStatus.metrics.accuracy * 100).toFixed(1)}%` : 'N/A',
      subtext: modelStatus?.trained ? `F1 Score: ${(modelStatus.metrics.f1_score * 100).toFixed(1)}%` : 'Model untrained',
      icon: Cpu,
      color: modelStatus?.trained ? 'text-indigo-400 border-indigo-500/20 bg-indigo-500/5' : 'text-amber-400 border-amber-500/20 bg-amber-500/5',
      glow: 'card-glow-brand'
    },
    {
      title: 'Avg Credit Score',
      value: datasetExists ? Math.round(stats.average_credit_score) : 'N/A',
      subtext: datasetExists ? `Avg Income: $${Math.round(stats.average_income / 1000)}k` : 'No scoring data',
      icon: CreditCard,
      color: 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5',
      glow: 'card-glow-brand'
    }
  ];

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100, damping: 15 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8"
    >
      {cards.map((card, i) => (
        <motion.div
          key={i}
          variants={cardVariants}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className={`glassmorphism rounded-2xl p-6 relative overflow-hidden transition-all duration-300 ${card.glow}`}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-medium">{card.title}</p>
              <h3 className="text-2xl font-bold mt-2 text-white">{card.value}</h3>
              <p className="text-slate-500 text-xs mt-1 font-light">{card.subtext}</p>
            </div>
            
            <div className={`p-3 rounded-xl border ${card.color}`}>
              <card.icon className="h-6 w-6" />
            </div>
          </div>
          
          {/* Subtle background glow effect */}
          <div className="absolute -right-10 -bottom-10 w-24 h-24 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        </motion.div>
      ))}
    </motion.div>
  );
}
