import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  Table,
  Database,
  Search,
  Calculator,
  ShieldAlert,
  Activity,
  Stethoscope,
  Wrench,
  BarChart,
  Target,
  Sparkles,
  Info,
  X,
  FileText as FileTextIcon,
  MessageSquarePlus
} from "lucide-react";
import { motion } from "framer-motion";

import * as api from "../services/api";
import { useChat } from "../context/ChatContext";
import type {
  EDASummary,
  CorrelationData,
  PreviewData,
  PreparationSuggestions
} from "../types";

import { StatMetricCard } from "../components/StatMetricCard";
import { DataIssueCard } from "../components/DataIssueCard";
import { RepairSuggestionCard } from "../components/RepairSuggestionCard";
import { HealthScoreCard } from "../components/HealthScoreCard";
import { RepairSimulationPanel, type SimulationData } from "../components/RepairSimulationPanel";
import { RepairTracePanel, type RepairTraceData } from "../components/RepairTracePanel";
import { StrategyComparisonPanel, type StrategyComparisonData } from "../components/StrategyComparisonPanel";
import { DatasetQualityRadar, type QualityMetrics } from "../components/DatasetQualityRadar";
import { VersionHistoryPanel } from "../components/VersionHistoryPanel";
import DataPreviewTable from "../components/DataPreviewTable";

const AnalysisLab: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [summary, setSummary] = useState<EDASummary | null>(null);
  const [correlation, setCorrelation] = useState<CorrelationData | null>(null);
  const [repairData, setRepairData] = useState<any>(null);
  const [qualityData, setQualityData] = useState<QualityMetrics | null>(null);

  const [simOpen, setSimOpen] = useState(false);
  const [simData, setSimData] = useState<SimulationData | null>(null);
  const [traceData, setTraceData] = useState<RepairTraceData | null>(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareData, setCompareData] = useState<StrategyComparisonData | null>(null);

  const [showAllCategories, setShowAllCategories] = useState(false);
  const [modalContent, setModalContent] = useState<{ title: string, content: React.ReactNode } | null>(null);

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

  const handleStatClick = (type: string) => {
    if (!preview || !summary || !repairData) return;
    
    let title = "";
    let content: React.ReactNode = null;

    switch (type) {
      case "rows":
        title = "Record Inventory (Rows)";
        content = (
          <div className="space-y-4">
            <p className="text-sm text-slate-400">Your dataset has <b className="text-white">{preview.row_count}</b> total records. Each record represents one unique entry in your database.</p>
            <div className="bg-black/20 rounded-xl p-4 border border-white/5">
              <h4 className="text-xs font-bold text-indigo-400 uppercase mb-2">Live Preview (Top 5 Records)</h4>
              <DataPreviewTable datasetId={Number(id)} />
            </div>
          </div>
        );
        break;
      case "columns":
        title = "Attribute Inventory (Columns)";
        content = (
          <div className="space-y-4">
            <p className="text-sm text-slate-400">Total of <b className="text-white">{preview.column_count}</b> columns detected. Here is the structure:</p>
            <div className="grid grid-cols-2 gap-2">
              {[...summary.numeric, ...summary.categorical].map((c, i) => (
                <div key={i} className="flex justify-between items-center bg-white/5 p-2 rounded border border-white/5">
                  <span className="text-xs text-white truncate max-w-[150px]">{c.column}</span>
                  <span className="text-[10px] text-slate-500 uppercase">{(c as any).mean !== undefined ? 'Numeric' : 'Label'}</span>
                </div>
              ))}
            </div>
          </div>
        );
        break;
      case "missing":
        title = "Data Voids (Missing Values)";
        const missingCountTotal = allIssues.filter((i:any) => i.issue === "Missing Values").reduce((a:any,b:any) => a + b.count, 0);
        content = (
          <div className="space-y-4">
            <div className="text-center p-6 bg-amber-500/10 rounded-2xl border border-amber-500/20">
              <p className="text-3xl font-black text-amber-400">{missingCountTotal}</p>
              <p className="text-xs text-amber-500 uppercase tracking-widest font-bold">Total Empty Cells</p>
            </div>
            <p className="text-sm text-slate-400">Missing values occur when information was not recorded. We found them in these columns:</p>
            <ul className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
              {allIssues.filter((i:any) => i.issue === "Missing Values").map((iss: any, i: number) => (
                <li key={i} className="flex justify-between items-center bg-white/5 p-2 rounded">
                  <span className="text-xs text-white">{iss.column}</span>
                  <span className="text-xs text-amber-400">{iss.count} gaps</span>
                </li>
              ))}
            </ul>
          </div>
        );
        break;
      case "duplicates":
        title = "Redundancy (Duplicate Rows)";
        const dupCountTotal = allIssues.find((i:any) => i.issue === "Duplicate Rows")?.count || 0;
        content = (
          <div className="space-y-4">
            <div className="text-center p-6 bg-red-500/10 rounded-2xl border border-red-500/20">
              <p className="text-3xl font-black text-red-400">{dupCountTotal}</p>
              <p className="text-xs text-red-500 uppercase tracking-widest font-bold">Identical Records</p>
            </div>
            <p className="text-sm text-slate-400">Duplicates are identical rows that can bias your analysis results. We recommend removing them to ensure statistical accuracy.</p>
          </div>
        );
        break;
    }

    setModalContent({ title, content });
  };

  const handleMetricClick = (metricName: string) => {
    if (!qualityData) return;

    let title = `${metricName} Deep Dive`;
    let content: React.ReactNode = null;
    const score = (qualityData as any)[metricName.toLowerCase().replace(" ", "_")];

    switch (metricName) {
      case "Completeness":
        content = (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20">
              <span className="text-sm font-bold text-emerald-400 uppercase">Integrity Score</span>
              <span className="text-2xl font-black text-white">{score}%</span>
            </div>
            <p className="text-sm text-slate-400">
              Completeness measures the presence of data across all registered fields. 
              A 100% score means every single cell in your dataset has a value.
            </p>
          </div>
        );
        break;
      case "Consistency":
        content = (
          <div className="space-y-4">
             <div className="flex items-center justify-between bg-indigo-500/10 p-4 rounded-2xl border border-indigo-500/20">
              <span className="text-sm font-bold text-indigo-400 uppercase">Pattern Score</span>
              <span className="text-2xl font-black text-white">{score}%</span>
            </div>
            <p className="text-sm text-slate-400">
              Consistency checks if the data types and formats are uniform. 
            </p>
          </div>
        );
        break;
      case "Uniqueness":
        content = (
          <div className="space-y-4">
             <div className="flex items-center justify-between bg-purple-500/10 p-4 rounded-2xl border border-purple-500/20">
              <span className="text-sm font-bold text-purple-400 uppercase">Diversity Score</span>
              <span className="text-2xl font-black text-white">{score}%</span>
            </div>
            <p className="text-sm text-slate-400">
              Uniqueness ensures your dataset isn't bloated with redundant copies.
            </p>
          </div>
        );
        break;
    }

    setModalContent({ title, content });
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const [previewData, summaryData, corrData, repairInfo, qualityInfo] = await Promise.all([
          api.getDatasetPreview(Number(id)),
          api.getEDASummary(Number(id)),
          api.getCorrelationMatrix(Number(id)),
          api.getRepairRecommendations(Number(id)),
          api.getDatasetQuality(Number(id))
        ]);

        setPreview(previewData);
        setSummary(summaryData);
        setCorrelation(corrData);
        setRepairData(repairInfo);
        setQualityData(qualityInfo);

        setQualityData(qualityInfo);
      } catch (err: any) {
        console.error("AnalysisLab Fetch Error:", err);
        setError("Unable to initialize Analysis Lab workspace.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handlePreviewFix = async (column: string, strategy: string) => {
    if (!id) return;
    setSubmitting(true);
    try {
       const [result, traceResult] = await Promise.all([
          api.simulateRepair(Number(id), column, strategy),
          api.getRepairTrace(Number(id), column, strategy)
       ]);
       setSimData(result);
       setTraceData(traceResult);
       setSimOpen(true);
    } catch (e: any) {
       console.error("Preview Fix Error:", e);
       alert("Failed to simulate repair strategy.");
    } finally {
       setSubmitting(false);
    }
  };

  const handleCompareStrategies = async (column: string) => {
    if (!id) return;
    setSubmitting(true);
    try {
      const result = await api.compareStrategies(Number(id), column);
      setCompareData(result);
      setCompareOpen(true);
    } catch (e: any) {
      console.error("Comparison Error:", e);
      alert("Failed to compare strategies.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApplyFinal = async (column?: string, strategy?: string) => {
    // Determine target from function args, or default to simData
    const targetCol = column || simData?.column;
    const targetStrat = strategy || simData?.strategy;
    
    if (!id || !targetCol || !targetStrat) return;
    
    setSubmitting(true);
    try {
      const result = await api.applyRepair(Number(id), targetCol, targetStrat);
      setSimOpen(false);
      navigate(`/dashboard/${result.new_dataset_id}/analyze`);
    } catch (err: any) {
      console.error("Apply Fix Error:", err);
      alert("Failed to apply repair strategy physically.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950">
        <Loader2 className="w-16 h-16 text-indigo-500 animate-spin relative z-10" />
        <p className="text-slate-400 font-mono text-sm mt-6 animate-pulse tracking-widest">INITIALIZING ANALYSIS LAB...</p>
      </div>
    );
  }

  if (error || !preview || !summary || !repairData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 p-6">
        <div className="bg-red-500/10 border border-red-500/20 p-10 rounded-3xl max-w-lg text-center backdrop-blur-xl">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-wide">Workspace Error</h3>
          <p className="text-slate-400 mb-8 leading-relaxed">{error}</p>
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const allIssues = repairData.issues || [];
  const allRecommendations = repairData.recommendations || [];

  const { setCurrentContext, triggerMessage } = useChat();

  useEffect(() => {
     if (repairData && preview) {
         setCurrentContext({
             healthScore: repairData.health_score,
             issueCount: allIssues.length,
             datasetName: preview.filename,
             context: "Intelligence Workspace"
         });
     }
  }, [repairData, preview, allIssues.length, setCurrentContext]);

  return (
    <div className="py-8 space-y-12 transition-all">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-12">
        
        {/* NEW: DATASET NARRATIVE */}
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
            <StatMetricCard title="File Name" value={preview.filename} icon={FileTextIcon} colorClass="text-blue-400" description={preview.file_type.toUpperCase()} />
            <div onClick={() => handleStatClick('rows')} className="cursor-pointer transition-transform hover:scale-[1.02]">
              <StatMetricCard title="Total Rows" value={preview.row_count.toLocaleString()} icon={Table} colorClass="text-emerald-400" />
            </div>
            <div onClick={() => handleStatClick('columns')} className="cursor-pointer transition-transform hover:scale-[1.02]">
              <StatMetricCard title="Total Columns" value={preview.column_count} icon={Database} colorClass="text-purple-400" />
            </div>
            <div onClick={() => handleStatClick('missing')} className="cursor-pointer transition-transform hover:scale-[1.02]">
              <StatMetricCard title="Missing Values" value={allIssues.filter((i:any) => i.issue === "Missing Values").reduce((a:any,b:any) => a + b.count, 0)} icon={AlertCircle} colorClass="text-amber-400" />
            </div>
            <div onClick={() => handleStatClick('duplicates')} className="cursor-pointer transition-transform hover:scale-[1.02]">
              <StatMetricCard title="Duplicate Rows" value={allIssues.find((i:any) => i.issue === "Duplicate Rows")?.count || 0} icon={Search} colorClass="text-red-400" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
             <HealthScoreCard score={repairData.health_score || 0} />
             {qualityData && <DatasetQualityRadar metrics={qualityData} onMetricClick={handleMetricClick} />}
          </div>
          
        <div className="mt-8">
          <h2 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-2">Diagnostic Trace Logs</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              <div className="bg-slate-900 border border-indigo-500/20 rounded-2xl p-6 w-full flex flex-col mt-6 shadow-xl relative min-h-[400px]">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full"></div>
                 <div className="flex items-center gap-3 border-b border-indigo-500/20 pb-3 mb-4 relative z-10">
                    <span className="text-xl font-bold text-white tracking-wide">Algorithmic Repair Trajectory</span>
                 </div>
                 {traceData ? (
                   <RepairTracePanel trace={traceData} />
                 ) : (
                   <div className="flex-1 flex flex-col items-center justify-center text-center p-8 mt-12 bg-black/20 rounded-xl border border-white/5">
                       <Stethoscope className="w-12 h-12 text-indigo-400 mb-4 opacity-60" />
                       <p className="text-slate-400">Select a recommended strategy below and click "Preview Fix" to generate a detailed transparent algorithmic trace.</p>
                   </div>
                 )}
              </div>
              <VersionHistoryPanel datasetId={Number(id)} currentFilename={preview?.filename || "dataset.csv"} />
          </div>
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
                    count={issue.count}
                    totalRows={preview.row_count}
                  />
                ))}
              </div>
            ) : (
              <div className="p-8 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-white">No Structural Issues Found</h3>
                <p className="text-emerald-200/70">The dataset passes all baseline diagnostic checks.</p>
              </div>
            )}
          </div>
        </section>

        {/* SECTION 3: REPAIR RECOMMENDATIONS */}
        {allRecommendations.length > 0 && (
          <section>
            <div className="flex items-center gap-3 border-b border-indigo-500/20 pb-4 mb-6">
              <Wrench className="w-6 h-6 text-indigo-400" />
              <h2 className="text-2xl font-bold text-white tracking-wide">3. Intelligent Repair Recommendations</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {allRecommendations.map((rec: any, idx: number) => (
                <RepairSuggestionCard 
                  key={idx}
                  column={rec.column}
                  issue={rec.issue}
                  confidenceScore={rec.confidence_score}
                  recommendedStrategy={rec.recommended_strategy}
                  explanation={rec.explanation}
                  isLoading={submitting}
                  onCompare={() => handleCompareStrategies(rec.column)}
                  onPreview={() => handlePreviewFix(rec.column, rec.recommended_strategy)}
                  onApply={() => handleApplyFinal(rec.column, rec.recommended_strategy)}
                />
              ))}
            </div>
          </section>
        )}

        {/* SECTION 4: STATISTICAL ANALYSIS */}
        <section>
          <div className="flex items-center gap-3 border-b border-purple-500/20 pb-4 mb-6">
            <BarChart className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white tracking-wide">4. Statistical Engine</h2>
          </div>

          <div className="space-y-8">
            {/* Numeric Spread */}
            {summary.numeric.length > 0 && (
              <div className="bg-slate-900/60 border border-white/5 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Calculator className="w-4 h-4 text-purple-400" /> Numeric Distributions</h3>
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
                          <td className="px-6 py-4 text-amber-400/80 font-mono">{col.skew}</td>
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
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Database className="w-4 h-4 text-indigo-400" /> Categorical Frequencies</h3>
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
          </div>
        </section>

      </motion.div>

      {/* MODAL SIMULATION PORTAL */}
      <RepairSimulationPanel 
        isOpen={simOpen}
        data={simData}
        traceData={traceData}
        onClose={() => setSimOpen(false)}
        onApply={() => handleApplyFinal()}
        isApplying={submitting}
      />

      <StrategyComparisonPanel
        isOpen={compareOpen}
        onClose={() => setCompareOpen(false)}
        data={compareData}
        onPreview={(strategy: string) => {
           setCompareOpen(false);
           if (compareData) handlePreviewFix(compareData.column, strategy);
        }}
        onApply={(strategy: string) => {
           if (compareData) handleApplyFinal(compareData.column, strategy);
        }}
        isLoading={submitting}
      />

      {/* MODAL SYSTEM (from Overview) */}
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

export default AnalysisLab;
