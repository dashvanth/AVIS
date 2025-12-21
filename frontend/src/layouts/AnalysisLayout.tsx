// frontend/src/layouts/AnalysisLayout.tsx
import React, { useEffect, useState } from "react";
import { Outlet, NavLink, useParams, useNavigate } from "react-router-dom";
import {
  BarChart2,
  Lightbulb,
  MessageSquare,
  ArrowLeft,
  Layout,
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
      {/* Dark Premium Sidebar */}
      <aside className="w-64 bg-avis-secondary border-r border-avis-border flex flex-col z-20">
        <div className="p-6 border-b border-avis-border bg-gradient-to-br from-avis-accent-indigo/10 to-transparent">
          <button
            onClick={() => navigate("/app/datasets")}
            className="flex items-center text-xs font-semibold text-avis-text-secondary hover:text-avis-accent-cyan transition-colors mb-4 uppercase tracking-wider"
          >
            <ArrowLeft className="w-3 h-3 mr-1" />
            Back to Hub
          </button>
          <h2
            className="font-bold text-avis-text-primary text-lg leading-tight truncate"
            title={dataset?.filename}
          >
            {dataset?.filename || "Analyzing..."}
          </h2>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          <NavLink
            to={`/dashboard/${id}/eda`}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                isActive
                  ? "bg-avis-accent-indigo/20 text-avis-accent-indigo border border-avis-accent-indigo/30"
                  : "text-avis-text-secondary hover:text-white hover:bg-avis-primary"
              }`
            }
          >
            <BarChart2 className="w-5 h-5 mr-3" />
            Step-by-Step EDA
          </NavLink>
          <NavLink
            to={`/dashboard/${id}/builder`}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                isActive
                  ? "bg-avis-accent-indigo/20 text-avis-accent-indigo border border-avis-accent-indigo/30"
                  : "text-avis-text-secondary hover:text-white hover:bg-avis-primary"
              }`
            }
          >
            <Layout className="w-5 h-5 mr-3" />
            Custom Dashboard
          </NavLink>
          <NavLink
            to={`/dashboard/${id}/insights`}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                isActive
                  ? "bg-avis-accent-indigo/20 text-avis-accent-indigo border border-avis-accent-indigo/30"
                  : "text-avis-text-secondary hover:text-white hover:bg-avis-primary"
              }`
            }
          >
            <Lightbulb className="w-5 h-5 mr-3" />
            Guided Insights
          </NavLink>
          <NavLink
            to={`/dashboard/${id}/chat`}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                isActive
                  ? "bg-avis-accent-indigo/20 text-avis-accent-indigo border border-avis-accent-indigo/30"
                  : "text-avis-text-secondary hover:text-white hover:bg-avis-primary"
              }`
            }
          >
            <MessageSquare className="w-5 h-5 mr-3" />
            LLM Assistant
          </NavLink>
        </nav>
      </aside>

      {/* Content Area */}
      <main className="flex-1 overflow-auto bg-avis-primary relative">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <Outlet context={{ dataset }} />
        </div>
      </main>
    </div>
  );
};

export default AnalysisLayout;
