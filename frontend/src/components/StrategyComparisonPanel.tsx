import React, { useState } from "react";
import { CheckCircle, AlertCircle, TrendingUp, BarChart2, Check, ExternalLink, Calculator, X } from "lucide-react";
import Plot from "react-plotly.js";

export interface StrategyComparisonData {
  column: string;
  best_strategy: string;
  comparison: {
    rank: number;
    strategy: string;
    health_score: number;
    missing_after: number;
    distortion: string;
  }[];
}

interface StrategyComparisonPanelProps {
  isOpen: boolean;
  onClose: () => void;
  data: StrategyComparisonData | null;
  onApply: (strategy: string) => void;
  onPreview: (strategy: string) => void;
  isLoading: boolean;
}

export const StrategyComparisonPanel: React.FC<StrategyComparisonPanelProps> = ({ isOpen, onClose, data, onApply, onPreview, isLoading }) => {
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);

  if (!isOpen || !data) return null;

  const getDistortionColor = (distortion: string) => {
    switch(distortion) {
      case "Very Low": return "text-emerald-400";
      case "Low": return "text-emerald-300";
      case "Medium": return "text-amber-400";
      case "High": return "text-red-400";
      default: return "text-slate-400";
    }
  };

  const plotData = [
    {
      x: data.comparison.map(c => c.strategy),
      y: data.comparison.map(c => c.health_score),
      type: "bar",
      marker: {
        color: data.comparison.map(c => 
          c.strategy === data.best_strategy ? "#10b981" : "#6366f1"
        ),
        line: { color: "rgba(255,255,255,0.1)", width: 1 }
      },
      text: data.comparison.map(c => c.health_score.toString()),
      textposition: "auto"
    }
  ];

  const plotLayout = {
    title: { text: "Predicted Health Score impact", font: { color: "#94a3b8", size: 12 } },
    paper_bgcolor: "transparent",
    plot_bgcolor: "transparent",
    xaxis: { color: "#64748b", showgrid: false },
    yaxis: { color: "#64748b", showgrid: true, gridcolor: "rgba(255,255,255,0.05)" },
    margin: { t: 40, b: 60, l: 40, r: 20 },
    height: 250,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-950 border border-indigo-500/30 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
      
      {/* Top Header */}
      <div className="flex items-center justify-between p-6 border-b border-indigo-500/20 bg-slate-900/50">
        <div className="flex items-center gap-3">
          <Calculator className="w-6 h-6 text-indigo-400" />
          <div>
             <h3 className="text-xl font-bold text-white tracking-wide">Strategy Evaluation System</h3>
             <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">Mathematical Bound Simulation</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <span className="text-xs font-mono bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full border border-indigo-500/20">
             Column: {data.column}
           </span>
           <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition text-slate-400 hover:text-white">
             <X className="w-5 h-5" />
           </button>
        </div>
      </div>

      <div className="p-6 flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Plotly Graph Layer */}
        <div className="bg-slate-900/50 border border-white/5 rounded-xl p-4">
          <Plot data={plotData as any} layout={plotLayout} useResizeHandler className="w-full" config={{ displayModeBar: false }} />
        </div>

        {/* Matrix Tabular Data */}
        <div className="flex flex-col">
          <h4 className="text-sm uppercase tracking-wide text-slate-400 mb-3 font-semibold">Mathematical Trajectories</h4>
          <div className="flex-1 bg-slate-900/50 border border-white/5 rounded-xl overflow-x-auto min-h-[250px]">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-white/5 text-slate-400 uppercase text-[10px] font-black tracking-widest border-b border-white/5">
                <tr>
                  <th className="px-4 py-3">Rank</th>
                  <th className="px-4 py-3">Strategy</th>
                  <th className="px-4 py-3 text-right">Health Score</th>
                  <th className="px-4 py-3 text-right">Data Distortion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.comparison.map((row, idx) => (
                  <tr 
                    key={idx} 
                    className={`cursor-pointer transition hover:bg-white/5 ${selectedStrategy === row.strategy ? "bg-indigo-500/10" : ""}`}
                    onClick={() => setSelectedStrategy(row.strategy)}
                  >
                    <td className="px-4 py-3 font-mono">
                      {row.rank === 1 ? <CheckCircle className="w-4 h-4 text-emerald-400 inline" /> : `#${row.rank}`}
                    </td>
                    <td className={`px-4 py-3 font-medium ${row.rank === 1 ? "text-emerald-400" : "text-white"}`}>
                      {row.strategy}
                    </td>
                    <td className="px-4 py-3 font-mono text-indigo-300 text-right">{row.health_score}</td>
                    <td className={`px-4 py-3 font-bold text-right ${getDistortionColor(row.distortion)}`}>
                      {row.distortion}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

          {/* Action Block */}
          <div className="mt-8 pt-4 border-t border-indigo-500/20 flex flex-col sm:flex-row justify-between items-center gap-4 bg-indigo-950/20 p-4 rounded-xl">
            <div className="flex flex-col">
               <span className="text-xs uppercase text-slate-500 font-bold tracking-widest">Active Selection</span>
               <span className="text-lg font-black text-white">{selectedStrategy || data.best_strategy}</span>
            </div>
            <div className="flex gap-3">
              <button 
                disabled={isLoading}
                onClick={onClose}
                className="px-5 py-2.5 rounded-lg text-slate-400 hover:text-white font-medium transition"
              >
                Cancel
              </button>
              <button 
                disabled={isLoading}
                onClick={() => onPreview(selectedStrategy || data.best_strategy)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-indigo-500 text-indigo-400 font-semibold hover:bg-indigo-500/10 transition"
              >
                <ExternalLink className="w-4 h-4" /> Simulate Matrix
              </button>
              <button 
                disabled={isLoading}
                onClick={() => onApply(selectedStrategy || data.best_strategy)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition disabled:opacity-50"
              >
                <Check className="w-4 h-4" /> Enforce Strategy
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
