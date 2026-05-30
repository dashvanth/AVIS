import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ProjectCard from "../components/ProjectCard";
import DashboardHint from "../components/DashboardHint";
import FileUpload from "../components/FileUpload";
import { getDatasets, deleteDataset } from "../services/api";
import type { Dataset } from "../types";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

type FilterType = 'all' | 'verified' | 'processing';

const DashboardHome: React.FC = () => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleUploadSuccess = async (dataset: Dataset) => {
    navigate(`/dashboard/${dataset.id}/analyze`);
  };

  const fetchDatasets = async () => {
    try {
      const data = await getDatasets();
      const sorted = data.sort((a: any, b: any) => b.id - a.id);
      setDatasets(sorted);
    } catch (error) {
      console.error("Sync Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  const handleDelete = async (id: number) => {
    setDatasets((prev) => prev.filter((d) => d.id !== id));
    try {
      await deleteDataset(id);
    } catch (error) {
      console.error(error);
    }
  };

  // Filter Logic
  const filteredDatasets = datasets.filter(d => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'verified') return d.analyzed;
    if (activeFilter === 'processing') return !d.analyzed;
    return true;
  });

  return (
    <div className="px-6 py-6">

      {/* 1. BEGINNER GUIDANCE */}
      <DashboardHint />

      {/* 2. UPLOAD + DATASETS SIDE BY SIDE */}
      <div className="flex flex-col lg:flex-row gap-8 mb-8" id="upload-section">

        {/* Left: Upload Area */}
        <div className="w-full lg:w-[340px] shrink-0">
          <FileUpload onUploadSuccess={handleUploadSuccess} existingDatasets={datasets} />
        </div>

        {/* Right: Dataset List (fills remaining space) */}
        <div className="flex-1 min-w-0">
          {/* Header & Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Your Datasets</h2>
              <p className="text-slate-400 text-xs mt-0.5">All your uploaded datasets are listed here.</p>
            </div>

            <div className="flex bg-slate-900 border border-white/5 p-1 rounded-xl">
              <FilterButton
                label="All"
                isActive={activeFilter === 'all'}
                onClick={() => setActiveFilter('all')}
                count={datasets.length}
              />
              <FilterButton
                label="Verified"
                isActive={activeFilter === 'verified'}
                onClick={() => setActiveFilter('verified')}
                count={datasets.filter(d => d.analyzed).length}
              />
              <FilterButton
                label="Processing"
                isActive={activeFilter === 'processing'}
                onClick={() => setActiveFilter('processing')}
                count={datasets.filter(d => !d.analyzed).length}
              />
            </div>
          </div>

          {/* Dataset Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : filteredDatasets.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-16 text-center border border-dashed border-white/10 rounded-2xl bg-white/5"
            >
              <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
                <Plus className="w-7 h-7 text-slate-500" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">
                {activeFilter === 'all' ? "No datasets yet" : "No datasets match this filter"}
              </h3>
              <p className="text-slate-400 max-w-sm mx-auto text-xs">
                {activeFilter === 'all'
                  ? "Upload a file on the left to get started."
                  : "Try switching filters to see other datasets."}
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-10">
              {filteredDatasets.map((dataset) => (
                <ProjectCard
                  key={dataset.id}
                  dataset={dataset}
                  onResume={() => { }}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper Component for Filter Buttons
const FilterButton = ({ label, isActive, onClick, count }: any) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${isActive
        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
        : "text-slate-400 hover:text-white hover:bg-white/5"
      }`}
  >
    {label}
    {count !== undefined && (
      <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${isActive ? "bg-white/20 text-white" : "bg-white/10 text-slate-500"
        }`}>
        {count}
      </span>
    )}
  </button>
);

export default DashboardHome;
