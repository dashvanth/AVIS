import React from "react";
import { ShieldAlert, Info, TrendingDown, Combine } from "lucide-react";

export interface RiskMetrics {
  distribution_shift: number;
  correlation_impact: number;
  information_loss: number;
  risk_score: number;
  risk_level: "LOW" | "MEDIUM" | "HIGH";
}

interface RepairRiskCardProps {
  metrics: RiskMetrics;
}

export const RepairRiskCard: React.FC<RepairRiskCardProps> = ({ metrics }) => {
  // Color mappings
  const colorMap = {
     LOW: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
     MEDIUM: "text-amber-400 border-amber-500/30 bg-amber-500/10",
     HIGH: "text-rose-400 border-rose-500/30 bg-rose-500/10",
  };

  const bgMap = {
     LOW: "from-emerald-900/40 text-emerald-300 border-emerald-500/20",
     MEDIUM: "from-amber-900/40 text-amber-300 border-amber-500/20",
     HIGH: "from-rose-900/40 text-rose-300 border-rose-500/20",
  };
  
  const activeColor = colorMap[metrics.risk_level] || colorMap.MEDIUM;
  const cardBg = bgMap[metrics.risk_level] || bgMap.MEDIUM;

  return (
    <div className={`mt-6 w-full rounded-xl border bg-gradient-to-br to-slate-900 p-5 ${cardBg} shadow-lg relative overflow-hidden transition-all duration-300`}>
        {/* Abstract Glow */}
       <div className={`absolute -right-10 -top-10 w-32 h-32 blur-[60px] rounded-full opacity-30 bg-current`}></div>
       
       <div className="flex items-center justify-between border-b border-current/20 pb-3 mb-4 relative z-10">
          <div className="flex items-center gap-3">
             <ShieldAlert className="w-6 h-6" />
             <h3 className="font-bold tracking-wide uppercase">Statistical Consequence Risk</h3>
          </div>
          <div className={`px-4 py-1.5 rounded-md font-black tracking-widest text-sm border ${activeColor} shadow-md`}>
             {metrics.risk_level}
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10 w-full mb-4">
           {/* Global Score Representation */}
           <div className="bg-slate-950/60 rounded-lg p-4 border border-slate-800 flex flex-col justify-center items-center h-full">
              <span className="text-sm font-medium text-slate-400 uppercase tracking-widest">Calculated Distortion Index</span>
              <div className="text-4xl font-black mt-2 font-mono flex items-end gap-1">
                 {metrics.risk_score.toFixed(2)}
              </div>
           </div>

           {/* Metrics Grid */}
           <div className="flex flex-col gap-2">
              <div className="bg-slate-950/40 rounded border border-slate-800 p-2.5 flex items-center justify-between">
                 <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                     <TrendingDown className="w-4 h-4" /> Shift
                 </div>
                 <span className="font-mono text-slate-200 text-sm">{(metrics.distribution_shift * 100).toFixed(1)}%</span>
              </div>
              <div className="bg-slate-950/40 rounded border border-slate-800 p-2.5 flex items-center justify-between">
                 <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                     <Combine className="w-4 h-4" /> Decorrelation
                 </div>
                 <span className="font-mono text-slate-200 text-sm">{(metrics.correlation_impact * 100).toFixed(1)}%</span>
              </div>
              <div className="bg-slate-950/40 rounded border border-slate-800 p-2.5 flex items-center justify-between">
                 <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                     <Info className="w-4 h-4" /> Alteration Loss
                 </div>
                 <span className="font-mono text-slate-200 text-sm">{(metrics.information_loss * 100).toFixed(1)}%</span>
              </div>
           </div>
       </div>
    </div>
  );
};
