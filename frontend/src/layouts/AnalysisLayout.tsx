// frontend/src/layouts/AnalysisLayout.tsx
import React, { useEffect, useState } from "react";
import { Outlet, NavLink, useParams, useNavigate } from "react-router-dom";
import {
  Search,
  PieChart,
  Lightbulb,
  MessageSquare,
  ArrowLeft,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { getDatasets } from "../services/api";
import type { Dataset } from "../types";

const AnalysisLayout: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dataset, setDataset] = useState<Dataset | null>(null);

  useEffect(() => {
    const fetchDataset = async () => {
      if (!id) return;
      try {
        const datasets = await getDatasets();
        const found = datasets.find((d) => d.id === Number(id));
        if (found) setDataset(found);
      } catch (error) {
        console.error("Failed to fetch dataset info", error);
      }
    };
    fetchDataset();
  }, [id]);

  return (
    <div className="flex h-screen bg-avis-primary overflow-hidden">
      {/* Advanced Premium Sidebar */}
      <aside className="w-72 bg-avis-secondary border-r border-avis-border flex flex-col z-20 shadow-2xl">
        <div className="p-6 border-b border-avis-border bg-gradient-to-br from-avis-accent-indigo/5 to-transparent">
          <button
            onClick={() => navigate("/app")}
            className="flex items-center text-[10px] font-black text-avis-text-secondary hover:text-avis-accent-indigo transition-all mb-4 uppercase tracking-[0.2em]"
          >
            <ArrowLeft className="w-3 h-3 mr-2" />
            Exit to Hub
          </button>
          <div className="flex items-center gap-2 text-avis-accent-indigo mb-1">
            <Zap className="w-3 h-3" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Active Session
            </span>
          </div>
          <h2
            className="font-black text-white text-xl leading-tight truncate italic"
            title={dataset?.filename}
          >
            {dataset?.filename || "Loading..."}
          </h2>
        </div>

        <nav className="flex-1 overflow-y-auto py-8 px-4 space-y-2">
          <SidebarLink
            to={`/dashboard/${id}/eda`}
            icon={<Search className="w-5 h-5" />}
            label="Step-by-Step EDA"
          />
          <SidebarLink
            to={`/dashboard/${id}/viz`}
            icon={<PieChart className="w-5 h-5" />}
            label="Visual Studio"
          />
          <SidebarLink
            to={`/dashboard/${id}/insights`}
            icon={<Lightbulb className="w-5 h-5" />}
            label="Forensic Insights"
          />
          <SidebarLink
            to={`/dashboard/${id}/chat`}
            icon={<MessageSquare className="w-5 h-5" />}
            label="AI Assistant"
          />
        </nav>

        {/* Functionality 2: Integrity Badge */}
        <div className="p-6 border-t border-avis-border/50 bg-avis-primary/20">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 text-[10px] font-black text-avis-accent-success uppercase tracking-widest bg-avis-accent-success/10 p-3 rounded-xl border border-avis-accent-success/20">
              <ShieldCheck className="w-4 h-4" />
              Structure Verified
            </div>
            <p className="text-[9px] text-avis-text-secondary px-1 italic">
              Forensic cleaning complete. Ready for discovery.
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto bg-avis-primary relative no-scrollbar">
        <div className="max-w-[1400px] mx-auto px-8 py-10">
          {/* We pass the dataset metadata down to all child routes via context */}
          <Outlet context={{ dataset }} />
        </div>
      </main>
    </div>
  );
};

/**
 * Reusable Sidebar Link Component with active state styling
 */
const SidebarLink = ({
  to,
  icon,
  label,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
}) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center px-5 py-4 text-xs font-black uppercase tracking-widest rounded-2xl transition-all group ${
        isActive
          ? "bg-avis-accent-indigo text-white shadow-[0_10px_20px_rgba(99,102,241,0.2)] border border-white/10"
          : "text-avis-text-secondary hover:text-white hover:bg-avis-primary/50"
      }`
    }
  >
    <span
      className={`mr-4 transition-transform group-hover:scale-110 group-hover:rotate-3`}
    >
      {icon}
    </span>
    {label}
  </NavLink>
);

export default AnalysisLayout;
