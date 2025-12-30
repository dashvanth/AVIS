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
  ShieldAlert
} from "lucide-react";
import { motion } from "framer-motion";
import * as api from "../services/api";
import type { PreviewData, EDASummary } from "../types";

interface VisualizationDashboardProps {
  datasetId: number;
}

const VisualizationDashboard: React.FC<VisualizationDashboardProps> = ({ datasetId }) => {
  // 🔹 STATE MANAGEMENT
  const [loading, setLoading] = useState(true);
  const [rendering, setRendering] = useState(false);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [edaSummary, setEdaSummary] = useState<EDASummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Selection State
  const [chartType, setChartType] = useState<"bar" | "pie" | "line" | "scatter">("bar");
  const [xColumn, setXColumn] = useState<string>("");
  const [yColumn, setYColumn] = useState<string>("");
  const [chartData, setChartData] = useState<any>(null);

  // 🔹 INITIAL DATA FETCH
  useEffect(() => {
    const fetchContext = async () => {
      if (!datasetId) return;
      setLoading(true);
      try {
        const [previewData, summaryData] = await Promise.all([
          api.getDatasetPreview(datasetId),
          api.getEDASummary(datasetId)
        ]);
        setPreview(previewData);
        setEdaSummary(summaryData);

        // Auto-select first intelligent default
        const catCols = summaryData.categorical.map(c => c.column);
        const numCols = summaryData.numeric.map(c => c.column);
        if (catCols.length > 0) setXColumn(catCols[0]);
        if (numCols.length > 0) setYColumn(numCols[0]);
      } catch (err) {
        console.error(err);
        setError("Failed to load dataset context.");
      } finally {
        setLoading(false);
      }
    };
    fetchContext();
  }, [datasetId]);

  // 🔹 CHART RENDERING TRIGGER
  useEffect(() => {
    const renderChart = async () => {
      if (!datasetId || !xColumn) return;
      setRendering(true);
      try {
        // For Pie charts, Y is optional (uses counts if missing)
        // For others, Y is usually needed or defaults to count
        const data = await api.getChartData(datasetId, xColumn, chartType, yColumn || undefined);
        setChartData(data);
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

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0B0F19]">
      <Loader2 className="w-16 h-16 text-indigo-500 animate-spin" />
      <p className="text-indigo-400 mt-4 font-mono text-sm tracking-widest animate-pulse">PREPARING VISUAL LAB...</p>
    </div>
  );

  if (error || !preview) return <div className="p-10 text-white text-center">{error}</div>;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-200 font-sans pb-32">

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-[95%] mx-auto px-6 pt-12 space-y-12">

        {/* 🔹 SECTION 1: VISUALIZATION CONTEXT (ENHANCED LINEAGE) */}
        <motion.section variants={itemVariants} className="flex flex-col md:flex-row justify-between items-end border-b border-white/5 pb-8 gap-6">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-black uppercase tracking-[0.3em] mb-3">
              <Layout className="w-4 h-4" /> Visual Lab
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">
              Visualizing <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">{preview.filename}</span>
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400 mt-4">
              <span className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full"><Table className="w-4 h-4 text-emerald-400" /> {preview.row_count} Rows (0 Removed)</span>
              <span className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full"><Database className="w-4 h-4 text-emerald-400" /> {preview.column_count} Columns</span>
              <span className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-bold uppercase text-[10px]">
                <FileCheck className="w-3 h-3" /> Prepared Data
              </span>
            </div>
          </div>
        </motion.section>

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
                  Based on EDA: Categorical charts (Bar/Pie) are recommended for this dataset.
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

            {/* 🔹 SECTION 8 & 9: EDUCATIONAL LAYERS (SPLIT) */}
            <motion.section variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Helps With */}
              <div className="p-6 bg-slate-900/40 border border-white/5 rounded-2xl">
                <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" /> This Chart Helps You
                </h4>
                <ul className="space-y-2 text-sm text-slate-400">
                  {chartType === "bar" && <><li>Compare group sizes easily.</li><li>Spot the most frequent categories.</li></>}
                  {chartType === "pie" && <><li>See how parts make up the hole.</li><li>Visualize dominance of a few groups.</li></>}
                  {chartType === "line" && <><li>Track trends over time.</li><li>Spot sudden increases or drops.</li></>}
                  {chartType === "scatter" && <><li>Check if two values are related.</li><li>Identify outliers (unusual points).</li></>}
                </ul>
              </div>

              {/* Does Not Help With (Limits) */}
              <div className="p-6 bg-slate-900/40 border border-white/5 rounded-2xl">
                <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" /> Does NOT Help With
                </h4>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li>❌ Predicting future values (Forecasting).</li>
                  <li>❌ Proving cause and effect relationships.</li>
                </ul>
              </div>

            </motion.section>

            {/* 🔹 SECTION 10: NEXT ACTIONS */}
            <motion.section variants={itemVariants}>
              <div className="p-6 bg-slate-900/40 border border-white/5 rounded-2xl flex flex-col items-center justify-center gap-4 text-center">
                <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" /> Analysis Complete?
                </h4>
                <p className="text-sm text-slate-500 max-w-lg">
                  You have visualized the shapes of your data. Now, let the <strong>Insights Engine</strong> explain what these patterns mean in plain English.
                </p>
                <div className="flex gap-4 w-full justify-center">
                  <Link to={`/dashboard/${datasetId}/insights`} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20 transition-all transform hover:scale-105">
                    Get AI Insights
                  </Link>
                  <Link to={`/dashboard/${datasetId}/chat`} className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-sm border border-white/10 transition-all">
                    Ask Chat about this
                  </Link>
                </div>
              </div>
            </motion.section>

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
