import React, { useState } from "react";
import {
  Wrench,
  AlertTriangle,
  Download,
  Eye,
  CheckCircle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  X,
  Loader2,
  Undo2,
  HelpCircle,
  BarChart3,
  Shield,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Plot from "react-plotly.js";
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
  histogram_before?: number[];
  histogram_after?: number[];
  histogram_bins?: number[];
}

/* ─── Stat explanations ─── */
const STAT_HELP: Record<string, string> = {
  "Missing Values": "How many empty cells exist. After repair, this should be 0.",
  "Mean (Average)": "The average value. If this changes a lot, the filled-in values may be shifting the overall pattern.",
  "Median (Middle)": "The middle value when data is sorted. Less affected by extreme values than the average.",
  "Std Dev (Spread)": "How spread out the values are. Lower = more consistent, Higher = more varied.",
  "Skewness (Tilt)": "Whether data leans left or right. 0 = balanced, >1 = leans right, <-1 = leans left.",
  "Total Rows": "Number of rows. Changes if duplicate rows are removed.",
  "Health Score": "Overall data quality percentage. Higher = better quality.",
};

/* ─── Collapsible Section ─── */
const CollapsibleSection: React.FC<{
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}> = ({ title, subtitle, icon, defaultOpen = false, children }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border border-white/10 rounded-xl overflow-hidden bg-slate-900/30 mt-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors group"
      >
        <div className="flex items-center gap-3">
          {icon}
          <div className="text-left">
            <h4 className="text-sm font-bold text-white">{title}</h4>
            <p className="text-[10px] text-slate-500">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider">
            {isOpen ? "Hide" : "Show"}
          </span>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
          )}
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ═══════════════════════════════════════ */
/*           REPAIR PAGE                  */
/* ═══════════════════════════════════════ */

const RepairPage: React.FC = () => {
  const { datasetId, loading, error, preview, repairData } = useDatasetContext();
  const navigate = useNavigate();

  const [busy, setBusy] = useState(false);
  const [simulation, setSimulation] = useState<SimResult | null>(null);
  const [visibleRows, setVisibleRows] = useState(5);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [repairedDatasetId, setRepairedDatasetId] = useState<number | null>(null);
  // Track which strategy is selected per recommendation index
  const [selectedStrategies, setSelectedStrategies] = useState<Record<number, string>>({});

  /* ── Preview a single fix ── */
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

  /* ── REPAIR ALL & DOWNLOAD ── */
  const handleRepairAll = async () => {
    if (!datasetId) return;
    setBusy(true);
    setSuccessMsg(null);
    try {
      const res = await api.applyAllRepairs(datasetId);
      const newId = res.new_dataset_id;

      const originalName = preview?.filename || "dataset.csv";
      const ext = originalName.split(".").pop() || "csv";
      const base = originalName.replace(`.${ext}`, "").replace("_repaired", "");
      const newFileName = `${base}_repaired.${ext}`;

      const downloadUrl = api.getDownloadUrl(newId, "data", "prepared");
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = newFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setRepairedDatasetId(newId);
      setSimulation(null);

      const repairsApplied = res.repairs_applied || [];
      const summary = repairsApplied.map((r: any) => `${r.strategy} on ${r.column}`).join(", ");
      setSuccessMsg(
        `✅ All repairs applied! ${res.rows_modified ?? 0} changes made. ` +
        `Fixes: ${summary}. ` +
        `Your cleaned file "${newFileName}" is downloading now.`
      );
    } catch (err: any) {
      console.error("Apply all failed:", err);
      setSuccessMsg("❌ Something went wrong while applying repairs. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  /* ── UNDO ── */
  const handleUndo = () => {
    if (datasetId) {
      navigate(`/dashboard/${datasetId}/repair`);
      window.location.reload();
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
  const affectedCols = new Set(
    issues.filter((i: any) => i.issue === "Missing Values").map((i: any) => i.column)
  ).size;

  const actionableRecs = recommendations.filter((r: any) =>
    ["Missing Values", "Duplicate Rows", "Incorrect Data Type"].includes(r.issue)
  );

  /* ── Confidence color helper ── */
  const getConfidenceColor = (score: number) => {
    if (score >= 80) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
    if (score >= 50) return "text-amber-400 bg-amber-500/10 border-amber-500/30";
    return "text-red-400 bg-red-500/10 border-red-500/30";
  };

  const getConfidenceLabel = (score: number) => {
    if (score >= 80) return "High Confidence";
    if (score >= 50) return "Medium Confidence";
    return "Low Confidence";
  };

  /* ── Simplify explanation text ── */
  const simplifyExplanation = (text: string): string => {
    if (!text) return "";
    return text
      .replace(/Distribution is skewed \(skew=[\d.-]+\)\.\s*/g, "The data is unevenly spread. ")
      .replace(/Distribution is relatively symmetric\.\s*/g, "The data is evenly spread. ")
      .replace(/High correlation with other columns detected\.\s*/g, "This column is closely related to other columns. ")
      .replace(/Regression provides precise estimation\./g, "Using other columns to predict the missing values gives the best result.")
      .replace(/Median provides more stable estimation\./g, "The middle value is a safer choice because extreme values won't affect it.")
      .replace(/Mean imputation is safe and effective\./g, "Using the average value works well here.")
      .replace(/Categorical data requires mode replacement or explicitly labeling as 'Unknown'\./g,
        "This column has text values. The most common value will be used to fill gaps.")
      .replace(/Identical rows detected\. Removing duplicates prevents bias in analysis\./g,
        "Some rows are exact copies. Removing them prevents the data from being unfairly weighted.")
      .replace(/Data format restricts calculations\. Converting to Number is highly recommended\./g,
        "This column looks like numbers but is stored as text. Converting it will allow calculations.");
  };

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
          </div>
          <p className="text-xs text-slate-500 mt-4">
            Preview each fix below to see what will change, then click <strong>"Repair All Issues & Download"</strong> to fix everything at once.
          </p>
        </section>

        {/* ════════════════════════════════════════ */}
        {/* SECTION 2 — RECOMMENDED FIXES            */}
        {/* ════════════════════════════════════════ */}
        <section>
          <div className="flex items-center gap-3 border-b border-indigo-500/20 pb-4 mb-6">
            <Wrench className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-bold text-white">Recommended Fixes</h2>
            <span className="text-xs text-slate-500 ml-2">({actionableRecs.length} fixes)</span>
          </div>

          {actionableRecs.length > 0 ? (
            <div className="space-y-3">
              {actionableRecs.map((rec: any, idx: number) => {
                const count = issues.find(
                  (i: any) => i.column === rec.column && i.issue === rec.issue
                )?.count || 0;

                const columnLabel = rec.column === "Entire Dataset" ? "Duplicate Rows" : rec.column;

                const issueDescription =
                  rec.issue === "Duplicate Rows"
                    ? `${count} duplicate row${count !== 1 ? "s" : ""} found in the dataset`
                    : rec.issue === "Missing Values"
                    ? `${count} missing value${count !== 1 ? "s" : ""} in "${rec.column}"`
                    : rec.issue === "Incorrect Data Type"
                    ? `Column "${rec.column}" has numbers stored as text`
                    : `${rec.issue} in "${rec.column}"`;

                // Build strategy options: recommended + alternatives
                const allStrategies = [rec.recommended_strategy, ...(rec.alternatives || [])];
                const currentStrategy = selectedStrategies[idx] || rec.recommended_strategy;
                const confidenceScore = Math.round((rec.confidence_score || 0) * 100);

                return (
                  <div key={idx} className="bg-slate-900/40 border border-white/5 rounded-xl p-5 hover:border-indigo-500/20 transition-all">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      {/* Description */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-indigo-400 font-bold text-sm">{columnLabel}</span>
                          <span className="text-slate-600">—</span>
                          <span className="text-white text-sm">{issueDescription}</span>
                        </div>

                        {/* Strategy + Confidence */}
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          <span className="text-xs text-slate-500">Fix:</span>
                          <span className="text-emerald-400 font-semibold text-xs">{currentStrategy}</span>

                          {/* Confidence Badge */}
                          {confidenceScore > 0 && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getConfidenceColor(confidenceScore)}`}>
                              <Shield className="w-3 h-3 inline mr-1" />
                              {confidenceScore}% — {getConfidenceLabel(confidenceScore)}
                            </span>
                          )}
                        </div>

                        {/* Explanation */}
                        {rec.explanation && (
                          <p className="text-xs text-slate-500 mt-1.5">
                            {simplifyExplanation(rec.explanation)}
                          </p>
                        )}
                      </div>

                      {/* Strategy Selector + Preview Button */}
                      <div className="shrink-0 flex items-center gap-2">
                        {/* Alternative Strategy Dropdown */}
                        {allStrategies.length > 1 && (
                          <select
                            value={currentStrategy}
                            onChange={(e) => {
                              setSelectedStrategies({ ...selectedStrategies, [idx]: e.target.value });
                            }}
                            className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-lg px-2 py-2 focus:border-indigo-500 focus:outline-none appearance-auto cursor-pointer"
                          >
                            {allStrategies.map((s: string) => (
                              <option key={s} value={s}>
                                {s === rec.recommended_strategy ? `${s} (Recommended)` : s}
                              </option>
                            ))}
                          </select>
                        )}

                        <button
                          onClick={() => handlePreview(rec.column, currentStrategy)}
                          disabled={busy}
                          className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-indigo-500 hover:text-white transition-all disabled:opacity-50"
                        >
                          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Eye className="w-3.5 h-3.5" />}
                          Preview
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
                      {simulation.strategy} on "{simulation.column === "Entire Dataset" ? "All Rows" : simulation.column}"
                    </p>
                  </div>
                </div>
                <button onClick={() => setSimulation(null)} className="p-2 rounded-lg hover:bg-white/5">
                  <X className="w-4 h-4 text-slate-500 hover:text-white" />
                </button>
              </div>

              {/* Changed Rows Table */}
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
                              {row.before === null ? <span className="italic text-red-500/60">NULL (empty)</span> : String(row.before)}
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

                  {simulation.changed_rows.length > 5 && (
                    <div className="px-5 py-3 border-t border-white/5 text-center flex items-center justify-center gap-4">
                      {visibleRows < simulation.changed_rows.length && (
                        <button
                          onClick={() => setVisibleRows((v) => v + 15)}
                          className="flex items-center gap-2 text-xs font-bold text-indigo-400 hover:text-white transition-colors"
                        >
                          <ChevronDown className="w-4 h-4" />
                          View More ({simulation.changed_rows.length - visibleRows} remaining)
                        </button>
                      )}
                      {visibleRows > 5 && (
                        <button
                          onClick={() => setVisibleRows(5)}
                          className="text-xs font-bold text-slate-500 hover:text-white transition-colors"
                        >
                          View Less
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Stats Change Table */}
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
                        <th className="text-left px-3 py-2 text-[10px] font-bold text-slate-600 uppercase tracking-wider w-1/3">What This Means</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      <MetricRow label="Missing Values" before={simulation.metrics_delta.missing_before} after={simulation.metrics_delta.missing_after} highlight help={STAT_HELP["Missing Values"]} />
                      <MetricRow label="Mean (Average)" before={simulation.metrics_delta.mean_before} after={simulation.metrics_delta.mean_after} help={STAT_HELP["Mean (Average)"]} />
                      <MetricRow label="Median (Middle)" before={simulation.metrics_delta.median_before} after={simulation.metrics_delta.median_after} help={STAT_HELP["Median (Middle)"]} />
                      <MetricRow label="Std Dev (Spread)" before={simulation.metrics_delta.std_before} after={simulation.metrics_delta.std_after} help={STAT_HELP["Std Dev (Spread)"]} />
                      <MetricRow label="Skewness (Tilt)" before={simulation.metrics_delta.skew_before} after={simulation.metrics_delta.skew_after} help={STAT_HELP["Skewness (Tilt)"]} />
                      <MetricRow label="Total Rows" before={simulation.row_count_before} after={simulation.row_count_after} help={STAT_HELP["Total Rows"]} />
                      <MetricRow label="Health Score" before={`${simulation.health_score_before}%`} after={`${simulation.health_score_after}%`} highlight help={STAT_HELP["Health Score"]} />
                    </tbody>
                  </table>
                </div>
              )}

              {/* ── Distribution Histogram (Collapsible) ── */}
              {simulation.histogram_before && simulation.histogram_before.length > 0 && simulation.histogram_bins && (
                <CollapsibleSection
                  title="How the Distribution Changes"
                  subtitle="See how the shape of the data shifts after repair"
                  icon={<BarChart3 className="w-4 h-4 text-cyan-400" />}
                >
                  <div className="bg-black/20 rounded-xl p-4">
                    <Plot
                      data={[
                        {
                          x: simulation.histogram_bins.slice(0, -1).map((b, i) =>
                            ((b + (simulation.histogram_bins as number[])[i + 1]) / 2)
                          ),
                          y: simulation.histogram_before,
                          type: "bar" as const,
                          name: "Before Repair",
                          marker: { color: "rgba(239, 68, 68, 0.5)", line: { color: "rgba(239, 68, 68, 0.8)", width: 1 } },
                          hovertemplate: "Value: %{x:.1f}<br>Count: %{y}<extra>Before</extra>",
                        },
                        {
                          x: simulation.histogram_bins.slice(0, -1).map((b, i) =>
                            ((b + (simulation.histogram_bins as number[])[i + 1]) / 2)
                          ),
                          y: simulation.histogram_after,
                          type: "bar" as const,
                          name: "After Repair",
                          marker: { color: "rgba(34, 197, 94, 0.5)", line: { color: "rgba(34, 197, 94, 0.8)", width: 1 } },
                          hovertemplate: "Value: %{x:.1f}<br>Count: %{y}<extra>After</extra>",
                        },
                      ]}
                      layout={{
                        barmode: "overlay",
                        paper_bgcolor: "transparent",
                        plot_bgcolor: "transparent",
                        margin: { t: 30, b: 40, l: 40, r: 20 },
                        height: 260,
                        xaxis: {
                          title: { text: simulation.column, font: { size: 11, color: "#94a3b8" } },
                          gridcolor: "rgba(255,255,255,0.05)",
                          color: "#64748b",
                          tickfont: { size: 9 },
                        },
                        yaxis: {
                          title: { text: "Count", font: { size: 11, color: "#94a3b8" } },
                          gridcolor: "rgba(255,255,255,0.05)",
                          color: "#64748b",
                          tickfont: { size: 9 },
                        },
                        legend: {
                          orientation: "h" as const,
                          x: 0.5,
                          xanchor: "center" as const,
                          y: 1.15,
                          font: { color: "#94a3b8", size: 10 },
                        },
                        autosize: true,
                      }}
                      useResizeHandler
                      className="w-full"
                      config={{ displayModeBar: false, responsive: true }}
                    />
                    <p className="text-[10px] text-slate-600 mt-2 text-center">
                      <span className="text-red-400">Red</span> = data shape before repair ·
                      <span className="text-emerald-400 ml-1">Green</span> = data shape after repair.
                      If the shapes look similar, the repair preserved the original pattern well.
                    </p>
                  </div>
                </CollapsibleSection>
              )}

            </motion.section>
          )}
        </AnimatePresence>

        {/* ════════════════════════════════════════ */}
        {/* SECTION 4 — REPAIR ALL & DOWNLOAD        */}
        {/* ════════════════════════════════════════ */}
        {actionableRecs.length > 0 && !repairedDatasetId && (
          <section className="text-center space-y-3 pt-4">
            <button
              onClick={handleRepairAll}
              disabled={busy}
              className="inline-flex items-center gap-3 px-12 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm uppercase tracking-wider rounded-xl shadow-xl shadow-emerald-500/25 transition-all active:scale-95 disabled:opacity-50"
            >
              {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
              {busy ? "Repairing..." : "Repair All Issues & Download"}
            </button>
            <p className="text-xs text-slate-500">
              This will fill all missing values, remove duplicate rows, fix data types, and download the cleaned dataset as a CSV file.
            </p>
          </section>
        )}

        {/* ════════════════════════════════════════ */}
        {/* SECTION 5 — SUCCESS + UNDO               */}
        {/* ════════════════════════════════════════ */}
        <AnimatePresence>
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className={`p-5 rounded-xl border text-sm font-semibold ${
                successMsg.includes("✅")
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-red-500/10 border-red-500/30 text-red-400"
              }`}>
                {successMsg}
              </div>

              {repairedDatasetId && (
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={handleUndo}
                    className="flex items-center gap-2 px-6 py-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-amber-500 hover:text-white transition-all"
                  >
                    <Undo2 className="w-4 h-4" />
                    Undo — Go Back to Original Dataset
                  </button>
                  <button
                    onClick={() => navigate(`/dashboard/${repairedDatasetId}/analyze`)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-indigo-500 hover:text-white transition-all"
                  >
                    View Repaired Dataset
                  </button>
                </div>
              )}
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
const MetricRow = ({ label, before, after, highlight = false, help }: { label: string; before: any; after: any; highlight?: boolean; help?: string }) => {
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
      <td className="px-3 py-2.5 text-xs text-slate-600 group-hover:text-slate-400 transition-colors">
        {help || ""}
      </td>
    </tr>
  );
};

export default RepairPage;
