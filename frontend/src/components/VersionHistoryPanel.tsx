import React, { useEffect, useState } from "react";
import { History, Undo2, ArrowRight, Eye, AlertCircle } from "lucide-react";
import * as api from "../services/api";
import { useNavigate } from "react-router-dom";

export interface VersionInfo {
  id: number;
  version: number;
  description: string;
  timestamp: string;
  filename: string;
}

interface VersionHistoryPanelProps {
  datasetId: number;
  currentFilename: string;
}

export const VersionHistoryPanel: React.FC<VersionHistoryPanelProps> = ({ datasetId, currentFilename }) => {
  const [history, setHistory] = useState<VersionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const data = await api.getDatasetVersions(datasetId);
        setHistory(data);
      } catch (error) {
        console.error("Failed to map dataset version histories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [datasetId]);

  const handleRestore = async (targetId: number) => {
    try {
       setRestoring(true);
       const result = await api.restoreDatasetVersion(targetId);
       
       if (result.restored_dataset_id) {
           // Jump explicitly mapping the browser root over bridging timelines
           navigate(`/dashboard/${result.restored_dataset_id}/analyze`, { replace: true });
       }
    } catch(err) {
       console.error("Restoration failed", err);
    } finally {
       setRestoring(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 w-full flex justify-center mt-6">
         <span className="text-slate-500 font-mono text-sm animate-pulse">Initializing version topology...</span>
      </div>
    );
  }

  if (history.length <= 1) {
    return (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 w-full flex items-center justify-between mt-6">
           <div className="flex items-center gap-3">
             <History className="w-5 h-5 text-slate-500" />
             <h3 className="text-lg font-bold text-slate-300">Dataset Version History</h3>
           </div>
           <p className="text-sm font-mono text-slate-500 bg-slate-800 px-3 py-1 rounded-md">V1: Original Root</p>
        </div>
    );
  }

  // Identify the currently active rendering boundary for styling
  const currentIndex = history.findIndex(h => h.id === datasetId);

  return (
    <div className="bg-slate-900 border border-indigo-500/20 rounded-2xl p-6 w-full flex flex-col gap-4 mt-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full"></div>
       
      <div className="flex items-center gap-3 border-b border-indigo-500/20 pb-3 relative z-10">
        <History className="w-5 h-5 text-indigo-400" />
        <h3 className="text-xl font-bold text-white tracking-wide">Version Control</h3>
        <span className="ml-auto text-xs font-mono bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full border border-indigo-500/20">
          File: {currentFilename}
        </span>
      </div>

      <div className="relative z-10 pl-4 border-l-2 border-indigo-500/20 space-y-6 mt-4">
         {history.map((item, idx) => {
            const isActive = item.id === datasetId;
            const isFuture = currentIndex !== -1 && idx > currentIndex; // Branch timeline checks
            
            return (
               <div key={item.id} className={`relative flex items-center gap-4 ${isFuture ? 'opacity-50' : 'opacity-100'}`}>
                   {/* Timeline Node */}
                   <div className={`absolute -left-[21px] w-3 h-3 rounded-full ${isActive ? 'bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.8)]' : 'bg-slate-700'}`}></div>
                   
                   <div className={`flex-1 flex items-center justify-between p-3 rounded-lg border ${isActive ? 'bg-indigo-500/10 border-indigo-500/40' : 'bg-slate-800/50 border-slate-700'} transition-all`}>
                      <div className="flex flex-col">
                         <div className="flex items-center gap-2">
                             <span className={`font-mono font-bold text-sm ${isActive ? 'text-indigo-400' : 'text-slate-400'}`}>V{item.version}</span>
                             <span className="text-white font-medium">{item.description}</span>
                             {isActive && <span className="ml-2 text-[10px] uppercase font-bold tracking-wider text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">Active</span>}
                         </div>
                         <span className="text-xs text-slate-500 mt-1 font-mono">{item.timestamp}</span>
                      </div>
                      
                      {!isActive && (
                         <div className="flex items-center gap-2 opacity-0 hover:opacity-100 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
                             <button
                               onClick={() => handleRestore(item.id)}
                               disabled={restoring}
                               className="flex items-center gap-2 text-xs font-bold text-indigo-300 bg-indigo-500/20 hover:bg-indigo-500/30 px-3 py-1.5 rounded-md transition-colors"
                             >
                                <Undo2 className="w-3 h-3" /> Restore
                             </button>
                         </div>
                      )}
                      {!isActive && (
                         <ArrowRight className="w-4 h-4 text-slate-600 block sm:hidden" />
                      )}
                   </div>
               </div>
            );
         })}
      </div>
    </div>
  );
};
