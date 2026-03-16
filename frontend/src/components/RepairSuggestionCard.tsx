import React from "react";
import { Sparkles, ArrowRight, Wrench, ShieldCheck, Activity } from "lucide-react";

interface RepairSuggestionCardProps {
  column: string;
  issue: string;
  recommendedStrategy: string;
  confidenceScore: number;
  explanation: string;
  onPreview: () => void;
  onApply: () => void;
  onCompare?: () => void;
  isLoading?: boolean;
  impactPercentage?: string | number;
}

export const RepairSuggestionCard: React.FC<RepairSuggestionCardProps> = ({
  column,
  issue,
  recommendedStrategy,
  confidenceScore,
  explanation,
  onPreview,
  onApply,
  onCompare,
  isLoading = false,
  impactPercentage,
}) => {
  return (
    <div className="bg-slate-900/40 border border-white/10 rounded-[2rem] overflow-hidden relative group transition-all hover:border-indigo-500/50 backdrop-blur-xl">
      {/* Strategy Indicator Bar */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500/50 to-emerald-500/50"></div>
      
      <div className="p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-indigo-400">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xl font-black text-white italic tracking-tight">Column: <span className="text-indigo-400">{column}</span></h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{issue}</span>
                {impactPercentage && (
                   <span className="text-[10px] font-black text-red-400 uppercase tracking-widest bg-red-400/10 px-2 py-0.5 rounded">
                     {impactPercentage}% Impact
                   </span>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${
              confidenceScore >= 0.8 ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
              confidenceScore >= 0.6 ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
              "bg-red-500/10 border-red-500/20 text-red-400"
            }`}>
              <ShieldCheck className="w-3.5 h-3.5" />
              Algorithmic Confidence: {Math.round(confidenceScore * 100)}%
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 bg-black/20 rounded-3xl p-6 border border-white/5">
            <div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-2">
                <Activity className="w-3 h-3" /> Recommended Strategy
              </span>
              <p className="text-white font-mono text-sm font-bold bg-white/5 p-3 rounded-xl border border-white/5">
                {recommendedStrategy}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">
                Deterministic Justification
              </span>
              <p className="text-slate-400 text-xs leading-relaxed italic font-medium">
                "{explanation}"
              </p>
            </div>
        </div>

        <div className="flex items-center justify-end gap-4 border-t border-white/5 pt-6">
          {onCompare && (
             <button
                onClick={onCompare}
                disabled={isLoading}
                className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 hover:text-white transition-all disabled:opacity-50 mr-auto"
             >
                Compare Alternatives
             </button>
          )}
          
          <button
            onClick={onPreview}
            disabled={isLoading}
            className="px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-white hover:bg-white/5 border border-white/10 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            Preview Transformation
          </button>
          
          <button
            onClick={onApply}
            disabled={isLoading}
            className="px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-indigo-500 hover:bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? "Executing..." : "Apply Repair"}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
