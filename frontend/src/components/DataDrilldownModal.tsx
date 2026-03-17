import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Table, Database, AlertCircle, Search, Layout, ArrowRight, ChevronDown } from "lucide-react";

interface DataDrilldownModalProps {
  open: boolean;
  title: string;
  type: "rows" | "columns" | "missing" | "duplicates" | string;
  data: any;
  onClose: () => void;
}

const DataDrilldownModal: React.FC<DataDrilldownModalProps> = ({
  open,
  title,
  type,
  data,
  onClose
}) => {
  const [pageSize, setPageSize] = useState(10);

  const paginatedData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.slice(0, pageSize);
  }, [data, pageSize]);

  const hasMore = Array.isArray(data) && data.length > pageSize;

  const renderContent = () => {
    if (!data) return (
      <div className="flex flex-col items-center justify-center p-16 text-slate-500">
        <Database className="w-12 h-12 mb-4 opacity-20" />
        <p className="text-sm font-medium">No data available for this section.</p>
      </div>
    );

    switch (type) {
      case "rows":
        return (
          <div className="space-y-4">
            <div className="bg-black/40 border border-white/5 rounded-xl overflow-hidden">
              <div className="overflow-x-auto max-h-[500px] custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-800/80 border-b border-white/10 sticky top-0 z-10 backdrop-blur-md">
                      {Object.keys(data[0] || {}).map((header) => (
                        <th key={header} className="px-5 py-3 text-[10px] font-bold uppercase text-indigo-400 tracking-wider whitespace-nowrap">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((row, idx) => (
                      <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                        {Object.values(row).map((val: any, vIdx) => (
                          <td key={vIdx} className="px-5 py-3 text-sm text-slate-300 font-medium whitespace-nowrap group-hover:text-white">
                            {val === null ? <span className="text-red-400 font-bold italic opacity-60">NULL</span> : String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {hasMore && (
              <button 
                onClick={() => setPageSize(prev => prev + 10)}
                className="w-full py-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider hover:bg-indigo-500 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <ChevronDown className="w-4 h-4" />
                Load More Rows (+10)
              </button>
            )}
          </div>
        );

      case "columns":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {Object.entries(data as Record<string, string>).map(([name, dtype], idx) => (
              <div key={idx} className="bg-slate-800/40 border border-white/5 rounded-xl p-4 flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/20 rounded-lg">
                    <Layout className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">{name}</h4>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mt-0.5 group-hover:text-indigo-400 transition-colors">{dtype || "Object"}</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-700 group-hover:text-indigo-500 transition-all opacity-0 group-hover:opacity-100" />
              </div>
            ))}
          </div>
        );

      case "missing":
        return (
            <div className="space-y-5">
              <div className="p-5 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-amber-400 font-bold text-sm">Missing Values Summary</p>
                  <p className="text-xs text-amber-500/70 mt-1">Columns with empty cells that need to be filled</p>
                </div>
                <AlertCircle className="w-8 h-8 text-amber-500/20" />
              </div>
              <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {Array.isArray(data) && data.map((item: any, idx: number) => (
                  <div key={idx} className="bg-white/5 border border-white/5 rounded-xl p-4 hover:border-amber-500/30 transition-all">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-200 font-bold text-sm">{item.column}</span>
                      <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-[10px] font-bold tracking-wider uppercase">{item.count} missing</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      {item.count === 1 
                        ? "1 empty cell in this column"
                        : `${item.count} empty cells in this column`
                      }
                      {item.missing_percentage && ` (${item.missing_percentage}% of rows)`}
                    </p>
                  </div>
                ))}
              </div>
            </div>
        );

      case "duplicates":
        return (
          <div className="space-y-5">
            <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-red-400 font-bold text-sm">Duplicate Rows</p>
                <p className="text-xs text-red-500/70 mt-1">Rows that are exact copies of other rows</p>
              </div>
              <Search className="w-8 h-8 text-red-500/20" />
            </div>
            <div className="p-8 bg-black/30 border border-white/5 rounded-xl text-center">
                <Search className="w-10 h-10 text-red-500/20 mx-auto mb-3" />
                <h4 className="text-white font-bold text-lg mb-2">{data?.count || 0} Duplicate Row{(data?.count || 0) !== 1 ? "s" : ""} Found</h4>
                <p className="text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
                   These are rows where every single column value is identical to another row. 
                   Keeping duplicates can bias your analysis results. 
                   Go to the <strong className="text-indigo-400">Repair</strong> page to remove them.
                </p>
            </div>
          </div>
        );

      default:
        return <p className="text-slate-400 italic">No data to display.</p>;
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`
                relative bg-slate-900/90 border border-indigo-500/20 rounded-2xl w-full shadow-2xl overflow-hidden backdrop-blur-2xl
                ${type === "rows" ? "max-w-6xl" : "max-w-3xl"}
            `}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-gradient-to-r from-indigo-500/10 to-transparent">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-500/20 rounded-xl">
                  {type === "rows" && <Table className="w-5 h-5 text-indigo-400" />}
                  {type === "columns" && <Database className="w-5 h-5 text-indigo-400" />}
                  {type === "missing" && <AlertCircle className="w-5 h-5 text-indigo-400" />}
                  {type === "duplicates" && <Search className="w-5 h-5 text-indigo-400" />}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">{title}</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {type === "rows" && "Browse the actual data in your dataset"}
                    {type === "columns" && "All columns and their data types"}
                    {type === "missing" && "Columns with empty cells"}
                    {type === "duplicates" && "Identical rows in the dataset"}
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-all text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-8">
              {renderContent()}
            </div>

            {/* Footer */}
            <div className="px-8 py-5 bg-slate-950/80 border-t border-white/5 flex justify-end">
              <button
                onClick={onClose}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
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

export default DataDrilldownModal;
