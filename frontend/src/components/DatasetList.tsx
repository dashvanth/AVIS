import React from "react";
import {
  FileText,
  Trash2,
  BarChart2,
  Lightbulb,
  MessageSquare,
  Layout,
  TrendingUp,
  Clock,
} from "lucide-react";
import { motion } from "framer-motion";
import type { Dataset } from "../types";

interface DatasetListProps {
  datasets: Dataset[];
  onDelete: (id: number) => void;
  onAnalyze: (id: number) => void;
  onVisualize: (id: number) => void;
  onForecast: (id: number) => void;
  onInsights: (id: number) => void;
  onChat: (id: number) => void;
  onSelect: (id: number) => void; // Syncs with Audit Engine
  selectedId: number | null; // Tracks active state
}

const DatasetList: React.FC<DatasetListProps> = ({
  datasets,
  onDelete,
  onAnalyze,
  onVisualize,
  onForecast,
  onInsights,
  onChat,
  onSelect,
  selectedId,
}) => {
  return (
    /* Responsive Grid: auto-fill ensures cards don't stretch weirdly on large screens */
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {datasets.map((dataset) => {
        const isSelected = selectedId === dataset.id;

        return (
          <motion.div
            key={dataset.id}
            onClick={() => onSelect(dataset.id)}
            layout
            className={`group cursor-pointer bg-avis-primary rounded-2xl shadow-lg border p-6 flex flex-col hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] transition-all duration-300 relative overflow-hidden
                            ${
                              isSelected
                                ? "border-avis-accent-indigo ring-1 ring-avis-accent-indigo/30"
                                : "border-avis-border hover:border-avis-accent-indigo/50"
                            }`}
          >
            {/* Glow Effect */}
            <div
              className={`absolute top-0 right-0 w-32 h-32 bg-avis-accent-indigo opacity-0 group-hover:opacity-10 blur-[60px] transition-opacity ${
                isSelected ? "opacity-20" : ""
              }`}
            ></div>

            {/* Card Header */}
            <div className="flex items-start justify-between mb-6 relative z-10">
              <div className="flex items-center space-x-3 min-w-0">
                <div
                  className={`p-3 rounded-xl shadow-inner transition-colors ${
                    isSelected
                      ? "bg-avis-accent-indigo"
                      : "bg-gradient-to-br from-avis-accent-indigo to-purple-600"
                  }`}
                >
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3
                    className="font-bold text-avis-text-primary truncate text-base group-hover:text-avis-accent-indigo transition-colors"
                    title={dataset.filename}
                  >
                    {dataset.filename}
                  </h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-avis-secondary text-avis-text-secondary border border-avis-border uppercase tracking-widest mt-1">
                    {dataset.file_type}
                  </span>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(dataset.id);
                }}
                className="text-avis-text-secondary hover:text-red-500 transition-colors p-2 hover:bg-red-500/10 rounded-lg shrink-0"
                title="Delete Dataset"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6 relative z-10">
              <div className="bg-avis-secondary/50 p-3 rounded-xl border border-avis-border/50 group-hover:border-avis-accent-indigo/30 transition-colors">
                <span className="text-[10px] text-avis-text-secondary font-bold uppercase tracking-tighter block mb-1">
                  Rows
                </span>
                <span className="text-avis-text-primary font-bold font-mono text-sm">
                  {dataset.row_count.toLocaleString()}
                </span>
              </div>
              <div className="bg-avis-secondary/50 p-3 rounded-xl border border-avis-border/50 group-hover:border-avis-accent-indigo/30 transition-colors">
                <span className="text-[10px] text-avis-text-secondary font-bold uppercase tracking-tighter block mb-1">
                  Cols
                </span>
                <span className="text-avis-text-primary font-bold font-mono text-sm">
                  {dataset.column_count}
                </span>
              </div>
            </div>

            {/* Action Buttons Grid */}
            <div className="mt-auto space-y-2 relative z-10">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAnalyze(dataset.id);
                  }}
                  className="flex items-center justify-center py-2 text-[10px] font-bold text-indigo-300 bg-indigo-900/20 border border-indigo-500/20 rounded-lg hover:bg-indigo-500 hover:text-white transition-all"
                >
                  <BarChart2 className="w-3 h-3 mr-1.5" /> Analyze
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onVisualize(dataset.id);
                  }}
                  className="flex items-center justify-center py-2 text-[10px] font-bold text-purple-300 bg-purple-900/20 border border-purple-500/20 rounded-lg hover:bg-purple-500 hover:text-white transition-all"
                >
                  <Layout className="w-3 h-3 mr-1.5" /> Visualize
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onForecast(dataset.id);
                  }}
                  className="flex items-center justify-center py-2 text-[10px] font-bold text-emerald-300 bg-emerald-900/20 border border-emerald-500/20 rounded-lg hover:bg-emerald-500 hover:text-white transition-all"
                >
                  <TrendingUp className="w-3 h-3 mr-1.5" /> Forecast
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onInsights(dataset.id);
                  }}
                  className="flex items-center justify-center py-2 text-[10px] font-bold text-amber-300 bg-amber-900/20 border border-amber-500/20 rounded-lg hover:bg-amber-500 hover:text-white transition-all"
                >
                  <Lightbulb className="w-3 h-3 mr-1.5" /> Insights
                </button>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onChat(dataset.id);
                }}
                className="w-full flex items-center justify-center py-2.5 text-xs font-bold text-white bg-gradient-to-r from-avis-accent-indigo to-avis-accent-cyan rounded-lg hover:shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all transform hover:-translate-y-0.5"
              >
                <MessageSquare className="w-3.5 h-3.5 mr-2" /> Chat with Data
              </button>
            </div>

            {/* Status Bar */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-avis-border/30">
              <div
                className={`h-full transition-all duration-500 ${
                  dataset.analyzed
                    ? "bg-avis-accent-success w-full"
                    : "bg-avis-accent-amber w-1/3"
                }`}
              />
            </div>
          </motion.div>
        );
      })}

      {datasets.length === 0 && (
        <div className="col-span-full py-20 text-center border-2 border-dashed border-avis-border/30 rounded-3xl">
          <Database className="w-12 h-12 text-avis-text-secondary/20 mx-auto mb-4" />
          <p className="text-slate-400">No datasets uploaded yet.</p>
        </div>
      )}
    </div>
  );
};

export default DatasetList;
