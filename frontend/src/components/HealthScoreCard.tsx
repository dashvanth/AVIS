import { Activity, CheckCircle2 } from "lucide-react";

interface HealthScoreCardProps {
  score: number;
  onClick?: () => void;
  metrics?: {
    completeness?: number;
    consistency?: number;
    uniqueness?: number;
    validity?: number;
  };
}

export const HealthScoreCard: React.FC<HealthScoreCardProps> = ({ score, onClick, metrics }) => {
  const getStyleTokens = () => {
    if (score >= 90) return { bg: "from-emerald-500/20 to-teal-500/5", border: "border-emerald-500/30", text: "text-emerald-400" };
    if (score >= 70) return { bg: "from-indigo-500/20 to-purple-500/5", border: "border-indigo-500/30", text: "text-indigo-400" };
    if (score >= 40) return { bg: "from-amber-500/20 to-orange-500/5", border: "border-amber-500/30", text: "text-amber-400" };
    return { bg: "from-red-500/20 to-rose-500/5", border: "border-red-500/30", text: "text-red-400" };
  };

  const getStatusText = () => {
    if (score >= 90) return "Optimal Condition";
    if (score >= 70) return "Acceptable Quality";
    if (score >= 40) return "Requires Attention";
    return "Critical Issues Detected";
  };

  const styles = getStyleTokens();

  const metricList = [
    { label: "Completeness", value: metrics?.completeness ?? 100 },
    { label: "Consistency", value: metrics?.consistency ?? 100 },
    { label: "Uniqueness", value: metrics?.uniqueness ?? 100 },
    { label: "Validity", value: metrics?.validity ?? 100 },
  ];

  return (
    <div 
      onClick={onClick}
      className={`
        mt-2 p-3.5 bg-gradient-to-br ${styles.bg} border ${styles.border} rounded-xl flex flex-col gap-2.5 
        transition-all duration-300 group relative backdrop-blur-md
        ${onClick ? "cursor-pointer hover:border-indigo-500/60 hover:shadow-2xl hover:shadow-indigo-500/10 hover:scale-[1.01]" : ""}
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 rounded-lg bg-black/20 ${styles.text}`}>
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-[13px] font-black text-white tracking-wider uppercase leading-none">Overall Health</h3>
            <p className={`text-[10px] ${styles.text} opacity-70 font-bold uppercase tracking-widest mt-1`}>{getStatusText()}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black font-mono tracking-tighter leading-none" style={{ textShadow: "0 4px 12px rgba(0,0,0,0.4)"}}>
              <span className={styles.text}>{score}</span>
              <span className="text-slate-600 text-base ml-1">/100</span>
          </div>
        </div>
      </div>

      <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
        <div 
           className={`h-full bg-current ${styles.text} transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(0,0,0,0.5)]`} 
           style={{ width: `${Math.min(Math.max(score, 0), 100)}%` }} 
        />
      </div>

      <div className="grid grid-cols-2 gap-x-5 gap-y-2">
        {metricList.map((m, idx) => (
          <div key={idx} className="flex items-center justify-between group/metric">
            <div className="flex items-center gap-2 min-w-0">
               <CheckCircle2 className={`w-3 h-3 flex-shrink-0 ${m.value >= 90 ? 'text-emerald-500' : 'text-slate-500'}`} />
               <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter truncate">{m.label}</span>
            </div>
            <span className="text-xs font-black text-slate-200 ml-1 italic">{m.value}%</span>
          </div>
        ))}
      </div>

      <div className="pt-2.5 border-t border-white/5 flex items-center justify-between">
         <span className="text-[10px] text-slate-500 font-medium italic">Score derived from quality metrics</span>
         <div className="flex gap-1.5 items-center">
            {[1,2,3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-slate-700 group-hover:bg-indigo-500 transition-colors" />)}
         </div>
      </div>
    </div>
  );
};
