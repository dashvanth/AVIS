import React, { useEffect, useState, useMemo } from "react";
import Plot from "react-plotly.js";
import { Link, useParams } from "react-router-dom";
import {
  Loader2,
  Layout,
  BarChart3,
  PieChart,
  TrendingUp,
  ScatterChart,
  Info,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  HelpCircle,
  MousePointer2,
  Lightbulb,
  MessageSquare,
  Database,
  Table,
  FileCheck,
  ShieldAlert,
  MessageSquarePlus
} from "lucide-react";
import { motion } from "framer-motion";
import * as api from "../services/api";
import type { PreviewData, EDASummary } from "../types";

import { useDatasetContext } from "../context/DatasetContext";

interface VisualizationDashboardProps {
  datasetId: number;
}

const VisualizationDashboard: React.FC<VisualizationDashboardProps> = ({ datasetId }) => {
  const { preview, summary: edaSummary, loading: contextLoading } = useDatasetContext();

  // 🔹 STATE MANAGEMENT
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Selection State
  const [chartType, setChartType] = useState<"bar" | "pie" | "line" | "scatter">("bar");
  const [xColumn, setXColumn] = useState<string>("");
  const [yColumn, setYColumn] = useState<string>("");
  const [chartData, setChartData] = useState<any>(null);
  const [chartMeta, setChartMeta] = useState<{ downsampled: boolean, limit: number } | null>(null);

  // Auto-select intelligent defaults when data arrives
  useEffect(() => {
    if (edaSummary && !xColumn) {
      const catCols = edaSummary.categorical.map(c => c.column);
      const numCols = edaSummary.numeric.map(c => c.column);
      
      // Smart Recommendation Logic
      if (catCols.length > 0) {
        setXColumn(catCols[0]);
        setChartType(catCols.length < 5 ? "pie" : "bar");
        if (numCols.length > 0) setYColumn(numCols[0]);
      } else if (numCols.length >= 2) {
        setXColumn(numCols[0]);
        setYColumn(numCols[1]);
        setChartType("scatter");
      } else if (numCols.length === 1) {
        setXColumn(numCols[0]);
        setChartType("bar");
      }
    }
  }, [edaSummary, xColumn]);

  // 🔹 CHART RENDERING TRIGGER
  useEffect(() => {
    const renderChart = async () => {
      if (!datasetId || !xColumn) return;
      setRendering(true);
      try {
        // For Pie charts, Y is optional (uses counts if missing)
        // For others, Y is usually needed or defaults to count
        const response = await api.getChartData(datasetId, xColumn, chartType, yColumn || undefined);
        setChartData(response);
        if (response.meta) {
           setChartMeta(response.meta);
        } else {
           setChartMeta(null);
        }
      } catch (err) {
        console.error("Render failed:", err);
      } finally {
        setRendering(false);
      }
    };
    // Debounce slightly to prevent flicker on rapid selection
    const timer = setTimeout(renderChart, 300);
    return () => clearTimeout(timer);
  }, [datasetId, xColumn, yColumn, chartType]);

  // 🔹 HELPER LOGIC
  const numericColumns = edaSummary?.numeric.map(c => c.column) || [];
  const categoricalColumns = edaSummary?.categorical.map(c => c.column) || [];
  const allColumns = [...categoricalColumns, ...numericColumns];

  // Chart Availability Logic
  const getChartAvailability = (type: string) => {
    if (type === "scatter") {
      return numericColumns.length >= 2
        ? { allowed: true, reason: "Good for checking correlations." }
        : { allowed: false, reason: "Requires at least 2 numeric columns." };
    }
    if (type === "line") {
      // Ideally check for time/order, strictly speaking line needs safe order, but for V2 flexible
      return { allowed: true, reason: "Best for ordered data or trends." };
    }
    if (type === "pie") {
      const isCat = categoricalColumns.includes(xColumn);
      return isCat
        ? { allowed: true, reason: "Great for showing proportions." }
        : { allowed: true, reason: "Works best with few categories." };
    }
    return { allowed: true, reason: "Standard comparison chart." }; // Bar
  };

  // Axis Recommendation Logic
  const getXAxisRecommendation = () => {
    if (!xColumn) return "";
    const isCat = categoricalColumns.includes(xColumn);
    return isCat
      ? "Recommended: This is a categorical label, perfect for grouping."
      : "Notice: Grouping by numbers can create many bars.";
  };

  const getYAxisRecommendation = () => {
    if (!yColumn) return "Recommended: 'Count of Records' is safest for categorical groups.";
    return "Using Sum/Average. Ensure this makes sense for your data.";
  };

  const getLogicExplanation = () => {
    if (!xColumn) return "Waiting for selection...";
    const base = `1. Grouped data by '${xColumn}'.`;
    const edaContext = "Consistent with EDA findings.";

    if (chartType === "bar") return `${base} 2. Calculated the size (count) or sum of each group. 3. Drew bars to compare heights. (${edaContext})`;
    if (chartType === "pie") return `${base} 2. Calculated the percentage of the whole for each group. 3. Drew slices to show proportions.`;
    if (chartType === "line") return `${base} 2. Connected the data points in order. 3. Showed the trend over the sequence.`;
    if (chartType === "scatter") return `1. Plotted every single row as a dot. 2. Positioned based on '${xColumn}' (X) and '${yColumn}' (Y). 3. Revealed the relationship pattern.`;
    return "";
  };

  if (contextLoading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0B0F19]">
      <Loader2 className="w-16 h-16 text-indigo-500 animate-spin" />
      <p className="text-indigo-400 mt-4 font-mono text-sm tracking-widest animate-pulse">PREPARING VISUAL LAB...</p>
    </div>
  );

  if (error || !preview) return (
     <div className="flex flex-col items-center justify-center min-h-[50vh] bg-slate-950 p-6">
        <div className="bg-red-500/10 border border-red-500/20 p-10 rounded-3xl max-w-lg text-center backdrop-blur-xl">
           <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-6" />
           <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-wide">Visualization Error</h3>
           <p className="text-slate-400 mb-8 leading-relaxed">{error || "Unable to load visual data."}</p>
           <Link 
              to="/app"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-all"
           >
              Return to Dashboard
           </Link>
        </div>
     </div>
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

  return (
    <div className="py-8">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
        
        {/* 🔹 SECTION 1: COMPARE BEFORE/AFTER REPAIR */}
        {preview?.parent_dataset_id && (
          <motion.div variants={itemVariants} className="flex justify-end mb-4">
             <Link
               to={`/dashboard/${preview.parent_dataset_id}/visualize`}
               className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-amber-500/20 transition-all transform hover:scale-105"
             >
               <BarChart3 className="w-4 h-4" />
               View Original Data (Before Repair)
             </Link>
          </motion.div>
        )}

        {/* 🔹 SECTION 2: EDUCATION */}
        <motion.section variants={itemVariants}>
          <div className="p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl flex items-start gap-4">
            <div className="p-3 bg-indigo-500/20 rounded-xl">
              <HelpCircle className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-white font-bold mb-1">What does this page do?</h3>
              <p className="text-sm text-slate-400 leading-relaxed max-w-3xl">
                This lab helps you see patterns in your data using charts.
                It does not calculate specific statistics (like averages) but instead shows you the <strong>shape</strong> and <strong>distribution</strong> of your information.
              </p>
            </div>
          </div>
        </motion.section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* CONTROLS COLUMN */}
          <div className="lg:col-span-4 space-y-8">

            {/* 🔹 SECTION 3: CHART SELECTION (ENHANCED AVAILABILITY) */}
            <motion.section variants={itemVariants} className="bg-slate-900/40 border border-white/5 rounded-[2rem] p-6">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">1. Choose a Chart</h4>
              <div className="grid grid-cols-1 gap-3">
                {["bar", "pie", "line", "scatter"].map((type) => {
                  const { allowed, reason } = getChartAvailability(type);
                  const icons: any = { bar: BarChart3, pie: PieChart, line: TrendingUp, scatter: ScatterChart };
                  return (
                    <ChartOption
                      key={type}
                      active={chartType === type}
                      onClick={() => allowed && setChartType(type as any)}
                      icon={icons[type]}
                      label={`${type.charAt(0).toUpperCase() + type.slice(1)} Chart`}
                      desc={reason}
                      disabled={!allowed}
                    />
                  );
                })}
              </div>
              <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/5">
                <p className="text-[10px] text-slate-400 italic">
                  <Lightbulb className="w-3 h-3 inline mr-1 text-amber-400" />
                  Auto-recommended based on your dataset structure.
                </p>
              </div>
            </motion.section>

            {/* 🔹 SECTION 4: AXIS SELECTION (ENHANCED RECS) */}
            <motion.section variants={itemVariants} className="bg-slate-900/40 border border-white/5 rounded-[2rem] p-6">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">2. Configure Axes</h4>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-indigo-300 mb-2">Primary Dimension (X-Axis)</label>
                  <select
                    value={xColumn}
                    onChange={(e) => setXColumn(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none"
                  >
                    {allColumns.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <p className="text-[10px] text-indigo-300/60 mt-2">{getXAxisRecommendation()}</p>
                </div>
                <div className={chartType === 'pie' ? 'opacity-50 pointer-events-none' : ''}>
                  <label className="block text-xs font-bold text-cyan-300 mb-2">Measure (Y-Axis) <span className="text-[10px] font-normal text-slate-500">(Optional)</span></label>
                  <select
                    value={yColumn}
                    onChange={(e) => setYColumn(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none"
                  >
                    <option value="">(Auto: Count of Records)</option>
                    {numericColumns.map(c => <option key={c} value={c}>Sum of {c}</option>)}
                  </select>
                  <p className="text-[10px] text-cyan-300/60 mt-2">{getYAxisRecommendation()}</p>
                </div>
              </div>
            </motion.section>

            {/* 🔹 SECTION 5: DATA LINEAGE BOX (NEW) */}
            <motion.section variants={itemVariants} className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
              <div className="flex items-start gap-3">
                <FileCheck className="w-4 h-4 text-emerald-500 mt-1" />
                <div>
                  <h4 className="text-xs font-bold text-emerald-200 mb-1">Data Source: Prepared Dataset</h4>
                  <ul className="text-[10px] text-emerald-200/70 space-y-1 list-disc pl-4">
                    <li>Missing values were filled (where approved).</li>
                    <li>Original file remains unchanged.</li>
                    <li>No rows were hidden from this view.</li>
                  </ul>
                </div>
              </div>
            </motion.section>

          </div>

          {/* CANVAS COLUMN */}
          <div className="lg:col-span-8 space-y-6">

            {/* 🔹 SECTION 6: LOGIC DISCLOSURE */}
            <motion.section variants={itemVariants}>
              <div className="px-6 py-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center gap-4">
                <div className="p-2 bg-indigo-500/20 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-black tracking-widest text-indigo-300 block mb-1">How this chart was built</span>
                  <p className="text-sm text-indigo-100 font-mono leading-relaxed">{getLogicExplanation()}</p>
                </div>
              </div>
            </motion.section>

            {/* 🔹 SECTION 7: CHART DISPLAY */}
            <motion.section variants={itemVariants} className="bg-slate-900/40 border border-white/5 rounded-[3rem] p-8 min-h-[500px] flex items-center justify-center relative backdrop-blur-sm">
              {rendering ? (
                <div className="text-center">
                  <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto mb-4" />
                  <p className="text-xs text-slate-500 uppercase tracking-widest">Rendering...</p>
                </div>
              ) : chartData ? (
                <div className="w-full h-full relative z-10">
                  <Plot
                    data={chartData.data}
                    layout={{
                      ...chartData.layout,
                      autosize: true,
                      paper_bgcolor: "rgba(0,0,0,0)",
                      plot_bgcolor: "rgba(0,0,0,0)",
                      font: { color: "#94a3b8", family: "Inter" },
                      margin: { l: 50, r: 20, t: 30, b: 50 },
                      showlegend: chartType === 'pie',
                    }}
                    className="w-full h-[500px]"
                    useResizeHandler={true}
                    config={{ displayModeBar: false, responsive: true }}
                  />
                  <div className="absolute bottom-2 right-2 px-3 py-1 bg-black/40 rounded-full text-[9px] text-slate-500 border border-white/5">
                    Auto-scaled for visibility
                  </div>
                </div>
              ) : (
                <div className="text-center opacity-30">
                  <MousePointer2 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Select an X-Axis to Begin</p>
                </div>
              )}
            </motion.section>

            {/* (Removed Help/Does Not Help sections per request) */}

          </div>
        </div>
      </motion.div>
    </div>
  );
};

// 🔹 SUB-COMPONENTS
const ChartOption = ({ active, onClick, icon: Icon, label, desc, disabled, tooltip }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={tooltip}
    className={`w-full p-4 rounded-xl border flex items-center gap-4 text-left transition-all ${disabled ? 'opacity-30 cursor-not-allowed bg-transparent border-white/5' :
        active
          ? 'bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-500/20'
          : 'bg-black/20 border-white/5 hover:bg-white/5 hover:border-white/10'
      }`}
  >
    <div className={`p-2 rounded-lg ${active ? 'bg-white/20' : 'bg-white/5'}`}>
      <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-slate-400'}`} />
    </div>
    <div>
      <div className={`text-sm font-bold ${active ? 'text-white' : 'text-slate-200'}`}>{label}</div>
      <div className={`text-[10px] ${active ? 'text-indigo-200' : 'text-slate-500'}`}>{desc}</div>
    </div>
    {active && <CheckCircle2 className="w-5 h-5 text-white ml-auto" />}
  </button>
);

export default VisualizationDashboard;
