import React from "react";
import Plot from "react-plotly.js";
import { type NumericSummary } from "../../types";

interface NumericalDistributionChartsProps {
  numeric: NumericSummary[];
}

export const NumericalDistributionCharts: React.FC<NumericalDistributionChartsProps> = ({ numeric }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {numeric.map((col, idx) => (
        <div key={idx} className="bg-slate-900/60 border border-white/5 rounded-2xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-white font-bold text-sm tracking-tight">{col.column}</h4>
            <span className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">Distribution Scan</span>
          </div>
          <div className="h-[200px]">
            <Plot
              data={[
                {
                  type: 'box',
                  y: [col.min, col["25%"], col["50%"], col["75%"], col.max],
                  name: 'Quartiles',
                  marker: { color: '#818cf8' },
                  boxpoints: false
                }
              ]}
              layout={{
                paper_bgcolor: 'transparent',
                plot_bgcolor: 'transparent',
                margin: { t: 10, b: 30, l: 40, r: 10 },
                showlegend: false,
                yaxis: {
                  gridcolor: 'rgba(255,255,255,0.05)',
                  tickfont: { color: '#64748b', size: 10 }
                },
                xaxis: { showticklabels: false, zeroline: false },
                height: 200,
                autosize: true
              }}
              useResizeHandler
              className="w-full h-full"
              config={{ displayModeBar: false }}
            />
          </div>
          <p className="text-[10px] text-slate-500 italic mt-2">
            Insight: {col.insight}
          </p>
        </div>
      ))}
    </div>
  );
};
