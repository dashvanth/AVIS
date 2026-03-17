import React, { useState } from "react";
import {
  Wrench,
  AlertTriangle,
  Download,
  Eye,
  CheckCircle,
  ArrowRight,
  ChevronDown,
  X,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as api from "../services/api";
import { useDatasetContext } from "../context/DatasetContext";

/* ─── Types ─── */
interface ChangedRow {
  row_index: number;
  column: string;
  before: any;
  after: any;
}

interface MetricsDelta {
  missing_before: number; missing_after: number;
  mean_before: number | null; mean_after: number | null;
  median_before: number | null; median_after: number | null;
  std_before: number | null; std_after: number | null;
  skew_before: number | null; skew_after: number | null;
}

interface SimResult {
  column: string;
  strategy: string;
  changed_rows: ChangedRow[];
  rows_modified: number;
  metrics_delta: MetricsDelta;
  health_score_before: number;
  health_score_after: number;
  row_count_before: number;
  row_count_after: number;
}

/* ═══════════════════════════════════════ */
/*           REPAIR PAGE                  */
/* ═══════════════════════════════════════ */

const RepairPage: React.FC = () => {
  const { datasetId, loading, error, preview, repairData } = useDatasetContext();

  const [busy, setBusy] = useState(false);
  const [simulation, setSimulation] = useState<SimResult | null>(null);
  const [visibleRows, setVisibleRows] = useState(5);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  /* ── Preview a fix ── */
  const handlePreview = async (column: string, strategy: string) => {
    if (!datasetId) return;
    setBusy(true);
    setSimulation(null);
    setSuccessMsg(null);
    setVisibleRows(5);
    try {
      const result = await api.simulateRepair(datasetId, column, strategy);
      setSimulation(result);
      setTimeout(() => {
        document.getElementById("preview-section")?.scrollIntoView({ behavior: "smooth" });
      }, 150);
    } catch (e: any) {
      console.error("Preview failed:", e);
    } finally {
      setBusy(false);
    }
  };

  /* ── Apply repair & auto-download ── */
  const handleApplyAndDownload = async (column: string, strategy: string) => {
    if (!datasetId) return;
    setBusy(true);
    setSuccessMsg(null);
    try {
      const res = await api.applyRepair(datasetId, column, strategy);
      const newId = res.new_dataset_id;

      // Build a clean filename
      const originalName = preview?.filename || "dataset.csv";
      const ext = originalName.split(".").pop() || "csv";
      const base = originalName.replace(`.${ext}`, "");
      const newFileName = `${base}_repaired.${ext}`;

      // Trigger browser download
      const downloadUrl = api.getDownloadUrl(newId, "data", "prepared");
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = newFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSuccessMsg(`Repair applied successfully! ${res.rows_modified ?? 0} rows were modified. Your cleaned file "${newFileName}" is downloading now.`);
      setSimulation(null);
    } catch (err: any) {
      console.error("Apply failed:", err);
      setSuccessMsg("Something went wrong while applying the repair. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  /* ── Guards ── */
  if (loading) return null;
  if (error || !preview || !repairData) return null;

  const issues = repairData.issues || [];
  const recommendations = repairData.recommendations || [];
  const totalMissing = issues
    .filter((i: any) => i.issue === "Missing Values")
    .reduce((a: number, b: any) => a + (b.count || 0), 0);
  const totalDuplicates = issues.find((i: any) => i.issue === "Duplicate Rows")?.count || 0;
  const affectedCols = new Set(issues.map((i: any) => i.column)).size;

  return (
    <div className="py-8 space-y-10">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">

        {/* ════════════════════════════════════════ */}
        {/* SECTION 1 — REPAIR SUMMARY              */}
        {/* ════════════════════════════════════════ */}
        <section className="bg-slate-900/50 border border-white/5 p-8 rounded-2xl">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest mb-5">
            <AlertTriangle className="w-4 h-4" /> Issues Found in Your Dataset
          </div>
          <div className="flex flex-wrap gap-10">
            <StatBox label="Missing Values" value={totalMissing} />
            <StatBox label="Duplicate Rows" value={totalDuplicates} />
            <StatBox label="Affected Columns" value={affectedCols} color="text-indigo-400" />
            <StatBox label="Total Issues" value={issues.length} />
          </div>
        </section>

        {/* ════════════════════════════════════════ */}
        {/* SECTION 2 — RECOMMENDED FIXES            */}
        {/* ════════════════════════════════════════ */}
        <section>
          <div className="flex items-center gap-3 border-b border-indigo-500/20 pb-4 mb-6">
            <Wrench className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-bold text-white">Recommended Fixes</h2>
          </div>

          {recommendations.length > 0 ? (
            <div className="space-y-3">
              {recommendations.map((rec: any, idx: number) => {
                const count = issues.find(
                  (i: any) => i.column === rec.column && i.issue === rec.issue
                )?.count || 0;

                return (
                  <div key={idx} className="bg-slate-900/40 border border-white/5 rounded-xl p-5 hover:border-indigo-500/20 transition-all">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-300">
                          <span className="text-indigo-400 font-bold">{rec.column === "Entire Dataset" ? "All Rows" : rec.column}</span>
                          {" — "}
                          <span className="text-white font-semibold">{rec.issue}</span>
                          {" "}({count} row{count !== 1 ? "s" : ""})
                          {" → Fix: "}
                          <span className="text-emerald-400 font-bold">{rec.recommended_strategy}</span>
                        </p>
                      </div>

                      {/* Buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handlePreview(rec.column, rec.recommended_strategy)}
                          disabled={busy}
                          className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-indigo-500 hover:text-white transition-all disabled:opacity-50"
                        >
                          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Eye className="w-3.5 h-3.5" />}
                          Preview
                        </button>
                        <button
                          onClick={() => handleApplyAndDownload(rec.column, rec.recommended_strategy)}
                          disabled={busy}
                          className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-50"
                        >
                          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                          Apply & Download
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-10 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center">
              <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white">No Repairs Needed</h3>
              <p className="text-sm text-emerald-200/70 mt-1">This dataset looks clean — no issues detected.</p>
            </div>
          )}
        </section>

        {/* ════════════════════════════════════════ */}
        {/* SECTION 3 — PREVIEW (Before vs After)    */}
        {/* ════════════════════════════════════════ */}
        <AnimatePresence>
          {simulation && (
            <motion.section
              id="preview-section"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between border-b border-amber-500/20 pb-4">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-amber-500" />
                  <div>
                    <h2 className="text-xl font-bold text-white">Preview: What Will Change</h2>
                    <p className="text-xs text-amber-400 font-bold mt-0.5">
                      {simulation.strategy} on "{simulation.column}"
                    </p>
                  </div>
                </div>
                <button onClick={() => setSimulation(null)} className="p-2 rounded-lg hover:bg-white/5">
                  <X className="w-4 h-4 text-slate-500 hover:text-white" />
                </button>
              </div>

              {/* Part A — Changed Rows Table */}
              {simulation.changed_rows && simulation.changed_rows.length > 0 && (
                <div className="bg-slate-900/40 border border-white/5 rounded-xl overflow-hidden">
                  <div className="px-5 py-3 border-b border-white/5">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Rows That Will Change ({simulation.rows_modified} total)
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-800/60">
                          <th className="px-5 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Row</th>
                          <th className="px-5 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Column</th>
                          <th className="px-5 py-2.5 text-left text-[10px] font-bold text-red-400 uppercase tracking-wider">Before</th>
                          <th className="px-5 py-2.5 text-center text-slate-600"></th>
                          <th className="px-5 py-2.5 text-left text-[10px] font-bold text-emerald-400 uppercase tracking-wider">After</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {simulation.changed_rows.slice(0, visibleRows).map((row, idx) => (
                          <tr key={idx} className="hover:bg-indigo-500/5 transition-colors">
                            <td className="px-5 py-2.5 text-sm font-mono text-slate-300">{row.row_index}</td>
                            <td className="px-5 py-2.5 text-sm font-bold text-indigo-400">{row.column}</td>
                            <td className="px-5 py-2.5 text-sm font-mono text-red-400">
                              {row.before === null ? <span className="italic text-red-500/60">NULL</span> : String(row.before)}
                            </td>
                            <td className="px-5 py-2.5 text-center">
                              <ArrowRight className="w-3.5 h-3.5 text-amber-500 mx-auto" />
                            </td>
                            <td className="px-5 py-2.5 text-sm font-mono font-bold text-emerald-400">
                              {row.after === null ? <span className="italic">NULL</span> : String(row.after)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* View More */}
                  {visibleRows < simulation.changed_rows.length && (
                    <div className="px-5 py-3 border-t border-white/5 text-center">
                      <button
                        onClick={() => setVisibleRows((v) => v + 15)}
                        className="flex items-center gap-2 mx-auto text-xs font-bold text-indigo-400 hover:text-white transition-colors"
                      >
                        <ChevronDown className="w-4 h-4" />
                        View More ({simulation.changed_rows.length - visibleRows} remaining)
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Part B — Stats Change */}
              {simulation.metrics_delta && (
                <div className="bg-slate-900/40 border border-white/5 rounded-xl p-5">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
                    How Stats Will Change
                  </h3>
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Metric</th>
                        <th className="text-right px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Before</th>
                        <th className="text-right px-3 py-2 text-[10px] font-bold text-emerald-500 uppercase tracking-wider">After</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      <MetricRow label="Missing Values" before={simulation.metrics_delta.missing_before} after={simulation.metrics_delta.missing_after} highlight />
                      <MetricRow label="Mean (Average)" before={simulation.metrics_delta.mean_before} after={simulation.metrics_delta.mean_after} />
                      <MetricRow label="Median (Middle)" before={simulation.metrics_delta.median_before} after={simulation.metrics_delta.median_after} />
                      <MetricRow label="Std Dev (Spread)" before={simulation.metrics_delta.std_before} after={simulation.metrics_delta.std_after} />
                      <MetricRow label="Skewness (Tilt)" before={simulation.metrics_delta.skew_before} after={simulation.metrics_delta.skew_after} />
                      <MetricRow label="Total Rows" before={simulation.row_count_before} after={simulation.row_count_after} />
                      <MetricRow label="Health Score" before={`${simulation.health_score_before}%`} after={`${simulation.health_score_after}%`} highlight />
                    </tbody>
                  </table>
                </div>
              )}

              {/* Apply Button */}
              <div className="flex justify-center pt-2">
                <button
                  onClick={() => handleApplyAndDownload(simulation.column, simulation.strategy)}
                  disabled={busy}
                  className="flex items-center gap-3 px-10 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm uppercase tracking-wider rounded-xl shadow-xl shadow-emerald-500/25 transition-all active:scale-95 disabled:opacity-50"
                >
                  {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                  {busy ? "Applying..." : "Apply Repair & Download"}
                </button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* ════════════════════════════════════════ */}
        {/* SECTION 4 — SUCCESS / ERROR MESSAGE      */}
        {/* ════════════════════════════════════════ */}
        <AnimatePresence>
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`p-5 rounded-xl border text-center text-sm font-semibold ${
                successMsg.includes("successfully")
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-red-500/10 border-red-500/30 text-red-400"
              }`}
            >
              {successMsg}
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
};

/* ─── Stat Box ─── */
const StatBox = ({ label, value, color = "text-white" }: { label: string; value: number; color?: string }) => (
  <div>
    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</p>
    <p className={`text-3xl font-black ${color}`}>{value}</p>
  </div>
);

/* ─── Metric Row ─── */
const MetricRow = ({ label, before, after, highlight = false }: { label: string; before: any; after: any; highlight?: boolean }) => {
  const fmt = (v: any) => {
    if (v === null || v === undefined) return "—";
    if (typeof v === "number") return Number.isInteger(v) ? v.toString() : v.toFixed(2);
    return String(v);
  };
  const changed = fmt(before) !== fmt(after);

  return (
    <tr className="group hover:bg-indigo-500/5 transition-colors">
      <td className="px-3 py-2.5 text-xs text-slate-400 group-hover:text-white transition-colors">{label}</td>
      <td className="px-3 py-2.5 text-right text-sm font-mono text-slate-500">{fmt(before)}</td>
      <td className={`px-3 py-2.5 text-right text-sm font-mono font-bold ${changed ? (highlight ? "text-emerald-400" : "text-amber-400") : "text-slate-300"}`}>
        {fmt(after)}
      </td>
    </tr>
  );
};

export default RepairPage;
