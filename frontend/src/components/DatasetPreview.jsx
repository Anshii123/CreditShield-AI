import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, ChevronDown, Table } from 'lucide-react';
import { apiService } from '../services/api';

export default function DatasetPreview({ previewData, onUploadSuccess }) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const processFile = async (file) => {
    if (!file.name.endsWith('.csv')) {
      setStatus({ success: false, message: 'Please upload only CSV files (.csv extension)' });
      return;
    }

    setUploading(true);
    setStatus(null);

    try {
      const res = await apiService.uploadDataset(file);
      setStatus({ success: true, message: `Successfully loaded "${file.name}" containing ${res.rows} rows.` });
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (err) {
      setStatus({ success: false, message: err.message || 'Dataset upload failed.' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="glassmorphism rounded-3xl p-6 lg:p-8 card-glow-brand">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl">
          <FileSpreadsheet className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Dataset Manager</h2>
          <p className="text-slate-400 text-xs font-light">Upload your customized credit metrics file and preview data</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Upload Zone */}
        <div className="xl:col-span-1">
          <form 
            onDragEnter={handleDrag} 
            onDragOver={handleDrag} 
            onDragLeave={handleDrag} 
            onDrop={handleDrop}
            onSubmit={(e) => e.preventDefault()}
            onClick={triggerFileInput}
            className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all h-64 ${
              dragActive 
                ? 'border-blue-500 bg-blue-500/5' 
                : 'border-slate-700 bg-slate-900/10 hover:border-slate-600 hover:bg-slate-900/20'
            }`}
          >
            <input 
              ref={fileInputRef}
              type="file" 
              accept=".csv"
              className="hidden" 
              onChange={handleFileChange}
              disabled={uploading}
            />

            <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800 mb-4 group-hover:scale-105 transition-transform">
              <Upload className={`h-6 w-6 text-slate-400 ${uploading ? 'animate-bounce' : ''}`} />
            </div>

            <p className="text-slate-200 text-sm font-semibold">
              {uploading ? 'Uploading and validating...' : 'Drag & drop your CSV here'}
            </p>
            <p className="text-slate-500 text-xs mt-1 font-light">or click to browse local files</p>
            <span className="text-[10px] text-slate-600 mt-4 block">Requires columns: Age, Income, Loan_Amount, Credit_Score, Employment_Years, Education_Level, Housing_Status</span>
          </form>

          {/* Status Message */}
          {status && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl border mt-4 text-xs flex items-start gap-2.5 ${
                status.success 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
              }`}
            >
              {status.success ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              )}
              <span className="leading-tight font-light">{status.message}</span>
            </motion.div>
          )}
        </div>

        {/* Dataset Preview Table */}
        <div className="xl:col-span-2 flex flex-col justify-between">
          {previewData?.exists ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-slate-900/35 border border-slate-800 px-4 py-2.5 rounded-xl">
                <div className="flex items-center gap-2">
                  <Table className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-300 text-xs font-semibold uppercase tracking-wider">Dataset Snapshot</span>
                </div>
                <span className="text-slate-400 text-xs font-light">{previewData.total_rows} total rows loaded</span>
              </div>

              {/* Table Wrapper */}
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/15 max-h-48 overflow-y-auto">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-900/80 border-b border-slate-800 sticky top-0">
                        {previewData.columns.map((col, i) => (
                          <th key={i} className="px-4 py-2.5 font-semibold text-slate-300 whitespace-nowrap">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-light">
                      {previewData.data.map((row, rowIdx) => (
                        <tr key={rowIdx} className="hover:bg-slate-800/20 transition-colors">
                          {previewData.columns.map((col, colIdx) => (
                            <td key={colIdx} className="px-4 py-2 text-slate-300 whitespace-nowrap">
                              {row[col] === 1 && col === 'Default' ? (
                                <span className="px-1.5 py-0.5 bg-rose-500/10 border border-rose-500/25 text-rose-400 text-[10px] font-medium rounded-full">Default</span>
                              ) : row[col] === 0 && col === 'Default' ? (
                                <span className="px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-medium rounded-full">Clear</span>
                              ) : (
                                typeof row[col] === 'number' && col === 'Income' || col === 'Loan_Amount' 
                                  ? `$${row[col].toLocaleString()}` 
                                  : row[col]
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-slate-800 border-dashed rounded-2xl h-full flex flex-col items-center justify-center p-8 text-center bg-slate-900/10">
              <FileSpreadsheet className="h-8 w-8 text-slate-500/60 mb-2" />
              <p className="text-slate-300 text-sm font-medium">No Dataset Loaded</p>
              <p className="text-slate-500 text-xs mt-1 max-w-sm font-light">
                Use the uploader on the left to inject credit records. After validation, you will see a detailed data grid preview here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
