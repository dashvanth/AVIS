import React from "react";
import Plot from "react-plotly.js";
import { type CategoricalSummary } from "../../types";

interface CategoricalDistributionChartsProps {
  categorical: CategoricalSummary[];
}

export const CategoricalDistributionCharts: React.FC<CategoricalDistributionChartsProps> = ({ categorical }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {categorical.map((col, idx) => {
        const labels = Object.keys(col.top_values);
        const values = Object.values(col.top_values);
        
        return (
          <div key={idx} className="bg-slate-900/60 border border-white/5 rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-white font-bold text-sm tracking-tight">{col.column}</h4>
              <span className="text-[10px] text-amber-400 font-black uppercase tracking-widest">Frequency Sweep</span>
            </div>
            <div className="h-[200px]">
              <Plot
                data={[
                  {
                    type: 'bar',
                    x: labels,
                    y: values,
                    marker: {
                      color: 'rgba(245, 158, 11, 0.4)',
                      line: { color: 'rgba(245, 158, 11, 1)', width: 1 }
                    }
                  }
                ]}
                layout={{
                  paper_bgcolor: 'transparent',
                  plot_bgcolor: 'transparent',
                  margin: { t: 10, b: 40, l: 40, r: 10 },
                  showlegend: false,
                  yaxis: {
                    gridcolor: 'rgba(255,255,255,0.05)',
                    tickfont: { color: '#64748b', size: 10 }
                  },
                  xaxis: {
                    tickfont: { color: '#64748b', size: 10 },
                    tickangle: 0
                  },
                  height: 200,
                  autosize: true
                }}
                useResizeHandler
                className="w-full h-full"
                config={{ displayModeBar: false }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
