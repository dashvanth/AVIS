import React, { useState } from "react";
import { 
  Calculator, 
  Database, 
  BarChart as BarChartIcon,
  Table as TableIcon
} from "lucide-react";
import { motion } from "framer-motion";
import { useDatasetContext } from "../context/DatasetContext";
import DataPreviewTable from "../components/DataPreviewTable";
import { NumericalDistributionCharts } from "../components/eda/NumericalDistributionCharts";
import { CategoricalDistributionCharts } from "../components/eda/CategoricalDistributionCharts";

const StatisticsPage: React.FC = () => {
  const { 
    datasetId, 
    loading, 
    error, 
    preview, 
    summary 
  } = useDatasetContext();

  const [showAllCategories, setShowAllCategories] = useState(false);

  if (loading) return null;
  if (error || !preview || !summary) return null;

  return (
    <div className="py-8 space-y-12 transition-all">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
        <section>
          <div className="flex items-center gap-3 border-b border-purple-500/20 pb-4 mb-6">
            <BarChartIcon className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white tracking-wide">Statistical Engine</h2>
          </div>

          <div className="space-y-8">
            {/* Numeric Spread */}
            {summary.numeric.length > 0 && (
              <div className="bg-slate-900/60 border border-white/5 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-purple-400" /> Numeric Distributions
                </h3>
                
                {/* Visual Distribution */}
                <div className="mb-8">
                  <NumericalDistributionCharts numeric={summary.numeric} />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead className="bg-black/20 text-slate-400 uppercase text-[10px] font-black tracking-widest">
                      <tr>
                        <th className="px-6 py-4">Column</th>
                        <th className="px-6 py-4">Mean</th>
                        <th className="px-6 py-4">Std Dev</th>
                        <th className="px-6 py-4">Min</th>
                        <th className="px-6 py-4">Max</th>
                        <th className="px-6 py-4">Skew</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {summary.numeric.map((col, idx) => (
                        <tr key={idx} className="hover:bg-white/5">
                          <td className="px-6 py-4 text-white font-medium">{col.column}</td>
                          <td className="px-6 py-4 text-indigo-300 font-mono">{col.mean.toFixed(2)}</td>
                          <td className="px-6 py-4 text-slate-400 font-mono">{col.std.toFixed(2)}</td>
                          <td className="px-6 py-4 text-slate-500 font-mono">{col.min}</td>
                          <td className="px-6 py-4 text-slate-500 font-mono">{col.max}</td>
                          <td className="px-6 py-4 text-amber-400/80 font-mono">{col.skew?.toFixed(2) || "N/A"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Categorical Summary */}
            {summary.categorical.length > 0 && (
              <div className="bg-slate-900/60 border border-white/5 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Database className="w-4 h-4 text-indigo-400" /> Categorical Frequencies
                </h3>

                {/* Visual Frequencies */}
                <div className="mb-8">
                  <CategoricalDistributionCharts categorical={summary.categorical.slice(0, showAllCategories ? undefined : 2)} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {summary.categorical.slice(0, showAllCategories ? undefined : 3).map((col, idx) => (
                    <div key={idx} className="bg-black/20 rounded-lg p-5 border border-white/5">
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-semibold text-white">{col.column}</span>
                        <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-slate-400 uppercase">{col.unique_count} Unique</span>
                      </div>
                      <div className="space-y-2">
                        {Object.entries(col.top_values).map(([val, count], i) => (
                          <div key={i} className="flex justify-between text-xs">
                            <span className="text-slate-400 truncate pr-2">{val}</span>
                            <span className="font-mono text-indigo-400">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {summary.categorical.length > 3 && (
                  <button onClick={() => setShowAllCategories(!showAllCategories)} className="mt-4 text-xs text-indigo-400 hover:text-indigo-300 uppercase tracking-widest font-bold">
                    {showAllCategories ? "Show Less" : `View All ${summary.categorical.length} Categories`}
                  </button>
                )}
              </div>
            )}

            {/* Live Data Preview */}
            <div className="bg-slate-900/60 border border-white/5 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <TableIcon className="w-4 h-4 text-emerald-400" /> Full Record Inventory
              </h3>
              <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                <DataPreviewTable datasetId={Number(datasetId)} />
              </div>
            </div>
          </div>
        </section>
      </motion.div>
    </div>
  );
};

export default StatisticsPage;
