import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Search,
    BarChart2, MessageSquare,
    Eye, Shield, Clock, CheckCircle,
    FileText, HelpCircle, Trash2
} from 'lucide-react';
import type { Dataset } from '../types';

interface ProjectCardProps {
    dataset: Dataset;
    onResume?: (id: number) => void;
    onDelete: (id: number) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ dataset, onDelete }) => {
    const navigate = useNavigate();

    // Helper to determine status color/icon
    const getStatusConfig = (d: Dataset) => {
        if (!d.analyzed) return {
            color: "text-amber-400",
            bg: "bg-amber-500/10",
            border: "border-amber-500/20",
            icon: Clock,
            label: "Processing",
            subtext: "Ingestion in progress"
        };
        if (d.quality_score && d.quality_score > 80) return {
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/20",
            icon: Shield,
            label: "Verified",
            subtext: "Quality check passed"
        };
        return {
            color: "text-blue-400",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20",
            icon: CheckCircle,
            label: "Ready",
            subtext: "Analysis available"
        };
    };

    const status = getStatusConfig(dataset);

    // Action Handlers
    const handleAction = (path: string) => {
        navigate(`/dashboard/${dataset.id}${path}`);
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ y: -4 }}
            className="group bg-slate-900/40 backdrop-blur-md border border-white/5 hover:border-indigo-500/30 rounded-2xl p-5 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 flex flex-col h-full"
        >
            {/* Header: Name & Status */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3 overflow-hidden flex-1">
                    <div className="p-2.5 bg-slate-800 rounded-xl border border-white/5 group-hover:border-indigo-500/30 transition-colors shrink-0">
                        <FileText className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-bold text-white text-base leading-tight truncate" title={dataset.filename}>
                            {dataset.filename}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${status.color}`}>
                                {status.label}
                            </span>
                            <span className="text-[10px] text-slate-500">•</span>
                            <span className="text-[10px] text-slate-400 truncate hidden sm:inline">
                                {status.subtext}
                            </span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Are you sure you want to delete this project?')) onDelete(dataset.id);
                    }}
                    className="p-2 hover:bg-red-500/10 rounded-lg group/del transition-colors"
                    title="Delete Project"
                >
                    <Trash2 className="w-4 h-4 text-slate-600 group-hover/del:text-red-400" />
                </button>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-2 mb-6">
                <div className="p-2 bg-slate-800/30 rounded-lg border border-white/5 flex flex-col justify-center">
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">Rows</div>
                    <div className="text-sm font-mono text-white">{(dataset.row_count ?? 0).toLocaleString()}</div>
                </div>
                <div className="p-2 bg-slate-800/30 rounded-lg border border-white/5 flex flex-col justify-center relative group/tooltip">
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">
                        Quality
                        <HelpCircle className="w-3 h-3 text-slate-600 cursor-help" />
                    </div>
                    <div className={`text-sm font-mono font-bold ${(dataset.quality_score ?? 0) > 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {dataset.quality_score ?? 'N/A'}
                    </div>
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-[10px] text-white rounded opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-20">
                        Automated Health Score
                    </div>
                </div>
            </div>

            {/* Action Toolbar */}
            <div className="mt-auto pt-4 border-t border-white/5 grid grid-cols-4 gap-1">
                <ActionButton
                    icon={Eye}
                    label="View Data"
                    onClick={() => handleAction('/understanding')}
                    color="text-slate-400 hover:text-white"
                />
                <ActionButton
                    icon={Search}
                    label="EDA"
                    onClick={() => handleAction('/eda')}
                    color="text-indigo-400 hover:text-indigo-300"
                />
                <ActionButton
                    icon={BarChart2}
                    label="Visualize"
                    onClick={() => handleAction('/viz')}
                    color="text-purple-400 hover:text-purple-300"
                />
                <ActionButton
                    icon={MessageSquare}
                    label="Ask AI"
                    onClick={() => handleAction('/chat')}
                    color="text-emerald-400 hover:text-emerald-300"
                />
            </div>
        </motion.div>
    );
};

// Helper Action Component
const ActionButton = ({ icon: Icon, label, onClick, color }: any) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center gap-1 p-1 rounded-lg hover:bg-white/5 transition-colors group/btn relative ${color}`}
    >
        <Icon className="w-4 h-4" />
        <span className="text-[9px] font-medium opacity-70 group-hover/btn:opacity-100 hidden sm:block">
            {label}
        </span>
        {/* Tooltip for Mobile/desktop hover */}
        <span className="sr-only">{label}</span>
    </button>
);

export default ProjectCard;
