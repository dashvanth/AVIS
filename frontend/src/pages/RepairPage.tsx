import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Wrench, Stethoscope, Activity, Target, AlertCircle, ShieldAlert, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as api from "../services/api";
import { useDatasetContext } from "../context/DatasetContext";
import { RepairSuggestionCard } from "../components/RepairSuggestionCard";
import { RepairSimulationPanel, type SimulationData } from "../components/RepairSimulationPanel";
import { RepairTracePanel, type RepairTraceData } from "../components/RepairTracePanel";
import { StrategyComparisonPanel, type StrategyComparisonData } from "../components/StrategyComparisonPanel";
import { VersionHistoryPanel } from "../components/VersionHistoryPanel";
import { BeforeAfterTable } from "../components/BeforeAfterTable";
import { DistributionComparisonChart } from "../components/DistributionComparisonChart";

const RepairPage: React.FC = () => {
  const { 
    datasetId, 
    loading, 
    error, 
    preview, 
    repairData, 
    refreshData 
  } = useDatasetContext();
  
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [activeSimulation, setActiveSimulation] = useState<SimulationData | null>(null);
  const [activeTrace, setActiveTrace] = useState<RepairTraceData | null>(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareData, setCompareData] = useState<StrategyComparisonData | null>(null);
  const [visibleRecommendations, setVisibleRecommendations] = useState(2);

  const handlePreviewFix = async (column: string, strategy: string) => {
    if (!datasetId) return;
    setSubmitting(true);
    try {
       const [result, traceResult] = await Promise.all([
          api.simulateRepair(datasetId, column, strategy),
          api.getRepairTrace(datasetId, column, strategy)
       ]);
       setActiveSimulation(result);
       setActiveTrace(traceResult);
       
       // Smooth scroll to simulation results
       setTimeout(() => {
         document.getElementById('simulation-engine')?.scrollIntoView({ behavior: 'smooth' });
       }, 100);
    } catch (e: any) {
       console.error("Preview Fix Error:", e);
       alert("Failed to simulate repair strategy.");
    } finally {
       setSubmitting(false);
    }
  };

  const handleCompareStrategies = async (column: string) => {
    if (!datasetId) return;
    setSubmitting(true);
    try {
      const result = await api.compareStrategies(datasetId, column);
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
    const targetCol = column || activeSimulation?.column;
    const targetStrat = strategy || activeSimulation?.strategy;
    
    if (!datasetId || !targetCol || !targetStrat) return;
    
    setSubmitting(true);
    try {
      const result = await api.applyRepair(datasetId, targetCol, targetStrat);
      setActiveSimulation(null);
      // After repair, navigate to the NEW dataset analyze page
      navigate(`/dashboard/${result.new_dataset_id}/analyze`);
    } catch (err: any) {
      console.error("Apply Fix Error:", err);
      alert("Failed to apply repair strategy physically.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;
  if (error || !preview || !repairData) return null;

  const allRecommendations = repairData.recommendations || [];
  const allIssues = repairData.issues || [];

  return (
    <div className="py-8 space-y-16 transition-all selection:bg-indigo-500/30">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-16">
        
        {/* SECTION 1: REPAIR CONTEXT SUMMARY */}
        <section className="bg-slate-900/40 border border-white/5 p-10 rounded-[3rem] backdrop-blur-3xl relative overflow-hidden">
           <div className="absolute top-0 right-0 p-10 opacity-5">
              <ShieldAlert className="w-48 h-48" />
           </div>
           <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <Target className="w-6 h-6 text-indigo-400" />
                <h2 className="text-sm font-black text-slate-500 uppercase tracking-[0.4em]">Section 01: Audit Context</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-500 uppercase">Total Detected Vulnerabilities</span>
                  <p className="text-3xl font-black text-white italic">{allIssues.length}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-500 uppercase">Missing Data Saturation</span>
                  <p className="text-3xl font-black text-white italic">
                    {allIssues.filter((i:any) => i.issue.toLowerCase().includes('missing')).reduce((a:any,b:any) => a + b.count, 0)} Cells
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-500 uppercase">Redundancy Profile</span>
                  <p className="text-3xl font-black text-white italic">
                    {allIssues.find((i:any) => i.issue.toLowerCase().includes('duplicate'))?.count || 0} Records
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-500 uppercase">Compromised Attributes</span>
                  <p className="text-3xl font-black text-indigo-400 italic">
                    {new Set(allIssues.map((i:any) => i.column)).size} Columns
                  </p>
                </div>
              </div>
           </div>
        </section>

        {/* SECTION 2: REPAIR RECOMMENDATIONS */}
        <section>
          <div className="flex items-center gap-3 border-b border-indigo-500/20 pb-6 mb-8">
            <Wrench className="w-7 h-7 text-indigo-400" />
            <div className="flex-1">
              <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Recommended Fixes</h2>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Algorithmic selection based on structural diagnostics</p>
            </div>
          </div>
          
          {allRecommendations.length > 0 ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {allRecommendations.slice(0, visibleRecommendations).map((rec: any, idx: number) => (
                  <RepairSuggestionCard 
                    key={idx}
                    column={rec.column}
                    issue={rec.issue}
                    confidenceScore={rec.confidence_score}
                    recommendedStrategy={rec.recommended_strategy}
                    explanation={rec.explanation}
                    isLoading={submitting}
                    impactPercentage={((allIssues.find((i:any) => i.column === rec.column && i.issue === rec.issue)?.count || 0) / preview.row_count * 100).toFixed(1)}
                    onPreview={() => handlePreviewFix(rec.column, rec.recommended_strategy)}
                    onApply={() => handleApplyFinal(rec.column, rec.recommended_strategy)}
                  />
                ))}
              </div>

              {allRecommendations.length > visibleRecommendations && (
                <div className="flex justify-center pt-4">
                   <button 
                      onClick={() => setVisibleRecommendations(prev => prev + 2)}
                      className="group flex flex-col items-center gap-3 transition-all"
                   >
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] group-hover:text-indigo-400 transition-colors">
                        Expand Repair Protocols ({allRecommendations.length - visibleRecommendations} Remaining)
                      </span>
                      <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:border-indigo-500/50 group-hover:bg-indigo-500/10 transition-all">
                         <ChevronDown className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-y-0.5 transition-all" />
                      </div>
                   </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-16 bg-emerald-500/5 border border-emerald-500/10 rounded-[3rem] text-center backdrop-blur-md">
              <h3 className="text-2xl font-black text-white italic mb-2 uppercase tracking-tighter">Workspace Integrity Confirmed</h3>
              <p className="text-slate-400 font-medium">No automated repair protocols recommended for this dataset version.</p>
            </div>
          )}
        </section>

        {/* SECTION 3: SIMULATION ENGINE (DETERMINISTIC FORENSICS) */}
        <AnimatePresence>
          {activeSimulation && (
             <motion.section 
               id="simulation-engine"
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="space-y-10"
             >
                <div className="flex items-center gap-3 border-b border-amber-500/20 pb-6 mb-8">
                  <Activity className="w-7 h-7 text-amber-500" />
                  <div className="flex-1">
                    <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Forensic Simulation Engine</h2>
                    <p className="text-xs text-amber-500 font-bold uppercase tracking-widest mt-1">Impact Analysis: {activeSimulation.strategy} on '{activeSimulation.column}'</p>
                  </div>
                  <button 
                    onClick={() => setActiveSimulation(null)}
                    className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest bg-white/5 px-4 py-2 rounded-xl transition-all"
                  >
                    Clear Results
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                   {/* Summary Metrics Table */}
                   <div className="lg:col-span-5 space-y-6">
                      <div className="bg-slate-900 border border-white/5 rounded-[3rem] p-10 shadow-2xl">
                         <h4 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-8">Statistical Delta Analysis</h4>
                         <div className="space-y-6">
                            <div className="flex items-center justify-between border-b border-white/5 pb-4">
                               <span className="text-[10px] font-black text-slate-500 uppercase">Metric Parameter</span>
                               <div className="flex gap-16 text-[10px] font-black text-slate-500 uppercase pr-4">
                                  <span>Original</span>
                                  <span>Repaired</span>
                               </div>
                            </div>
                            <SimMetricRow label="Missing Records" before={activeSimulation.missing_before} after={activeSimulation.missing_after} highlight={true} />
                            <SimMetricRow label="Mean (Average)" before={activeSimulation.mean_before?.toFixed(2) || 'N/A'} after={activeSimulation.mean_after?.toFixed(2) || 'N/A'} />
                            <SimMetricRow label="Projected Health" before={activeSimulation.health_score_before + '%'} after={activeSimulation.health_score_after + '%'} highlight={true} />
                            <SimMetricRow label="Information Loss" before="0.0%" after={(activeSimulation.information_loss || 0).toFixed(2) + '%'} />
                         </div>
                      </div>

                      {activeTrace && (
                         <div className="bg-black/20 border border-white/5 rounded-[3rem] p-10">
                            <h4 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                               <Stethoscope className="w-4 h-4 text-indigo-400" /> Algorithmic Repair Trace
                            </h4>
                            <RepairTracePanel trace={activeTrace} />
                         </div>
                      )}
                   </div>

                   {/* Distribution Comparison */}
                   <div className="lg:col-span-7 bg-slate-900/50 border border-white/5 rounded-[3rem] p-10 min-h-[500px] flex flex-col">
                      <div className="mb-6">
                        <h4 className="text-xs font-black text-white uppercase tracking-[0.3em]">Distribution Shift Visualization</h4>
                      </div>
                      <div className="flex-1">
                         {activeSimulation.histogram_before && activeSimulation.histogram_after && activeSimulation.histogram_bins && (
                            <DistributionComparisonChart 
                               histogramBefore={activeSimulation.histogram_before}
                               histogramAfter={activeSimulation.histogram_after}
                               bins={activeSimulation.histogram_bins}
                               columnName={activeSimulation.column}
                            />
                         )}
                      </div>
                   </div>
                </div>

                {/* SECTION 4: BEFORE VS AFTER DATA (TRANSFORMATION PROOF) */}
                <BeforeAfterTable 
                  originalRows={preview.full_data}
                  transformedRows={activeSimulation.transformed_rows || preview.full_data}
                  column={activeSimulation.column}
                />

                <div className="flex justify-center pt-8">
                   <button 
                      onClick={() => handleApplyFinal()}
                      disabled={submitting}
                      className="px-20 py-6 bg-indigo-500 hover:bg-indigo-600 text-white font-black text-sm uppercase tracking-[0.4em] rounded-[2rem] shadow-2xl shadow-indigo-500/40 transition-all active:scale-95"
                   >
                      {submitting ? "Finalizing Transformation..." : "Confirm & Commit Repair"}
                   </button>
                </div>
             </motion.section>
          )}
        </AnimatePresence>

        {/* SECTION 5: VERSION HISTORY */}
        <section>
           <div className="flex items-center gap-3 border-b border-indigo-500/20 pb-6 mb-8">
             <Activity className="w-7 h-7 text-indigo-400" />
             <div className="flex-1">
               <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Dataset Lineage</h2>
               <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Version control and restoration portal</p>
             </div>
           </div>
           <div className="max-w-4xl">
              <VersionHistoryPanel datasetId={Number(datasetId)} currentFilename={preview.filename} />
           </div>
        </section>
      </motion.div>
    </div>
  );
};

/* Helper Component for Simulation Metrics */
const SimMetricRow = ({ label, before, after, highlight = false }: { label: string, before: any, after: any, highlight?: boolean }) => {
  const isChanged = before !== after;
  return (
    <div className="flex items-center justify-between py-2 group">
      <span className="text-xs font-medium text-slate-400 group-hover:text-slate-200 transition-colors">{label}</span>
      <div className="flex items-center gap-8">
        <span className="text-sm font-mono text-slate-500">{before}</span>
        <ArrowRight className={`w-4 h-4 ${isChanged ? "text-amber-500 animate-pulse" : "text-slate-700 opacity-20"}`} />
        <span className={`text-sm font-mono font-black ${isChanged ? (highlight ? "text-emerald-400" : "text-amber-400") : "text-slate-300"}`}>
          {after}
        </span>
      </div>
    </div>
  );
};

const ArrowRight = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
  </svg>
);

export default RepairPage;
