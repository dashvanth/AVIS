import React, { useMemo } from "react";
import {
  Calculator,
  Table,
  Activity,
  Layers,
  Info,
  HelpCircle,
  Sigma,
  Zap,
  TrendingUp,
  BarChart3,
  Search,
  ArrowRight,
  ShieldCheck,
  FileDigit,
  Type,
} from "lucide-react";
import type {
  NumericSummary,
  CategoricalSummary,
  ProcessingStep,
} from "../../types";
import { motion } from "framer-motion";
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
  // Accessing the dataset from Layout context to get the processing_log
  const { dataset } = useOutletContext<{ dataset: any }>();

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
          <div className="p-8 bg-avis-primary/40 rounded-[2.5rem] border border-white/5 space-y-6">
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
            <p className="text-[11px] text-avis-text-secondary italic text-center pt-2">
              "We isolated and removed unusable rows to prevent broken
              averages."
            </p>
          </div>

          {/* Type Inference Audit */}
          <div className="p-8 bg-avis-primary/40 rounded-[2.5rem] border border-white/5 space-y-6">
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
            <p className="text-[11px] text-avis-text-secondary italic text-center pt-2">
              "We identified numbers hidden in text and fixed them for
              analysis."
            </p>
          </div>
        </div>
      </div>

      {/* 2. DATA OVERVIEW CARDS: Simplified labels for beginners */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatMetricCard
          label="Valid Rows"
          value={totalRows.toLocaleString()}
          icon={<Layers className="w-5 h-5 text-avis-accent-indigo" />}
          desc="The final count of rows ready for analysis."
        />
        <StatMetricCard
          label="Data Points"
          value={totalColumns.toString()}
          icon={<Table className="w-5 h-5 text-avis-accent-cyan" />}
          desc="Attributes detected per unique entity."
        />
        <StatMetricCard
          label="Numbers"
          value={numeric.length.toString()}
          icon={<Sigma className="w-5 h-5 text-avis-accent-success" />}
          desc="Columns with measurable numeric data."
        />
        <StatMetricCard
          label="Labels"
          value={categorical.length.toString()}
          icon={<Activity className="w-5 h-5 text-avis-accent-amber" />}
          desc="Columns used for groups and names."
        />
      </div>

      {/* 3. NUMBER ANALYSIS: Simplified from "Quantitative Matrix" */}
      <div className="bg-avis-secondary/40 border border-avis-border/60 rounded-[3rem] overflow-hidden shadow-2xl backdrop-blur-xl">
        <div className="px-10 py-8 border-b border-avis-border/40 flex justify-between items-center bg-avis-primary/40">
          <div className="flex items-center gap-4">
            <Calculator className="w-6 h-6 text-avis-accent-cyan" />
            <div>
              <h3 className="font-black text-white uppercase tracking-tighter text-xl">
                Averages and Spread
              </h3>
              <p className="text-[10px] text-avis-text-secondary font-bold uppercase tracking-widest">
                What does a typical row look like?
              </p>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-avis-primary/60 text-[10px] uppercase font-black text-avis-text-secondary tracking-[0.2em]">
              <tr>
                <th className="px-10 py-6 border-b border-avis-border/40">
                  Column
                </th>
                <th className="px-10 py-6 border-b border-avis-border/40 group cursor-help">
                  <div className="flex items-center gap-2">
                    Average{" "}
                    <HelpCircle className="w-3 h-3 text-avis-accent-indigo" />
                  </div>
                </th>
                <th className="px-10 py-6 border-b border-avis-border/40 group cursor-help">
                  <div className="flex items-center gap-2">
                    Variation{" "}
                    <HelpCircle className="w-3 h-3 text-avis-accent-indigo" />
                  </div>
                </th>
                <th className="px-10 py-6 border-b border-avis-border/40 text-center">
                  Full Range (Lowest → Highest)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-avis-border/20">
              {numeric.map((stat, idx) => (
                <motion.tr
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={stat.column}
                  className="hover:bg-white/5 transition-colors group"
                >
                  <td className="px-10 py-6 font-black text-white text-lg tracking-tight italic">
                    {stat.column}
                  </td>
                  <td className="px-10 py-6 font-mono text-avis-accent-cyan font-black text-lg">
                    {stat.mean.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="px-10 py-6 font-mono text-avis-text-secondary text-base">
                    {stat.std.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="px-10 py-6 min-w-[300px]">
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between text-[10px] font-black uppercase text-avis-text-secondary mb-1">
                        <span>{stat.min.toLocaleString()}</span>
                        <span className="text-white">
                          {stat.max.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-2 bg-avis-primary rounded-full overflow-hidden border border-avis-border/40 shadow-inner">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: "100%" }}
                          className="h-full bg-gradient-to-r from-avis-accent-indigo to-avis-accent-cyan opacity-40 group-hover:opacity-100 transition-opacity"
                        />
                      </div>
                    </div>
                  </td>
                </motion.tr>
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
                <h4 className="font-black text-white text-xl tracking-tight group-hover:text-avis-accent-amber transition-colors">
                  {stat.column}
                </h4>
                <p className="text-[9px] text-avis-text-secondary font-black uppercase tracking-widest italic">
                  Label Group
                </p>
              </div>
              <div className="text-[10px] font-black text-avis-accent-amber bg-avis-accent-amber/10 px-3 py-1.5 rounded-xl border border-avis-accent-amber/30 uppercase tracking-widest">
                {stat.unique_count} Types
              </div>
            </div>
            <ul className="space-y-5 flex-1">
              {Object.entries(stat.top_values).map(([val, count]) => {
                const percentage = ((count / totalRows) * 100).toFixed(1);
                return (
                  <li key={val} className="space-y-2">
                    <div className="flex justify-between text-xs font-black uppercase tracking-tighter">
                      <span
                        className="text-avis-text-secondary truncate max-w-[150px]"
                        title={val}
                      >
                        {val}
                      </span>
                      <span className="text-white font-mono">
                        {count}{" "}
                        <span className="text-avis-accent-amber opacity-60 ml-2">
                          {percentage}%
                        </span>
                      </span>
                    </div>
                    <div className="h-1.5 bg-avis-primary rounded-full overflow-hidden border border-avis-border/20 shadow-inner">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        className="h-full bg-avis-accent-amber shadow-[0_0_10px_rgba(251,191,36,0.5)]"
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

// MINI COMPONENTS
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
