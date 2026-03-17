import React, { useEffect, useState } from "react";
import { Outlet, NavLink, useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Zap,
  Activity,
  PieChart,
  MessageSquare,
  LogOut,
  Download,
  User,
  ChevronRight,
} from "lucide-react";
import { getDatasets, getDownloadUrl } from "../services/api";
import type { Dataset } from "../types";
import FloatingChat from "../components/FloatingChat";
import { ChatProvider } from "../context/ChatContext";

import { DatasetProvider } from "../context/DatasetContext";

const AppLayout: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [dataset, setDataset] = useState<Dataset | null>(null);

  // Sync Dataset Context when ID is present
  useEffect(() => {
    const fetchDataset = async () => {
      if (!id) {
        setDataset(null);
        return;
      }
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
    { id: "analyze", label: "Analyze", path: `/dashboard/${id}/analyze`, icon: Activity },
    { id: "repair", label: "Repair", path: `/dashboard/${id}/repair`, icon: Zap },
    { id: "viz", label: "Visualize", path: `/dashboard/${id}/viz`, icon: PieChart },
  ];

  const handleExport = () => {
    if (!id) return;
    const isPrepared = dataset?.filename.includes("_prepared");
    const url = getDownloadUrl(Number(id), "data", isPrepared ? "prepared" : "original");
    window.open(url, "_blank");
  };

  const getStepStatus = (index: number) => {
    const currentPath = location.pathname;
    const currentStepIndex = steps.findIndex(step => currentPath.includes(step.id));
    if (index === currentStepIndex) return "active";
    if (index < currentStepIndex) return "completed";
    return "future";
  };

  return (
    <ChatProvider>
      <div className="flex flex-col h-screen bg-slate-950 overflow-hidden text-slate-200">
        {/* Background Decor */}
        <div className="fixed inset-0 pointer-events-none z-0">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/5 rounded-full blur-[120px]" />
        </div>

        {/* UNIFIED HEADER */}
        <header className="h-16 flex items-center justify-between px-6 bg-slate-900/50 backdrop-blur-xl border-b border-white/5 z-50 shrink-0 relative">
          
          {/* LEFT: Logo & Context */}
          <div className="flex items-center gap-6">
            <button onClick={() => navigate("/app")} className="flex items-center gap-2 group transition-all">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                <Zap className="w-4 h-4 text-white fill-white" />
              </div>
            </button>

            {id && dataset && (
              <>
                <div className="h-8 w-px bg-white/10" />
                <div className="flex items-center gap-3">
                   <div>
                      <h2 className="text-sm font-bold text-white truncate max-w-[200px]">{dataset.filename}</h2>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                         <span>{dataset.row_count.toLocaleString()} rows</span>
                         <span className="text-slate-800">•</span>
                         <span className={`font-bold ${(dataset.quality_score || 0) > 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                            Health: {dataset.quality_score || 'N/A'}
                         </span>
                      </div>
                   </div>
                </div>
              </>
            )}
          </div>

          {/* CENTER: Contextual Navigation (Only in Project View) */}
          {id && (
            <nav className="hidden lg:flex items-center bg-white/5 rounded-full p-1 border border-white/5">
              {steps.map((step, idx) => {
                const status = getStepStatus(idx);
                const isActive = status === "active";
                
                return (
                  <div key={step.id} className="flex items-center">
                    <NavLink
                      to={step.path}
                      className={`
                        px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all
                        ${isActive 
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
                          : "text-slate-400 hover:text-white"
                        }
                      `}
                    >
                      <step.icon className="w-3 h-3" />
                      <span>{step.label}</span>
                    </NavLink>
                    {idx < steps.length - 1 && <div className="w-3 h-px bg-white/5 mx-1" />}
                  </div>
                );
              })}
            </nav>
          )}

          {/* RIGHT: User & Global Actions */}
          <div className="flex items-center gap-4">
            {!id && (
               <button onClick={() => navigate("/app")} className="text-xs font-bold text-slate-400 hover:text-white transition-colors">
                  Dashboard
               </button>
            )}
            
            {id && (
               <button onClick={handleExport} className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-white/5 transition-all">
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  Export
               </button>
            )}

            <div className="h-8 w-px bg-white/10" />
            
            <div className="flex items-center gap-3 pl-2">
               <div className="hidden sm:block text-right">
                  <div className="text-xs font-bold text-white leading-none mb-1">
                     {localStorage.getItem("userName") || "Guest User"}
                  </div>
                  <div className="text-[10px] text-emerald-500 font-bold uppercase tracking-tighter">
                     Operator
                  </div>
               </div>
               <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center group cursor-pointer hover:border-indigo-500/40 transition-colors">
                  <User className="w-4 h-4 text-slate-400 group-hover:text-white" />
               </div>
            </div>
          </div>
        </header>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-auto bg-slate-950 relative z-10">
          <div className="w-full max-w-[1400px] mx-auto min-h-full transition-all duration-500">
             <DatasetProvider id={id}>
                <Outlet context={{ dataset }} />
             </DatasetProvider>
          </div>
        </main>

        {/* PERSISTENT AI ASSISTANT */}
        <FloatingChat />
      </div>
    </ChatProvider>
  );
};

export default AppLayout;
