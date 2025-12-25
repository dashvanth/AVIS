import React, { useEffect, useState, useMemo } from "react";
import Plot from "react-plotly.js";
import {
  Loader2,
  Trash2,
  Layout,
  BarChart3,
  PieChart,
  TrendingUp,
  ScatterChart,
  Zap,
  AlertCircle,
  MousePointer2,
  ShieldCheck,
  Info,
  Maximize2,
} from "lucide-react";
import {
  getChartData,
  getEDASummary,
  saveDashboard,
  getDashboards,
  deleteDashboard,
} from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import type { Dashboard } from "../types";

interface VisualizationDashboardProps {
  datasetId: number;
}

const VisualizationDashboard: React.FC<VisualizationDashboardProps> = ({
  datasetId,
}) => {
  const [loading, setLoading] = useState(false);
  const [columns, setColumns] = useState<string[]>([]);
  const [xColumn, setXColumn] = useState<string>("");
  const [yColumn, setYColumn] = useState<string>("");
  const [chartType, setChartType] = useState<string>("bar");
  const [chartData, setChartData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [dashboardName, setDashboardName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Load Metadata and Saved Views
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [summary, dashboardsData] = await Promise.all([
          getEDASummary(datasetId),
          getDashboards(datasetId),
        ]);

        const cols = [
          ...summary.numeric.map((c: any) => c.column),
          ...summary.categorical.map((c: any) => c.column),
        ];
        setColumns(cols);
        setDashboards(dashboardsData);

        if (cols.length > 0) setXColumn(cols[0]);
        if (cols.length > 1) setYColumn(cols[1]);
      } catch (err) {
        setError("Forensic sync failed. Please check backend status.");
      }
    };
    if (datasetId) fetchMetadata();
  }, [datasetId]);

  // Fetch High-Fidelity Chart Data
  const fetchChart = async (x: string, y: string, type: string) => {
    if (!x) return;
    setLoading(true);
    setError(null);
    try {
      const yInfo = type === "pie" ? undefined : y;
      const data = await getChartData(datasetId, x, type, yInfo);
      setChartData(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to render visualization");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (datasetId && xColumn) fetchChart(xColumn, yColumn, chartType);
  }, [datasetId, xColumn, yColumn, chartType]);

  // Handle Persistence
  const handleSaveDashboard = async () => {
    if (!dashboardName.trim()) return;
    setIsSaving(true);
    try {
      const config = { xColumn, yColumn, chartType };
      const newDashboard = await saveDashboard(
        datasetId,
        dashboardName,
        config
      );
      setDashboards([newDashboard, ...dashboards]);
      setDashboardName("");
    } catch (err) {
      alert("Persistence Failure: Snapshot could not be saved.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadDashboard = (dashboard: Dashboard) => {
    const config = JSON.parse(dashboard.layout_config);
    setXColumn(config.xColumn);
    setYColumn(config.yColumn);
    setChartType(config.chartType);
  };

  const handleDeleteDashboard = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Purge this saved view?")) {
      await deleteDashboard(id);
      setDashboards((prev) => prev.filter((d) => d.id !== id));
    }
  };

  // ADVANCED: Dynamic Logic Explainer (Functionality 6)
  const getLogicNote = useMemo(() => {
    if (chartType === "bar")
      return "Categorical Frequency: Counting occurrences per group.";
    if (chartType === "pie")
      return "Proportional Density: Visualizing slice-to-whole ratio.";
    if (chartType === "scatter")
      return "Relational Linkage: Plotting raw intersection of two dimensions.";
    return "Trend Sequence: Analyzing movement across the primary axis.";
  }, [chartType]);

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-10 space-y-10 bg-avis-primary min-h-screen">
      {/* 1. VISUALIZATION HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-avis-border/40 pb-10 gap-6">
        <div>
          <div className="flex items-center gap-3 text-avis-accent-indigo text-[10px] font-black uppercase tracking-[0.4em] mb-3">
            <BarChart3 className="w-4 h-4" /> Visual Studio Node
          </div>
          <h2 className="text-5xl font-black text-white tracking-tighter italic">
            Discovery Graphics
          </h2>
          <p className="text-avis-text-secondary mt-3 text-sm font-medium max-w-2xl leading-relaxed">
            Translate your{" "}
            <span className="text-white italic">Forensic DNA</span> results into
            interactive graphics. This stage identifies patterns through visual
            density rather than raw math.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-avis-accent-success/10 px-6 py-3 rounded-2xl border border-avis-accent-success/20">
          <ShieldCheck className="w-4 h-4 text-avis-accent-success" />
          <span className="text-[10px] font-black text-avis-accent-success uppercase tracking-widest">
            Normalized Data Feed Active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* 2. ADVANCED CONTROL PANEL */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-8 bg-avis-secondary/40 border border-avis-border/60 rounded-[3rem] shadow-2xl space-y-8 backdrop-blur-xl">
            <div>
              <label className="block text-[10px] font-black text-avis-text-secondary uppercase tracking-widest mb-6 ml-1">
                Render Architecture
              </label>
              <div className="grid grid-cols-2 gap-3">
                <ChartIconBtn
                  active={chartType === "bar"}
                  onClick={() => setChartType("bar")}
                  icon={<BarChart3 />}
                  label="Bar"
                />
                <ChartIconBtn
                  active={chartType === "pie"}
                  onClick={() => setChartType("pie")}
                  icon={<PieChart />}
                  label="Pie"
                />
                <ChartIconBtn
                  active={chartType === "line"}
                  onClick={() => setChartType("line")}
                  icon={<TrendingUp />}
                  label="Line"
                />
                <ChartIconBtn
                  active={chartType === "scatter"}
                  onClick={() => setChartType("scatter")}
                  icon={<ScatterChart />}
                  label="Scatter"
                />
              </div>
            </div>

            <div className="space-y-6 pt-6 border-t border-avis-border/20">
              <AxisSelect
                label="Primary Dimension (X)"
                value={xColumn}
                onChange={setXColumn}
                options={columns}
              />
              <AxisSelect
                label="Intersect Dimension (Y)"
                value={yColumn}
                onChange={setYColumn}
                options={columns}
                disabled={chartType === "pie"}
              />
            </div>
          </div>

          {/* PERSPECTIVE HISTORY */}
          <div className="p-8 bg-avis-secondary/20 border border-avis-border/40 rounded-[3rem]">
            <h4 className="text-white font-black text-[10px] uppercase tracking-widest mb-6 flex items-center gap-2">
              <Layout className="w-4 h-4 text-avis-accent-indigo" /> Saved
              Perspectives
            </h4>
            <div className="space-y-3">
              {dashboards.length === 0 ? (
                <p className="text-[10px] text-avis-text-secondary italic px-2">
                  No snapshots persisted.
                </p>
              ) : (
                dashboards.map((dash) => (
                  <div
                    key={dash.id}
                    onClick={() => handleLoadDashboard(dash)}
                    className="p-4 bg-avis-primary/40 rounded-2xl border border-avis-border/40 hover:border-avis-accent-indigo/60 cursor-pointer flex justify-between items-center group transition-all"
                  >
                    <div className="truncate pr-4">
                      <p className="text-[11px] font-bold text-white truncate uppercase tracking-tighter">
                        {dash.name}
                      </p>
                      <p className="text-[8px] text-avis-text-secondary font-mono">
                        NODE_{dash.id.toString().padStart(3, "0")}
                      </p>
                    </div>
                    <Trash2
                      onClick={(e) => handleDeleteDashboard(dash.id, e)}
                      className="w-3.5 h-3.5 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* 3. FORENSIC CHART CANVAS */}
        <div className="lg:col-span-3 space-y-6">
          {/* FUNCTIONALITY 4: NO BLACK-BOX LABEL */}
          <div className="px-8 py-5 bg-avis-accent-indigo/5 border border-avis-accent-indigo/20 rounded-[2rem] flex items-center gap-5 shadow-inner">
            <div className="p-2 bg-avis-accent-indigo/20 rounded-lg">
              <Zap className="w-4 h-4 text-avis-accent-indigo" />
            </div>
            <p className="text-[10px] text-avis-text-secondary uppercase font-black tracking-widest leading-relaxed">
              <span className="text-white">Direct-Feed Logic:</span>{" "}
              {getLogicNote}
              <span className="ml-2 text-avis-accent-cyan italic">
                // Source: Verified Clean Matrix (Step 1)
              </span>
            </p>
          </div>

          <div className="bg-avis-secondary/40 border border-avis-border/60 rounded-[4rem] p-10 min-h-[600px] flex items-center justify-center relative shadow-[0_0_50px_rgba(0,0,0,0.3)] overflow-hidden group">
            {loading ? (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-12 h-12 text-avis-accent-indigo animate-spin opacity-40" />
                <span className="text-[10px] font-black text-avis-text-secondary uppercase tracking-widest animate-pulse">
                  Matrix Rendering...
                </span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center gap-4 text-red-400">
                <AlertCircle className="w-10 h-10" />
                <p className="text-xs font-bold uppercase tracking-widest">
                  {error}
                </p>
              </div>
            ) : chartData ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full h-full"
              >
                <Plot
                  data={chartData.data}
                  layout={{
                    ...chartData.layout,
                    autosize: true,
                    paper_bgcolor: "rgba(0,0,0,0)",
                    plot_bgcolor: "rgba(0,0,0,0)",
                    font: { color: "#94a3b8", family: "Inter, sans-serif" },
                    margin: { l: 60, r: 40, b: 60, t: 40 },
                    xaxis: {
                      gridcolor: "rgba(255,255,255,0.05)",
                      zerolinecolor: "rgba(255,255,255,0.1)",
                    },
                    yaxis: {
                      gridcolor: "rgba(255,255,255,0.05)",
                      zerolinecolor: "rgba(255,255,255,0.1)",
                    },
                  }}
                  className="w-full h-[550px]"
                  useResizeHandler={true}
                  config={{ displayModeBar: false, responsive: true }}
                />
              </motion.div>
            ) : (
              <div className="flex flex-col items-center gap-5 opacity-20">
                <MousePointer2 className="w-16 h-16 text-avis-text-secondary" />
                <div className="text-center">
                  <p className="text-sm font-black uppercase tracking-widest text-white mb-2">
                    Workspace Idle
                  </p>
                  <p className="text-[10px] font-bold text-avis-text-secondary uppercase tracking-tighter">
                    Select dimensions to initiate rendering
                  </p>
                </div>
              </div>
            )}

            {/* Scale Indicator */}
            <div className="absolute bottom-10 right-10 flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/5">
              <Maximize2 className="w-3 h-3 text-avis-text-secondary" />
              <span className="text-[8px] font-black text-avis-text-secondary uppercase tracking-widest">
                Auto-Scale Active
              </span>
            </div>
          </div>

          {/* SAVE COMMAND BAR */}
          <div className="flex items-center gap-4 p-4 bg-avis-secondary/40 border border-avis-border rounded-full shadow-2xl group focus-within:border-avis-accent-indigo transition-all backdrop-blur-md">
            <div className="p-3 bg-avis-primary rounded-full border border-avis-border/60 text-avis-accent-indigo group-hover:rotate-12 transition-transform">
              <Zap className="w-4 h-4" />
            </div>
            <input
              value={dashboardName}
              onChange={(e) => setDashboardName(e.target.value)}
              placeholder="Label this snapshot (e.g. Price vs Age)..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold text-white px-4 placeholder:text-avis-text-secondary/30"
            />
            <button
              onClick={handleSaveDashboard}
              disabled={!dashboardName || isSaving}
              className="px-12 py-3.5 bg-avis-accent-indigo text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg hover:scale-105 disabled:opacity-30 disabled:hover:scale-100 transition-all"
            >
              {isSaving ? "Persisting..." : "Save Perspective"}
            </button>
          </div>
        </div>
      </div>

      {/* FOOTER EXPLAINER */}
      <div className="p-8 bg-avis-accent-indigo/5 border border-avis-border/40 rounded-[3rem] flex items-start gap-6">
        <div className="p-3 bg-avis-secondary/50 rounded-2xl border border-avis-border/60">
          <Info className="w-6 h-6 text-avis-accent-indigo" />
        </div>
        <div className="space-y-2">
          <h4 className="text-white font-black text-xs uppercase tracking-widest">
            How to use Discovery Graphics:
          </h4>
          <p className="text-[11px] text-avis-text-secondary leading-relaxed max-w-4xl italic">
            Choose an **X-Axis** to define your groups and a **Y-Axis** to
            measure them. If you see tall bars or rising lines, it confirms the
            <span className="text-avis-accent-cyan">
              {" "}
              Relationship Discovery
            </span>{" "}
            identified in the Step-by-Step EDA. Use the **Scatter** option for
            the most accurate forensic view of how individual entities
            intersect.
          </p>
        </div>
      </div>
    </div>
  );
};

const ChartIconBtn = ({ active, icon, label, onClick }: any) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-3 p-5 rounded-[2.5rem] border transition-all ${
      active
        ? "bg-avis-accent-indigo border-avis-accent-indigo text-white shadow-[0_10px_30px_rgba(99,102,241,0.3)] scale-110 z-10"
        : "bg-avis-primary/40 border-avis-border/60 text-avis-text-secondary hover:border-white/20"
    }`}
  >
    {React.cloneElement(icon, { className: "w-6 h-6" })}
    <span className="text-[8px] font-black uppercase tracking-widest">
      {label}
    </span>
  </button>
);

const AxisSelect = ({ label, value, onChange, options, disabled }: any) => (
  <div
    className={`space-y-3 ${disabled ? "opacity-20 pointer-events-none" : ""}`}
  >
    <label className="text-[9px] font-black text-avis-text-secondary uppercase tracking-[0.2em] ml-2 italic">
      {label}
    </label>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-avis-primary border border-avis-border/60 rounded-2xl px-6 py-4 text-xs text-white font-bold outline-none focus:border-avis-accent-indigo transition-all appearance-none cursor-pointer pr-10"
      >
        {options.map((o: any) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
        <Layout className="w-3 h-3 text-avis-text-secondary opacity-40" />
      </div>
    </div>
  </div>
);

export default VisualizationDashboard;
