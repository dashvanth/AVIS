// frontend/src/components/DataPreviewTable.tsx
import React, { useState, useEffect } from "react";
import { getDatasetPreview } from "../services/api";
import {
  Activity,
  AlertCircle,
  FileText,
  Binary,
  Hash,
  Type,
  ShieldCheck,
} from "lucide-react";
import { motion } from "framer-motion";

interface DataPreviewTableProps {
  datasetId: number;
}

const DataPreviewTable: React.FC<DataPreviewTableProps> = ({ datasetId }) => {
  const [data, setData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [colTypes, setColTypes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (datasetId) {
      setLoading(true);
      setError(null);
      getDatasetPreview(datasetId)
        .then((res) => {
          // Adapt to the standard API response structure
          setData(res.data || []);
          setColumns(res.columns || []);
          setColTypes(res.dtypes || {});
        })
        .catch((err) => {
          console.error("Verification Handshake Failed", err);
          setError("System failed to retrieve relational preview.");
        })
        .finally(() => setLoading(false));
    }
  }, [datasetId]);

  const getTypeIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes("int") || lowerType.includes("float"))
      return <Hash className="w-3 h-3 text-avis-accent-cyan" />;
    if (lowerType.includes("object") || lowerType.includes("str"))
      return <Type className="w-3 h-3 text-avis-accent-indigo" />;
    return <Binary className="w-3 h-3 text-avis-accent-success" />;
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-avis-primary/20 rounded-[2rem]">
        <Activity className="w-12 h-12 text-avis-accent-indigo animate-spin mb-4" />
        <p className="text-xs font-bold text-avis-text-secondary uppercase tracking-[0.2em]">
          Synchronizing relational matrix...
        </p>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 bg-red-500/5 rounded-[2rem] border border-red-500/20">
        <AlertCircle className="w-8 h-8 text-red-400" />
        <p className="text-sm font-medium text-red-200">{error}</p>
      </div>
    );

  return (
    <div className="w-full bg-avis-secondary/30 rounded-[2rem] border border-avis-border/40 overflow-hidden shadow-2xl">
      {/* Table Header / Characterization Info */}
      <div className="p-5 border-b border-avis-border/40 bg-avis-primary/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-4 h-4 text-avis-accent-success" />
          <span className="text-[10px] font-black text-avis-text-secondary uppercase tracking-widest">
            Inferred Schema Verified
          </span>
        </div>
        <span className="text-[9px] font-mono text-avis-text-secondary/40">
          PREVIEW_NODE_ACTIVE
        </span>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-avis-primary/50">
              {columns.map((col) => (
                <th
                  key={col}
                  className="px-6 py-5 text-left group border-b border-avis-border/40 min-w-[150px]"
                >
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-black text-white uppercase tracking-tight truncate">
                      {col}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-avis-primary rounded-md border border-avis-border/60">
                        {getTypeIcon(colTypes[col])}
                      </div>
                      <span className="text-[9px] font-mono font-bold text-avis-text-secondary uppercase opacity-70">
                        {colTypes[col]}
                      </span>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-avis-border/20">
            {data.map((row, idx) => (
              <motion.tr
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.03 }}
                key={idx}
                className="hover:bg-avis-accent-indigo/5 transition-colors"
              >
                {columns.map((col) => (
                  <td key={col} className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`text-[11px] font-mono ${
                        row[col] === null || row[col] === undefined
                          ? "text-avis-accent-amber italic font-bold"
                          : "text-avis-text-secondary"
                      }`}
                    >
                      {row[col] !== null && row[col] !== undefined
                        ? String(row[col])
                        : "NULL_VOID"}
                    </span>
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend Footer for Radical Transparency */}
      <div className="p-4 bg-avis-primary/40 border-t border-avis-border/40 flex gap-6">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-avis-accent-indigo" />
          <span className="text-[9px] font-bold text-avis-text-secondary uppercase">
            Relational Data
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-avis-accent-amber" />
          <span className="text-[9px] font-bold text-avis-text-secondary uppercase">
            Anomaly (Null) Detected
          </span>
        </div>
      </div>
    </div>
  );
};

export default DataPreviewTable;
