import React from "react";
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
  SearchCode,
} from "lucide-react";
import type { NumericSummary, CategoricalSummary } from "../../types";
import { motion } from "framer-motion";

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
  return (
    <div className="space-y-12">
      {/* 1. Dimensional Intelligence Cards (Functionality 3) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatMetricCard
          label="Relational Entities"
          value={totalRows.toLocaleString()}
          icon={<Layers className="w-5 h-5 text-avis-accent-indigo" />}
          desc="Total valid instances processed after ingestion audit."
        />
        <StatMetricCard
          label="Feature dimensions"
          value={totalColumns.toString()}
          icon={<Table className="w-5 h-5 text-avis-accent-cyan" />}
          desc="Individual attributes identified per unique entity."
        />
        <StatMetricCard
          label="Quantitative Features"
          value={numeric.length.toString()}
          icon={<Sigma className="w-5 h-5 text-avis-accent-success" />}
          desc="Columns identified as measurable numeric values."
        />
        <StatMetricCard
          label="Qualitative Features"
          value={categorical.length.toString()}
          icon={<Activity className="w-5 h-5 text-avis-accent-amber" />}
          desc="Columns used for grouping and labeling entities."
        />
      </div>

      {/* 2. Educational Insight Banner (Functionality 6) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-8 bg-gradient-to-r from-avis-accent-indigo/10 to-avis-accent-cyan/10 border border-avis-accent-indigo/20 rounded-[3rem] flex flex-col md:flex-row items-center gap-6 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <Zap className="w-32 h-32 text-white" />
        </div>
        <div className="p-4 bg-avis-accent-indigo/20 rounded-2xl backdrop-blur-md border border-avis-accent-indigo/30">
          <SearchCode className="w-8 h-8 text-avis-accent-indigo" />
        </div>
        <div className="space-y-2">
          <h4 className="text-white font-black uppercase tracking-[0.3em] text-[10px] mb-1">
            System Logic: Automated Discovery Active
          </h4>
          <p className="text-sm text-avis-text-secondary leading-relaxed italic max-w-4xl">
            "The A.V.I.S Engine has completed a **Descriptive Audit**. For
            numeric data, we calculated central tendencies (Mean) and variance
            (Std Dev). For categories, we performed a frequency scan to find
            dominant patterns. This ensures your analysis is grounded in
            verified statistical fact."
          </p>
        </div>
      </motion.div>

      {/* 3. Numeric Distribution Intelligence (Functionality 3) */}
      <div className="bg-avis-secondary/40 border border-avis-border/60 rounded-[3rem] overflow-hidden shadow-2xl backdrop-blur-xl">
        <div className="px-10 py-8 border-b border-avis-border/40 flex justify-between items-center bg-avis-primary/40">
          <div className="flex items-center gap-4">
            <Calculator className="w-6 h-6 text-avis-accent-cyan" />
            <div>
              <h3 className="font-black text-white uppercase tracking-tighter text-xl">
                Quantitative Matrix Summary
              </h3>
              <p className="text-[10px] text-avis-text-secondary font-bold uppercase tracking-widest">
                Comprehensive Central Tendency Audit
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3 text-[10px] text-avis-accent-cyan uppercase font-black bg-avis-accent-cyan/10 px-4 py-2 rounded-full border border-avis-accent-cyan/20">
            <TrendingUp className="w-3 h-3" /> Statistical Engine V1.2
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-avis-primary/60 text-[10px] uppercase font-black text-avis-text-secondary tracking-[0.2em]">
              <tr>
                <th className="px-10 py-6 border-b border-avis-border/40">
                  Feature Name
                </th>
                <th className="px-10 py-6 border-b border-avis-border/40 group cursor-help">
                  <div className="flex items-center gap-2">
                    Mean{" "}
                    <HelpCircle className="w-3 h-3 text-avis-accent-indigo" />
                  </div>
                </th>
                <th className="px-10 py-6 border-b border-avis-border/40 group cursor-help">
                  <div className="flex items-center gap-2">
                    Std Dev{" "}
                    <HelpCircle className="w-3 h-3 text-avis-accent-indigo" />
                  </div>
                </th>
                <th className="px-10 py-6 border-b border-avis-border/40 text-center">
                  Data Spread (Min → Max)
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
                    {stat.mean.toFixed(2)}
                  </td>
                  <td className="px-10 py-6 font-mono text-avis-text-secondary text-base">
                    {stat.std.toFixed(2)}
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

      {/* 4. Categorical Frequency Analysis (Functionality 3) */}
      <div className="space-y-8">
        <div className="flex items-center gap-4 px-4">
          <BarChart3 className="w-7 h-7 text-avis-accent-amber" />
          <div>
            <h3 className="text-2xl font-black text-white uppercase tracking-tighter">
              Qualitative Frequency Audit
            </h3>
            <p className="text-[10px] text-avis-text-secondary font-bold uppercase tracking-widest">
              Discovery of dominant categorical patterns
            </p>
          </div>
        </div>
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
                    Qualitative Label
                  </p>
                </div>
                <div className="text-[10px] font-black text-avis-accent-amber bg-avis-accent-amber/10 px-3 py-1.5 rounded-xl border border-avis-accent-amber/30 uppercase tracking-widest">
                  {stat.unique_count} Unique
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
              <div className="mt-8 pt-6 border-t border-avis-border/20 flex items-center gap-2 text-[9px] font-black text-avis-text-secondary uppercase italic opacity-40">
                <Info className="w-3 h-3" /> Frequency density calculated from
                total rows
              </div>
            </motion.div>
          ))}
        </div>
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
    <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-0 group-hover:opacity-[0.02] transition-opacity -rotate-45 translate-x-12 -translate-y-12" />
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
