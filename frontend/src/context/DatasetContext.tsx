import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import * as api from "../services/api";
import type { PreviewData, EDASummary, CorrelationData } from "../types";
import type { QualityMetrics } from "../components/DatasetQualityRadar";

interface DatasetContextValue {
  datasetId: number | null;
  loading: boolean;
  error: string | null;

  preview: PreviewData | null;
  summary: EDASummary | null;
  correlation: CorrelationData | null;
  repairData: any | null;
  qualityData: QualityMetrics | null;
  timelineData: any[];

  refreshData: () => Promise<void>;
}

const DatasetContext = createContext<DatasetContextValue | undefined>(undefined);

export const useDatasetContext = () => {
  const context = useContext(DatasetContext);
  if (!context) {
    throw new Error("useDatasetContext must be used within a DatasetProvider");
  }
  return context;
};

interface DatasetProviderProps {
  id: string | undefined;
  children: ReactNode;
}

export const DatasetProvider: React.FC<DatasetProviderProps> = ({ id, children }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [summary, setSummary] = useState<EDASummary | null>(null);
  const [correlation, setCorrelation] = useState<CorrelationData | null>(null);
  const [repairData, setRepairData] = useState<any>(null);
  const [qualityData, setQualityData] = useState<QualityMetrics | null>(null);
  const [timelineData, setTimelineData] = useState<any[]>([]);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const datasetId = Number(id);
      const [previewData, summaryData, corrData, repairInfo, qualityInfo] = await Promise.all([
        api.getDatasetPreview(datasetId),
        api.getEDASummary(datasetId),
        api.getCorrelationMatrix(datasetId),
        api.getRepairRecommendations(datasetId),
        api.getDatasetQuality(datasetId)
      ]);

      setPreview(previewData);
      setSummary(summaryData);
      setCorrelation(corrData);
      setRepairData(repairInfo);
      setQualityData(qualityInfo);

      // Fetch timeline if recommendations exist
      if (repairInfo.recommendations && repairInfo.recommendations.length > 0) {
        try {
          const steps = repairInfo.recommendations.map((r: any) => ({
            column: r.column,
            strategy: r.recommended_strategy
          }));
          const tData = await api.getRepairTimeline(datasetId, steps);
          setTimelineData(tData.timeline || []);
        } catch (timelineErr) {
          console.warn("Could not fetch health timeline:", timelineErr);
          setTimelineData([]);
        }
      } else {
        setTimelineData([]);
      }
    } catch (err: any) {
      console.error("DatasetContext Fetch Error:", err);
      setError("Unable to initialize dataset context.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const value: DatasetContextValue = {
    datasetId: id ? Number(id) : null,
    loading,
    error,
    preview,
    summary,
    correlation,
    repairData,
    qualityData,
    timelineData,
    refreshData: fetchData
  };

  return <DatasetContext.Provider value={value}>{children}</DatasetContext.Provider>;
};
