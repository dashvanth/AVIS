import React from "react";
import Plot from "react-plotly.js";
import { BarChart } from "lucide-react";

export interface DistributionChartProps {
  histogramBefore: number[];
  histogramAfter: number[];
  bins: number[];
  columnName: string;
}

export const DistributionComparisonChart: React.FC<DistributionChartProps> = ({
  histogramBefore,
  histogramAfter,
  bins,
  columnName
}) => {
  // Convert bin edges to midpoints for the bar chart x-axis
  // The bins array length is exactly len(hist) + 1
  const xMidpoints = [];
  for (let i = 0; i < bins.length - 1; i++) {
    xMidpoints.push((bins[i] + bins[i+1]) / 2);
  }

  const traceBefore = {
    x: xMidpoints,
    y: histogramBefore,
    name: "Original Data",
    type: "bar",
    marker: { color: "rgba(148, 163, 184, 0.4)", line: { color: "rgba(148, 163, 184, 0.8)", width: 1 } },
    hoverinfo: "x+y",
  };

  const traceAfter = {
    x: xMidpoints,
    y: histogramAfter,
    name: "Repaired Data",
    type: "bar",
    marker: { color: "rgba(16, 185, 129, 0.6)", line: { color: "rgba(16, 185, 129, 0.9)", width: 1.5 } },
    hoverinfo: "x+y",
  };

  const layout = {
    title: { text: "Statistical Impact Distribution Overlay", font: { color: "#94a3b8", size: 12 } },
    barmode: "overlay",
    paper_bgcolor: "transparent",
    plot_bgcolor: "transparent",
    xaxis: { 
       title: { text: "Value Ranges", font: { color: "#64748b", size: 10 } },
       color: "#64748b", 
       showgrid: false 
    },
    yaxis: { 
       title: { text: "Frequency Density", font: { color: "#64748b", size: 10 } },
       color: "#64748b", 
       showgrid: true, 
       gridcolor: "rgba(255,255,255,0.05)" 
    },
    margin: { t: 40, b: 40, l: 40, r: 20 },
    height: 300,
    transition: { duration: 500, easing: "cubic-in-out" },
    legend: {
       x: 0,
       y: 1,
       bgcolor: "rgba(0,0,0,0.5)",
       font: { color: "#cbd5e1", size: 10 }
    }
  };

  return (
    <div className="bg-black/30 border border-emerald-500/20 rounded-2xl p-6 w-full flex flex-col gap-4 h-full relative">
       <div className="flex items-center gap-3 border-b border-emerald-500/20 pb-3">
        <BarChart className="w-5 h-5 text-emerald-400" />
        <h3 className="text-xl font-bold text-white tracking-wide">Distribution Displacement</h3>
        <span className="ml-auto text-xs font-mono bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20">
          Target: {columnName}
        </span>
      </div>
      
      <div className="bg-slate-900/50 border border-white/5 rounded-xl p-2">
         {histogramBefore.length === 0 ? (
             <div className="h-[250px] flex items-center justify-center text-slate-500 text-sm">
                Distribution trace unavailable for categorical boundaries.
             </div>
         ) : (
             <Plot
               data={[traceBefore as any, traceAfter as any]}
               layout={layout as any}
               useResizeHandler
               className="w-full"
               config={{ displayModeBar: false }}
             />
         )}
      </div>
    </div>
  );
};
