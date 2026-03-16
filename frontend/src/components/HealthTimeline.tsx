import React from "react";
import Plot from "react-plotly.js";
import { Activity, ArrowRight, CheckCircle2 } from "lucide-react";

interface TimelineStep {
  step: string;
  health_score: number;
}

interface HealthTimelineProps {
  timeline: TimelineStep[];
}

export const HealthTimeline: React.FC<HealthTimelineProps> = ({ timeline }) => {
  if (!timeline || timeline.length === 0) return null;

  const xData = timeline.map((t, idx) => `Step ${idx}`);
  const yData = timeline.map(t => t.health_score);
  const textData = timeline.map(t => t.step);

  const plotData = {
    x: xData,
    y: yData,
    text: textData,
    type: "scatter" as const,
    mode: "lines+markers+text" as const,
    textposition: "top center" as const,
    line: { color: "#10b981", width: 4, shape: "spline" as const }, // emerald-500
    marker: { size: 12, color: "#10b981", line: { color: "#0f172a", width: 2 } },
    hoverinfo: "y+text" as const,
  };

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-xl mb-6">
      <div className="flex items-center gap-3 border-b border-emerald-500/20 pb-4 mb-6">
        <Activity className="w-6 h-6 text-emerald-400" />
        <h2 className="text-xl font-bold text-white tracking-wide">Health Evolution Expected Trajectory</h2>
      </div>
      
      <div className="w-full relative min-h-[250px] bg-slate-950/50 rounded-lg p-4 border border-white/5">
        <Plot
          data={[plotData]}
          layout={{
            autosize: true,
            margin: { t: 40, l: 40, r: 40, b: 40 },
            paper_bgcolor: "transparent",
            plot_bgcolor: "transparent",
            font: { color: "#94a3b8" },
            yaxis: { title: "Health Score", range: [0, 105], showgrid: true, gridcolor: "#334155" },
            xaxis: { showgrid: false },
            annotations: timeline.map((t, idx) => ({
              x: `Step ${idx}`,
              y: t.health_score,
              text: t.step,
              showarrow: false,
              yshift: 20,
              font: { color: "#cbd5e1", size: 10 }
            }))
          }}
          useResizeHandler={true}
          style={{ width: "100%", height: "100%", position: "absolute", top:0, left:0 }}
          config={{ displayModeBar: false, responsive: true }}
        />
      </div>
      
      {/* Node Path Breakdown below */}
      <div className="mt-6 flex flex-wrap items-center gap-2 justify-center">
         {timeline.map((t, idx) => (
           <React.Fragment key={idx}>
             <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full flex items-center gap-1">
                {idx === timeline.length - 1 && <CheckCircle2 className="w-3 h-3" />}
                {t.health_score} {idx === 0 ? "(Initial)" : ""}
             </div>
             {idx < timeline.length - 1 && <ArrowRight className="w-4 h-4 text-slate-600" />}
           </React.Fragment>
         ))}
      </div>
    </div>
  );
};
