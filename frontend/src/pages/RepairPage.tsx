import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Wrench, Stethoscope } from "lucide-react";
import { motion } from "framer-motion";
import * as api from "../services/api";
import { useDatasetContext } from "../context/DatasetContext";
import { RepairSuggestionCard } from "../components/RepairSuggestionCard";
import { RepairSimulationPanel, type SimulationData } from "../components/RepairSimulationPanel";
import { RepairTracePanel, type RepairTraceData } from "../components/RepairTracePanel";
import { StrategyComparisonPanel, type StrategyComparisonData } from "../components/StrategyComparisonPanel";
import { VersionHistoryPanel } from "../components/VersionHistoryPanel";

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
  const [simOpen, setSimOpen] = useState(false);
  const [simData, setSimData] = useState<SimulationData | null>(null);
  const [traceData, setTraceData] = useState<RepairTraceData | null>(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareData, setCompareData] = useState<StrategyComparisonData | null>(null);

  const handlePreviewFix = async (column: string, strategy: string) => {
    if (!datasetId) return;
    setSubmitting(true);
    try {
       const [result, traceResult] = await Promise.all([
          api.simulateRepair(datasetId, column, strategy),
          api.getRepairTrace(datasetId, column, strategy)
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
    const targetCol = column || simData?.column;
    const targetStrat = strategy || simData?.strategy;
    
    if (!datasetId || !targetCol || !targetStrat) return;
    
    setSubmitting(true);
    try {
      const result = await api.applyRepair(datasetId, targetCol, targetStrat);
      setSimOpen(false);
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

  return (
    <div className="py-8 space-y-12 transition-all">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
        {/* SECTION 3: REPAIR RECOMMENDATIONS */}
        <section>
          <div className="flex items-center gap-3 border-b border-indigo-500/20 pb-4 mb-6">
            <Wrench className="w-6 h-6 text-indigo-400" />
            <h2 className="text-2xl font-bold text-white tracking-wide">Data Repair Laboratory</h2>
          </div>
          
          {allRecommendations.length > 0 ? (
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
          ) : (
            <div className="p-12 bg-emerald-500/5 border border-emerald-500/10 rounded-[2rem] text-center">
              <h3 className="text-xl font-bold text-white mb-2">Workspace Clean</h3>
              <p className="text-slate-400">No automated repair recommendations for this dataset version.</p>
            </div>
          )}
        </section>

        {/* SECTION: DIAGNOSTIC TRACE & HISTORY */}
        <section>
           <h2 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-2">Forensic Trace & Version History</h2>
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
               <div className="bg-slate-900 border border-indigo-500/20 rounded-2xl p-6 w-full flex flex-col shadow-xl relative min-h-[400px]">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full"></div>
                  <div className="flex items-center gap-3 border-b border-indigo-500/20 pb-3 mb-4 relative z-10">
                     <span className="text-xl font-bold text-white tracking-wide">Algorithmic Repair Trajectory</span>
                  </div>
                  {traceData ? (
                    <RepairTracePanel trace={traceData} />
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 mt-12 bg-black/20 rounded-xl border border-white/5">
                        <Stethoscope className="w-12 h-12 text-indigo-400 mb-4 opacity-60" />
                        <p className="text-slate-400">Select a recommended strategy and click "Preview Fix" to generate a detailed transparent algorithmic trace.</p>
                    </div>
                  )}
               </div>
               <VersionHistoryPanel datasetId={Number(datasetId)} currentFilename={preview.filename} />
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
           handlePreviewFix(compareData!.column, strategy);
        }}
        onApply={(strategy: string) => {
           handleApplyFinal(compareData!.column, strategy);
        }}
        isLoading={submitting}
      />
    </div>
  );
};

export default RepairPage;
