import React, { useMemo, useState } from "react";
import {
  Calculator,
  Table,
  Activity,
  Layers,
  HelpCircle,
  Sigma,
  Zap,
  ArrowRight,
  ShieldCheck,
  FileDigit,
  Type,
  ChevronDown,
  ChevronUp,
  Search,
  Info,
} from "lucide-react";
import type {
  NumericSummary,
  CategoricalSummary,
  ProcessingStep,
} from "../../types";
import { motion, AnimatePresence } from "framer-motion";
import { useOutletContext } from "react-router-dom";

interface SummaryStatsProps {
  numeric: NumericSummary[];
  categorical: CategoricalSummary[];
  totalRows: number;
  totalColumns: number;
}

const SummaryStats: React.FC<SummaryStatsProps> = ({
  numeric,
  categorical,
  totalRows,
  totalColumns,
}) => {
  const { dataset } = useOutletContext<{ dataset: any }>();
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const auditLogs: ProcessingStep[] = useMemo(() => {
    try {
      return dataset?.processing_log ? JSON.parse(dataset.processing_log) : [];
    } catch (e) {
      return [];
    }
  }, [dataset]);

  return (
    <div className="space-y-12">
      {/* 1. FUNCTIONALITY 2: RADICAL PROCESSING TRANSPARENCY HUB */}
      <div className="p-10 bg-avis-secondary/40 border border-avis-accent-indigo/30 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-avis-accent-indigo/5 rounded-full blur-3xl -mr-20 -mt-20" />

        <div className="flex items-center gap-4 mb-10 relative z-10">
          <div className="p-3 bg-avis-accent-indigo/20 rounded-2xl border border-avis-accent-indigo/30">
            <ShieldCheck className="w-6 h-6 text-avis-accent-indigo" />
          </div>
          <div>
            <h3 className="text-white font-black text-2xl uppercase tracking-tighter italic">
              Forensic Audit: Before vs. After
            </h3>
            <p className="text-[10px] text-avis-text-secondary font-black uppercase tracking-[0.3em]">
              Transparency Engine: Status Verified
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
          {/* Row Integrity Audit */}
          <div className="p-8 bg-avis-primary/40 rounded-[2.5rem] border border-white/5 space-y-6 shadow-inner">
            <div className="flex items-center gap-3">
              <FileDigit className="w-5 h-5 text-avis-accent-cyan" />
              <span className="text-xs font-black text-white uppercase tracking-widest">
                Row Integrity Audit
              </span>
            </div>
            <div className="flex items-center justify-between gap-6">
              <div className="text-center flex-1">
                <p className="text-[9px] text-avis-text-secondary font-bold uppercase mb-2">
                  Original State
                </p>
                <p className="text-3xl font-mono text-avis-text-secondary/40 line-through">
                  {(
                    totalRows +
                    (auditLogs.find((l) => l.action.includes("Rows"))?.count ||
                      0)
                  ).toLocaleString()}
                </p>
              </div>
              <ArrowRight className="w-8 h-8 text-avis-accent-indigo animate-pulse" />
              <div className="text-center flex-1">
                <p className="text-[9px] text-avis-accent-success font-bold uppercase mb-2">
                  Cleaned Matrix
                </p>
                <p className="text-5xl font-black text-white tracking-tighter">
                  {totalRows.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Type Inference Audit */}
          <div className="p-8 bg-avis-primary/40 rounded-[2.5rem] border border-white/5 space-y-6 shadow-inner">
            <div className="flex items-center gap-3">
              <Type className="w-5 h-5 text-avis-accent-amber" />
              <span className="text-xs font-black text-white uppercase tracking-widest">
                Format Correction
              </span>
            </div>
            <div className="flex flex-col gap-4">
              {auditLogs.some((l) => l.detected_as) ? (
                auditLogs
                  .filter((l) => l.detected_as)
                  .map((log, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between bg-black/20 p-4 rounded-2xl border border-white/5"
                    >
                      <span className="px-3 py-1 bg-white/5 rounded text-[10px] text-avis-text-secondary font-mono">
                        {log.stored_as}
                      </span>
                      <ArrowRight className="w-4 h-4 text-avis-accent-cyan" />
                      <span className="px-4 py-1.5 bg-avis-accent-cyan/20 rounded-xl text-[10px] text-avis-accent-cyan font-black uppercase shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                        {log.detected_as}
                      </span>
                    </div>
                  ))
              ) : (
                <div className="flex items-center justify-center gap-3 py-6 opacity-40">
                  <ShieldCheck className="text-avis-accent-success w-4 h-4" />
                  <span className="text-xs font-bold text-white italic">
                    All formats verified as valid.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. DATA OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatMetricCard
          label="Valid Rows"
          value={totalRows.toLocaleString()}
          icon={<Layers className="w-5 h-5 text-avis-accent-indigo" />}
          desc="Final record count after forensic cleaning."
        />
        <StatMetricCard
          label="Data Points"
          value={totalColumns.toString()}
          icon={<Table className="w-5 h-5 text-avis-accent-cyan" />}
          desc="Total attributes identified per entity."
        />
        <StatMetricCard
          label="Numbers"
          value={numeric.length.toString()}
          icon={<Sigma className="w-5 h-5 text-avis-accent-success" />}
          desc="Measurable numeric feature dimensions."
        />
        <StatMetricCard
          label="Labels"
          value={categorical.length.toString()}
          icon={<Activity className="w-5 h-5 text-avis-accent-amber" />}
          desc="Columns used for labeling or grouping."
        />
      </div>

      {/* 3. FUNCTIONALITY 3: PROGRESSIVE NUMBER ANALYSIS TABLE */}
      <div className="bg-avis-secondary/40 border border-avis-border/60 rounded-[3rem] overflow-hidden shadow-2xl backdrop-blur-xl">
        <div className="px-10 py-8 border-b border-avis-border/40 flex justify-between items-center bg-avis-primary/40">
          <div className="flex items-center gap-4">
            <Calculator className="w-6 h-6 text-avis-accent-cyan" />
            <div>
              <h3 className="font-black text-white uppercase tracking-tighter text-xl">
                Averages and Spread
              </h3>
              <p className="text-[10px] text-avis-text-secondary font-bold uppercase tracking-widest">
                Click a row to reveal the system logic
              </p>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-avis-primary/60 text-[10px] uppercase font-black text-avis-text-secondary tracking-[0.2em]">
              <tr>
                <th className="px-10 py-6">Column Name</th>
                <th className="px-10 py-6">Average</th>
                <th className="px-10 py-6">Variation</th>
                <th className="px-10 py-6 text-center">Data Spread</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-avis-border/20">
              {numeric.map((stat, idx) => (
                <React.Fragment key={stat.column}>
                  <motion.tr
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() =>
                      setExpandedRow(
                        expandedRow === stat.column ? null : stat.column
                      )
                    }
                    className="hover:bg-white/5 transition-colors group cursor-pointer"
                  >
                    <td className="px-10 py-6 font-black text-white text-lg italic flex items-center gap-3">
                      {stat.column}
                      {expandedRow === stat.column ? (
                        <ChevronUp className="w-4 h-4 text-avis-accent-indigo" />
                      ) : (
                        <ChevronDown className="w-4 h-4 opacity-20 group-hover:opacity-100 transition-opacity" />
                      )}
                    </td>
                    <td className="px-10 py-6 font-mono text-avis-accent-cyan font-black text-lg">
                      {stat.mean.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-10 py-6 font-mono text-avis-text-secondary">
                      {stat.std.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-10 py-6 min-w-[300px]">
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between text-[9px] font-black uppercase text-avis-text-secondary">
                          <span>{stat.min.toLocaleString()}</span>
                          <span className="text-white">
                            {stat.max.toLocaleString()}
                          </span>
                        </div>
                        <div className="h-1.5 bg-avis-primary rounded-full overflow-hidden border border-avis-border/40">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            className="h-full bg-gradient-to-r from-avis-accent-indigo to-avis-accent-cyan opacity-40 group-hover:opacity-100 transition-opacity"
                          />
                        </div>
                      </div>
                    </td>
                  </motion.tr>

                  {/* VISIBLE BACKEND STEPS (Functionality 3) */}
                  <AnimatePresence>
                    {expandedRow === stat.column && (
                      <tr>
                        <td colSpan={4} className="px-10 py-0">
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="bg-avis-accent-indigo/5 border-x border-b border-avis-accent-indigo/20 rounded-b-[2rem] p-8 mb-4 grid grid-cols-1 md:grid-cols-2 gap-8 shadow-inner">
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 text-avis-accent-indigo">
                                  <Search className="w-4 h-4" />
                                  <span className="text-[10px] font-black uppercase tracking-widest">
                                    Observation
                                  </span>
                                </div>
                                <p className="text-white font-bold text-sm italic leading-relaxed">
                                  "{stat.insight}"
                                </p>
                              </div>
                              <div className="space-y-3 border-l border-white/5 pl-8">
                                <div className="flex items-center gap-2 text-avis-text-secondary">
                                  <Info className="w-4 h-4" />
                                  <span className="text-[10px] font-black uppercase tracking-widest">
                                    Visible Backend Steps
                                  </span>
                                </div>
                                <p className="text-avis-text-secondary text-[11px] leading-relaxed font-medium">
                                  {stat.logic_desc ||
                                    "Analyzing variance patterns across unique records."}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. LABEL CATEGORIES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categorical.map((stat, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={stat.column}
            className="bg-avis-secondary/40 border border-avis-border/60 rounded-[3rem] p-8 hover:border-avis-accent-amber/40 transition-all shadow-2xl group flex flex-col"
          >
            <div className="flex justify-between items-start mb-8">
              <div className="space-y-1">
                <h4 className="font-black text-white text-xl group-hover:text-avis-accent-amber transition-colors italic">
                  {stat.column}
                </h4>
                <p className="text-[9px] text-avis-text-secondary font-black uppercase tracking-widest">
                  Label Group
                </p>
              </div>
              <div className="text-[10px] font-black text-avis-accent-amber bg-avis-accent-amber/10 px-3 py-1.5 rounded-xl border border-avis-accent-amber/30 uppercase tracking-widest">
                {stat.unique_count} Types
              </div>
            </div>
            {/* Logic description for categories */}
            <p className="text-[10px] text-avis-text-secondary mb-6 italic opacity-60">
              {stat.logic_desc || "Frequency density scan complete."}
            </p>
            <ul className="space-y-4 flex-1">
              {Object.entries(stat.top_values).map(([val, count]) => {
                const percentage = ((count / totalRows) * 100).toFixed(1);
                return (
                  <li key={val} className="space-y-2">
                    <div className="flex justify-between text-xs font-bold uppercase">
                      <span
                        className="text-avis-text-secondary truncate max-w-[150px]"
                        title={val}
                      >
                        {val}
                      </span>
                      <span className="text-white">
                        {count}{" "}
                        <span className="text-[9px] text-avis-accent-amber opacity-60 ml-1">
                          {percentage}%
                        </span>
                      </span>
                    </div>
                    <div className="h-1 bg-avis-primary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        className="h-full bg-avis-accent-amber shadow-[0_0_8px_rgba(251,191,36,0.4)]"
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const StatMetricCard = ({
  label,
  value,
  icon,
  desc,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  desc: string;
}) => (
  <div className="p-8 bg-avis-secondary/40 border border-avis-border/60 rounded-[3rem] shadow-2xl hover:bg-avis-secondary/60 transition-all group relative overflow-hidden">
    <div className="flex items-center gap-5 mb-5">
      <div className="p-4 bg-avis-primary rounded-2xl border border-avis-border/60 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-xl">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-avis-text-secondary uppercase tracking-[0.3em] mb-1">
          {label}
        </p>
        <p className="text-3xl font-black text-white tracking-tighter">
          {value}
        </p>
      </div>
    </div>
    <p className="text-[11px] text-avis-text-secondary leading-relaxed opacity-60 font-medium italic">
      {desc}
    </p>
  </div>
);

export default SummaryStats;
