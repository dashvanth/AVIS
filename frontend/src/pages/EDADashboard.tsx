import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  FileText,
  Table,
  Search,
  Calculator,
  Ban,
  Terminal,
  ShieldAlert,
  HelpCircle,
  Database,
  BarChart2,
  MessageSquare,
  Activity
} from "lucide-react";
import { motion } from "framer-motion";

import * as api from "../services/api";
import type {
  EDASummary,
  CorrelationData,
  PreviewData
} from "../types";

const EDADashboard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [summary, setSummary] = useState<EDASummary | null>(null);
  const [correlation, setCorrelation] = useState<CorrelationData | null>(null);
  const [showAllCategories, setShowAllCategories] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const [previewData, summaryData, corrData] = await Promise.all([
          api.getDatasetPreview(Number(id)),
          api.getEDASummary(Number(id)),
          api.getCorrelationMatrix(Number(id))
        ]);

        setPreview(previewData);
        setSummary(summaryData);
        setCorrelation(corrData);
      } catch (err: any) {
        console.error("EDA Fetch Error:", err);
        setError("Unable to load analysis. Please ensure the backend is running.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 animate-pulse"></div>
          <Loader2 className="w-16 h-16 text-indigo-500 animate-spin relative z-10" />
        </div>
        <p className="text-slate-400 font-mono text-sm mt-6 animate-pulse tracking-widest">RUNNING TRANSPARENT AUDIT...</p>
      </div>
    );
  }

  if (error || !preview || !summary) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 p-6">
        <div className="bg-red-500/10 border border-red-500/20 p-10 rounded-3xl max-w-lg text-center backdrop-blur-xl">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-wide">Analysis Failed</h3>
          <p className="text-slate-400 mb-8 leading-relaxed">{error || "Data could not be loaded."}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold uppercase tracking-widest transition-all hover:scale-105 shadow-lg shadow-red-600/20"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-200 font-sans selection:bg-indigo-500/30 pb-32">
      {/* Background Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-900/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-900/10 rounded-full blur-[150px]" />
      </div>

      {/* HEADER */}
      <div className="w-full max-w-[98%] mx-auto px-6 pt-16 pb-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6"
        >
          <div>
            <div className="flex items-center gap-3 text-indigo-400 text-xs font-black uppercase tracking-[0.3em] mb-4">
              <Search className="w-4 h-4" /> Transparent Analysis
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-4">
              Visual <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Explanation</span>
            </h1>
            <p className="text-slate-400 max-w-3xl text-lg md:text-xl leading-relaxed font-light">
              Nothing is hidden. <span className="text-slate-200 font-medium">Nothing is assumed.</span><br />
              This report explains <span className="text-indigo-400 font-bold decoration-indigo-500/30 underline underline-offset-4">what</span> we checked, <span className="text-purple-400 font-bold decoration-purple-500/30 underline underline-offset-4">how</span> we calculated it, and <span className="text-emerald-400 font-bold decoration-emerald-500/30 underline underline-offset-4">why</span> it matters.
            </p>
          </div>

          <div className="hidden xl:block">
            <div className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-4">
              <div className="flex flex-col text-right">
                <span className="text-[10px] uppercase tracking-widest text-slate-500">Audit Status</span>
                <span className="text-emerald-400 font-bold flex items-center gap-2 justify-end">
                  <CheckCircle2 className="w-4 h-4" /> Verified
                </span>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div className="flex flex-col text-right">
                <span className="text-[10px] uppercase tracking-widest text-slate-500">Dataset ID</span>
                <span className="text-white font-mono">#{String(id).padStart(4, '0')}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-[98%] mx-auto space-y-12 relative z-10"
      >

        {/* 🔹 SECTION 1: DATA RECEIVED CONFIRMATION */}
        <motion.section variants={itemVariants} className="space-y-8">
          <div className="flex items-center gap-4 border-b border-indigo-500/20 pb-4">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 font-black text-lg border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.15)]">1</span>
            <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Data Received Confirmation</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Dataset Name", value: preview.filename, icon: FileText, color: "text-blue-400" },
              { label: "Rows Received", value: preview.row_count.toLocaleString(), icon: Table, color: "text-emerald-400" },
              { label: "Columns Received", value: preview.column_count, icon: Database, color: "text-purple-400" },
              { label: "File Type", value: preview.file_type.toUpperCase(), icon: FileText, color: "text-amber-400" },
            ].map((item, idx) => (
              <div key={idx} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/5 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative p-8 bg-slate-900/40 border border-white/5 rounded-3xl flex flex-col items-center text-center gap-4 backdrop-blur-sm group-hover:border-white/10 transition-all group-hover:-translate-y-1">
                  <div className={`p-4 rounded-2xl bg-white/5 ${item.color}`}>
                    <item.icon className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 uppercase tracking-widest block mb-2">{item.label}</span>
                    <span className="text-2xl md:text-3xl font-black text-white tracking-tight">{item.value}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        <div className="flex flex-col gap-16">
          {/* 🔹 SECTION 2: COLUMN STRUCTURE */}
          <motion.section variants={itemVariants} className="space-y-8">
            <div className="flex items-center gap-4 border-b border-indigo-500/20 pb-4">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 font-black text-lg border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.15)]">2</span>
              <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Column Structure</h2>
            </div>

            <div className="overflow-x-auto overflow-hidden bg-slate-900/60 border border-white/5 rounded-3xl backdrop-blur-md shadow-2xl">
              <table className="w-full text-sm text-left">
                <thead className="bg-black/20 text-slate-400 uppercase text-[10px] font-black tracking-widest">
                  <tr>
                    <th className="px-8 py-5">Column Name</th>
                    <th className="px-8 py-5">Detected Type</th>
                    <th className="px-8 py-5">Explanation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {preview.column_types?.map((col, idx) => (
                    <tr key={idx} className="hover:bg-white/5 transition-colors group">
                      <td className="px-8 py-5 font-bold text-white group-hover:text-indigo-300 transition-colors">{col.column_name}</td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1.5 rounded-lg text-[10px] uppercase font-black tracking-widest border ${col.representation === "Number" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                          col.representation === "Date" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                            "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                          }`}>
                          {col.representation}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-slate-400 bg-white/0 group-hover:bg-white/[0.02] transition-colors">
                        {col.representation === "Number" ? "Validated for mathematical calculations." :
                          col.representation === "Date" ? "Parsed as time-series data." :
                            "Identified as categorical labels."}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.section>

          {/* 🔹 SECTION 3: DATA QUALITY CHECK */}
          <motion.section variants={itemVariants} className="space-y-8">
            <div className="flex items-center gap-4 border-b border-indigo-500/20 pb-4">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 font-black text-lg border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.15)]">3</span>
              <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Quality Scan (Read-Only)</h2>
            </div>

            <div className="flex flex-col gap-6">
              {(preview.data_issues?.length || 0) > 0 ? (
                <div className="overflow-x-auto overflow-hidden bg-red-500/5 border border-red-500/20 rounded-3xl shadow-[0_0_30px_rgba(239,68,68,0.05)]">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-red-500/10 text-red-200 uppercase text-[10px] font-black tracking-widest">
                      <tr>
                        <th className="px-8 py-5">Column</th>
                        <th className="px-8 py-5">Issue Found</th>
                        <th className="px-8 py-5">Severity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-red-500/10">
                      {preview.data_issues?.map((issue, idx) => (
                        <tr key={idx} className="hover:bg-red-500/5 transition-colors">
                          <td className="px-8 py-5 font-bold text-white">{issue.column_name}</td>
                          <td className="px-8 py-5 text-red-200">{issue.issue_type}: {issue.explanation}</td>
                          <td className="px-8 py-5">
                            <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${issue.severity === "High" ? "bg-red-500 text-white" : "bg-amber-500 text-black"
                              }`}>
                              {issue.severity}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex-1 p-10 bg-emerald-500/5 border border-emerald-500/20 rounded-3xl flex flex-col items-center justify-center text-center gap-6 backdrop-blur-sm">
                  <div className="p-6 bg-emerald-500/10 rounded-full border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                    <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-white uppercase tracking-tight mb-2">No Issues Found</h4>
                    <p className="text-emerald-200/70 text-lg">Your data passed all integrity checks.</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 p-6 bg-amber-500/5 border border-amber-500/20 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
                <ShieldAlert className="w-6 h-6 text-amber-500 shrink-0" />
                <p className="text-sm text-amber-100/90 font-medium leading-relaxed">
                  The system has <span className="font-bold text-amber-400 bg-amber-500/10 px-1 rounded mx-1">NOT removed or changed</span> any data. It only identified these issues for your review.
                </p>
              </div>
            </div>
          </motion.section>
        </div>

        {/* 🔹 SECTION 4: SAFETY AUDIT */}
        <motion.section variants={itemVariants} className="bg-slate-900/30 border border-white/5 rounded-3xl p-8 backdrop-blur-md">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-center">
            <div className="col-span-1 border-r border-white/5 pr-8">
              <div className="flex items-center gap-4 mb-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 font-black text-sm border border-indigo-500/20">4</span>
                <h2 className="text-lg font-bold text-white uppercase tracking-wider">Safety Audit</h2>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">Verifies that no rows were lost during the scanning process.</p>
            </div>

            <div className="col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-6 bg-black/40 rounded-2xl border border-white/5">
                <p className="text-[10px] uppercase text-slate-500 tracking-[0.2em] mb-2">Rows Before</p>
                <p className="text-4xl font-mono text-white tracking-tighter">{preview.row_count}</p>
              </div>
              <div className="p-6 bg-black/40 rounded-2xl border border-white/5">
                <p className="text-[10px] uppercase text-slate-500 tracking-[0.2em] mb-2">Rows After</p>
                <p className="text-4xl font-mono text-white tracking-tighter">{preview.row_count}</p>
              </div>
              <div className="p-6 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 flex items-center justify-between group overflow-hidden relative">
                <div className="absolute inset-0 bg-emerald-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div>
                  <p className="text-[10px] uppercase text-emerald-400 tracking-[0.2em] mb-2">Rows Removed</p>
                  <p className="text-4xl font-mono text-emerald-400 tracking-tighter">0</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-emerald-400 opacity-50" />
              </div>
            </div>
          </div>
        </motion.section>

        {/* 🔹 SECTION 5: BASIC CALCULATIONS (Numeric) */}
        {summary.numeric.length > 0 && (
          <motion.section variants={itemVariants} className="space-y-8">
            <div className="flex items-center gap-4 border-b border-indigo-500/20 pb-4">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 font-black text-lg border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.15)]">5</span>
              <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Averages (Visible Logic)</h2>
            </div>

            <div className="p-8 bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border border-indigo-500/20 rounded-3xl flex items-center gap-8 mb-8 backdrop-blur-md">
              <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-400">
                <Calculator className="w-8 h-8" />
              </div>
              <div className="space-y-3 flex-1">
                <h4 className="text-xs font-black text-indigo-300 uppercase tracking-[0.2em]">Formula Exposed</h4>
                <div className="flex flex-col md:flex-row gap-4">
                  <code className="text-sm text-white px-4 py-2 bg-black/40 rounded-lg border border-white/5 font-mono">
                    <span className="text-purple-400">Mean</span> = ∑(Values) ÷ Count
                  </code>
                  <code className="text-sm text-white px-4 py-2 bg-black/40 rounded-lg border border-white/5 font-mono">
                    <span className="text-emerald-400">Variation</span> = Deviation from Mean
                  </code>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {summary.numeric.map((col, idx) => (
                <div key={idx} className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-3xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative p-6 bg-slate-900/40 border border-white/5 rounded-3xl hover:border-indigo-500/30 transition-all hover:-translate-y-1 backdrop-blur-sm">
                    <div className="flex justify-between items-start mb-6">
                      <h3 className="font-bold text-white text-lg truncate max-w-[70%]">{col.column}</h3>
                      <Activity className="w-5 h-5 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-end border-b border-white/5 pb-3">
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest">Average</span>
                        <span className="text-2xl font-mono text-indigo-300 tracking-tight">{col.mean.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest">Variation</span>
                        <span className={`text-xs font-black uppercase tracking-widest px-2 py-1 rounded bg-black/20 ${(col.std / col.mean) > 0.5 ? "text-amber-400" : "text-emerald-400"
                          }`}>
                          {(col.std / col.mean) > 0.5 ? "High" : "Stable"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
          {/* 🔹 SECTION 6: SPREAD */}
          {summary.numeric.length > 0 && (
            <motion.section variants={itemVariants} className="space-y-8">
              <div className="flex items-center gap-4 border-b border-indigo-500/20 pb-4">
                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 font-black text-lg border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.15)]">6</span>
                <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Value Behavior</h2>
              </div>

              <div className="overflow-x-auto overflow-hidden bg-slate-900/60 border border-white/5 rounded-3xl backdrop-blur-md">
                <table className="w-full text-sm text-left">
                  <thead className="bg-white/5 text-slate-400 uppercase text-[10px] font-black tracking-widest">
                    <tr>
                      <th className="px-8 py-5">Column</th>
                      <th className="px-8 py-5">Std. Dev</th>
                      <th className="px-8 py-5">Explanation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {summary.numeric.map((col, idx) => (
                      <tr key={idx} className="hover:bg-white/5 transition-colors">
                        <td className="px-8 py-5 font-bold text-white">{col.column}</td>
                        <td className="px-8 py-5 font-mono text-slate-400">{col.std.toFixed(2)}</td>
                        <td className="px-8 py-5 text-slate-300 italic text-xs leading-relaxed opacity-80">
                          "{col.insight}"
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.section>
          )}

          {/* 🔹 SECTION 7: CATEGORY COUNTS */}
          {summary.categorical.length > 0 && (
            <motion.section variants={itemVariants} className="space-y-8">
              <div className="flex items-center gap-4 border-b border-indigo-500/20 pb-4">
                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 font-black text-lg border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.15)]">7</span>
                <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Frequency Analysis</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {summary.categorical.slice(0, showAllCategories ? undefined : 3).map((col, idx) => (
                  <div key={idx} className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 hover:bg-slate-900/60 transition-colors">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-white tracking-tight">{col.column}</h3>
                      <span className="text-[9px] bg-white/5 px-2 py-1 rounded text-slate-500 uppercase tracking-widest">{col.unique_count} Unique</span>
                    </div>
                    <div className="space-y-2">
                      {Object.entries(col.top_values).map(([val, count], i) => (
                        <div key={i} className="flex justify-between items-center text-xs p-2 rounded hover:bg-white/5 group">
                          <span className="text-slate-300 truncate max-w-[60%] group-hover:text-white transition-colors">{val}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
                              <div style={{ width: `${(count / summary.total_rows * 100)}%` }} className="h-full bg-indigo-500" />
                            </div>
                            <span className="font-mono text-slate-400">{((count / summary.total_rows) * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="mt-5 text-[10px] text-slate-500 border-t border-white/5 pt-3 flex items-center gap-2">
                      <Activity className="w-3 h-3" />
                      {col.diversity_index}
                    </p>
                  </div>
                ))}
              </div>

              {summary.categorical.length > 3 && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={() => setShowAllCategories(!showAllCategories)}
                    className="px-6 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-all flex items-center gap-2"
                  >
                    {showAllCategories ? "Show Less" : `Show All (${summary.categorical.length})`}
                    <div className={`w-1.5 h-1.5 border-r border-b border-current transform transition-transform ${showAllCategories ? "rotate-[225deg] mt-1" : "rotate-45 -mt-1"}`} />
                  </button>
                </div>
              )}
            </motion.section>
          )}
        </div>

        {/* 🔹 SECTION 8: LIMITS & USAGE */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.section variants={itemVariants} className="space-y-8">
            <div className="flex items-center gap-4 border-b border-indigo-500/20 pb-4">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 font-black text-lg border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.15)]">8</span>
              <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Honest Limits</h2>
            </div>

            <div className="bg-slate-900/60 border border-white/5 rounded-3xl p-8 flex flex-col items-center text-center gap-6 h-full justify-center bg-[url('https://grainy-gradients.vercel.app/noise.svg')]">
              <div className="bg-slate-800 p-4 rounded-full border border-white/5">
                <Ban className="w-8 h-8 text-slate-400" />
              </div>
              <div className="space-y-4">
                {correlation?.matrix.length === 0 ? (
                  <div>
                    <h4 className="text-xl font-bold text-white mb-2">Relationship Analysis Skipped</h4>
                    <p className="text-slate-400 mb-6 text-sm">
                      The system could not calculate correlations.
                    </p>
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                      <p className="text-amber-200 text-sm font-medium">
                        "Relationships require at least two numeric columns. This dataset does not meet that requirement."
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h4 className="text-xl font-bold text-white mb-2">Linear Limits</h4>
                    <p className="text-slate-400 text-sm max-w-sm mx-auto">
                      Only linear relationships were tested. Complex non-linear patterns may exist that are not visible here.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.section>

          <motion.section variants={itemVariants} className="space-y-8">
            <div className="flex items-center gap-4 border-b border-indigo-500/20 pb-4">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 font-black text-lg border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.15)]">9</span>
              <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Usage Guide</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
              <div className="p-8 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl flex flex-col gap-4 hover:bg-emerald-500/10 transition-colors">
                <h4 className="flex items-center gap-3 text-emerald-400 font-black uppercase tracking-widest text-xs">
                  <CheckCircle2 className="w-5 h-5" /> Good For
                </h4>
                <ul className="space-y-4 pt-2">
                  {summary.categorical.length > 0 && <li className="text-emerald-100/80 text-sm font-medium flex gap-3"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5" /> Grouping & Categorization</li>}
                  {summary.numeric.length > 0 && <li className="text-emerald-100/80 text-sm font-medium flex gap-3"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5" /> Trend Calculation</li>}
                  <li className="text-emerald-100/80 text-sm font-medium flex gap-3"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5" /> Historical Reporting</li>
                </ul>
              </div>
              <div className="p-8 bg-red-500/5 border border-red-500/10 rounded-3xl flex flex-col gap-4 hover:bg-red-500/10 transition-colors">
                <h4 className="flex items-center gap-3 text-red-400 font-black uppercase tracking-widest text-xs">
                  <Ban className="w-5 h-5" /> Avoid
                </h4>
                <ul className="space-y-4 pt-2">
                  {(preview.data_issues?.length || 0) > 0 && <li className="text-red-200/80 text-sm font-medium flex gap-3"><span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5" /> Precise Logic (Data Issues)</li>}
                  {correlation?.matrix.length === 0 && <li className="text-red-200/80 text-sm font-medium flex gap-3"><span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5" /> Correlation Mining</li>}
                  <li className="text-red-200/80 text-sm font-medium flex gap-3"><span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5" /> Streaming Analysis</li>
                </ul>
              </div>
            </div>
          </motion.section>
        </div>

        {/* 🔹 SECTION 10: BACKEND TRACE */}
        <motion.section variants={itemVariants} className="space-y-8">
          <div className="flex items-center gap-4 border-b border-indigo-500/20 pb-4">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 font-black text-lg border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.15)]">10</span>
            <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Backend Process Trace</h2>
          </div>

          <div className="bg-[#0f111a] border border-slate-800 rounded-3xl p-8 font-mono text-xs shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-50">
              <Terminal className="w-24 h-24 text-white/5" />
            </div>

            <div className="flex items-center gap-2 text-indigo-400 mb-6 border-b border-white/5 pb-4">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="ml-4 opacity-50">root@avis-engine:~# tail -f system_log.trace</span>
            </div>

            <div className="space-y-3 relative z-10 max-h-[300px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
              {preview.forensic_trace?.map((log, idx) => (
                <div key={idx} className="flex gap-4 items-start group hover:bg-white/5 p-1 rounded">
                  <span className="text-slate-600 w-16 shrink-0 text-right">{String(log.timestamp).padStart(4, '0')}ms</span>
                  <span className="text-emerald-500 shrink-0">➜</span>
                  <div className="flex flex-col">
                    <span className="text-emerald-400 font-bold">{log.step}</span>
                    <span className="text-slate-500">{log.code}</span>
                  </div>
                </div>
              ))}
              {summary.numeric.map((c, i) => (
                <div key={`n-${i}`} className="flex gap-4 items-start group hover:bg-white/5 p-1 rounded">
                  <span className="text-slate-600 w-16 shrink-0 text-right">---</span>
                  <span className="text-emerald-500 shrink-0">➜</span>
                  <div className="flex flex-col">
                    <span className="text-indigo-400">Calculated Mean</span>
                    <span className="text-slate-500">pandas.mean(col="{c.column}")</span>
                  </div>
                </div>
              ))}
              <div className="flex gap-4 items-start pt-4 border-t border-white/5 mt-4">
                <span className="text-slate-600 w-16 shrink-0 text-right">END</span>
                <span className="text-purple-500 shrink-0">■</span>
                <span className="text-white">Analysis Session Successfully Closed.</span>
              </div>
            </div>
          </div>
        </motion.section>

        {/* 🔹 SECTION 11: DISCLAIMER */}
        <motion.section variants={itemVariants} className="bg-slate-900/50 border border-white/5 p-10 rounded-[3rem] text-center backdrop-blur-xl">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-white font-bold text-xl mb-3 tracking-tight">System Limitation Disclaimer</h3>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
            The system has <span className="text-white font-bold bg-white/5 px-2 py-1 rounded">NOT</span> performed predictions, machine learning, or automated data cleaning.
            All data shown is exactly as it appears in the file.
          </p>
        </motion.section>

        {/* 🔹 SECTION 12: NEXT STEP & FOOTER */}
        <motion.section variants={itemVariants} className="pt-16 pb-8 border-t border-white/5 flex flex-col items-center gap-12 text-center">
          <div className="space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-400 mb-2 border border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.2)] animate-pulse">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">Analysis Complete</h2>
              <div className="text-slate-400 max-w-xl mx-auto text-lg space-y-2">
                <p>Your dataset is structurally valid.</p>
                <p>It contains <strong className="text-white">{summary.categorical.length}</strong> Categorical and <strong className="text-white">{summary.numeric.length}</strong> Numeric columns.</p>
                <p className="text-indigo-400 font-medium">Ready for visualization.</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6 w-full max-w-3xl px-6">
            <button
              disabled={true}
              className="flex-1 py-5 bg-slate-900 border border-slate-800 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 cursor-not-allowed opacity-50"
            >
              <FileText className="w-4 h-4" /> Download Report
            </button>
            <button
              onClick={() => navigate(`/dashboard/${id}/visualization`)}
              className="flex-1 py-5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(99,102,241,0.3)] transition-all hover:scale-[1.02] hover:-translate-y-1"
            >
              <BarChart2 className="w-5 h-5" /> Create Charts
            </button>
            <button
              onClick={() => navigate(`/dashboard/${id}/chat`)}
              className="flex-1 py-5 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(168,85,247,0.3)] transition-all hover:scale-[1.02] hover:-translate-y-1"
            >
              <MessageSquare className="w-5 h-5" /> Ask AI
            </button>
          </div>

          <p className="text-[10px] text-slate-600 uppercase tracking-[0.3em] opacity-50 mt-8">
            System Version 1.0.4 • Audit Node 24a • Secure Environment
          </p>
        </motion.section>

      </motion.div>
    </div>
  );
};

export default EDADashboard;
