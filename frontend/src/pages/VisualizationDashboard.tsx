import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import {
  Loader2,
  Save,
  Trash2,
  Layout,
  BarChart3,
  PieChart,
  TrendingUp,
  ScatterChart,
  Zap,
  AlertCircle,
  MousePointer2,
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

  // Selectors
  const [xColumn, setXColumn] = useState<string>("");
  const [yColumn, setYColumn] = useState<string>("");
  const [chartType, setChartType] = useState<string>("bar");

  const [chartData, setChartData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Dashboard State
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [dashboardName, setDashboardName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Initial load: Automated Statistics & Saved Views
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
        console.error("Failed to load metadata", err);
        setError("Metadata sync failed. Verify backend connection.");
      }
    };
    if (datasetId) fetchMetadata();
  }, [datasetId]);

  // Fetch dynamic chart data
  const fetchChart = async (x: string, y: string, type: string) => {
    if (!x) return;
    setLoading(true);
    setError(null);
    try {
      const yInfo = type === "pie" ? undefined : y;
      const data = await getChartData(datasetId, x, type, yInfo);
      setChartData(data);
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "Failed to generate visualization"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (datasetId && xColumn) {
      fetchChart(xColumn, yColumn, chartType);
    }
  }, [datasetId, xColumn, yColumn, chartType]);

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
      alert("Failed to persist dashboard view.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadDashboard = (dashboard: Dashboard) => {
    try {
      const config = JSON.parse(dashboard.layout_config);
      setXColumn(config.xColumn);
      setYColumn(config.yColumn);
      setChartType(config.chartType);
    } catch (e) {
      console.error("Invalid config structure", e);
    }
  };

  const handleDeleteDashboard = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Delete this saved view?")) {
      await deleteDashboard(id);
      setDashboards((prev) => prev.filter((d) => d.id !== id));
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-10 space-y-10 bg-avis-primary min-h-screen">
      {/* 1. VISUALIZATION HEADER (Functionality 6) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-avis-border/40 pb-10">
        <div>
          <div className="flex items-center gap-3 text-avis-accent-indigo text-[10px] font-black uppercase tracking-[0.4em] mb-3">
            <BarChart3 className="w-4 h-4" /> Visualization Node
          </div>
          <h2 className="text-5xl font-black text-white tracking-tighter italic">
            Dynamic Charting
          </h2>
          <p className="text-avis-text-secondary mt-3 text-sm font-medium max-w-2xl">
            Translate your Exploratory Audit results into interactive
            high-fidelity graphics for pattern recognition.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* 2. CONTROL PANEL (Functionality 4) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-8 bg-avis-secondary/40 border border-avis-border/60 rounded-[3rem] shadow-2xl space-y-8">
            <div>
              <label className="block text-[10px] font-black text-avis-text-secondary uppercase tracking-widest mb-6 ml-1">
                Chart Architecture
              </label>
              <div className="grid grid-cols-2 gap-3">
                <ChartIconBtn
                  active={chartType === "bar"}
                  onClick={() => setChartType("bar")}
                  icon={<BarChart3 className="w-5 h-5" />}
                  label="Bar"
                />
                <ChartIconBtn
                  active={chartType === "pie"}
                  onClick={() => setChartType("pie")}
                  icon={<PieChart className="w-5 h-5" />}
                  label="Pie"
                />
                <ChartIconBtn
                  active={chartType === "line"}
                  onClick={() => setChartType("line")}
                  icon={<TrendingUp className="w-5 h-5" />}
                  label="Line"
                />
                <ChartIconBtn
                  active={chartType === "scatter"}
                  onClick={() => setChartType("scatter")}
                  icon={<ScatterChart className="w-5 h-5" />}
                  label="Scatter"
                />
              </div>
            </div>

            <div className="space-y-6 pt-6 border-t border-avis-border/20">
              <AxisSelect
                label="Primary Axis (X)"
                value={xColumn}
                onChange={setXColumn}
                options={columns}
              />
              <AxisSelect
                label="Secondary Axis (Y)"
                value={yColumn}
                onChange={setYColumn}
                options={columns}
                disabled={chartType === "pie"}
              />
            </div>
          </div>

          {/* SAVED PERSPECTIVES */}
          <div className="p-8 bg-avis-secondary/20 border border-avis-border/40 rounded-[3rem]">
            <h4 className="text-white font-black text-[10px] uppercase tracking-widest mb-6 flex items-center gap-2">
              <Layout className="w-4 h-4 text-avis-accent-indigo" /> Saved Views
            </h4>
            <div className="space-y-3">
              {dashboards.length === 0 ? (
                <p className="text-[10px] text-avis-text-secondary italic px-2">
                  No saved views yet.
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
                        {new Date(dash.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Trash2
                      onClick={(e) => handleDeleteDashboard(dash.id, e)}
                      className="w-3 h-3 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* 3. CHART CANVAS & SAVE ACTION (Functionality 4) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-avis-secondary/40 border border-avis-border/60 rounded-[4rem] p-10 min-h-[600px] flex items-center justify-center relative shadow-[0_0_50px_rgba(0,0,0,0.3)] overflow-hidden group">
            {loading ? (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-12 h-12 text-avis-accent-indigo animate-spin opacity-40" />
                <span className="text-[10px] font-black text-avis-text-secondary uppercase tracking-widest">
                  Rendering...
                </span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center gap-4 text-red-400">
                <AlertCircle className="w-10 h-10" />
                <p className="text-xs font-bold">{error}</p>
              </div>
            ) : chartData ? (
              <div className="w-full h-full">
                <Plot
                  data={chartData.data}
                  layout={{
                    ...chartData.layout,
                    autosize: true,
                    paper_bgcolor: "rgba(0,0,0,0)",
                    plot_bgcolor: "rgba(0,0,0,0)",
                    font: { color: "#94a3b8", family: "Inter, sans-serif" },
                    margin: { l: 50, r: 50, b: 50, t: 50 },
                  }}
                  className="w-full h-[500px]"
                  useResizeHandler={true}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 opacity-30">
                <MousePointer2 className="w-10 h-10 text-avis-text-secondary" />
                <p className="text-[10px] font-black uppercase tracking-widest">
                  Select dimensions to visualize
                </p>
              </div>
            )}
          </div>

          {/* SAVE CONTROL BAR */}
          <div className="flex items-center gap-4 p-4 bg-avis-secondary/40 border border-avis-border rounded-full shadow-2xl group focus-within:border-avis-accent-indigo transition-all">
            <div className="p-3 bg-avis-primary rounded-full border border-avis-border/60 text-avis-accent-indigo">
              <Zap className="w-4 h-4" />
            </div>
            <input
              value={dashboardName}
              onChange={(e) => setDashboardName(e.target.value)}
              placeholder="Snapshot name..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold text-white px-4 placeholder:text-avis-text-secondary/30"
            />
            <button
              onClick={handleSaveDashboard}
              disabled={!dashboardName || isSaving}
              className="px-10 py-3 bg-avis-accent-indigo text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg hover:scale-105 disabled:opacity-30 transition-all"
            >
              {isSaving ? "Persisting..." : "Save View"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-components for clarity and scale
const ChartIconBtn = ({ active, icon, label, onClick }: any) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-3 p-5 rounded-[2rem] border transition-all ${
      active
        ? "bg-avis-accent-indigo border-avis-accent-indigo text-white shadow-xl scale-105"
        : "bg-avis-primary/40 border-avis-border/60 text-avis-text-secondary hover:border-white/20"
    }`}
  >
    {icon}
    <span className="text-[8px] font-black uppercase tracking-widest">
      {label}
    </span>
  </button>
);

const AxisSelect = ({ label, value, onChange, options, disabled }: any) => (
  <div
    className={`space-y-3 ${disabled ? "opacity-20 pointer-events-none" : ""}`}
  >
    <label className="text-[9px] font-black text-avis-text-secondary uppercase tracking-[0.2em] ml-2">
      {label}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-avis-primary border border-avis-border/60 rounded-2xl px-5 py-3.5 text-xs text-white font-bold outline-none focus:border-avis-accent-indigo transition-all appearance-none cursor-pointer"
    >
      {options.map((o: any) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  </div>
);

export default VisualizationDashboard;
