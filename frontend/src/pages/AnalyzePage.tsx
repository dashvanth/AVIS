import React, { useState } from "react";
import { 
  Table, 
  Database, 
  AlertCircle, 
  Search, 
  Target, 
  Sparkles, 
  FileText as FileTextIcon,
  MessageSquarePlus,
  X
} from "lucide-react";
import { motion } from "framer-motion";
import { useDatasetContext } from "../context/DatasetContext";
import { useChat } from "../context/ChatContext";
import { StatMetricCard } from "../components/StatMetricCard";
import { HealthScoreCard } from "../components/HealthScoreCard";
import { DatasetQualityRadar } from "../components/DatasetQualityRadar";
import { DataIssueCard } from "../components/DataIssueCard";
import DataDrilldownModal from "../components/DataDrilldownModal";
import HealthDetailModal from "../components/HealthDetailModal";
import { QualityMetricDataModal } from "../components/QualityMetricDataModal";

const AnalyzePage: React.FC = () => {
  const { 
    datasetId, 
    loading, 
    error, 
    preview, 
    summary, 
    repairData, 
    qualityData
  } = useDatasetContext();
  
  const { triggerMessage } = useChat();
  const [modalContent, setModalContent] = useState<{ title: string, content: React.ReactNode } | null>(null);
  const [activeDrilldown, setActiveDrilldown] = useState<{
    type: "rows" | "columns" | "missing" | "duplicates",
    title: string,
    payload: any
  } | null>(null);
  const [healthModalOpen, setHealthModalOpen] = useState(false);
  const [activeQualityMetric, setActiveQualityMetric] = useState<string | null>(null);

  const generateNarrative = () => {
    if (!preview || !summary) return "";
    const primaryType = preview.file_type.toUpperCase();
    const rowCount = preview.row_count.toLocaleString();
    const colCount = preview.column_count;
    const catCols = summary.categorical.length;
    const numCols = summary.numeric.length;
    
    return `This dataset is a ${primaryType} file containing ${rowCount} distinct records across ${colCount} attributes. 
    Our structural engine identified ${numCols} numeric metrics and ${catCols} categorical labels. 
    The data appears to represent ${summary.categorical[0]?.column || 'structured information'} trends, 
    useful for identifying patterns and driving automated decisions.`;
  };

  const handleMetricClick = (metricName: string) => {
    setActiveQualityMetric(metricName);
  };

  if (loading) return null;
  if (error || !preview || !summary || !repairData) return null;

  const allIssues = repairData.issues || [];
  const totalMissing = allIssues.filter((i:any) => i.issue === "Missing Values").reduce((a:any,b:any) => a + b.count, 0);
  const totalDuplicates = allIssues.find((i:any) => i.issue === "Duplicate Rows")?.count || 0;

  return (
    <div className="py-8 space-y-12 transition-all">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
        {/* DATASET NARRATIVE */}
        <section className="bg-slate-900/50 border border-white/5 p-8 rounded-[3rem] relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <FileTextIcon className="w-48 h-48" />
          </div>
          <div className="relative z-10 max-w-4xl">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-black uppercase tracking-widest mb-4">
              <Sparkles className="w-4 h-4" /> Automated Insight Narrative
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white mb-4 leading-tight italic">
              "Understanding the <span className="text-indigo-400">Information Asset</span>"
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed font-medium italic mb-6">
              "{generateNarrative()}"
            </p>
            <button 
              onClick={() => triggerMessage(`Deep dive into this dataset overview: ${generateNarrative()}. What are the most critical takeaways?`)}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full font-bold text-sm shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95"
            >
              <MessageSquarePlus className="w-4 h-4" />
              Ask AI for Deep Analysis
            </button>
          </div>
        </section>

        {/* SECTION 1: DATASET OVERVIEW */}
        <section>
          <div className="flex items-center gap-3 border-b border-indigo-500/20 pb-4 mb-6">
            <Target className="w-6 h-6 text-indigo-400" />
            <h2 className="text-2xl font-bold text-white tracking-wide">1. Dataset Overview</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <StatMetricCard 
              title="File Name" 
              value={preview.filename} 
              icon={FileTextIcon} 
              colorClass="text-blue-400" 
              description={preview.file_type.toUpperCase()} 
            />
            <StatMetricCard 
              title="Total Rows" 
              value={preview.row_count.toLocaleString()} 
              icon={Table} 
              colorClass="text-emerald-400" 
              onClick={() => setActiveDrilldown({
                type: "rows",
                title: "Record Drilldown",
                payload: preview.full_data
              })}
            />
            <StatMetricCard 
              title="Total Columns" 
              value={preview.column_count} 
              icon={Database} 
              colorClass="text-purple-400" 
              onClick={() => setActiveDrilldown({
                type: "columns",
                title: "Attribute Inventory",
                payload: preview.dtypes
              })}
            />
            <StatMetricCard 
              title="Missing Values" 
              value={totalMissing} 
              icon={AlertCircle} 
              colorClass="text-amber-400" 
              onClick={() => setActiveDrilldown({
                type: "missing",
                title: "Information Gaps",
                payload: allIssues.filter((i:any) => i.issue === "Missing Values")
              })}
            />
            <StatMetricCard 
              title="Duplicate Rows" 
              value={totalDuplicates} 
              icon={Search} 
              colorClass="text-red-400" 
              onClick={() => setActiveDrilldown({
                type: "duplicates",
                title: "Redundancy Analysis",
                payload: allIssues.find((i:any) => i.issue === "Duplicate Rows") || { count: 0 }
              })}
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 items-start">
             <HealthScoreCard 
               score={repairData.health_score || 0} 
               onClick={() => setHealthModalOpen(true)} 
               metrics={qualityData || undefined}
             />
             {qualityData && <DatasetQualityRadar metrics={qualityData} onMetricClick={handleMetricClick} />}
          </div>
        </section>

        {/* SECTION 2: DATA QUALITY DIAGNOSTICS */}
        <section>
          <div className="flex items-center gap-3 border-b border-amber-500/20 pb-4 mb-6">
            <Search className="w-6 h-6 text-amber-500" />
            <h2 className="text-2xl font-bold text-white tracking-wide">2. Quality Diagnostics</h2>
          </div>
          
          <div className="space-y-4">
            {allIssues.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allIssues.map((issue: any, idx: number) => (
                  <DataIssueCard 
                    key={idx} 
                    column={issue.column} 
                    issueType={`${issue.issue} (${issue.count} affected)`} 
                    severity={issue.severity} 
                    description={issue.details || "Detected structure vulnerability capable of distorting algorithms."}
                  />
                ))}
              </div>
            ) : (
              <div className="p-8 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
                <Target className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-white">No Structural Issues Found</h3>
                <p className="text-emerald-200/70">The dataset passes all baseline diagnostic checks.</p>
              </div>
            )}
          </div>
        </section>
      </motion.div>

      {/* DATA DRILLDOWN MODAL SYSTEM */}
      {activeDrilldown && (
        <DataDrilldownModal
          open={!!activeDrilldown}
          title={activeDrilldown.title}
          type={activeDrilldown.type}
          data={activeDrilldown.payload}
          onClose={() => setActiveDrilldown(null)}
        />
      )}

      {/* HEALTH DETAIL MODAL SYSTEM */}
      <HealthDetailModal
        open={healthModalOpen}
        onClose={() => setHealthModalOpen(false)}
        preview={preview}
        repairData={repairData}
        qualityData={qualityData}
      />

      {/* QUALITY METRIC DATA INSPECTION MODAL */}
      <QualityMetricDataModal
        open={!!activeQualityMetric}
        onClose={() => setActiveQualityMetric(null)}
        metricName={activeQualityMetric}
        score={(activeQualityMetric && qualityData) ? (qualityData as any)[activeQualityMetric.toLowerCase().replace(" ", "_")] : 0}
        preview={preview}
        repairData={repairData}
      />

      {/* GENERAL MODAL SYSTEM (Legacy/Fallback) */}
      {modalContent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl transition-all">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-8 py-6 border-b border-white/5">
              <h3 className="text-xl font-black text-white italic">{modalContent.title}</h3>
              <button onClick={() => setModalContent(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            <div className="px-8 py-8">{modalContent.content}</div>
            <div className="px-8 py-6 bg-black/20 border-t border-white/5 flex justify-end">
              <button 
                onClick={() => setModalContent(null)}
                className="px-8 py-3 bg-indigo-500 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-indigo-600 transition-all"
              >
                Understood
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AnalyzePage;
