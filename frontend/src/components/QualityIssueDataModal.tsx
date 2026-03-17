import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Table, Eye, Layout, ChevronDown } from "lucide-react";

interface QualityIssueDataModalProps {
  open: boolean;
  onClose: () => void;
  issue: {
    column: string;
    type: string;
    count: number;
    percentage: number;
    rows: any[];
    affectedIndices?: number[];
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
  const isDuplicate = issue.type === "Duplicate Rows";
  const isMissing = issue.type === "Missing Values";

  // Get the actual row index from the data
  const getRowIndex = (row: any, idx: number): number => {
    // First check if the row has _row_index (added by handleIssueClick)
    if (row._row_index !== undefined) return row._row_index;
    // Then check affected indices from backend
    if (issue.affectedIndices && issue.affectedIndices[idx] !== undefined) return issue.affectedIndices[idx];
    return idx;
  };

  // Display the problematic value
  const getValueDisplay = (row: any) => {
    if (isDuplicate) {
      return <span className="text-amber-400 font-medium text-xs">Entire row is a duplicate</span>;
    }
    const val = row[issue.column];
    if (val === null || val === undefined || val === "") {
      return <span className="text-red-400 font-bold">EMPTY (no data)</span>;
    }
    return <span className="text-amber-400 font-mono">{String(val)}</span>;
  };

  // Human-readable title
  const getTitle = () => {
    if (isMissing) return `Missing Values in "${issue.column}"`;
    if (isDuplicate) return "Duplicate Rows Found";
    return `${issue.type} in "${issue.column}"`;
  };

  // All columns for the row (excluding internal _row_index)
  const getCleanRow = (row: any) => {
    const clean = { ...row };
    delete clean._row_index;
    return clean;
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className="bg-slate-900 border border-white/10 w-full max-w-5xl rounded-2xl shadow-3xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-red-500/10 to-transparent">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-500/20 rounded-xl text-red-500">
                  <Layout className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {getTitle()}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded">
                      {issue.count} affected
                    </span>
                    <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider bg-red-500/10 px-2 py-0.5 rounded">
                      {issue.percentage}% of dataset
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-hidden flex gap-0">
               {/* Main Table Content */}
               <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                 <div className="flex items-center justify-between mb-5">
                   <div className="flex items-center gap-2">
                       <Table className="w-4 h-4 text-indigo-400" />
                       <h4 className="text-xs font-bold text-white uppercase tracking-wider">Affected Rows</h4>
                   </div>
                   <div className="text-[10px] font-bold text-slate-500">
                       Showing {displayRows.length} of {affectedRows.length} rows
                   </div>
                 </div>

                 {affectedRows.length > 0 ? (
                   <div className="bg-black/20 border border-white/5 rounded-xl overflow-hidden">
                     <table className="w-full text-left">
                         <thead>
                             <tr className="bg-white/5 border-b border-white/5">
                                 <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Row #</th>
                                 {!isDuplicate && (
                                   <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Column</th>
                                 )}
                                 <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                   {isDuplicate ? "Status" : "Value"}
                                 </th>
                                 <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
                             </tr>
                         </thead>
                         <tbody className="divide-y divide-white/5">
                             {displayRows.map((row, idx) => (
                                 <tr key={idx} className="hover:bg-white/5 transition-colors group">
                                     <td className="px-5 py-3 text-sm font-mono text-slate-400">
                                       Row {getRowIndex(row, idx) + 1}
                                     </td>
                                     {!isDuplicate && (
                                       <td className="px-5 py-3 text-sm font-bold text-indigo-400">{issue.column}</td>
                                     )}
                                     <td className="px-5 py-3 text-sm">{getValueDisplay(row)}</td>
                                     <td className="px-5 py-3 text-right">
                                         <button 
                                             onClick={() => setSelectedRow(getCleanRow(row))}
                                             className="p-2 hover:bg-indigo-500/20 text-indigo-400 rounded-lg transition-all opacity-0 group-hover:opacity-100 flex items-center gap-2 text-[10px] font-bold uppercase float-right"
                                         >
                                             <Eye className="w-3.5 h-3.5" />
                                             View Full Row
                                         </button>
                                     </td>
                                 </tr>
                             ))}
                         </tbody>
                     </table>
                   </div>
                 ) : (
                   <div className="p-10 bg-slate-800/30 rounded-xl text-center">
                     <p className="text-sm text-slate-400">
                       {isDuplicate 
                         ? `${issue.count} duplicate row${issue.count !== 1 ? "s" : ""} detected. The duplicates exist in the full dataset but aren't within the preview range.`
                         : "No affected rows found in the preview data."
                       }
                     </p>
                   </div>
                 )}

                 {affectedRows.length > displayRows.length && (
                   <div className="mt-6 flex justify-center">
                       <button 
                           onClick={() => setShowLimit(prev => prev + 20)}
                           className="flex items-center gap-2 px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
                       >
                           <ChevronDown className="w-4 h-4" />
                           Show More Rows
                       </button>
                   </div>
                 )}
               </div>

               {/* Right Sidebar: Row Inspector */}
               {selectedRow && (
                 <motion.div 
                    initial={{ x: 300, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="w-96 bg-black/40 border-l border-white/10 p-8 overflow-y-auto custom-scrollbar"
                 >
                    <div className="flex items-center justify-between mb-6">
                        <h5 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Full Row Data</h5>
                        <button onClick={() => setSelectedRow(null)} className="text-slate-500 hover:text-white transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {Object.entries(selectedRow).map(([key, val]) => (
                            <div key={key} className="space-y-1">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{key}</span>
                                <div className={`p-3 rounded-lg bg-white/5 border border-white/5 text-sm font-mono break-all ${key === issue.column ? 'border-red-500/30 text-red-300' : 'text-slate-300'}`}>
                                    {val === null || val === undefined ? <span className="text-red-400 italic">empty</span> : String(val as string)}
                                </div>
                            </div>
                        ))}
                    </div>
                 </motion.div>
               )}
            </div>

            {/* Footer */}
            <div className="px-8 py-5 bg-black/40 border-t border-white/5 flex items-center justify-between">
              <div className="text-[10px] font-bold text-slate-600">
                Data shown from the preview. Go to Repair page to fix these issues.
              </div>
              <button 
                onClick={onClose}
                className="px-8 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
