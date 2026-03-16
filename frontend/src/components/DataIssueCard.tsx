import { AlertTriangle, AlertCircle, Info, MessageSquarePlus } from "lucide-react";
import { useChat } from "../context/ChatContext";

interface DataIssueCardProps {
  column: string;
  issueType: string;
  severity: "High" | "Medium" | "Low";
  description?: string;
}

export const DataIssueCard: React.FC<DataIssueCardProps> = ({
  column,
  issueType,
  severity,
  description,
}) => {
  const { triggerMessage } = useChat();

  const handleAiAsk = () => {
      triggerMessage(`What is the "${issueType}" problem in the '${column}' column? How does it affect analysis?`, {
          component: "DataIssueCard",
          column,
          issue: issueType,
          severity
      });
  };

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
      onClick={handleAiAsk}
      className={`rounded-lg p-4 border ${styles.bg} ${styles.border} flex items-start gap-4 cursor-pointer hover:border-indigo-500/50 transition-all group relative`}
    >
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <MessageSquarePlus className="w-3.5 h-3.5 text-indigo-400" />
      </div>
      <div className="mt-0.5">{styles.icon}</div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-semibold text-slate-200">
            Column: <span className="text-indigo-400">'{column}'</span>
          </h4>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${styles.bg} ${styles.text} border ${styles.border}`}
          >
            {severity} Severity
          </span>
        </div>
        <p className="text-sm text-slate-300 font-medium mb-1">{issueType}</p>
        {description && (
          <p className="text-sm text-slate-400 max-w-2xl">{description}</p>
        )}
      </div>
    </div>
  );
};
