import React, { useState, useEffect, useMemo } from "react";
import {
  Terminal,
  Zap,
  CheckCircle2,
  Info,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  Database,
  Search,
} from "lucide-react";
import type { ProcessingStep } from "../types";

interface ProcessingConsoleProps {
  logJson?: string;
}

export const ProcessingConsole: React.FC<ProcessingConsoleProps> = ({
  logJson,
}) => {
  const [visibleLogs, setVisibleLogs] = useState<ProcessingStep[]>([]);

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
        }, index * 800);
      });
    }
  }, [auditLog]);

  if (auditLog.length === 0) {
    return (
      <div className="mt-8 bg-slate-950 border border-avis-accent-success/30 rounded-2xl p-6 font-mono text-sm shadow-2xl relative">
        <div className="flex items-center gap-2 text-avis-accent-success">
          <Sparkles className="w-4 h-4" />
          <span className="uppercase tracking-widest text-[10px] font-bold">
            Transparency Engine: Status Optimal
          </span>
        </div>
        <p className="text-slate-400 mt-2 text-xs italic">
          No structural gaps detected. Your dataset is perfectly aligned and
          ready for exploratory analysis.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 bg-slate-950 border border-avis-accent-indigo/30 rounded-2xl p-6 font-mono text-sm shadow-2xl overflow-hidden relative group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-avis-accent-cyan/5 rounded-full blur-3xl -mr-16 -mt-16 transition-transform group-hover:scale-150"></div>

      <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-3 relative z-10">
        <Terminal className="w-4 h-4 text-avis-accent-cyan" />
        <span className="text-avis-accent-cyan uppercase tracking-widest text-[10px] font-bold">
          Transparency Engine: Radical Processing Audit
        </span>
      </div>

      <div className="space-y-6 relative z-10">
        {visibleLogs.map((log, i) => {
          const hasIssues = log.count > 0;
          return (
            <div
              key={i}
              className="animate-in fade-in slide-in-from-left duration-500 border-l-2 border-white/5 pl-4"
            >
              <div className="flex items-center gap-2 mb-2">
                {hasIssues ? (
                  <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
                ) : (
                  <Zap className="w-3.5 h-3.5 text-avis-accent-success" />
                )}
                <span className="font-bold text-white">[{log.action}]</span>
                <span
                  className={`${
                    hasIssues ? "text-red-500" : "text-avis-accent-success"
                  } font-black text-[10px] uppercase`}
                >
                  {hasIssues ? `Impacted: ${log.count} Items` : "Verified"}
                </span>
              </div>

              {/* Functionality 2: Before vs. After States */}
              {log.before !== undefined && log.after !== undefined && (
                <div className="flex items-center gap-3 mb-2 bg-white/5 w-fit px-3 py-1 rounded-lg border border-white/5">
                  <div className="flex items-center gap-1.5">
                    <Database className="w-3 h-3 text-avis-text-secondary" />
                    <span className="text-[10px] text-avis-text-secondary">
                      Initial:{" "}
                      <span className="text-white font-bold">{log.before}</span>
                    </span>
                  </div>
                  <ArrowRight className="w-3 h-3 text-avis-accent-cyan" />
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-avis-accent-success" />
                    <span className="text-[10px] text-avis-text-secondary">
                      Cleaned:{" "}
                      <span className="text-avis-accent-success font-bold">
                        {log.after}
                      </span>
                    </span>
                  </div>
                </div>
              )}

              {/* Functionality 2: Type Inference Transparency */}
              {log.detected_as && (
                <div className="flex items-center gap-3 mb-2 bg-avis-accent-cyan/5 w-fit px-3 py-1 rounded-lg border border-avis-accent-cyan/10">
                  <Search className="w-3 h-3 text-avis-accent-cyan" />
                  <span className="text-[10px] text-avis-text-secondary">
                    Inferred Type:{" "}
                    <span className="text-avis-accent-cyan font-bold uppercase">
                      {log.detected_as}
                    </span>
                  </span>
                  <span className="text-[9px] text-avis-text-secondary/50 italic">
                    (Corrected from {log.stored_as})
                  </span>
                </div>
              )}

              <p className="text-slate-400 text-xs italic leading-relaxed max-w-2xl">
                {log.reason}
              </p>
            </div>
          );
        })}

        {visibleLogs.length === auditLog.length && (
          <div className="text-avis-accent-success flex items-center gap-2 mt-8 animate-pulse pt-4 border-t border-white/5">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-bold uppercase tracking-tighter">
              Scan Complete: Forensic Matrix Verified
            </span>
          </div>
        )}
      </div>

      <div className="mt-8 p-4 bg-avis-accent-indigo/5 rounded-xl border border-avis-accent-indigo/20 flex items-start gap-4">
        <div className="p-2 bg-avis-accent-indigo/20 rounded-lg">
          <Info className="w-5 h-5 text-avis-accent-indigo shrink-0" />
        </div>
        <div>
          <p className="text-xs text-white font-bold mb-1">
            Why Radical Transparency?
          </p>
          <p className="text-[11px] text-avis-text-secondary leading-relaxed">
            A.V.I.S. doesn't just clean your data in the dark. We show you
            exactly how many rows were removed and where we identified
            <span className="text-avis-accent-cyan italic"> Numerical </span>
            patterns in text data. This ensures your analysis starts from a
            foundation of trust.
          </p>
        </div>
      </div>
    </div>
  );
};
