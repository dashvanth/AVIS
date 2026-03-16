import React from "react";
import { BookOpen, Target, Sparkles, MoveRight, ArrowRight, AlertCircle, Database } from "lucide-react";

export interface RepairTraceData {
  column: string;
  issue: string;
  analysis: {
    missing_ratio?: number;
    skewness?: number;
  };
  chosen_strategy: string;
  reason: string;
  effect: {
    missing_before: number;
    missing_after: number;
    mean_before: number | null;
    mean_after: number | null;
    health_before: number;
    health_after: number;
  };
}

interface RepairTracePanelProps {
  trace: RepairTraceData;
}

export const RepairTracePanel: React.FC<RepairTracePanelProps> = ({ trace }) => {
  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 space-y-6">
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <BookOpen className="w-5 h-5 text-indigo-400" />
        <h3 className="text-lg font-bold text-white uppercase tracking-wider">Explainable Repair Trace</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Target Dimension</p>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-slate-400" />
            <span className="text-white font-medium">{trace.column}</span>
          </div>
        </div>
        <div>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Detected Anomaly</p>
          <span className="text-amber-400 font-medium">{trace.issue}</span>
        </div>
      </div>

      {trace.analysis && Object.keys(trace.analysis).length > 0 && (
        <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-lg p-4">
          <p className="text-xs text-indigo-400 font-bold uppercase tracking-widest mb-3">Pre-Flight Analytics</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
             {trace.analysis.missing_ratio !== undefined && (
               <div className="flex justify-between">
                 <span className="text-slate-400">Missing Ratio:</span>
                 <span className="text-indigo-300 font-mono">{(trace.analysis.missing_ratio * 100).toFixed(1)}%</span>
               </div>
             )}
             {trace.analysis.skewness !== undefined && (
               <div className="flex justify-between">
                 <span className="text-slate-400">Distribution Skew:</span>
                 <span className="text-indigo-300 font-mono">{trace.analysis.skewness}</span>
               </div>
             )}
          </div>
        </div>
      )}

      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-4">
        <p className="text-xs text-emerald-400 font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
          <Sparkles className="w-3 h-3" /> Chosen Strategy: {trace.chosen_strategy}
        </p>
        <p className="text-sm text-slate-300 leading-relaxed pl-5 border-l-2 border-emerald-500/30">
          {trace.reason}
        </p>
      </div>

      <div className="bg-black/30 rounded-lg p-5 border border-white/5">
        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
          <BookOpen className="w-3 h-3" /> Algorithmic Significance
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] leading-relaxed mb-6">
           <div className="p-3 bg-white/5 rounded-xl border border-white/5">
             <b className="text-white block mb-1">Why this trace?</b>
             <span className="text-slate-400 italic">This trace is generated to provide radical transparency into automated decision-making. It proves that the repair is justified by mathematical necessity.</span>
           </div>
           <div className="p-3 bg-white/5 rounded-xl border border-white/5">
             <b className="text-white block mb-1">What does it mean?</b>
             <span className="text-slate-400 italic">It means your dataset is undergoing "Digital Surgery". We are replacing corrupted nodes with valid placeholders.</span>
           </div>
        </div>

        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-3">Simulated Restorative Effect</p>
        <div className="space-y-3 text-sm">
           <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
             <span className="text-slate-400 flex items-center gap-2 text-xs uppercase font-black"><AlertCircle className="w-3 h-3 font-black" /> Gaps Closed:</span>
             <div className="flex items-center gap-3 text-mono">
               <span className="text-slate-300 line-through opacity-50">{trace.effect.missing_before}</span>
               <ArrowRight className="w-3 h-3 text-emerald-500" />
               <span className="text-emerald-400 font-black">{trace.effect.missing_after}</span>
             </div>
           </div>
           {trace.effect.mean_before !== null && trace.effect.mean_after !== null && (
             <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
               <span className="text-slate-400 flex items-center gap-2 text-xs uppercase font-black"><Database className="w-3 h-3" /> Data Center:</span>
               <div className="flex items-center gap-3 text-mono">
                 <span className="text-slate-300 opacity-50">{Number(trace.effect.mean_before).toFixed(2)}</span>
                 <ArrowRight className="w-3 h-3 text-amber-500" />
                 <span className="text-amber-400 font-black">{Number(trace.effect.mean_after).toFixed(2)}</span>
               </div>
             </div>
           )}
           <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
             <div className="flex flex-col">
               <span className="text-indigo-400 font-black text-xs uppercase tracking-widest">Health Restoration</span>
               <span className="text-[10px] text-slate-500">Projected improvement in quality score</span>
             </div>
             <div className="flex items-center gap-3 text-mono bg-indigo-500/10 px-4 py-2 rounded-xl border border-indigo-500/20">
               <span className="text-slate-400 text-xs font-bold">{trace.effect.health_before}</span>
               <ArrowRight className="w-4 h-4 text-indigo-400" />
               <span className="text-indigo-400 font-black text-xl">+{trace.effect.health_after - trace.effect.health_before}</span>
             </div>
           </div>
        </div>
      </div>

    </div>
  );
};
