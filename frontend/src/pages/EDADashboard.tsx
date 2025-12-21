import React, { useEffect, useState } from "react";
import { Loader2, Info, Microscope, ShieldCheck } from "lucide-react";
import type { EDASummary } from "../types";
import * as api from "../services/api";
import SummaryStats from "../components/eda/SummaryStats";
import CorrelationMatrix from "../components/eda/CorrelationMatrix";

interface EDADashboardProps {
  datasetId: number;
}

const EDADashboard: React.FC<EDADashboardProps> = ({ datasetId }) => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<EDASummary | null>(null);
  const [correlation, setCorrelation] = useState<any[]>([]);
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
      } catch (err) {
        setError(
          "Statistical Engine Handshake Failed. Verify backend connection."
        );
      } finally {
        setLoading(false);
      }
    };
    if (datasetId) fetchData();
  }, [datasetId]);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-32 bg-avis-primary">
        <Loader2 className="w-12 h-12 text-avis-accent-indigo animate-spin mb-6" />
        <p className="text-avis-text-secondary font-black uppercase tracking-[0.3em] text-xs">
          Computing Relational Metrics...
        </p>
      </div>
    );

  return (
    <div className="max-w-[1600px] mx-auto px-8 py-10 space-y-10 bg-avis-primary min-h-screen">
      <div className="flex justify-between items-end border-b border-avis-border pb-8">
        <div>
          <div className="flex items-center gap-2 text-avis-accent-indigo text-[10px] font-black uppercase tracking-widest mb-2">
            <Microscope className="w-3 h-3" /> Step-by-Step Analysis
          </div>
          <h2 className="text-4xl font-black text-white tracking-tighter">
            Exploratory Audit
          </h2>
        </div>
        <div className="flex gap-4">
          <div className="px-4 py-2 bg-avis-secondary border border-avis-border rounded-xl flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-avis-accent-success" />
            <span className="text-[10px] font-bold text-white uppercase">
              Schema Verified
            </span>
          </div>
        </div>
      </div>

      {summary && (
        <div className="space-y-6">
          <div className="bg-avis-accent-indigo/5 border border-avis-accent-indigo/20 p-4 rounded-2xl flex items-start gap-4">
            <Info className="w-5 h-5 text-avis-accent-indigo shrink-0 mt-1" />
            <p className="text-xs text-avis-text-secondary leading-relaxed">
              <span className="text-white font-bold">Backend Step:</span> We
              automatically separated your {summary.total_columns} columns into
              Numeric and Categorical groups to apply appropriate statistical
              functions.
            </p>
          </div>
          <SummaryStats
            numeric={summary.numeric}
            categorical={summary.categorical}
            totalRows={summary.total_rows}
            totalColumns={summary.total_columns}
          />
        </div>
      )}

      {correlation && correlation.length > 0 && (
        <div className="space-y-6">
          <div className="bg-avis-accent-cyan/5 border border-avis-accent-cyan/20 p-4 rounded-2xl flex items-start gap-4">
            <Microscope className="w-5 h-5 text-avis-accent-cyan shrink-0 mt-1" />
            <p className="text-xs text-avis-text-secondary leading-relaxed">
              <span className="text-white font-bold">
                Relationship Discovery:
              </span>{" "}
              The system computed a Pearson Correlation matrix to identify
              linear dependencies between variables.
            </p>
          </div>
          <CorrelationMatrix data={correlation} />
        </div>
      )}
    </div>
  );
};

export default EDADashboard;
