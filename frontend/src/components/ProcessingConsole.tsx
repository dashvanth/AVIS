import React, { useState, useEffect, useMemo } from "react";
import { Terminal, Zap, CheckCircle2 } from "lucide-react";
import type { ProcessingStep } from "../types";
interface ProcessingConsoleProps {
  logJson?: string;
}

export const ProcessingConsole: React.FC<ProcessingConsoleProps> = ({
  logJson,
}) => {
  const [visibleLogs, setVisibleLogs] = useState<ProcessingStep[]>([]);

  // Parse the JSON string into an array of steps
  const auditLog: ProcessingStep[] = useMemo(() => {
    try {
      return logJson ? JSON.parse(logJson) : [];
    } catch (e) {
      console.error("Failed to parse processing log", e);
      return [];
    }
  }, [logJson]);

  useEffect(() => {
    if (auditLog.length > 0) {
      setVisibleLogs([]);
      auditLog.forEach((log, index) => {
        setTimeout(() => {
          setVisibleLogs((prev) => [...prev, log]);
        }, index * 1000); // 1-second delay per step for educational clarity
      });
    }
  }, [auditLog]);

  if (auditLog.length === 0) return null;

  return (
    <div className="mt-8 bg-slate-950 border border-avis-accent-indigo/30 rounded-2xl p-6 font-mono text-sm shadow-2xl overflow-hidden relative group">
      {/* Background Glow Effect */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-avis-accent-cyan/5 rounded-full blur-3xl -mr-16 -mt-16 transition-transform group-hover:scale-150"></div>

      <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-2 relative z-10">
        <Terminal className="w-4 h-4 text-avis-accent-cyan" />
        <span className="text-avis-accent-cyan uppercase tracking-widest text-[10px] font-bold">
          Transparency Engine: Pre-Processing Audit
        </span>
      </div>

      <div className="space-y-4 relative z-10">
        {visibleLogs.map((log, i) => (
          <div
            key={i}
            className="animate-in fade-in slide-in-from-left duration-500"
          >
            <div className="flex items-center gap-2 text-avis-accent-indigo">
              <Zap className="w-3 h-3" />
              <span className="font-bold">[{log.action}]</span>
              <span className="text-avis-accent-success font-semibold">
                {log.count > 0 ? `Detected: ${log.count}` : "Verified"}
              </span>
            </div>
            <p className="text-slate-400 ml-5 text-xs italic leading-relaxed">
              {log.reason}
            </p>
          </div>
        ))}

        {visibleLogs.length === auditLog.length && (
          <div className="text-avis-accent-success flex items-center gap-2 mt-6 animate-pulse">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-bold uppercase tracking-tighter">
              Dataset Structured & Normalized
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
