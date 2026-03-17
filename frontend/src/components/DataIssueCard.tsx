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

  // Friendly label: "Entire Dataset" → show as scope, not column
  const isDuplicateIssue = column === "Entire Dataset";
  const columnLabel = isDuplicateIssue ? "All Rows" : column;
  const labelPrefix = isDuplicateIssue ? "Scope" : "Column";

  // Friendly issue type display
  const displayIssueType = (() => {
    switch (issueType) {
      case "Missing Values": return `${count} Missing Value${count !== 1 ? "s" : ""}`;
      case "Duplicate Rows": return `${count} Duplicate Row${count !== 1 ? "s" : ""}`;
      case "Incorrect Data Type": return "Wrong Data Type";
      default: return issueType;
    }
  })();

  const getSeverityStyles = () => {
    switch (severity) {
      case "High":
        return {
          bg: "bg-red-500/10",
          border: "border-red-500/30",
          text: "text-red-400",
          icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
          label: "High Priority"
        };
      case "Medium":
        return {
          bg: "bg-amber-500/10",
          border: "border-amber-500/30",
          text: "text-amber-400",
          icon: <AlertCircle className="w-5 h-5 text-amber-500" />,
          label: "Medium Priority"
        };
      case "Low":
      default:
        return {
          bg: "bg-blue-500/10",
          border: "border-blue-500/30",
          text: "text-blue-400",
          icon: <Info className="w-5 h-5 text-blue-500" />,
          label: "Low Priority"
        };
    }
  };

  const styles = getSeverityStyles();

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl p-5 border ${styles.bg} ${styles.border} flex items-start gap-4 cursor-pointer hover:border-indigo-500 transition-all group relative backdrop-blur-md`}
    >
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
          <ArrowUpRight className="w-4 h-4 text-indigo-400" />
      </div>
      
      <div className="mt-1 shrink-0">{styles.icon}</div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {labelPrefix}: <span className="text-indigo-400 font-black">{columnLabel}</span>
          </h4>
          <span
            className={`text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${styles.bg} ${styles.text} border ${styles.border}`}
          >
            {styles.label}
          </span>
        </div>
        
        <p className="text-base font-bold text-white mb-2">{displayIssueType}</p>

        {/* Impact bar */}
        <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div 
                    className={`h-full rounded-full ${severity === "High" ? "bg-red-500" : severity === "Medium" ? "bg-amber-500" : "bg-blue-500"} transition-all duration-1000`} 
                    style={{ width: `${Math.min(Number(impactPercentage), 100)}%` }}
                />
            </div>
            <span className={`text-xs font-bold ${styles.text}`}>{impactPercentage}%</span>
        </div>

        {description && (
          <p className="text-xs text-slate-400 font-medium leading-relaxed">
            {description}
          </p>
        )}

        <p className="text-[10px] text-indigo-400/60 font-bold mt-2 uppercase tracking-wider">
          Click to inspect affected data →
        </p>
      </div>
    </div>
  );
};
