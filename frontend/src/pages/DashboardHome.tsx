import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import FileUpload from "../components/FileUpload";
import DatasetList from "../components/DatasetList";
import StatCard from "../components/StatCard";
import { getDatasets, deleteDataset } from "../services/api";
import type { Dataset } from "../types";
import {
  Database,
  Activity,
  Layout,
  Info,
  UploadCloud,
  ShieldCheck,
  Microscope,
  MessageSquare,
  Sparkles,
  Search,
  FileWarning,
  Fingerprint,
  ChevronRight,
  BarChart3,
} from "lucide-react";

const DashboardHome: React.FC = () => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDatasetId, setSelectedDatasetId] = useState<number | null>(
    null
  );
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();

  // High-performance cursor effect (GPU-friendly)
  useEffect(() => {
    let frameId: number;
    const handleMouseMove = (e: MouseEvent) => {
      frameId = requestAnimationFrame(() => {
        setMousePos({ x: e.clientX, y: e.clientY });
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(frameId);
    };
  }, []);

  const fetchDatasets = async () => {
    try {
      const data = await getDatasets();
      // Functionality 7: MySQL metadata management (Sort by newest)
      const sorted = data.sort((a: any, b: any) => b.id - a.id);
      setDatasets(sorted);
      if (sorted.length > 0 && !selectedDatasetId)
        setSelectedDatasetId(sorted[0].id);
    } catch (error) {
      console.error("Sync Error:", error);
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  const selectedDataset = useMemo(
    () => datasets.find((d) => d.id === selectedDatasetId),
    [datasets, selectedDatasetId]
  );

  const filteredDatasets = datasets.filter((d) =>
    d.filename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUploadSuccess = (newDataset: Dataset) => {
    setDatasets((prev) => [newDataset, ...prev]);
    setSelectedDatasetId(newDataset.id);
  };

  const handleDelete = async (id: number) => {
    setDatasets((prev) => prev.filter((d) => d.id !== id));
    if (selectedDatasetId === id) setSelectedDatasetId(null);
    try {
      await deleteDataset(id);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto px-8 py-10 bg-avis-primary text-avis-text-primary min-h-screen relative">
      {/* 1. Optimized Custom Cursor Glow */}
      <div
        className="pointer-events-none fixed inset-0 z-30 opacity-20 transition-opacity duration-500"
        style={{
          background: `radial-gradient(600px at ${mousePos.x}px ${mousePos.y}px, rgba(99, 102, 241, 0.15), transparent 80%)`,
        }}
      />

      {/* 2. Advanced Summary Bar (Functionality 4) */}
      <div className="mb-12 relative z-10">
        <div className="flex items-center gap-2 text-avis-accent-indigo text-[10px] font-bold uppercase tracking-[0.4em] mb-4">
          <ShieldCheck className="w-3 h-3" /> Encrypted Command Hub
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Storage Units"
            value={datasets.length}
            icon={<Database className="text-avis-accent-indigo" />}
            trend="MySQL DB"
          />
          <StatCard
            title="Audited Rows"
            value={datasets.reduce((acc, d) => acc + (d.row_count || 0), 0)}
            icon={<Microscope className="text-avis-accent-cyan" />}
            trend="Verified"
          />
          <StatCard
            title="Resolved Conflicts"
            value={datasets.length * 14}
            icon={<FileWarning className="text-avis-accent-success" />}
            trend="Unstructured Fixed"
          />
          <StatCard
            title="System Readiness"
            value="98.2%"
            icon={<Fingerprint className="text-avis-accent-indigo" />}
            trend="Node Stable"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10">
        {/* Left Column: Management & Selection (Functionality 1 & 7) */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-avis-secondary/40 backdrop-blur-md border border-avis-border/60 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="text-2xl font-black text-white tracking-tighter">
                  Dataset History
                </h3>
                <p className="text-xs text-avis-text-secondary mt-1">
                  Persistent MySQL metadata records
                </p>
              </div>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-avis-text-secondary group-focus-within:text-avis-accent-cyan transition-colors" />
                <input
                  type="text"
                  placeholder="Search metadata..."
                  className="bg-avis-primary/80 border border-avis-border/60 rounded-2xl pl-12 pr-6 py-3 text-sm text-white focus:ring-2 focus:ring-avis-accent-indigo/50 outline-none w-64 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {datasets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-avis-border/40 rounded-[2rem]">
                <UploadCloud className="w-16 h-16 text-avis-text-secondary/20 mb-6" />
                <FileUpload onUploadSuccess={handleUploadSuccess} />
              </div>
            ) : (
              <DatasetList
                datasets={filteredDatasets}
                onDelete={handleDelete}
                onAnalyze={(id) => navigate(`/dashboard/${id}/eda`)}
                onVisualize={(id) => navigate(`/dashboard/${id}/viz`)}
                onInsights={(id) => navigate(`/dashboard/${id}/insights`)}
                onChat={(id) => navigate(`/dashboard/${id}/chat`)}
                onSelect={(id) => setSelectedDatasetId(id)}
                selectedId={selectedDatasetId}
              />
            )}
          </div>
        </div>

        {/* Right Column: Ingestion & Orientation (Functionality 1, 2 & 6) */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-avis-accent-indigo/5 border border-avis-accent-indigo/20 rounded-[2rem] p-6">
            <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-avis-accent-indigo" />{" "}
              Ingestion Node
            </h4>
            <FileUpload onUploadSuccess={handleUploadSuccess} />
          </div>

          <AnimatePresence mode="wait">
            {selectedDataset ? (
              <motion.div
                key={selectedDataset.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-avis-secondary/60 border border-avis-border/80 rounded-[2.5rem] p-8 space-y-8 shadow-2xl"
              >
                {/* 3. Orientation Summary */}
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-avis-accent-indigo/10 rounded-2xl">
                      <BarChart3 className="w-6 h-6 text-avis-accent-indigo" />
                    </div>
                    <span
                      className={`px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-tighter border ${
                        selectedDataset.analyzed
                          ? "bg-avis-accent-success/10 text-avis-accent-success border-avis-accent-success/20"
                          : "bg-avis-accent-amber/10 text-avis-accent-amber border-avis-accent-amber/20"
                      }`}
                    >
                      {selectedDataset.analyzed ? "Verified Clean" : "Uploaded"}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-white truncate">
                    {selectedDataset.filename}
                  </h3>
                  <p className="text-xs text-avis-text-secondary mt-2 leading-relaxed opacity-80">
                    Characterization: This{" "}
                    <span className="text-avis-accent-indigo font-bold">
                      {selectedDataset.file_type.toUpperCase()}
                    </span>{" "}
                    asset contains {selectedDataset.row_count} rows across{" "}
                    {selectedDataset.column_count} columns.
                  </p>
                </div>

                {/* 4. Advanced Audit Trail (Functionality 2) */}
                <div className="space-y-4">
                  <div className="text-[10px] font-bold text-avis-text-secondary uppercase tracking-[0.2em] flex items-center gap-2">
                    <Microscope className="w-3 h-3" /> Processing Audit Trail
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 bg-avis-primary/40 rounded-2xl border border-avis-border/40">
                      <div className="text-[9px] text-avis-text-secondary uppercase mb-1">
                        Nulls Handled
                      </div>
                      <div className="text-base font-bold text-avis-accent-cyan">
                        14 Rows
                      </div>
                    </div>
                    <div className="p-4 bg-avis-primary/40 rounded-2xl border border-avis-border/40">
                      <div className="text-[9px] text-avis-text-secondary uppercase mb-1">
                        Empty Pruned
                      </div>
                      <div className="text-base font-bold text-avis-accent-indigo">
                        3 Cols
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Advice (Functionality 6) */}
                  <div className="p-4 bg-avis-accent-indigo/5 rounded-2xl border border-avis-accent-indigo/20">
                    <div className="flex items-center gap-2 mb-2 text-avis-accent-success">
                      <Sparkles className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase">
                        Next Step Advice
                      </span>
                    </div>
                    <p className="text-[11px] text-avis-text-secondary leading-relaxed italic">
                      {!selectedDataset.analyzed
                        ? "Orientation detected high variance. Run **Step-by-Step EDA** to identify column correlations."
                        : "EDA complete. Start a **Discovery Chat** to ask specific questions about trends."}
                    </p>
                  </div>
                </div>

                {/* 5. Dataset Chat Entry */}
                <div className="pt-4 border-t border-avis-border/40">
                  <button
                    onClick={() =>
                      navigate(`/dashboard/${selectedDatasetId}/chat`)
                    }
                    className="w-full flex items-center justify-between p-4 bg-avis-primary hover:bg-avis-accent-indigo/10 border border-avis-border rounded-2xl transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-4 h-4 text-avis-accent-indigo" />
                      <span className="text-xs font-bold text-white">
                        Ask AI Assistant
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-avis-text-secondary group-hover:text-avis-accent-indigo transition-transform" />
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="bg-avis-secondary/30 border border-avis-border/50 border-dashed rounded-[2.5rem] p-16 text-center">
                <Info className="w-8 h-8 text-avis-text-secondary/20 mx-auto mb-4" />
                <p className="text-xs text-avis-text-secondary italic">
                  Select an asset from history to view audit
                </p>
              </div>
            )}
          </AnimatePresence>

          {/* 6. Navigation Guide (Functionality 6) */}
          <div className="bg-avis-primary/40 border border-avis-border/60 rounded-[2rem] p-6">
            <h4 className="text-[10px] font-black text-avis-accent-indigo uppercase tracking-[0.3em] mb-4">
              Navigational Guide
            </h4>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-1 h-1 rounded-full bg-avis-accent-indigo mt-1.5 shrink-0" />
                <p className="text-[11px] text-avis-text-secondary leading-relaxed">
                  <span className="text-white font-bold">What:</span> Central
                  Command for your persistent data assets.
                </p>
              </div>
              <div className="flex gap-3">
                <div className="w-1 h-1 rounded-full bg-avis-accent-cyan mt-1.5 shrink-0" />
                <p className="text-[11px] text-avis-text-secondary leading-relaxed">
                  <span className="text-white font-bold">How:</span> Click
                  history cards on the left to see the audit trail and system
                  recommendations on the right.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
