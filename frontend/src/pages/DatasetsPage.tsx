// frontend/src/pages/DatasetsPage.tsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import FileUpload from "../components/FileUpload";
import DataPreviewTable from "../components/DataPreviewTable";
import {
  Database,
  ShieldCheck,
  FileCheck,
  Microscope,
  RefreshCw,
  Search,
  Terminal,
  AlertTriangle,
  CheckCircle2,
  Zap,
  HelpCircle,
  ArrowRight,
  Fingerprint,
  Binary,
  Trash2,
  ChevronRight,
} from "lucide-react";
import type { Dataset } from "../types";

const DatasetsPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentDataset, setCurrentDataset] = useState<Dataset | null>(null);
  const [stage, setStage] = useState<"idle" | "auditing" | "preview">("idle");
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLogs((prev) => [
      ...prev.slice(-5),
      `[${new Date().toLocaleTimeString()}] ${msg}`,
    ]);
  };

  const handleUploadSuccess = (dataset: Dataset) => {
    setStage("auditing");
    addLog("Secure handshake initiated...");

    // Transparent Pipeline Simulation (Functionality 2)
    setTimeout(
      () =>
        addLog(
          `Multi-format buffer detected: .${dataset.file_type.toUpperCase()}`
        ),
      600
    );
    setTimeout(
      () =>
        addLog(
          `Inference Engine: Mapping ${dataset.column_count} dimensions...`
        ),
      1200
    );
    setTimeout(
      () => addLog("Radical Audit: Scanning for structural anomalies..."),
      1800
    );
    setTimeout(() => {
      addLog("Integrity check complete. Ready for verification.");
      setCurrentDataset(dataset);
      setStage("preview");
    }, 2500);
  };

  const handleReject = () => {
    setCurrentDataset(null);
    setStage("idle");
    setLogs([]);
  };

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-8 bg-avis-primary min-h-screen text-avis-text-primary">
      {/* 1. Dynamic Header with Stage Progress (Functionality 6) */}
      <div className="mb-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 text-avis-accent-indigo text-[10px] font-bold uppercase tracking-[0.4em] mb-3">
            <ShieldCheck className="w-4 h-4" /> Secure Data Pipeline
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter">
            Asset Ingestion
          </h1>
        </div>

        <div className="flex items-center gap-4 bg-avis-secondary/50 p-2 rounded-2xl border border-avis-border/50">
          <StageIndicator
            active={stage === "idle"}
            label="Ingest"
            icon={<Database className="w-3 h-3" />}
          />
          <ChevronRight className="w-4 h-4 text-avis-border" />
          <StageIndicator
            active={stage === "auditing"}
            label="Audit"
            icon={<Microscope className="w-3 h-3" />}
          />
          <ChevronRight className="w-4 h-4 text-avis-border" />
          <StageIndicator
            active={stage === "preview"}
            label="Verify"
            icon={<FileCheck className="w-3 h-3" />}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* LEFT COLUMN: PRIMARY INTERACTION */}
        <div className="lg:col-span-8 space-y-8">
          <AnimatePresence mode="wait">
            {stage === "idle" && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-avis-secondary/30 border-2 border-dashed border-avis-border/60 rounded-[3rem] p-20 text-center relative overflow-hidden group"
              >
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 bg-avis-primary border border-avis-border rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl group-hover:border-avis-accent-indigo/50 transition-all rotate-3 group-hover:rotate-0">
                    <Database className="w-10 h-10 text-avis-accent-indigo" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">
                    Ready to Initialize
                  </h3>
                  <p className="text-avis-text-secondary mb-10 leading-relaxed text-sm">
                    Upload your raw CSV, Excel, or JSON. The orientation engine
                    will automatically infer types and audit your data
                    structure.
                  </p>
                  <FileUpload onUploadSuccess={handleUploadSuccess} />
                </div>
              </motion.div>
            )}

            {stage === "auditing" && (
              <motion.div
                key="auditing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-avis-secondary/50 border border-avis-border rounded-[3rem] p-16 text-center space-y-10"
              >
                <div className="relative w-24 h-24 mx-auto">
                  <RefreshCw className="w-24 h-24 text-avis-accent-indigo animate-spin opacity-20" />
                  <Microscope className="w-10 h-10 text-avis-accent-indigo absolute inset-0 m-auto animate-pulse" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter">
                    Running Ingress Audit
                  </h3>
                  <p className="text-avis-text-secondary text-sm">
                    Validating schema and identifying data patterns.
                  </p>
                </div>
                {/* Advanced: Log Terminal */}
                <div className="max-w-lg mx-auto bg-black/80 rounded-2xl p-6 text-left font-mono text-[11px] text-avis-accent-cyan border border-white/5 shadow-2xl">
                  {logs.map((log, i) => (
                    <div key={i} className="mb-1.5 opacity-90 flex gap-3">
                      <span className="text-avis-accent-indigo">~</span>
                      {log}
                    </div>
                  ))}
                  <div className="w-2 h-4 bg-avis-accent-cyan inline-block animate-pulse mt-1" />
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
                <div className="bg-avis-secondary/50 border border-avis-border rounded-[2.5rem] p-8 shadow-2xl overflow-hidden">
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-avis-accent-success/10 rounded-2xl text-avis-accent-success">
                        <Search className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-white tracking-tight">
                          Gatekeeper Verification
                        </h3>
                        <p className="text-xs text-avis-text-secondary uppercase tracking-widest font-bold">
                          Previewing entities for ingest authorization
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleReject}
                        className="px-5 py-2.5 bg-avis-primary border border-avis-border rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 transition-all flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" /> Reject
                      </button>
                      <button
                        onClick={() =>
                          navigate(`/dashboard/${currentDataset.id}/eda`)
                        }
                        className="px-6 py-2.5 bg-avis-accent-indigo text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg hover:shadow-indigo-500/40 transition-all flex items-center gap-2"
                      >
                        Authorize & Start <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* High-Fidelity Table Preview */}
                  <div className="rounded-2xl border border-avis-border/40 overflow-hidden bg-avis-primary/30">
                    <DataPreviewTable datasetId={currentDataset.id} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT COLUMN: ORIENTATION SIDEBAR (Functionality 1, 2, 6) */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-avis-secondary/60 border border-avis-border/80 rounded-[2.5rem] p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-avis-accent-indigo/10 rounded-2xl text-avis-accent-indigo">
                <Fingerprint className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black text-white text-lg">
                  System Orientation
                </h4>
                <p className="text-[10px] text-avis-accent-indigo font-bold uppercase tracking-widest">
                  Backend Inference Engine
                </p>
              </div>
            </div>

            {currentDataset ? (
              <div className="space-y-6">
                <div className="p-5 bg-avis-primary/40 rounded-3xl border border-avis-border/40">
                  <div className="flex items-center gap-2 mb-2 text-avis-accent-cyan">
                    <Zap className="w-3 h-3" />
                    <span className="text-[10px] font-black uppercase tracking-tighter">
                      AI Characterization
                    </span>
                  </div>
                  <p className="text-xs text-avis-text-secondary leading-relaxed font-medium">
                    A.V.I.S has oriented this asset as a{" "}
                    <span className="text-white">
                      .{currentDataset.file_type}
                    </span>{" "}
                    entity. Structure identified:{" "}
                    <span className="text-avis-accent-success font-bold">
                      Relational Matrix
                    </span>
                    .
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <IngestionStat
                    label="Features"
                    value={currentDataset.column_count.toString()}
                    icon={<Binary className="w-3 h-3" />}
                  />
                  <IngestionStat
                    label="Instances"
                    value={currentDataset.row_count.toString()}
                    icon={<Database className="w-3 h-3" />}
                  />
                </div>
              </div>
            ) : (
              <div className="py-20 text-center opacity-30">
                <HelpCircle className="w-12 h-12 mx-auto mb-4 text-avis-text-secondary" />
                <p className="text-xs italic">Awaiting asset handshake...</p>
              </div>
            )}
          </div>

          {/* Functionality 6 Sidebar */}
          <div className="bg-avis-primary/40 border border-avis-border/60 rounded-[2.5rem] p-8">
            <h4 className="text-[10px] font-black text-avis-accent-indigo uppercase tracking-[0.4em] mb-6">
              Navigational Guide
            </h4>
            <div className="space-y-6">
              <GuideStep
                title="What is Ingestion?"
                desc="This stage transforms raw files into secure database records while verifying structural integrity."
              />
              <GuideStep
                title="Why Preview?"
                desc="Previewing allows you to authorize the data structure before launching heavy statistical calculations."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// MINI COMPONENTS
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
    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
      active
        ? "bg-avis-accent-indigo text-white shadow-lg"
        : "text-avis-text-secondary opacity-50"
    }`}
  >
    {icon}
    <span className="text-[10px] font-black uppercase tracking-widest">
      {label}
    </span>
  </div>
);

const IngestionStat = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) => (
  <div className="p-4 bg-avis-primary/40 rounded-2xl border border-avis-border/40 hover:border-avis-accent-indigo/30 transition-all group">
    <div className="flex items-center gap-2 mb-1">
      <span className="text-avis-accent-indigo group-hover:text-avis-accent-cyan transition-colors">
        {icon}
      </span>
      <span className="text-[8px] text-avis-text-secondary uppercase tracking-widest">
        {label}
      </span>
    </div>
    <div className="text-lg font-black text-white">{value}</div>
  </div>
);

const GuideStep = ({ title, desc }: { title: string; desc: string }) => (
  <div className="relative pl-6 border-l-2 border-avis-border/30">
    <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-avis-accent-indigo" />
    <h5 className="text-[11px] font-bold text-white uppercase mb-1">{title}</h5>
    <p className="text-[10px] text-avis-text-secondary leading-relaxed">
      {desc}
    </p>
  </div>
);

export default DatasetsPage;
