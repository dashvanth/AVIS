import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Table, Eye, Layout, ChevronRight, Download } from "lucide-react";

interface QualityIssueDataModalProps {
  open: boolean;
  onClose: () => void;
  issue: {
    column: string;
    type: string;
    count: number;
    percentage: number;
    rows: any[];
  } | null;
}

export const QualityIssueDataModal: React.FC<QualityIssueDataModalProps> = ({
  open,
  onClose,
  issue
}) => {
  const [showLimit, setShowLimit] = useState(10);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);

  if (!issue) return null;

  const affectedRows = issue.rows || [];
  const displayRows = affectedRows.slice(0, showLimit);

  // Logic to determine what the "anomaly" value is
  const getValueDisplay = (row: any) => {
    const val = row[issue.column];
    if (val === null || val === undefined || val === "") return <span className="text-red-400 font-bold italic">NULL</span>;
    return <span className="text-amber-400 font-mono italic">{String(val)}</span>;
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className="bg-slate-900 border border-white/10 w-full max-w-5xl rounded-[3rem] shadow-3xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="px-10 py-8 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-red-500/10 to-transparent">
              <div className="flex items-center gap-5">
                <div className="p-4 bg-red-500/20 rounded-2xl text-red-500">
                  <Layout className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">
                    Forensic Inspection: <span className="text-red-400">{issue.type}</span>
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded">
                      Column: {issue.column}
                    </span>
                    <span className="text-[10px] text-red-400 font-black uppercase tracking-widest bg-red-500/10 px-2 py-0.5 rounded">
                      Impact: {issue.percentage}%
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="p-3 hover:bg-white/10 rounded-full transition-colors text-slate-400"
              >
                <X className="w-8 h-8" />
              </button>
            </div>

            <div className="flex-1 overflow-hidden flex gap-0">
               {/* Main Table Content */}
               <div className="flex-1 overflow-y-auto custom-scrollbar p-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Table className="w-4 h-4 text-indigo-400" />
                        <h4 className="text-xs font-black text-white uppercase tracking-[0.3em]">Affected Evidence Trace</h4>
                    </div>
                    <div className="text-[10px] font-black text-slate-500 uppercase">
                        Showing {displayRows.length} of {affectedRows.length} affected records
                    </div>
                  </div>

                  <div className="bg-black/20 border border-white/5 rounded-3xl overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/5">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Index</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Target Attribute</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Anomaly Value</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {displayRows.map((row, idx) => (
                                <tr key={idx} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4 text-xs font-mono text-slate-500 italic">#{idx + 1}</td>
                                    <td className="px-6 py-4 text-sm font-black text-white italic">{issue.column}</td>
                                    <td className="px-6 py-4 text-sm">{getValueDisplay(row)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => setSelectedRow(row)}
                                            className="p-2 hover:bg-indigo-500/20 text-indigo-400 rounded-lg transition-all opacity-0 group-hover:opacity-100 flex items-center gap-2 text-[10px] font-black uppercase float-right"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                            Inspect Row
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                  </div>

                  {affectedRows.length > displayRows.length && (
                    <div className="mt-8 flex justify-center">
                        <button 
                            onClick={() => setShowLimit(prev => prev + 50)}
                            className="px-10 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black text-[10px] uppercase tracking-[0.4em] rounded-2xl transition-all"
                        >
                            Load More Records
                        </button>
                    </div>
                  )}
               </div>

               {/* Right Sidebar: Row Inspector */}
               {selectedRow && (
                 <motion.div 
                    initial={{ x: 300, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="w-96 bg-black/40 border-l border-white/10 p-10 overflow-y-auto custom-scrollbar"
                 >
                    <div className="flex items-center justify-between mb-8">
                        <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Full Record View</h5>
                        <button onClick={() => setSelectedRow(null)} className="text-slate-500 hover:text-white transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        {Object.entries(selectedRow).map(([key, val]) => (
                            <div key={key} className="space-y-1.5">
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">{key}</span>
                                <div className={`p-3 rounded-xl bg-white/5 border border-white/5 text-xs font-mono break-all ${key === issue.column ? 'border-red-500/30 text-red-300' : 'text-slate-300'}`}>
                                    {val === null ? "null" : String(val)}
                                </div>
                            </div>
                        ))}
                    </div>
                 </motion.div>
               )}
            </div>

            {/* Footer */}
            <div className="px-10 py-8 bg-black/40 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase italic">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                Diagnostics locked to deterministic preview data
              </div>
              <div className="flex gap-4">
                  <button 
                    onClick={onClose}
                    className="px-10 py-4 bg-indigo-500 hover:bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-indigo-500/20 transition-all active:scale-95"
                  >
                    Close Audit
                  </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
