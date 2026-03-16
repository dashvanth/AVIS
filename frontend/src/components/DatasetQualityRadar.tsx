import React from "react";
import Plot from "react-plotly.js";
import { Radar, CheckCircle2 } from "lucide-react";

export interface QualityMetrics {
  completeness: number;
  consistency: number;
  uniqueness: number;
  stability: number;
  type_integrity: number;
}

interface DatasetQualityRadarProps {
  metrics: QualityMetrics;
  onMetricClick?: (metricName: string) => void;
}

export const DatasetQualityRadar: React.FC<DatasetQualityRadarProps> = ({ metrics, onMetricClick }) => {
  // 🛡️ Safe Metrics Fallback
  const m = metrics || { completeness: 0, consistency: 0, uniqueness: 0, stability: 0, type_integrity: 0 };

  const rValues = [
    m.completeness || 0,
    m.consistency || 0,
    m.uniqueness || 0,
    m.stability || 0,
    m.type_integrity || 0,
    m.completeness || 0,
  ];

  const thetaLabels = [
    "Completeness",
    "Consistency",
    "Uniqueness",
    "Stability",
    "Type Integrity",
    "Completeness",
  ];

  const traceOrig = {
    type: "scatterpolar",
    r: rValues,
    theta: thetaLabels,
    fill: "toself",
    name: "Structural Quality",
    hoverinfo: "theta+r",
    line: { color: "#6366f1", width: 3 },
    fillcolor: "rgba(99, 102, 241, 0.2)",
    marker: { 
      size: 10, 
      color: "#818cf8", 
      line: { color: "#fff", width: 2 },
      opacity: 0.9
    }
  };

  const layout = {
    polar: {
      radialaxis: {
        visible: true,
        range: [0, 100],
        color: "#4a5568",
        gridcolor: "rgba(255,255,255,0.03)",
        tickfont: { size: 7, color: "#64748b" }
      },
      angularaxis: {
        color: "#94a3b8",
        gridcolor: "rgba(255,255,255,0.08)",
        tickfont: { size: 10, weight: 'bold' },
        rotation: 90,
      },
      bgcolor: "transparent",
    },
    paper_bgcolor: "transparent",
    plot_bgcolor: "transparent",
    showlegend: false,
    margin: { t: 40, b: 20, l: 50, r: 50 },
    height: 280,
    autosize: true
  };

  const handlePlotClick = (data: any) => {
    try {
      if (onMetricClick && data?.points?.[0]) {
        onMetricClick(data.points[0].theta);
      }
    } catch (e) {
      console.error("Radar click handler failed:", e);
    }
  };

  const summaryItems = [
    { label: "Completeness", value: m.completeness || 0, key: "Completeness" },
    { label: "Consistency", value: m.consistency || 0, key: "Consistency" },
    { label: "Uniqueness", value: m.uniqueness || 0, key: "Uniqueness" },
    { label: "Integrity", value: m.type_integrity || 0, key: "Type Integrity" },
  ];

  return (
    <div className="bg-slate-900/40 border border-indigo-500/20 rounded-[2.5rem] p-6 relative overflow-hidden h-full min-h-[480px] flex flex-col group backdrop-blur-xl shrink-0">
       <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-30"></div>
       
       <div className="flex w-full items-center justify-between border-b border-white/5 pb-4 mb-2">
         <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] flex items-center gap-2">
            <Radar className="w-4 h-4 text-indigo-400" />
            Quality Profile
         </h3>
       </div>

       <div className="w-full flex-grow relative cursor-pointer" style={{ minHeight: '280px' }}>
          <Plot
            data={[traceOrig as any]}
            layout={layout as any}
            useResizeHandler
            className="w-full h-full"
            config={{ displayModeBar: false, responsive: true }}
            onClick={handlePlotClick}
          />
       </div>

       <div className="mt-4 grid grid-cols-2 gap-3 pt-4 border-t border-white/5">
          {summaryItems.map((item, idx) => (
            <div 
              key={idx}
              onClick={() => onMetricClick?.(item.key)} 
              className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-indigo-500/30 hover:bg-white/10 transition-all cursor-pointer group/item"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <CheckCircle2 className={`w-3.5 h-3.5 flex-shrink-0 ${(item.value || 0) >= 90 ? 'text-emerald-500' : 'text-slate-500 group-hover/item:text-indigo-400'}`} />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter truncate">{item.label}</span>
              </div>
              <span className="text-xs font-black text-white italic ml-2">{item.value || 0}%</span>
            </div>
          ))}
       </div>
    </div>
  );
};
