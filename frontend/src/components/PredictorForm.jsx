import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ShieldAlert, Shield, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { apiService } from '../services/api';

export default function PredictorForm({ modelStatus }) {
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

  const resetForm = () => {
    setResult(null);
    setError(null);
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'Low':
        return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10';
      case 'Medium':
        return 'text-amber-400 border-amber-500/20 bg-amber-500/10';
      case 'High':
        return 'text-rose-400 border-rose-500/20 bg-rose-500/10';
      default:
        return 'text-blue-400 border-blue-500/20 bg-blue-500/10';
    }
  };

  const getRiskIcon = (level) => {
    switch (level) {
      case 'Low':
        return <ShieldCheck className="h-10 w-10 text-emerald-400" />;
      case 'Medium':
        return <Shield className="h-10 w-10 text-amber-400" />;
      case 'High':
        return <ShieldAlert className="h-10 w-10 text-rose-400" />;
      default:
        return <Shield className="h-10 w-10 text-blue-400" />;
    }
  };

  return (
    <div className="glassmorphism rounded-3xl p-6 lg:p-8 card-glow-brand h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-xl">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Defaulter Risk Predictor</h2>
          <p className="text-slate-400 text-xs font-light">Evaluate applicant risk using the active machine learning model</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!result ? (
          <motion.form
            key="predict-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
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
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-2">Annual Income ($)</label>
                <input
                  type="number"
                  name="Income"
                  min="0"
                  required
                  value={formData.Income}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-2">Loan Amount ($)</label>
                <input
                  type="number"
                  name="Loan_Amount"
                  min="0"
                  required
                  value={formData.Loan_Amount}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-2">Employment (Years)</label>
                <input
                  type="number"
                  name="Employment_Years"
                  min="0"
                  max="60"
                  required
                  value={formData.Employment_Years}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-2">Education Level</label>
                <select
                  name="Education_Level"
                  value={formData.Education_Level}
                  onChange={handleInputChange}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                  style={{ backgroundImage: 'radial-gradient(circle, transparent 20%, #1e293b 20%, #1e293b 80%, transparent 80%)' }}
                >
                  <option value="High School">High School</option>
                  <option value="Bachelor">Bachelor</option>
                  <option value="Master">Master</option>
                  <option value="PhD">PhD</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-300 text-xs font-semibold mb-2">Housing Status</label>
                <div className="grid grid-cols-3 gap-3">
                  {['Rent', 'Mortgage', 'Own'].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, Housing_Status: status }))}
                      className={`py-2 px-4 rounded-xl border text-sm font-medium transition-all ${
                        formData.Housing_Status === status
                          ? 'border-blue-500 bg-blue-500/10 text-white'
                          : 'border-slate-700 bg-slate-900/35 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium py-3 px-4 rounded-xl shadow-lg hover:shadow-indigo-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Calculating Default Odds...
                </>
              ) : (
                'Run Risk Evaluation'
              )}
            </button>
          </motion.form>
        ) : (
          <motion.div
            key="predict-result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-6"
          >
            {/* Risk Gauge Panel */}
            <div className="flex flex-col items-center p-6 bg-slate-900/30 rounded-2xl border border-slate-800">
              <div className="relative flex items-center justify-center">
                {/* SVG Radial Gauge */}
                <svg className="w-36 h-36 transform -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r="62"
                    className="stroke-slate-800 fill-none"
                    strokeWidth="10"
                  />
                  <motion.circle
                    cx="72"
                    cy="72"
                    r="62"
                    className="fill-none"
                    strokeWidth="10"
                    strokeDasharray={2 * Math.PI * 62}
                    initial={{ strokeDashoffset: 2 * Math.PI * 62 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 62 * (1 - result.probability) }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    strokeLinecap="round"
                    style={{
                      stroke: result.risk_level === 'Low' ? '#10b981' : result.risk_level === 'Medium' ? '#f59e0b' : '#ef4444'
                    }}
                  />
                </svg>
                
                {/* Center Value */}
                <div className="absolute text-center">
                  <span className="text-3xl font-extrabold text-white">
                    {Math.round(result.probability * 100)}%
                  </span>
                  <p className="text-[10px] text-slate-500 tracking-wider uppercase mt-0.5">Risk Score</p>
                </div>
              </div>

              {/* Severity Label */}
              <div className={`mt-5 px-4 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 ${getRiskColor(result.risk_level)}`}>
                {getRiskIcon(result.risk_level)}
                <span className="uppercase tracking-wider">{result.risk_level} Delinquency Risk</span>
              </div>
            </div>

            {/* Explanation Factors */}
            <div className="space-y-3.5">
              <h4 className="text-slate-300 text-xs font-semibold uppercase tracking-wider">AI Assessment Factors</h4>
              <div className="space-y-2">
                {result.explanations.map((explanation, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex gap-3 items-start p-3 bg-slate-900/15 rounded-xl border border-slate-800/40"
                  >
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                      result.risk_level === 'Low' ? 'bg-emerald-500' : result.risk_level === 'Medium' ? 'bg-amber-500' : 'bg-rose-500'
                    }`} />
                    <p className="text-slate-300 text-xs leading-relaxed font-light">{explanation}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <button
              onClick={resetForm}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-2.5 px-4 rounded-xl border border-slate-700/60 transition-colors flex items-center justify-center gap-2 text-xs"
            >
              <ArrowLeft className="h-4.5 w-4.5" />
              Evaluate Another Applicant
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
