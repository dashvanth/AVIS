import { Sparkles, ArrowRight, Bot, MessageSquarePlus } from "lucide-react";
import { useChat } from "../context/ChatContext";

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
}) => {
  const { triggerMessage } = useChat();

  const handleAiAsk = () => {
    triggerMessage(`Explain why the "${recommendedStrategy}" strategy is recommended for fixing "${issue}" in '${column}'. What are the trade-offs?`, {
      component: "RepairSuggestionCard",
      column,
      issue,
      strategy: recommendedStrategy
    });
  };

  return (
    <div className="bg-slate-800/80 border border-indigo-500/30 rounded-xl overflow-hidden relative group transition-all hover:border-indigo-500/60">
      {/* AI Glow Effect */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>
      
      <button 
        onClick={handleAiAsk}
        className="absolute top-4 right-20 opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-indigo-500/10 rounded-lg hover:bg-indigo-500/20 text-indigo-400 flex items-center gap-2 text-[10px] font-bold uppercase tracking-tighter border border-indigo-500/20"
      >
        <MessageSquarePlus className="w-3 h-3" />
        Ask AI
      </button>

      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30 text-indigo-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-slate-200 font-semibold">{issue} in '{column}'</h4>
              <p className="text-xs text-slate-400">A.I. Generated Repair Protocol</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${
              confidenceScore >= 0.8 ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
              confidenceScore >= 0.6 ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
              "bg-red-500/10 border-red-500/20 text-red-400"
            }`}>
              <Sparkles className="w-3 h-3" />
              {Math.round(confidenceScore * 100)}% Confidence
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 rounded-lg p-4 mb-5 border border-slate-700/50">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Strategy
              </span>
              <p className="text-slate-200 font-medium">{recommendedStrategy}</p>
            </div>
            <div className="hidden md:flex items-center text-slate-600">
              <ArrowRight className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Reasoning
              </span>
              <p className="text-slate-400 text-sm leading-relaxed">
                {explanation}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-700/50 pt-4 mt-2">
          {onCompare && (
             <button
                onClick={onCompare}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg text-sm font-medium text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors disabled:opacity-50 mr-auto"
             >
                Compare Strategies
             </button>
          )}
          <button
            onClick={handleAiAsk}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition-colors"
          >
            <Bot className="w-4 h-4" />
            Explain Strategy
          </button>
          <button
            onClick={onPreview}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            Preview Fix
          </button>
          <button
            onClick={onApply}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? "Executing..." : "Apply Repair"}
            <Sparkles className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
