import React, { useState, useEffect } from "react";
import { getDatasetPreview } from "../services/api";
import {
  AlertCircle,
  Hash,
  Type,
  Binary,
  Database,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DataPreviewTableProps {
  datasetId: number;
}

const DataPreviewTable: React.FC<DataPreviewTableProps> = ({ datasetId }) => {
  const [fullData, setFullData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [colTypes, setColTypes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCount, setShowCount] = useState(20);

  useEffect(() => {
    if (datasetId) {
      const fetchPreview = async () => {
        setLoading(true);
        setError(null);
        try {
          const res = await getDatasetPreview(datasetId);
          setFullData(res.full_data || []);
          setColumns(res.columns || []);
          setColTypes(res.dtypes || {});
        } catch (err) {
          console.error("Preview load failed", err);
          setError("Failed to load dataset preview.");
        } finally {
          setLoading(false);
        }
      };
      fetchPreview();
    }
  }, [datasetId]);

  const getTypeIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes("int") || lowerType.includes("float"))
      return <Hash className="w-3 h-3 text-cyan-400" />;
    if (lowerType.includes("object") || lowerType.includes("str"))
      return <Type className="w-3 h-3 text-indigo-400" />;
    return <Binary className="w-3 h-3 text-emerald-400" />;
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-slate-900/30 rounded-2xl">
        <Database className="w-10 h-10 text-indigo-400 animate-spin mb-4" />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Loading preview...
        </p>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 bg-red-500/5 rounded-2xl border border-red-500/20">
        <AlertCircle className="w-8 h-8 text-red-400" />
        <p className="text-sm font-medium text-red-200">{error}</p>
      </div>
    );

  const displayRows = fullData.slice(0, showCount);
  const hasMore = fullData.length > showCount;

  return (
    <div className="w-full space-y-4">
      {/* Table */}
      <div className="bg-slate-900/40 rounded-2xl border border-white/5 overflow-hidden shadow-xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-800/80 border-b border-white/10">
                {columns.map((col) => (
                  <th
                    key={col}
                    className="px-6 py-4 text-left min-w-[150px] group"
                  >
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs font-bold text-white uppercase tracking-wide group-hover:text-cyan-400 transition-colors">
                        {col}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {getTypeIcon(colTypes[col] || "")}
                        <span className="text-[9px] font-mono text-slate-500 uppercase">
                          {colTypes[col]}
                        </span>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <AnimatePresence mode="wait">
                {displayRows.length > 0 ? (
                  displayRows.map((row, idx) => (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      key={idx}
                      className="hover:bg-indigo-500/5 transition-colors"
                    >
                      {columns.map((col) => {
                        const isNull =
                          row[col] === null ||
                          row[col] === undefined ||
                          row[col] === "NULL_VOID";
                        return (
                          <td
                            key={col}
                            className={`px-6 py-3.5 whitespace-nowrap text-[11px] font-mono
                            ${
                              isNull
                                ? "bg-amber-500/5 text-amber-400 font-bold italic"
                                : "text-slate-300 hover:text-white"
                            }`}
                          >
                            {isNull ? (
                              <span className="flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> NULL
                              </span>
                            ) : (
                              String(row[col])
                            )}
                          </td>
                        );
                      })}
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="py-20 text-center">
                      <p className="text-sm text-slate-500">No data to display.</p>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Show More */}
      {hasMore && (
        <button
          onClick={() => setShowCount((prev) => prev + 20)}
          className="w-full py-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all flex items-center justify-center gap-2"
        >
          <ChevronDown className="w-4 h-4" />
          Show More Rows
        </button>
      )}

      {/* Footer info */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900/30 rounded-xl border border-white/5">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          Showing {Math.min(showCount, fullData.length)} of {fullData.length} rows
        </span>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          {columns.length} columns
        </span>
      </div>
    </div>
  );
};

export default DataPreviewTable;
