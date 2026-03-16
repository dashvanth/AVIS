import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Table, AlertCircle, Database, Layout, ChevronDown, ChevronUp, ArrowRight, BarChart3 } from "lucide-react";

interface QualityMetricDataModalProps {
  open: boolean;
  onClose: () => void;
  metricName: string | null;
  score: number;
  preview: any;
  repairData: any;
}

export const QualityMetricDataModal: React.FC<QualityMetricDataModalProps> = ({
  open,
  onClose,
  metricName,
  score,
  preview,
  repairData
}) => {
  const [showAllRows, setShowAllRows] = useState(false);

  if (!open || !metricName) return null;

  // 🛡️ ULTRA-SAFE DATA PARSING
  const getSafeDetails = () => {
    try {
      const name = (metricName || "").toLowerCase();
      const issues = Array.isArray(repairData?.issues) ? repairData.issues : [];
      const summary = repairData?.summary || {};
      
      let label = metricName || "Quality Analysis";
      let issuesList = [];
      let totalIssues = 0;
      let denLabel = "Data Points";
      let denValue = 100;
      let icon = <AlertCircle className="w-5 h-5 text-indigo-400" />;

      if (name.includes("completeness")) {
        label = "Completeness";
        issuesList = issues.filter((i: any) => (i.issue || i.type || "").toLowerCase().includes("missing"));
        totalIssues = summary?.total_missing_cells || 0;
        denLabel = "Total Cells";
        denValue = (preview?.row_count || 0) * (preview?.column_count || 0);
        icon = <BarChart3 className="w-5 h-5 text-indigo-400" />;
      } else if (name.includes("consistency") || name.includes("uniqueness")) {
        label = name.includes("uniqueness") ? "Uniqueness" : "Consistency";
        issuesList = issues.filter((i: any) => (i.issue || i.type || "").toLowerCase().includes("duplicate"));
        totalIssues = summary?.duplicate_rows || 0;
        denLabel = "Total Rows";
        denValue = preview?.row_count || 0;
        icon = <Database className="w-5 h-5 text-indigo-400" />;
      } else if (name.includes("integrity") || name.includes("validity") || name.includes("type")) {
        label = "Validity";
        issuesList = issues.filter((i: any) => {
          const s = (i.issue || i.type || "").toLowerCase();
          return s.includes("type") || s.includes("schema") || s.includes("invalid");
        });
        totalIssues = issuesList.length;
        denLabel = "Analyzed Columns";
        denValue = preview?.column_count || 0;
        icon = <Layout className="w-5 h-5 text-indigo-400" />;
      } else {
        issuesList = issues.slice(0, 3);
        totalIssues = issues.length;
        denValue = preview?.row_count || 100;
      }

      return { label, issues: issuesList, totalIssues, denLabel, denValue, icon };
    } catch (e) {
      console.error("Critical failure in getSafeDetails:", e);
      return {
        label: "Analysis Error",
        issues: [],
        totalIssues: 0,
        denLabel: "N/A",
        denValue: 0,
        icon: <AlertCircle className="w-5 h-5 text-red-400" />
      };
    }
  };

  const details = getSafeDetails();
  const sortedColumns = (details.issues || [])
    .map((i: any) => ({
      name: i.column || "Global",
      count: i.count || 0,
      impact: ((i.count || 0) / (details.denValue || 1) * 100).toFixed(1)
    }))
    .sort((a: any, b: any) => parseFloat(b.impact) - parseFloat(a.impact));

  const affectedColumns = sortedColumns.slice(0, 5);
  const mainImpactColumn = sortedColumns[0]?.name;
  const rowTraceData = Array.isArray(preview?.full_data) ? preview.full_data : (Array.isArray(preview?.data) ? preview.data : []);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className="bg-slate-900 border border-white/10 w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-indigo-500/10 to-transparent">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-500/20 rounded-2xl text-indigo-400">
                  {details.icon}
                </div>
                <div>
                  <h3 className="text-xl font-black text-white italic uppercase tracking-widest">{details.label}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] italic">
                      Performance: {score || 0}%
                    </span>
                    {mainImpactColumn && mainImpactColumn !== "Global" && (
                      <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-[9px] font-black uppercase tracking-tighter">
                        Main impact: {mainImpactColumn}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
              {/* IMPACT SUMMARY */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white/5 border border-white/5 p-6 rounded-3xl flex flex-col items-center text-center">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Total {details.denLabel}</span>
                  <div className="text-4xl font-black font-mono text-white italic">{details.denValue || 0}</div>
                </div>
                <div className="bg-white/5 border border-white/5 p-6 rounded-3xl flex flex-col items-center text-center">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Affected Volume</span>
                  <div className="text-4xl font-black font-mono text-red-400 italic">{details.totalIssues || 0}</div>
                </div>
                <div className="bg-white/5 border border-white/5 p-6 rounded-3xl flex flex-col items-center text-center">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Affected Columns</span>
                  <div className="text-4xl font-black font-mono text-indigo-400 italic">{details.issues?.length || 0}</div>
                </div>
              </div>

              {/* COLUMNS TABLE */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Layout className="w-4 h-4 text-indigo-400" />
                  <h4 className="text-xs font-black text-white uppercase tracking-[0.2em]">Impact Audit Trace</h4>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-black/20 border-b border-white/5">
                        <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Column</th>
                        <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Count</th>
                        <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">% Impact</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {affectedColumns.length > 0 ? affectedColumns.map((col: any, idx: number) => (
                        <tr key={idx} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 text-sm font-black text-white italic">{col.name}</td>
                          <td className="px-6 py-4 text-sm font-mono text-slate-400">{col.count}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-1.5 bg-black/40 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${col.impact}%` }} className="h-full bg-indigo-500" />
                              </div>
                              <span className="text-[10px] font-black text-indigo-400 font-mono">{col.impact}%</span>
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-500 text-xs italic">No specific column impacts detected</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ROWS TRACE */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Table className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-black text-white uppercase tracking-[0.2em]">Record-Level Evidence</h4>
                  </div>
                  <button onClick={() => setShowAllRows(!showAllRows)} className="text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-white">
                    {showAllRows ? "See Less" : "Show More"}
                  </button>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-black/20 border-b border-white/5">
                        <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Row ID</th>
                        <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Target</th>
                        <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono">
                      {rowTraceData.length > 0 ? rowTraceData.slice(0, showAllRows ? 30 : 10).map((row: any, idx: number) => {
                        const firstKey = Object.keys(row || {})[0] || "Unknown";
                        return (
                          <tr key={idx} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 text-xs text-slate-500">#{idx + 1}</td>
                            <td className="px-6 py-4 text-xs text-slate-300">{firstKey}</td>
                            <td className="px-6 py-4">
                               <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 text-[9px] font-black uppercase">
                                    {(details.label || "").includes("Completeness") ? "null" : "anomalous"}
                                  </span>
                                  <span className="text-[9px] text-slate-500 italic truncate max-w-[120px]">
                                    {String(row[firstKey] !== undefined ? row[firstKey] : "N/A")}
                                  </span>
                               </div>
                            </td>
                          </tr>
                        );
                      }) : (
                        <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-500 text-xs italic">No record trace available</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="px-8 py-6 bg-black/40 border-t border-white/5 flex justify-end">
              <button onClick={onClose} className="px-8 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl">
                Close Audit
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
