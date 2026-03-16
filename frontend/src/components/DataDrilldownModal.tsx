import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Table, Database, AlertCircle, Search, ChevronRight, Layout, ArrowRight } from "lucide-react";

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
      <div className="flex flex-col items-center justify-center p-20 text-slate-500">
        <Database className="w-12 h-12 mb-4 opacity-20" />
        <p className="text-sm font-medium">No diagnostic data available for this metric.</p>
      </div>
    );

    switch (type) {
      case "rows":
        return (
          <div className="space-y-4">
            <div className="bg-black/40 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto max-h-[500px] custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-800/80 border-b border-white/10 sticky top-0 z-10 backdrop-blur-md">
                      {Object.keys(data[0] || {}).map((header) => (
                        <th key={header} className="px-6 py-4 text-[10px] font-black uppercase text-indigo-400 tracking-widest whitespace-nowrap">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((row, idx) => (
                      <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                        {Object.values(row).map((val: any, vIdx) => (
                          <td key={vIdx} className="px-6 py-4 text-sm text-slate-300 font-medium whitespace-nowrap group-hover:text-white">
                            {val === null ? <span className="text-red-400 font-black tracking-tighter italic opacity-50">NULL</span> : String(val)}
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
                className="w-full py-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all shadow-lg hover:shadow-indigo-500/20"
              >
                Load More Records (+10)
              </button>
            )}
          </div>
        );

      case "columns":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {Object.entries(data as Record<string, string>).map(([name, dtype], idx) => (
              <div key={idx} className="bg-slate-800/40 border border-white/5 rounded-2xl p-5 flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-indigo-500/20 rounded-xl">
                    <Layout className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">{name}</h4>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-0.5 group-hover:text-indigo-400 transition-colors">{dtype || "Object"}</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-700 group-hover:text-indigo-500 transition-all opacity-0 group-hover:opacity-100 group-hover:translate-x-1" />
              </div>
            ))}
          </div>
        );

      case "missing":
        return (
            <div className="space-y-6">
              <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-[2rem] flex items-center justify-between">
                <div>
                  <p className="text-amber-400 font-black text-xs uppercase tracking-widest">Inventory of Information Gaps</p>
                  <p className="text-[10px] text-amber-500/60 font-medium mt-1 uppercase italic">Structural vulnerabilities identified across columns</p>
                </div>
                <AlertCircle className="w-10 h-10 text-amber-500/20" />
              </div>
              <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {Array.isArray(data) && data.map((item: any, idx: number) => (
                  <div key={idx} className="bg-white/5 border border-white/5 rounded-2xl p-5 hover:border-amber-500/30 transition-all">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-slate-200 font-bold text-sm tracking-tight">{item.column}</span>
                      <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-[10px] font-black tracking-widest uppercase">{item.count} Missing</span>
                    </div>
                    {item.details && (
                      <p className="text-[11px] text-slate-500 leading-relaxed font-medium line-clamp-2 italic">"{item.details}"</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
        );

      case "duplicates":
        return (
          <div className="space-y-6">
            <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-[2rem] flex items-center justify-between">
              <div>
                <p className="text-red-400 font-black text-xs uppercase tracking-widest">Redundancy Assessment</p>
                <p className="text-[10px] text-red-500/60 font-medium mt-1 uppercase italic">Identical observations detected in vector space</p>
              </div>
              <Search className="w-10 h-10 text-red-500/20" />
            </div>
            <div className="p-10 bg-black/40 border border-white/5 rounded-[2.5rem] text-center">
                <Search className="w-12 h-12 text-red-500/20 mx-auto mb-4" />
                <h4 className="text-white font-bold text-lg mb-2">Duplicate Fingerprints Found</h4>
                <p className="text-sm text-slate-400 leading-relaxed max-w-md mx-auto italic">
                   The structural engine identified {data?.count || 0} records that are exact duplicates. These records distort statistical weighting and should be pruned for optimal model accuracy.
                </p>
            </div>
          </div>
        );

      default:
        return <p className="text-slate-400 italic">No specific renderer for {type} stage.</p>;
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

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`
                relative bg-slate-900/90 border border-indigo-500/20 rounded-[3rem] w-full shadow-[0_0_100px_-15px_rgba(79,70,229,0.3)] overflow-hidden backdrop-blur-2xl
                ${type === "rows" ? "max-w-6xl" : "max-w-3xl"}
            `}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-8 border-b border-white/5 bg-gradient-to-r from-indigo-500/10 to-transparent">
              <div className="flex items-center gap-5">
                <div className="p-3.5 bg-indigo-500/20 rounded-[1.5rem] shadow-inner">
                  {type === "rows" && <Table className="w-6 h-6 text-indigo-400" />}
                  {type === "columns" && <Database className="w-6 h-6 text-indigo-400" />}
                  {type === "missing" && <AlertCircle className="w-6 h-6 text-indigo-400" />}
                  {type === "duplicates" && <Search className="w-6 h-6 text-indigo-400" />}
                </div>
                <div>
                  <h3 className="text-3xl font-black text-white tracking-tight leading-none italic">{title}</h3>
                  <p className="text-[10px] text-indigo-400 uppercase font-black tracking-[0.3em] mt-2 opacity-60">System Data Drilldown Engine</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-3 hover:bg-white/10 rounded-full transition-all text-slate-400 hover:text-white hover:rotate-90"
              >
                <X className="w-8 h-8" />
              </button>
            </div>

            {/* Content Area */}
            <div className="p-10 space-y-8 scroll-smooth">
              {renderContent()}
            </div>

            {/* Footer */}
            <div className="p-8 bg-slate-950/80 border-t border-white/5 flex justify-end">
              <button
                onClick={onClose}
                className="px-10 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95"
              >
                Exit Inspection
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DataDrilldownModal;
