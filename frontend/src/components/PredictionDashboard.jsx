import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ShieldCheck, ShieldAlert, Sparkles, HelpCircle, ArrowRight, HelpCircle as QuestionIcon } from 'lucide-react';
import { apiService } from '../services/api';

export default function PredictionDashboard() {
  const [formData, setFormData] = useState({
    Age: 30,
    Income: 65000,
    Loan_Amount: 15000,
    Credit_Score: 710,
    Employment_Years: 5,
    Education_Level: 'Bachelor',
    Housing_Status: 'Mortgage',
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const numericFields = ['Age', 'Income', 'Loan_Amount', 'Credit_Score', 'Employment_Years'];
    setFormData((prev) => ({
      ...prev,
      [name]: numericFields.includes(name) ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await apiService.predictDefault(formData);
      setResult(data);
    } catch (err) {
      setError(err.message || 'An error occurred during prediction.');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'Low':
        return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
      case 'Medium':
        return 'text-amber-400 border-amber-500/20 bg-amber-500/5';
      case 'High':
        return 'text-rose-400 border-rose-500/20 bg-rose-500/5';
      default:
        return 'text-blue-400 border-blue-500/20 bg-blue-500/5';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Risk Evaluation Engine</h1>
        <p className="text-slate-400 text-xs font-light">Input applicant parameters below to query prediction outcomes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch">
        {/* Form Panel (Left) */}
        <div className="lg:col-span-3">
          <div className="glassmorphism rounded-3xl p-6 lg:p-8 card-glow-brand h-full">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="h-5 w-5 text-blue-400" />
              <h3 className="text-white font-bold text-lg">Applicant Parameters</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-2">Age</label>
                  <input
                    type="number"
                    name="Age"
                    min="18"
                    max="100"
                    required
                    value={formData.Age}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900/60 border border-slate-700/80 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-2">Credit Score</label>
                  <input
                    type="number"
                    name="Credit_Score"
                    min="300"
                    max="850"
                    required
                    value={formData.Credit_Score}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900/60 border border-slate-700/80 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-2">Annual Income ($)</label>
                  <input
                    type="number"
                    name="Income"
                    min="1"
                    required
                    value={formData.Income}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900/60 border border-slate-700/80 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-2">Loan Amount ($)</label>
                  <input
                    type="number"
                    name="Loan_Amount"
                    min="1"
                    required
                    value={formData.Loan_Amount}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900/60 border border-slate-700/80 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-2">Employment Years</label>
                  <input
                    type="number"
                    name="Employment_Years"
                    min="0"
                    max="60"
                    required
                    value={formData.Employment_Years}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900/60 border border-slate-700/80 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-2">Education Level</label>
                  <select
                    name="Education_Level"
                    value={formData.Education_Level}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900/60 border border-slate-700/80 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="High School">High School</option>
                    <option value="Bachelor">Bachelor</option>
                    <option value="Master">Master</option>
                    <option value="PhD">PhD</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-slate-300 text-xs font-semibold mb-2">Housing Status</label>
                  <select
                    name="Housing_Status"
                    value={formData.Housing_Status}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900/60 border border-slate-700/80 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="Rent">Rent</option>
                    <option value="Mortgage">Mortgage</option>
                    <option value="Own">Own</option>
                  </select>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 text-xs"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing loan risks...
                  </>
                ) : (
                  <>
                    Evaluate Applicant
                    <ArrowRight className="h-4.5 w-4.5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Results Panel (Right) */}
        <div className="lg:col-span-2">
          <div className="glassmorphism rounded-3xl p-6 lg:p-8 card-glow-brand h-full flex flex-col justify-between">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loader"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center flex-1 h-full py-20"
                >
                  <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-4" />
                  <p className="text-slate-400 text-xs tracking-wider animate-pulse">Running Neural Classifiers...</p>
                </motion.div>
              ) : result ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-6 flex-1 flex flex-col justify-between"
                >
                  <div className="space-y-6">
                    {/* Header decision */}
                    <div>
                      <h4 className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2">Loan Risk Decision</h4>
                      
                      {result.prediction === 'Approved' ? (
                        <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                          <div className="p-2 bg-emerald-500 rounded-xl">
                            <ShieldCheck className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <span className="text-emerald-400 font-extrabold text-lg uppercase tracking-wider">Approved</span>
                            <p className="text-slate-400 text-[10px] font-light">Applicant parameters satisfy risk parameters.</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
                          <div className="p-2 bg-rose-500 rounded-xl">
                            <ShieldAlert className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <span className="text-rose-400 font-extrabold text-lg uppercase tracking-wider">Rejected</span>
                            <p className="text-slate-400 text-[10px] font-light">Applicant defaults probability exceeds threshold.</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Stats Layout */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl text-center">
                        <span className="text-slate-500 text-[9px] font-semibold uppercase tracking-wider">Risk Category</span>
                        <div className={`mt-2 py-0.5 px-3 rounded-full border text-xs font-bold w-fit mx-auto ${getRiskColor(result.risk_level)}`}>
                          {result.risk_level}
                        </div>
                      </div>
                      
                      <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl text-center">
                        <span className="text-slate-500 text-[9px] font-semibold uppercase tracking-wider">Model Accuracy</span>
                        <p className="text-xl font-bold text-white mt-1.5">
                          {(result.accuracy * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    {/* Probability Radial Ring */}
                    <div className="flex flex-col items-center p-4 bg-slate-900/20 border border-slate-800/80 rounded-2xl">
                      <span className="text-slate-500 text-[9px] font-semibold uppercase tracking-wider mb-3">Default Risk Probability</span>
                      <div className="relative flex items-center justify-center">
                        <svg className="w-28 h-28 transform -rotate-90">
                          <circle
                            cx="56"
                            cy="56"
                            r="48"
                            className="stroke-slate-800 fill-none"
                            strokeWidth="8"
                          />
                          <motion.circle
                            cx="56"
                            cy="56"
                            r="48"
                            className="fill-none"
                            strokeWidth="8"
                            strokeDasharray={2 * Math.PI * 48}
                            initial={{ strokeDashoffset: 2 * Math.PI * 48 }}
                            animate={{ strokeDashoffset: 2 * Math.PI * 48 * (1 - result.default_probability) }}
                            transition={{ duration: 1 }}
                            strokeLinecap="round"
                            style={{
                              stroke: result.risk_level === 'Low' ? '#10b981' : result.risk_level === 'Medium' ? '#f59e0b' : '#ef4444'
                            }}
                          />
                        </svg>
                        <div className="absolute text-center">
                          <span className="text-2xl font-bold text-white">
                            {(result.default_probability * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Factor reasons */}
                  {result.explanations && result.explanations.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-800/60">
                      <span className="text-slate-500 text-[9px] font-semibold uppercase tracking-wider mb-2 block">Contributing Audit Factors</span>
                      <div className="space-y-1.5">
                        {result.explanations.slice(0, 2).map((exp, idx) => (
                          <div key={idx} className="flex gap-2 text-slate-300 text-[10px] leading-relaxed font-light">
                            <span className="text-blue-500 shrink-0 mt-0.5">•</span>
                            <span>{exp}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center text-center flex-1 h-full py-20"
                >
                  <QuestionIcon className="h-10 w-10 text-slate-600 mb-3" />
                  <h4 className="text-slate-300 text-sm font-semibold">Evaluation Results</h4>
                  <p className="text-slate-500 text-xs mt-1 max-w-[200px] mx-auto font-light leading-normal">
                    Complete the application form on the left to analyze loan default probability.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
