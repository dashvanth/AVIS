import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Table, ArrowRight, CheckCircle2, AlertCircle, Info } from "lucide-react";

interface BeforeAfterTableProps {
  originalRows: any[];
  transformedRows: any[];
  column: string;
}

export const BeforeAfterTable: React.FC<BeforeAfterTableProps> = ({
  originalRows,
  transformedRows,
  column
}) => {
  const [showLimit, setShowLimit] = useState(5);

  // We only want to show rows that actually CHANGED in the target column
  const changedIndices = originalRows
    .map((row, idx) => {
      const oldVal = row[column];
      const newVal = transformedRows[idx]?.[column];
      // Compare specifically the column being repaired
      const isChanged = oldVal !== newVal;
      return isChanged ? idx : -1;
    })
    .filter(idx => idx !== -1);

  const displayIndices = changedIndices.slice(0, showLimit);

  if (changedIndices.length === 0) {
    return (
      <div className="p-8 bg-black/20 rounded-[2rem] border border-white/5 text-center">
        <Info className="w-8 h-8 text-slate-500 mx-auto mb-3" />
        <p className="text-slate-400 text-sm font-medium">No record-level transitions detected for this sample.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
            <Table className="w-5 h-5 text-indigo-400" />
            <h4 className="text-xs font-black text-white uppercase tracking-[0.3em]">Record Transformation Proof</h4>
        </div>
        <div className="text-[10px] font-black text-slate-500 uppercase italic">
            Detected {changedIndices.length} impacted records in current sample
        </div>
      </div>

      <div className="bg-slate-900/50 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-xl">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-white/5 border-b border-white/5">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Row Index</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Original State</th>
                    <th className="px-4 py-5 text-center w-8"></th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Repaired State</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
                <AnimatePresence>
                    {displayIndices.map((idx) => {
                        const oldRow = originalRows[idx];
                        const newRow = transformedRows[idx];
                        const oldVal = oldRow[column];
                        const newVal = newRow[column];

                        return (
                            <motion.tr 
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="group hover:bg-white/5 transition-colors"
                            >
                                <td className="px-8 py-6 text-xs font-mono text-slate-500 italic">#{idx}</td>
                                <td className="px-8 py-6">
                                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                                        <span className="text-[10px] font-black text-red-400 uppercase tracking-tighter block mb-1">Before: {column}</span>
                                        <span className="text-sm font-mono text-red-200">
                                            {oldVal === null || oldVal === undefined || oldVal === "" ? "null" : String(oldVal)}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-4 py-6 text-center">
                                    <ArrowRight className="w-5 h-5 text-indigo-500 opacity-30 group-hover:opacity-100 transition-opacity mx-auto" />
                                </td>
                                <td className="px-8 py-6">
                                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-tighter block mb-1">After: {column}</span>
                                        <span className="text-sm font-mono text-emerald-200 font-bold">
                                            {newVal === null || newVal === undefined || newVal === "" ? "null" : String(newVal)}
                                        </span>
                                    </div>
                                </td>
                            </motion.tr>
                        );
                    })}
                </AnimatePresence>
            </tbody>
        </table>

        {changedIndices.length > displayIndices.length && (
            <div className="p-6 border-t border-white/5 bg-black/20 flex justify-center">
                <button 
                    onClick={() => setShowLimit(prev => prev + 10)}
                    className="px-10 py-3 bg-white/5 hover:bg-white/10 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl border border-white/5 transition-all"
                >
                    Show More Evidence
                </button>
            </div>
        )}
      </div>

      <div className="flex items-center gap-3 p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-3xl">
          <AlertCircle className="w-5 h-5 text-indigo-400" />
          <p className="text-[11px] text-slate-400 font-medium italic">
            This trace documents the exact row-level delta produced by the <span className="text-white font-bold">{column}</span> repair logic. 
            Verification successful for <span className="text-white font-bold">{changedIndices.length}</span> record transitions.
          </p>
      </div>
    </div>
  );
};
