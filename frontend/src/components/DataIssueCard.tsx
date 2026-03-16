import React from "react";
import { AlertTriangle, AlertCircle, Info, ArrowUpRight } from "lucide-react";

interface DataIssueCardProps {
  column: string;
  issueType: string;
  severity: "High" | "Medium" | "Low";
  description?: string;
  count: number;
  totalRows: number;
  onClick?: () => void;
}

export const DataIssueCard: React.FC<DataIssueCardProps> = ({
  column,
  issueType,
  severity,
  description,
  count,
  totalRows,
  onClick,
}) => {
  const impactPercentage = totalRows > 0 ? ((count / totalRows) * 100).toFixed(1) : "0.0";

  const getSeverityStyles = () => {
    switch (severity) {
      case "High":
        return {
          bg: "bg-red-500/10",
          border: "border-red-500/30",
          text: "text-red-400",
          icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
        };
      case "Medium":
        return {
          bg: "bg-amber-500/10",
          border: "border-amber-500/30",
          text: "text-amber-400",
          icon: <AlertCircle className="w-5 h-5 text-amber-500" />,
        };
      case "Low":
      default:
        return {
          bg: "bg-blue-500/10",
          border: "border-blue-500/30",
          text: "text-blue-400",
          icon: <Info className="w-5 h-5 text-blue-500" />,
        };
    }
  };

  const styles = getSeverityStyles();

  return (
    <div
      onClick={onClick}
      className={`rounded-3xl p-6 border ${styles.bg} ${styles.border} flex items-start gap-4 cursor-pointer hover:border-indigo-500 transition-all group relative backdrop-blur-md`}
    >
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
          <ArrowUpRight className="w-4 h-4 text-indigo-400" />
      </div>
      
      <div className="mt-1">{styles.icon}</div>
      
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-black text-slate-200 uppercase tracking-widest">
            Column: <span className="text-indigo-400">'{column}'</span>
          </h4>
          <span
            className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter ${styles.bg} ${styles.text} border ${styles.border}`}
          >
            {severity} Impact
          </span>
        </div>
        
        <div className="flex items-baseline gap-2 mb-3">
            <p className="text-lg font-black text-white italic">{issueType}</p>
            <span className="text-xs font-bold text-slate-500">[{count} Records]</span>
        </div>

        <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                <div 
                    className={`h-full ${styles.bg.replace('/10', '')} transition-all duration-1000`} 
                    style={{ width: `${impactPercentage}%` }}
                />
            </div>
            <span className={`text-xs font-black ${styles.text} italic`}>{impactPercentage}% Impact</span>
        </div>

        {description && (
          <p className="text-xs text-slate-400 font-medium leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};
