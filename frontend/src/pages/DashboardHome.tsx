import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ProjectCard from "../components/ProjectCard";
import DashboardHint from "../components/DashboardHint";
import { getDatasets, deleteDataset } from "../services/api";
import type { Dataset } from "../types";
import { Plus, Filter } from "lucide-react";

type FilterType = 'all' | 'verified' | 'processing';

const DashboardHome: React.FC = () => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);

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
    <div className="max-w-[1600px] mx-auto px-6 py-6">

      {/* 1. BEGINNER GUIDANCE */}
      <DashboardHint />

      {/* 2. DASHBOARD HEADER & CONTROLS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Data Projects</h2>
          <p className="text-slate-400 text-sm">Manage and analyze your persistent assets.</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Functional Filters */}
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
      </div>

      {/* 3. PROJECT GRID */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      ) : filteredDatasets.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-24 text-center border border-dashed border-white/10 rounded-3xl bg-white/5"
        >
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">
            {activeFilter === 'all' ? "No projects yet" : "No projects match this filter"}
          </h3>
          <p className="text-slate-400 max-w-md mx-auto text-sm">
            {activeFilter === 'all'
              ? "Use the 'Upload Dataset' button in the top navigation to create your first project."
              : "Try switching filters to see other projects."}
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
          {filteredDatasets.map((dataset) => (
            <ProjectCard
              key={dataset.id}
              dataset={dataset}
              onResume={() => { }} // Not used by new card, it has internal navigation
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Helper Component for Filter Buttons
const FilterButton = ({ label, isActive, onClick, count }: any) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${isActive
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
