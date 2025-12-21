import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import FileUpload from "../components/FileUpload";
import DataPreviewTable from "../components/DataPreviewTable";
import { getDatasetPreview } from "../services/api";
import {
  Database,
  ShieldCheck,
  FileCheck,
  Microscope,
  RefreshCw,
  Search,
  AlertTriangle,
  Zap,
  HelpCircle,
  ArrowRight,
  Fingerprint,
  Binary,
  Trash2,
  ChevronRight,
  Cpu,
  History,
  AlertCircle,
} from "lucide-react";
import type { Dataset, PreviewData, ProcessingStep } from "../types";

const DatasetsPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentDataset, setCurrentDataset] = useState<Dataset | null>(null);
  const [previewMetadata, setPreviewMetadata] = useState<PreviewData | null>(
    null
  );
  const [stage, setStage] = useState<"idle" | "auditing" | "preview">("idle");
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLogs((prev) => [
      ...prev.slice(-4),
      `[${new Date().toLocaleTimeString()}] ${msg}`,
    ]);
  };

  const handleUploadSuccess = async (dataset: Dataset) => {
    setCurrentDataset(dataset);
    setStage("auditing");
    addLog("File received. Starting check...");

    try {
      // Fetch the real numbers (249 nulls, etc.) immediately
      const res = await getDatasetPreview(dataset.id);
      setPreviewMetadata(res);

      addLog(`Found ${res.structural_audit?.total_nulls ?? 0} empty values.`);
      addLog("Check complete. Review your data below.");

      setTimeout(() => {
        setStage("preview");
      }, 1500);
    } catch (err) {
      addLog("Error reading file structure.");
    }
  };

  const handleReject = () => {
    setCurrentDataset(null);
    setPreviewMetadata(null);
    setStage("idle");
    setLogs([]);
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 sm:py-10 bg-avis-primary min-h-screen text-avis-text-primary">
      {/* 1. RESPONSIVE HEADER */}
      <div className="mb-8 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 border-b border-avis-border/40 pb-8">
        <div>
          <div className="flex items-center gap-3 text-avis-accent-indigo text-[10px] font-black uppercase tracking-[0.5em] mb-2">
            <Cpu className="w-4 h-4 animate-pulse" /> Secure Data Entry
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tighter italic">
            Add Dataset
          </h1>
          <p className="text-avis-text-secondary mt-2 max-w-xl text-xs sm:text-sm font-medium">
            We scan your file to find missing information and broken rows before
            you start.
          </p>
        </div>

        {/* STAGE INDICATORS - Responsive scroll on mobile */}
        <div className="flex items-center gap-3 bg-avis-secondary/30 p-2 rounded-2xl border border-avis-border/50 overflow-x-auto w-full sm:w-auto no-scrollbar">
          <StageIndicator
            active={stage === "idle"}
            label="Upload"
            icon={<Database className="w-3.5 h-3.5" />}
          />
          <ChevronRight className="w-4 h-4 text-avis-border/50 shrink-0" />
          <StageIndicator
            active={stage === "auditing"}
            label="Checking"
            icon={<Microscope className="w-3.5 h-3.5" />}
          />
          <ChevronRight className="w-4 h-4 text-avis-border/50 shrink-0" />
          <StageIndicator
            active={stage === "preview"}
            label="Review"
            icon={<FileCheck className="w-3.5 h-3.5" />}
          />
        </div>
      </div>

      {/* 2. MAIN LAYOUT - Responsive Stack */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT: INTERACTION AREA */}
        <div className="lg:col-span-8 space-y-6 order-2 lg:order-1">
          <AnimatePresence mode="wait">
            {stage === "idle" && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-avis-secondary/20 border-2 border-dashed border-avis-border/60 rounded-[2.5rem] p-10 sm:p-20 text-center"
              >
                <FileUpload onUploadSuccess={handleUploadSuccess} />
              </motion.div>
            )}

            {stage === "auditing" && (
              <motion.div
                key="auditing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-avis-secondary/40 border border-avis-border rounded-[2.5rem] p-16 text-center space-y-8"
              >
                <RefreshCw className="w-16 h-16 text-avis-accent-indigo animate-spin mx-auto opacity-40" />
                <div className="max-w-lg mx-auto bg-black/80 rounded-2xl p-6 text-left font-mono text-[11px] text-avis-accent-cyan border border-white/5">
                  {logs.map((log, i) => (
                    <div key={i} className="mb-2 opacity-90 flex gap-4">
                      <span className="text-avis-accent-indigo font-bold">
                        {">"}
                      </span>{" "}
                      {log}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {stage === "preview" && currentDataset && (
              <motion.div
                key="preview"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-avis-secondary/50 border border-avis-border rounded-[2.5rem] p-6 sm:p-8 shadow-2xl">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                      <h3 className="text-xl font-black text-white">
                        Review Results
                      </h3>
                      <p className="text-[10px] text-avis-text-secondary uppercase font-black">
                        Checking for rows that are not good
                      </p>
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                      <button
                        onClick={handleReject}
                        className="flex-1 px-5 py-2.5 bg-avis-primary border border-avis-border rounded-xl text-xs font-bold text-red-400"
                      >
                        REJECT
                      </button>
                      <button
                        onClick={() =>
                          navigate(`/dashboard/${currentDataset.id}/eda`)
                        }
                        className="flex-1 px-6 py-2.5 bg-avis-accent-indigo text-white rounded-xl text-xs font-black uppercase shadow-lg"
                      >
                        APPROVE
                      </button>
                    </div>
                  </div>
                  <div className="rounded-3xl border border-avis-border/40 overflow-hidden bg-avis-primary/30">
                    <DataPreviewTable datasetId={currentDataset.id} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT: SIMPLE AUDIT CARDS & SUMMARY */}
        <div className="lg:col-span-4 space-y-6 order-1 lg:order-2">
          {/* NEW: SIMPLE AUDIT CARDS (Placed above orientation) */}
          <div className="grid grid-cols-2 gap-4">
            <SimpleStatCard
              label="Null Values"
              value={previewMetadata?.structural_audit?.total_nulls ?? 0}
              color="text-orange-400"
              icon={<Zap className="w-4 h-4" />}
              desc="Total missing data"
            />
            <SimpleStatCard
              label="Null Rows"
              value={previewMetadata?.structural_audit?.null_rows ?? 0}
              color="text-amber-400"
              icon={<AlertCircle className="w-4 h-4" />}
              desc="Rows with errors"
            />
            <SimpleStatCard
              label="Null Columns"
              value={previewMetadata?.structural_audit?.null_cols ?? 0}
              color="text-red-400"
              icon={<Binary className="w-4 h-4" />}
              desc="Empty columns"
            />
            <SimpleStatCard
              label="Wrong Types"
              value={previewMetadata?.audit_metrics?.wrong_types ?? 0}
              color="text-cyan-400"
              icon={<AlertTriangle className="w-4 h-4" />}
              desc="Formatting issues"
            />
          </div>

          {/* About this Data Section */}
          <div className="bg-avis-secondary/60 border border-avis-border/80 rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden group">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-avis-accent-indigo/10 rounded-xl text-avis-accent-indigo">
                <Fingerprint className="w-6 h-6" />
              </div>
              <h4 className="font-black text-white text-lg">About this Data</h4>
            </div>

            {currentDataset ? (
              <div className="space-y-6">
                <div className="p-5 bg-avis-primary/60 rounded-2xl border border-avis-border/50">
                  <p className="text-xs text-avis-text-secondary leading-relaxed font-bold">
                    This is a{" "}
                    <span className="text-white">
                      .{currentDataset.file_type.toUpperCase()}
                    </span>{" "}
                    file. It has{" "}
                    <span className="text-white">
                      {currentDataset.row_count}
                    </span>{" "}
                    rows and{" "}
                    <span className="text-white">
                      {currentDataset.column_count}
                    </span>{" "}
                    columns.
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black text-avis-text-secondary uppercase tracking-widest">
                    List of automatic fixes:
                  </p>
                  {JSON.parse(currentDataset.processing_log || "[]").map(
                    (step: ProcessingStep, i: number) => (
                      <div
                        key={i}
                        className="p-3 bg-avis-primary/30 rounded-xl border border-avis-border/40 text-[10px] flex items-start gap-3"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-avis-accent-indigo mt-1.5 shrink-0" />
                        <div>
                          <p className="text-white font-bold uppercase">
                            {step.action}
                          </p>
                          <p className="text-avis-text-secondary italic">
                            {step.reason}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center opacity-30 italic text-xs flex flex-col items-center gap-3">
                <HelpCircle className="w-10 h-10" />
                Waiting for file...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// SIMPLE HELPER COMPONENTS
const StageIndicator = ({
  active,
  label,
  icon,
}: {
  active: boolean;
  label: string;
  icon: React.ReactNode;
}) => (
  <div
    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all shrink-0 ${
      active
        ? "bg-avis-accent-indigo text-white shadow-lg"
        : "text-avis-text-secondary opacity-40"
    }`}
  >
    {icon}{" "}
    <span className="text-[10px] font-black uppercase tracking-widest">
      {label}
    </span>
  </div>
);

const SimpleStatCard = ({
  label,
  value,
  color,
  icon,
  desc,
}: {
  label: string;
  value: any;
  color: string;
  icon: React.ReactNode;
  desc: string;
}) => (
  <div className="p-5 bg-avis-secondary border border-avis-border/80 rounded-[2rem] flex flex-col items-center justify-center text-center shadow-xl hover:border-white/10 transition-all group">
    <div
      className={`p-2 bg-avis-primary rounded-lg mb-2 ${color} border border-white/5`}
    >
      {icon}
    </div>
    <span className="text-[9px] font-black text-avis-text-secondary uppercase tracking-widest mb-1">
      {label}
    </span>
    <span className={`text-2xl font-black ${color}`}>{value}</span>
    <span className="text-[8px] text-avis-text-secondary/50 mt-1 uppercase font-bold">
      {desc}
    </span>
  </div>
);

export default DatasetsPage;
