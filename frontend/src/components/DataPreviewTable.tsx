import React, { useState, useEffect } from "react";
import { getDatasetPreview } from "../services/api";
import {
  Activity,
  AlertCircle,
  ShieldCheck,
  Binary,
  Hash,
  Type,
  Eye,
  EyeOff,
  LayoutPanelLeft,
  Database,
  Search,
  Filter,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DataPreviewTableProps {
  datasetId: number;
}

const DataPreviewTable: React.FC<DataPreviewTableProps> = ({ datasetId }) => {
  const [fullData, setFullData] = useState<any[]>([]);
  const [anomalyData, setAnomalyData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [colTypes, setColTypes] = useState<Record<string, string>>({});
  const [auditMetrics, setAuditMetrics] = useState<any>(null);

  const [showFull, setShowFull] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (datasetId) {
      const fetchAudit = async () => {
        setLoading(true);
        setError(null);
        try {
          // Functionality 1 & 2: Forensic handshaking
          const res = await getDatasetPreview(datasetId);
          setFullData(res.full_data || []);
          setAnomalyData(res.anomaly_data || []);
          setColumns(res.columns || []);
          setColTypes(res.dtypes || {});
          setAuditMetrics(res.audit_metrics || null);
        } catch (err) {
          console.error("Forensic Handshake Failed", err);
          setError("System failed to retrieve relational preview.");
        } finally {
          setLoading(false);
        }
      };
      fetchAudit();
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
      <div className="flex flex-col items-center justify-center py-32 bg-avis-primary/20 rounded-[3rem]">
        <Activity className="w-12 h-12 text-avis-accent-indigo animate-spin mb-6" />
        <p className="text-xs font-black text-avis-text-secondary uppercase tracking-[0.3em]">
          Forensic Pattern Recognition Active...
        </p>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 bg-red-500/5 rounded-[2.5rem] border border-red-500/20 shadow-2xl">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <p className="text-sm font-bold text-red-200 uppercase tracking-widest">
          {error}
        </p>
      </div>
    );

  const activeRows = showFull ? fullData : anomalyData;

  return (
    <div className="w-full space-y-8">
      {/* 1. ANOMALY FORENSIC CARDS (Functionality 1 & 2) */}
      {auditMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <AuditMetricCard
            label="Relational Gaps"
            value={auditMetrics.null_row_count}
            icon={<AlertCircle className="text-avis-accent-amber" />}
            sub="Null instances isolated"
          />
          <AuditMetricCard
            label="Pruned Features"
            value={auditMetrics.null_column_count}
            icon={<LayoutPanelLeft className="text-red-400" />}
            sub="Empty dimensions removed"
          />
          <AuditMetricCard
            label="Schema Health"
            value={auditMetrics.asset_importance.split(":")[0]}
            icon={<ShieldCheck className="text-avis-accent-success" />}
            sub="Orientation logic verified"
          />
          <AuditMetricCard
            label="Total Matrix"
            value={auditMetrics.total_instances}
            icon={<Database className="text-avis-accent-indigo" />}
            sub="Clean entities registered"
          />
        </div>
      )}

      {/* 2. ADVANCED TOGGLE CONTROL */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-avis-secondary/40 p-6 rounded-[2.5rem] border border-avis-border/60 shadow-xl gap-4">
        <div className="flex items-center gap-5">
          <div
            className={`p-4 rounded-2xl ${
              showFull
                ? "bg-avis-accent-indigo/10"
                : "bg-avis-accent-amber/10 animate-pulse border border-avis-accent-amber/20"
            }`}
          >
            {showFull ? (
              <Search className="w-6 h-6 text-avis-accent-indigo" />
            ) : (
              <Filter className="w-6 h-6 text-avis-accent-amber" />
            )}
          </div>
          <div>
            <h4 className="text-lg font-black text-white uppercase tracking-tighter italic">
              {showFull
                ? "Comprehensive Forensic View"
                : "Relational Anomaly Isolation"}
            </h4>
            <p className="text-[10px] text-avis-text-secondary font-bold uppercase tracking-widest opacity-60">
              {showFull
                ? "Inspecting first 100 historical instances"
                : `Isolated ${anomalyData.length} records with structural defects`}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowFull(!showFull)}
          className={`flex items-center gap-3 px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-500 shadow-lg border
            ${
              showFull
                ? "bg-avis-primary border-avis-border text-avis-text-secondary hover:text-white hover:border-avis-accent-indigo"
                : "bg-avis-accent-indigo border-avis-accent-indigo text-white hover:shadow-indigo-500/40 hover:-translate-y-1"
            }`}
        >
          {showFull ? (
            <>
              <EyeOff className="w-4 h-4" /> Mask Clean Records
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" /> Inspect Full Matrix
            </>
          )}
        </button>
      </div>

      {/* 3. FORENSIC TABLE ENGINE */}
      <div className="bg-avis-primary/30 rounded-[3rem] border border-avis-border/40 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.3)]">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-avis-primary/80 border-b border-avis-border/40">
                {columns.map((col) => (
                  <th
                    key={col}
                    className="px-8 py-6 text-left min-w-[180px] group relative"
                  >
                    <div className="flex flex-col gap-2">
                      <span className="text-xs font-black text-white uppercase tracking-widest group-hover:text-avis-accent-cyan transition-colors">
                        {col}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-avis-primary rounded-lg border border-avis-border/60">
                          {getTypeIcon(colTypes[col] || "")}
                        </div>
                        <span className="text-[9px] font-mono font-black text-avis-text-secondary uppercase opacity-50">
                          {colTypes[col]}
                        </span>
                      </div>
                    </div>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-[1px] bg-avis-border/30" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-avis-border/10">
              <AnimatePresence mode="wait">
                {activeRows.length > 0 ? (
                  activeRows.slice(0, 20).map((row, idx) => (
                    <motion.tr
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ delay: idx * 0.04 }}
                      key={`${showFull ? "full" : "anom"}-${idx}`}
                      className="hover:bg-avis-accent-indigo/5 transition-colors group"
                    >
                      {columns.map((col) => {
                        const isNull =
                          row[col] === null ||
                          row[col] === undefined ||
                          row[col] === "NULL_VOID";
                        return (
                          <td
                            key={col}
                            className={`px-8 py-5 whitespace-nowrap text-[11px] font-mono border-r border-avis-border/5
                            ${
                              isNull
                                ? "bg-avis-accent-amber/5 text-avis-accent-amber font-black italic"
                                : "text-avis-text-secondary group-hover:text-white"
                            }`}
                          >
                            {isNull ? (
                              <span className="flex items-center gap-1.5 animate-pulse">
                                <AlertCircle className="w-3 h-3" /> NULL_VOID
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
                    <td colSpan={columns.length} className="py-32 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-40">
                        <ShieldCheck className="w-12 h-12 text-avis-accent-success" />
                        <p className="text-sm font-black text-avis-text-secondary uppercase tracking-[0.2em]">
                          No structural anomalies identified in this slice.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. RADICAL LEGEND FOOTER */}
      <div className="flex items-center gap-8 px-10 py-6 bg-avis-primary/40 rounded-[2rem] border border-avis-border/30">
        <LegendItem
          color="bg-avis-accent-indigo"
          label="Relational Data Verified"
          desc="High-fidelity instances"
        />
        <LegendItem
          color="bg-avis-accent-amber"
          label="Anomaly Intercepted"
          desc="Unstructured gaps detected"
        />
        <div className="ml-auto text-[9px] font-mono text-avis-text-secondary/30 uppercase tracking-[0.4em]">
          Terminal Node // Active Forensic Stream
        </div>
      </div>
    </div>
  );
};

// MINI COMPONENTS
const AuditMetricCard = ({
  label,
  value,
  icon,
  sub,
}: {
  label: string;
  value: any;
  icon: React.ReactNode;
  sub: string;
}) => (
  <div className="p-6 bg-avis-secondary/60 border border-avis-border/80 rounded-[2.5rem] flex items-center gap-5 hover:border-avis-accent-indigo/40 transition-all group shadow-2xl">
    <div className="p-4 bg-avis-primary rounded-2xl border border-avis-border group-hover:scale-110 transition-transform duration-500 shadow-inner">
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-black text-avis-text-secondary uppercase tracking-widest opacity-60 mb-0.5">
        {label}
      </p>
      <p className="text-2xl font-black text-white tracking-tighter truncate max-w-[120px] mb-0.5">
        {value}
      </p>
      <p className="text-[8px] font-bold text-avis-accent-cyan uppercase tracking-tighter">
        {sub}
      </p>
    </div>
  </div>
);

const LegendItem = ({
  color,
  label,
  desc,
}: {
  color: string;
  label: string;
  desc: string;
}) => (
  <div className="flex items-center gap-3">
    <div
      className={`w-3 h-3 rounded-full ${color} shadow-[0_0_10px_rgba(0,0,0,0.5)]`}
    />
    <div>
      <p className="text-[10px] font-black text-white uppercase tracking-tighter">
        {label}
      </p>
      <p className="text-[8px] text-avis-text-secondary font-bold uppercase tracking-widest opacity-40">
        {desc}
      </p>
    </div>
  </div>
);

export default DataPreviewTable;
