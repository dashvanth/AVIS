// frontend/src/pages/InsightsDashboard.tsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; // Use URL params for datasetId
import {
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Info,
  Zap,
  BrainCircuit,
  Target,
} from "lucide-react";
import { getInsights } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";

interface Insight {
  type: "insight" | "recommendation";
  severity: "low" | "medium" | "high";
  column: string;
  message: string;
}

const InsightsDashboard: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Fetches ID from URL /dashboard/:id/insights
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<Insight[]>([]);

  useEffect(() => {
    const fetchInsights = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await getInsights(Number(id));
        setInsights(data);
      } catch (err) {
        console.error("Discovery error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, [id]);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-40 bg-avis-primary h-full">
        <BrainCircuit className="w-16 h-16 text-avis-accent-indigo animate-pulse mb-6 opacity-40" />
        <p className="text-avis-text-secondary font-black uppercase tracking-[0.4em] text-[10px]">
          A.V.I.S Discovery Node Scanning...
        </p>
      </div>
    );

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-10 space-y-12 bg-avis-primary min-h-screen">
      <div className="border-b border-avis-border/40 pb-10">
        <div className="flex items-center gap-3 text-avis-accent-indigo text-[10px] font-black uppercase tracking-[0.4em] mb-3">
          <Zap className="w-4 h-4" /> Discovery Hub
        </div>
        <h2 className="text-5xl font-black text-white tracking-tighter italic">
          AI Observations
        </h2>
        <p className="text-avis-text-secondary mt-3 text-sm font-medium max-w-2xl leading-relaxed">
          We converted your complex math results into simple observations. Use
          these to understand patterns and fix problems in your data.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* RECOMMENDATIONS */}
        <div className="space-y-6">
          <h3 className="text-[10px] font-black text-avis-accent-indigo uppercase tracking-[0.3em] flex items-center gap-3 ml-2">
            <Target className="w-4 h-4" /> Actions to take
          </h3>
          <div className="space-y-4">
            {insights
              .filter((i) => i.type === "recommendation")
              .map((item, idx) => (
                <InsightCard key={idx} item={item} />
              ))}
          </div>
        </div>

        {/* OBSERVATIONS */}
        <div className="space-y-6">
          <h3 className="text-[10px] font-black text-avis-accent-amber uppercase tracking-[0.3em] flex items-center gap-3 ml-2">
            <Lightbulb className="w-4 h-4" /> Interesting Patterns
          </h3>
          <div className="space-y-4">
            {insights
              .filter((i) => i.type === "insight")
              .map((item, idx) => (
                <InsightCard key={idx} item={item} />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const InsightCard = ({ item }: { item: Insight }) => {
  const isHigh = item.severity === "high";
  return (
    <motion.div
      whileHover={{ x: 5 }}
      className={`p-6 rounded-[2rem] border transition-all ${
        isHigh
          ? "bg-red-500/5 border-red-500/20"
          : "bg-avis-secondary/40 border-avis-border"
      }`}
    >
      <div className="flex gap-5">
        <div
          className={`p-3 rounded-xl shrink-0 ${
            isHigh
              ? "bg-red-500/10 text-red-500"
              : "bg-avis-accent-indigo/10 text-avis-accent-indigo"
          }`}
        >
          {isHigh ? (
            <AlertTriangle className="w-5 h-5" />
          ) : (
            <Lightbulb className="w-5 h-5" />
          )}
        </div>
        <div className="space-y-2">
          <p className="text-[9px] font-black uppercase tracking-widest text-avis-text-secondary">
            Category: {item.column}
          </p>
          <p className="text-white font-bold text-sm leading-relaxed">
            {item.message}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default InsightsDashboard;
