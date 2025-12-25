import React, { useEffect, useState } from "react";
import {
  Loader2,
  Info,
  Search,
  CheckCircle2,
  LayoutGrid,
  Zap,
  HelpCircle,
  AlertCircle,
  Terminal,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import type { EDASummary, CorrelationData } from "../types";
import * as api from "../services/api";
import SummaryStats from "../components/eda/SummaryStats";
import CorrelationMatrix from "../components/eda/CorrelationMatrix";
import { motion, AnimatePresence } from "framer-motion";

interface EDADashboardProps {
  datasetId: number;
}

const EDADashboard: React.FC<EDADashboardProps> = ({ datasetId }) => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<EDASummary | null>(null);
  const [correlation, setCorrelation] = useState<CorrelationData | null>(null);
  const [activeStep, setActiveStep] = useState<"summary" | "relationships">(
    "summary"
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [summaryData, corrData] = await Promise.all([
          api.getEDASummary(datasetId),
          api.getCorrelationMatrix(datasetId),
        ]);

        setSummary(summaryData);
        setCorrelation(corrData);
      } catch (err: any) {
        setError(
          err.response?.data?.detail ||
            "Unable to connect to the data engine. Please check your connection."
        );
      } finally {
        setLoading(false);
      }
    };
    if (datasetId) fetchData();
  }, [datasetId]);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-40 bg-avis-primary min-h-screen">
        <Loader2 className="w-16 h-16 text-avis-accent-indigo animate-spin mb-8 opacity-40" />
        <p className="text-avis-text-secondary font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">
          A.V.I.S is scanning your data...
        </p>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center py-40 bg-avis-primary min-h-screen px-6">
        <div className="p-10 bg-red-500/10 border border-red-500/30 rounded-[3rem] text-center max-w-xl shadow-2xl">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h3 className="text-2xl font-black text-white mb-3">
            Access Interrupted
          </h3>
          <p className="text-sm text-avis-text-secondary mb-8">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-red-500 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-red-600 transition-all"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );

  return (
    <div className="max-w-[1600px] mx-auto px-6 sm:px-10 py-10 space-y-12 bg-avis-primary min-h-screen">
      {/* 1. GUIDED HEADER: Simplified for Beginners */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end border-b border-avis-border/40 pb-10 gap-8">
        <div>
          <div className="flex items-center gap-3 text-avis-accent-indigo text-[10px] font-black uppercase tracking-[0.4em] mb-3">
            <Search className="w-4 h-4 animate-pulse" /> Step-by-Step Discovery
          </div>
          <h2 className="text-5xl font-black text-white tracking-tighter italic">
            Analyze Your Data
          </h2>
          <p className="text-avis-text-secondary mt-3 text-sm font-medium max-w-2xl leading-relaxed">
            We've broken your data down into simple steps. First, we look at the{" "}
            <strong>Averages</strong>, and then we find{" "}
            <strong>Hidden Links</strong> between your columns.
          </p>
        </div>

        {/* STEP NAVIGATOR: Replaced jargon with simple numbers */}
        <div className="flex bg-avis-secondary/30 p-2 rounded-[2rem] border border-avis-border/50 backdrop-blur-xl shadow-2xl w-full xl:w-auto">
          <button
            onClick={() => setActiveStep("summary")}
            className={`flex-1 xl:flex-none px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${
              activeStep === "summary"
                ? "bg-avis-accent-indigo text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                : "text-avis-text-secondary hover:text-white"
            }`}
          >
            <LayoutGrid className="w-4 h-4" /> 1. The Basics (Averages)
          </button>
          <button
            onClick={() => setActiveStep("relationships")}
            className={`flex-1 xl:flex-none px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${
              activeStep === "relationships"
                ? "bg-avis-accent-cyan text-white shadow-[0_0_20px_rgba(34,211,238,0.4)]"
                : "text-avis-text-secondary hover:text-white"
            }`}
          >
            <TrendingUp className="w-4 h-4" /> 2. Hidden Connections
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeStep === "summary" && summary && (
          <motion.div
            key="summary-stage"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-12"
          >
            {/* BEGINNER-FRIENDLY EXPLAINER */}
            <div className="bg-avis-accent-indigo/5 border border-avis-accent-indigo/20 p-8 rounded-[3rem] flex items-start gap-8 shadow-inner relative overflow-hidden group">
              <div className="p-4 bg-avis-accent-indigo/10 rounded-2xl text-avis-accent-indigo border border-avis-accent-indigo/20">
                <Info className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h4 className="text-white font-black text-[10px] uppercase tracking-[0.3em] mb-1">
                  How we read your data:
                </h4>
                <p className="text-sm text-avis-text-secondary leading-relaxed italic max-w-4xl font-medium">
                  "The system looked at your{" "}
                  <span className="text-white">
                    {summary.total_columns} columns
                  </span>{" "}
                  and
                  <span className="text-white">
                    {" "}
                    {summary.total_rows.toLocaleString()} rows
                  </span>
                  . We calculated the
                  <strong> Average (Mean)</strong> to show you what a typical
                  row looks like and checked for <strong>Data Spread</strong> to
                  see how much your numbers change."
                </p>
              </div>
            </div>

            <SummaryStats
              numeric={summary.numeric}
              categorical={summary.categorical}
              totalRows={summary.total_rows}
              totalColumns={summary.total_columns}
            />
          </motion.div>
        )}

        {activeStep === "relationships" && (
          <motion.div
            key="rel-stage"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-12"
          >
            {/* DYNAMIC DISCOVERY CARDS: Plain English explanations */}
            {correlation && correlation.top_discoveries.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {correlation.top_discoveries.map((insight, idx) => (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    key={idx}
                    className="p-8 bg-gradient-to-br from-avis-accent-cyan/10 to-transparent border border-avis-border/60 rounded-[3rem] shadow-2xl relative overflow-hidden group hover:border-avis-accent-cyan/40 transition-all"
                  >
                    <p className="text-[9px] font-black text-avis-accent-cyan uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Zap className="w-3 h-3" /> Connection Detected
                    </p>
                    <p className="text-sm text-white leading-relaxed font-bold italic">
                      "{insight}"
                    </p>
                  </motion.div>
                ))}
              </div>
            )}

            {/* RELATIONSHIP MATRIX: Beginner help text added */}
            {correlation && correlation.matrix.length > 0 ? (
              <div className="space-y-6">
                <div className="p-6 bg-avis-secondary/40 border border-avis-border/50 rounded-[2.5rem] flex items-center gap-4">
                  <Zap className="w-5 h-5 text-avis-accent-cyan" />
                  <p className="text-xs text-avis-text-secondary leading-relaxed">
                    <strong>How to read this chart:</strong> This grid shows how
                    columns affect each other. A{" "}
                    <span className="text-avis-accent-cyan">higher number</span>{" "}
                    means they move together (like Age and Price). A{" "}
                    <span className="text-white">lower number</span> means there
                    is no link.
                  </p>
                </div>
                <div className="bg-avis-secondary/20 border border-avis-border/40 rounded-[4rem] p-10 shadow-2xl">
                  <CorrelationMatrix data={correlation.matrix} />
                </div>
              </div>
            ) : (
              <div className="py-40 text-center bg-avis-secondary/20 rounded-[4rem] border-2 border-dashed border-avis-border/40 flex flex-col items-center">
                <HelpCircle className="w-20 h-20 text-avis-text-secondary mb-8 opacity-20" />
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">
                  No Connections Found
                </h3>
                <p className="text-sm text-avis-text-secondary mt-3 max-w-md">
                  We need at least two columns with numbers to find
                  relationships. Try uploading a dataset with more numeric
                  information.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. FOOTER: Simplified from "Audit Node" to "Status" */}
      <div className="pt-10 border-t border-avis-border/20 flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4 text-[10px] font-black text-avis-text-secondary uppercase tracking-[0.4em]">
          <CheckCircle2 className="w-4 h-4 text-avis-accent-success" /> Analysis
          Verified & Secure
        </div>
        <div className="px-6 py-2 bg-avis-secondary/50 rounded-full border border-avis-border/40 text-[9px] font-mono text-avis-text-secondary uppercase tracking-widest">
          Dataset ID: {datasetId.toString().padStart(4, "0")} // Status: Ready
        </div>
      </div>
    </div>
  );
};

export default EDADashboard;
