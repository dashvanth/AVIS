import React from "react";
import {
  Calculator,
  Table,
  Activity,
  Layers,
  Info,
  HelpCircle,
  Sigma,
  ChevronRight,
  Zap,
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
    <div className="space-y-10">
      {/* 1. Dimensional Overview Cards (Functionality 3) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatMetricCard
          label="Total Entities"
          value={totalRows.toLocaleString()}
          icon={<Layers className="w-5 h-5 text-avis-accent-indigo" />}
          desc="Total recorded instances in your relational matrix."
        />
        <StatMetricCard
          label="Variable Dimensions"
          value={totalColumns.toString()}
          icon={<Table className="w-5 h-5 text-avis-accent-cyan" />}
          desc="Number of individual attributes detected per entity."
        />
        <StatMetricCard
          label="Numeric Features"
          value={numeric.length.toString()}
          icon={<Sigma className="w-5 h-5 text-avis-accent-success" />}
          desc="Columns identified as quantitative measurements."
        />
        <StatMetricCard
          label="Categorical Features"
          value={categorical.length.toString()}
          icon={<Activity className="w-5 h-5 text-avis-accent-amber" />}
          desc="Columns identified as qualitative groupings."
        />
      </div>

      {/* 2. Educational Explainer (Functionality 6) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 bg-avis-accent-indigo/5 border border-avis-accent-indigo/20 rounded-[2rem] flex items-start gap-5 shadow-2xl"
      >
        <div className="p-3 bg-avis-accent-indigo/10 rounded-xl">
          <Zap className="w-6 h-6 text-avis-accent-indigo" />
        </div>
        <div>
          <h4 className="text-white font-black uppercase tracking-widest text-xs mb-1">
            A.V.I.S Intelligence: Why these stats matter?
          </h4>
          <p className="text-[11px] text-avis-text-secondary leading-relaxed italic">
            "We analyzed every column to separate quantitative values from
            qualitative labels. This allows the system to apply **Descriptive
            Statistics** for numbers and **Frequency Analysis** for categories,
            ensuring you understand the central tendency and diversity of your
            data."
          </p>
        </div>
      </motion.div>

      {/* 3. Numeric Distribution Table (Functionality 3) */}
      <div className="bg-avis-secondary/40 border border-avis-border/60 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="px-8 py-6 border-b border-avis-border/40 flex justify-between items-center bg-avis-primary/20">
          <div className="flex items-center gap-3">
            <Calculator className="w-5 h-5 text-avis-accent-cyan" />
            <h3 className="font-black text-white uppercase tracking-tighter">
              Quantitative Distribution
            </h3>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-avis-text-secondary uppercase font-bold bg-avis-primary/40 px-3 py-1.5 rounded-lg border border-avis-border/60">
            <Info className="w-3 h-3" /> Step-by-Step Backend Computation Active
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-avis-primary/40 text-[10px] uppercase font-black text-avis-text-secondary tracking-widest">
              <tr>
                <th className="px-8 py-5 border-b border-avis-border/40">
                  Feature Name
                </th>
                <th className="px-8 py-5 border-b border-avis-border/40 group cursor-help">
                  <div className="flex items-center gap-1">
                    Mean <HelpCircle className="w-3 h-3 opacity-30" />
                  </div>
                </th>
                <th className="px-8 py-5 border-b border-avis-border/40 group cursor-help">
                  <div className="flex items-center gap-1">
                    Std Dev <HelpCircle className="w-3 h-3 opacity-30" />
                  </div>
                </th>
                <th className="px-8 py-5 border-b border-avis-border/40">
                  Min / Max Range
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-avis-border/20 bg-avis-secondary/10">
              {numeric.map((stat, idx) => (
                <motion.tr
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  key={stat.column}
                  className="hover:bg-white/5 transition-colors group"
                >
                  <td className="px-8 py-5 font-black text-white">
                    {stat.column}
                  </td>
                  <td className="px-8 py-5 font-mono text-avis-accent-cyan font-bold">
                    {stat.mean.toFixed(2)}
                  </td>
                  <td className="px-8 py-5 font-mono text-avis-text-secondary">
                    {stat.std.toFixed(2)}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-mono text-avis-text-secondary opacity-60">
                        {stat.min}
                      </span>
                      <div className="flex-1 h-1.5 bg-avis-primary rounded-full overflow-hidden max-w-[100px] border border-avis-border/40">
                        <div className="h-full bg-avis-accent-indigo w-full opacity-40 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <span className="text-[10px] font-mono text-white font-bold">
                        {stat.max}
                      </span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Categorical Frequency Cards (Functionality 3) */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-avis-accent-amber" />
          <h3 className="text-xl font-black text-white uppercase tracking-tighter">
            Qualitative Frequency Analysis
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categorical.map((stat, idx) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              key={stat.column}
              className="bg-avis-secondary/40 border border-avis-border/60 rounded-[2rem] p-6 hover:border-avis-accent-amber/40 transition-all shadow-xl group"
            >
              <div className="flex justify-between items-start mb-6">
                <h4 className="font-black text-white group-hover:text-avis-accent-amber transition-colors">
                  {stat.column}
                </h4>
                <div className="text-[9px] font-black text-avis-accent-amber bg-avis-accent-amber/10 px-2 py-1 rounded-md uppercase tracking-widest">
                  {stat.unique_count} Unique
                </div>
              </div>
              <ul className="space-y-4">
                {Object.entries(stat.top_values).map(([val, count]) => {
                  const percentage = ((count / totalRows) * 100).toFixed(1);
                  return (
                    <li key={val} className="space-y-1.5">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-avis-text-secondary truncate max-w-[140px] uppercase tracking-tighter">
                          {val}
                        </span>
                        <span className="text-white font-mono">
                          {count}{" "}
                          <span className="text-avis-text-secondary opacity-40 text-[9px]">
                            ({percentage}%)
                          </span>
                        </span>
                      </div>
                      <div className="h-1 bg-avis-primary rounded-full overflow-hidden border border-avis-border/20">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          className="h-full bg-avis-accent-amber"
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
  <div className="p-6 bg-avis-secondary/40 border border-avis-border/60 rounded-[2.5rem] shadow-xl hover:bg-avis-secondary/60 transition-all group">
    <div className="flex items-center gap-4 mb-4">
      <div className="p-3 bg-avis-primary rounded-2xl border border-avis-border/60 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-avis-text-secondary uppercase tracking-[0.2em]">
          {label}
        </p>
        <p className="text-2xl font-black text-white tracking-tighter">
          {value}
        </p>
      </div>
    </div>
    <p className="text-[10px] text-avis-text-secondary leading-relaxed opacity-60 font-medium">
      {desc}
    </p>
  </div>
);

export default SummaryStats;
