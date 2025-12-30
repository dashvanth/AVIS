// frontend/src/layouts/AnalysisLayout.tsx
import React, { useEffect, useState } from "react";
import { Outlet, NavLink, useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  ShieldCheck,
  Zap,
  Layout,
  Search,
  PieChart,
  Lightbulb,
  MessageSquare,
  LogOut,
  ChevronRight,
  Package
} from "lucide-react";
import { getDatasets } from "../services/api";
import type { Dataset } from "../types";
import FloatingChat from "../components/FloatingChat";

const AnalysisLayout: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
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

  const steps = [
    { id: "understanding", label: "Understanding", path: `/dashboard/${id}/understanding`, icon: Layout },
    { id: "eda", label: "EDA", path: `/dashboard/${id}/eda`, icon: Search },
    { id: "prepare", label: "Prepare", path: `/dashboard/${id}/prepare`, icon: ShieldCheck },
    { id: "viz", label: "Visualization", path: `/dashboard/${id}/viz`, icon: PieChart },
    { id: "export", label: "Download", path: `/dashboard/${id}/export`, icon: Package },
    { id: "chat", label: "Chat", path: `/dashboard/${id}/chat`, icon: MessageSquare },
  ];

  // Helper to determine step status
  const getStepStatus = (index: number) => {
    const currentPath = location.pathname;
    const currentStepIndex = steps.findIndex(step => currentPath.includes(step.id));

    // If exact match fails (e.g. root dashboard path), default to first step or handle gracefully
    // specific logic: if currentStepIndex is -1, maybe we are at root /dashboard/:id -> which redirects to eda usually, but let's be safe.
    // Actually, usually one route is active.

    if (index === currentStepIndex) return "active";
    if (index < currentStepIndex) return "completed";
    return "future";
  };

  return (
    <div className="flex flex-col h-screen bg-avis-primary overflow-hidden selection:bg-indigo-500/30">
      {/* COMMAND HUB TOP NAVIGATION */}
      <header className="h-16 flex items-center justify-between px-6 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 z-50 shrink-0">

        {/* LEFT: IDENTITY & CONTEXT */}
        <div className="flex items-center gap-6">
          {/* Logo / Home */}
          <button
            onClick={() => navigate("/app")}
            className="flex items-center gap-2 group"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Zap className="w-4 h-4 text-white fill-white" />
            </div>
          </button>

          {/* Divider */}
          <div className="h-8 w-px bg-white/10" />

          {/* Dataset Info */}
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              {dataset?.filename || "Loading..."}
            </h1>

            {/* Context Badge */}
            {dataset && (
              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                <span>{dataset.row_count.toLocaleString()} rows</span>
                <span className="text-slate-700">•</span>
                <span>{dataset.column_count} cols</span>
                <span className="text-slate-700">•</span>
                <span className={`font-bold ${(dataset.quality_score || 0) > 80 ? "text-emerald-400" : "text-amber-400"
                  }`}>
                  Quality: {dataset.quality_score || "N/A"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* CENTER: STEP INDICATOR */}
        <nav className="hidden lg:flex items-center bg-white/5 rounded-full p-1 border border-white/5">
          {steps.map((step, idx) => {
            const status = getStepStatus(idx);
            const isLast = idx === steps.length - 1;

            return (
              <div key={step.id} className="flex items-center">
                <NavLink
                  to={step.path}
                  title={status === "future" ? "Recommended: Complete previous steps first" : ""}
                  className={({ isActive }) => `
                    relative px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all
                    ${isActive
                      ? "bg-avis-accent-indigo text-white shadow-lg shadow-indigo-500/20"
                      : status === "future"
                        ? "text-slate-600 hover:text-slate-500 cursor-not-allowed opacity-60"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }
                  `}
                >
                  {/* Icon */}
                  <step.icon className={`w-3 h-3 ${status === "active" ? "text-indigo-200" : "currentColor"}`} />

                  {/* Label */}
                  <span className={status === "future" ? "hidden xl:inline" : ""}>{step.label}</span>
                </NavLink>

                {/* Connector Line */}
                {!isLast && (
                  <div className="w-4 h-px bg-white/5 mx-1" />
                )}
              </div>
            );
          })}
        </nav>

        {/* RIGHT: EXIT CONTROL */}
        <button
          onClick={() => navigate("/app")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Exit to Dashboard</span>
        </button>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-auto bg-slate-950 relative">
        <div className="w-full min-h-full">
          {/* We pass the dataset metadata down to all child routes via context */}
          <Outlet context={{ dataset }} />
        </div>
      </main>

      {/* Floating Chat Assistant (Global Context Layer) */}
      <FloatingChat />
    </div>
  );
};

export default AnalysisLayout;
