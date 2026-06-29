import React, { useState, useEffect } from 'react';
import { Shield, Home, LayoutDashboard, BarChart3, Database, Loader2, Sparkles } from 'lucide-react';
import HomePage from './components/HomePage';
import PredictionDashboard from './components/PredictionDashboard';
import AnalyticsPage from './components/AnalyticsPage';
import DatasetPreview from './components/DatasetPreview';
import TrainingControl from './components/TrainingControl';
import { apiService } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [stats, setStats] = useState(null);
  const [modelStatus, setModelStatus] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTraining, setIsTraining] = useState(false);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setError(null);
    try {
      const [statsRes, statusRes, previewRes] = await Promise.all([
        apiService.getDashboardStats().catch(err => {
          console.warn('Dashboard stats call failed', err);
          return null;
        }),
        apiService.getModelStatus().catch(err => {
          console.warn('Model status call failed', err);
          return null;
        }),
        apiService.getDatasetPreview().catch(err => {
          console.warn('Dataset preview call failed', err);
          return null;
        })
      ]);

      setStats(statsRes);
      setModelStatus(statusRes);
      setPreviewData(previewRes);
    } catch (err) {
      setError('Could not connect to the CreditShield AI API service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRetrain = async () => {
    setIsTraining(true);
    try {
      await apiService.trainModel();
      await loadData();
    } catch (err) {
      alert(`Optimization failed: ${err.message}`);
    } finally {
      setIsTraining(false);
    }
  };

  const navigationItems = [
    { id: 'home', name: 'Home Portal', icon: Home },
    { id: 'predict', name: 'Risk Evaluator', icon: LayoutDashboard },
    { id: 'analytics', name: 'Model Analytics', icon: BarChart3 },
    { id: 'dataset', name: 'Dataset Manager', icon: Database },
  ];

  const renderView = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage onNavigateToPredict={() => setActiveTab('predict')} />;
      case 'predict':
        return <PredictionDashboard />;
      case 'analytics':
        return <AnalyticsPage stats={stats} modelStatus={modelStatus} />;
      case 'dataset':
        return (
          <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
            <div>
              <h1 className="text-2xl font-bold text-white">Database & Optimization Control</h1>
              <p className="text-slate-400 text-xs font-light">Upload transactional matrices and optimize neural networks parameter bounds.</p>
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
              <div className="xl:col-span-2">
                <DatasetPreview 
                  previewData={previewData} 
                  onUploadSuccess={loadData} 
                />
              </div>
              <div className="xl:col-span-1">
                <TrainingControl 
                  modelStatus={modelStatus} 
                  onRetrain={handleRetrain} 
                  isTraining={isTraining} 
                />
              </div>
            </div>
          </div>
        );
      default:
        return <HomePage onNavigateToPredict={() => setActiveTab('predict')} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex flex-col items-center justify-center text-white">
        <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-4" />
        <p className="text-slate-400 text-sm tracking-wider animate-pulse">Initializing CreditShield AI Console...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-[#0e1424] border-r border-slate-800/80 hidden lg:flex flex-col p-6 shrink-0">
        <div className="flex items-center gap-3 mb-10">
          <div className="p-2 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg text-white leading-none">CreditShield</h1>
            <span className="text-[10px] text-blue-400 font-semibold tracking-wider uppercase">Artificial Intelligence</span>
          </div>
        </div>

        <nav className="space-y-1.5 flex-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                {item.name}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-slate-800/80 pt-4 text-center">
          <p className="text-[10px] text-slate-500 font-light">CreditShield AI v1.2.0</p>
          <p className="text-[9px] text-slate-600 font-light mt-0.5">Axios API Layer Active</p>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header Console */}
        <header className="bg-[#0e1424]/40 backdrop-blur-md border-b border-slate-800/60 py-4 px-6 lg:px-8 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-3 lg:hidden">
            <div className="p-1.5 bg-blue-600 rounded-lg">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <h1 className="font-bold text-sm text-white">CreditShield AI</h1>
          </div>
          
          <div className="hidden lg:block">
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Enterprise Risk Intelligence</span>
            <h2 className="text-sm font-bold text-white mt-0.5">Loan Defaulter Prediction Console</h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Small Screen Layout Tabs */}
            <div className="flex bg-[#0b0f19] border border-slate-800 p-1 rounded-xl lg:hidden max-w-[280px] overflow-x-auto">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    activeTab === item.id ? 'bg-blue-600 text-white' : 'text-slate-400'
                  }`}
                >
                  {item.name.split(' ')[0]}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-[10px]">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-slate-400 font-medium">Server Online</span>
            </div>
          </div>
        </header>

        {/* Global Error Banner */}
        {error && (
          <div className="bg-rose-500/10 border-b border-rose-500/20 text-rose-400 py-3 px-6 text-xs flex items-center gap-2.5">
            <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping" />
            <span>{error} Make sure your FastAPI backend server is running by executing <code className="bg-slate-950 px-1.5 py-0.5 rounded font-mono">python backend/run.py</code>.</span>
          </div>
        )}

        {/* Page Render Router */}
        <div className="flex-1 overflow-y-auto">
          {renderView()}
        </div>
      </main>
    </div>
  );
}
