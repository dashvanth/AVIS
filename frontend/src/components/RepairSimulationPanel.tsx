import React from "react";
import { X, Target, HeartPulse, Activity, Sparkles, CheckCircle, ArrowRight, BarChart2 } from "lucide-react";
import Plot from "react-plotly.js";
import { RepairTracePanel, type RepairTraceData } from "./RepairTracePanel";
import { DistributionComparisonChart } from "./DistributionComparisonChart";
import { RepairRiskCard } from "./RepairRiskCard";

// @ts-ignore
export interface SimulationData {
  column: string;
  strategy: string;
  missing_before: number;
  missing_after: number;
  mean_before: number | null;
  mean_after: number | null;
  median_before: number | null;
  median_after: number | null;
  row_count_before: number;
  row_count_after: number;
  health_score_before: number;
  health_score_after: number;
  distribution_before: { bin: string; count: number }[];
  distribution_after: { bin: string; count: number }[];
  histogram_before?: number[];
  histogram_after?: number[];
  histogram_bins?: number[];
  transformed_rows?: any[];
  distribution_shift?: number;
  correlation_impact?: number;
  information_loss?: number;
  risk_score?: number;
  risk_level?: "LOW" | "MEDIUM" | "HIGH";
}

interface RepairSimulationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  data: SimulationData | null;
  traceData: RepairTraceData | null;
  onApply: () => void;
  isApplying: boolean;
}

const MetricRow = ({ label, before, after, highlight = false }: { label: string, before: any, after: any, highlight?: boolean }) => {
  const isChanged = before !== after;
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5">
      <span className="text-slate-400 font-medium text-sm">{label}</span>
      <div className="flex items-center gap-4">
        <span className="font-mono text-slate-300">{before !== null ? before : "N/A"}</span>
        <ArrowRight className={`w-4 h-4 ${isChanged ? "text-amber-500" : "text-slate-600"}`} />
        <span className={`font-mono font-bold ${isChanged ? (highlight ? "text-emerald-400" : "text-amber-400") : "text-slate-300"}`}>
          {after !== null ? after : "N/A"}
        </span>
      </div>
    </div>
  );
};

export const RepairSimulationPanel: React.FC<RepairSimulationPanelProps> = ({ isOpen, onClose, data, traceData, onApply, isApplying }) => {
  if (!isOpen || !data) return null;

  const hasPlotlyData = data.distribution_before && data.distribution_before.length > 0;

  const plotDataOrig = hasPlotlyData ? {
    x: data.distribution_before.map((d) => d.bin),
    y: data.distribution_before.map((d) => d.count),
    type: "bar" as const,
    name: "Original",
    opacity: 0.5,
    marker: { color: "#6366f1" } // indigo-500
  } : null;

  const plotDataRepaired = hasPlotlyData ? {
    x: data.distribution_after.map((d) => d.bin),
    y: data.distribution_after.map((d) => d.count),
    type: "bar" as const,
    name: "Repaired",
    opacity: 0.8,
    marker: { color: "#10b981" } // emerald-500
  } : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-6xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">Repair Simulation Preview</h2>
              <p className="text-xs text-slate-400 font-mono">Strategy: {data.strategy}</p>
            </div>
          </div>
          <button onClick={onClose} disabled={isApplying} className="text-slate-500 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col lg:flex-row gap-6">
          
          {/* Left: Trace & Metrics */}
          <div className="flex-[1.2] space-y-6 flex flex-col min-h-0">
             {traceData && (
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                   <RepairTracePanel trace={traceData} />
                </div>
             )}
            <div className="bg-black/30 border border-white/5 rounded-xl p-4 shrink-0">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-4">
                <Target className="w-4 h-4 text-indigo-400" /> Statistical Impact
              </h3>
              <div className="space-y-1">
                <MetricRow label="Target Feature" before={data.column} after={data.column} />
                <MetricRow label="Row Count" before={data.row_count_before} after={data.row_count_after} />
                <MetricRow label="Missing Values" before={data.missing_before} after={data.missing_after} highlight={true} />
                {(data.mean_before !== null || data.mean_after !== null) && (
                  <MetricRow label="Mean (Average)" before={data.mean_before} after={data.mean_after} />
                )}
                {(data.median_before !== null || data.median_after !== null) && (
                  <MetricRow label="Median" before={data.median_before} after={data.median_after} />
                )}
              </div>
            </div>
            
            {!traceData && (
              <div className="bg-gradient-to-br from-indigo-500/10 to-emerald-500/10 border border-indigo-500/20 rounded-xl p-5 relative overflow-hidden shrink-0">
                 <div className="absolute -right-4 -top-4 opacity-10"><HeartPulse className="w-32 h-32" /></div>
                 <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-4 relative z-10">
                  <Activity className="w-4 h-4 text-emerald-400" /> Global Health Impact
                </h3>
                <div className="flex items-center gap-8 relative z-10">
                  <div className="flex-1">
                    <p className="text-xs text-slate-400 mb-1 tracking-widest uppercase">Current Score</p>
                    <p className="text-3xl font-black text-slate-300 font-mono">{data.health_score_before}</p>
                  </div>
                  <ArrowRight className="w-6 h-6 text-emerald-500" />
                  <div className="flex-1">
                    <p className="text-xs text-slate-400 mb-1 tracking-widest uppercase text-emerald-400">Projected Score</p>
                    <p className="text-3xl font-black text-emerald-400 font-mono">{data.health_score_after}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Charts */}
          <div className="flex-[1.5] w-full flex flex-col min-h-[300px]">
            {data.histogram_before && data.histogram_after && data.histogram_bins && data.histogram_bins.length > 0 ? (
               <DistributionComparisonChart
                  histogramBefore={data.histogram_before}
                  histogramAfter={data.histogram_after}
                  bins={data.histogram_bins}
                  columnName={data.column}
               />
            ) : (
              <div className="bg-black/40 border border-white/5 rounded-xl p-5 flex flex-col relative flex-1">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Categorical Distribution Shift</h3>
                {hasPlotlyData && plotDataOrig && plotDataRepaired ? (
              <div className="flex-1 w-full relative">
                <Plot
                  data={[plotDataOrig, plotDataRepaired]}
                  layout={{
                    barmode: "overlay",
                    autosize: true,
                    margin: { t: 10, l: 40, r: 10, b: 40 },
                    paper_bgcolor: "transparent",
                    plot_bgcolor: "transparent",
                    font: { color: "#94a3b8" },
                    xaxis: { showgrid: true, gridcolor: "#334155" },
                    yaxis: { showgrid: true, gridcolor: "#334155" },
                    legend: { orientation: "h", y: -0.2 }
                  }}
                  useResizeHandler={true}
                  style={{ width: "100%", height: "100%", position: "absolute" }}
                  config={{ displayModeBar: false }}
                />
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                <BarChart2 className="w-12 h-12 mb-3 opacity-20" />
                <p className="text-sm font-medium">Chart unavailable for categorical shift.</p>
              </div>
            )}
            </div>
            )}
            
            {data.risk_score !== undefined && (
               <RepairRiskCard 
                   metrics={{
                       distribution_shift: data.distribution_shift || 0,
                       correlation_impact: data.correlation_impact || 0,
                       information_loss: data.information_loss || 0,
                       risk_score: data.risk_score || 0,
                       risk_level: data.risk_level || "MEDIUM" // Fallback to avoid ts errors
                   }}
               />
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex justify-end gap-3">
          <button 
            onClick={onClose} 
            disabled={isApplying}
            className="px-6 py-2 rounded-xl text-sm font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={onApply} 
            disabled={isApplying}
            className="flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/50 disabled:opacity-50"
          >
            {isApplying ? (
              <span className="flex items-center gap-2 animate-pulse"><Target className="w-4 h-4 animate-spin" /> Committing Repair...</span>
            ) : (
              <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Apply Fix to Dataset</span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
