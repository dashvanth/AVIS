import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    BarChart2,
    Eye, Shield, Clock, CheckCircle,
    FileSpreadsheet, FileText, FileCode,
    Trash2, Rows3, Columns3, HardDrive, Calendar
} from 'lucide-react';
import type { Dataset } from '../types';

interface ProjectCardProps {
    dataset: Dataset;
    onResume?: (id: number) => void;
    onDelete: (id: number) => void;
}

// Map file types to icons and colors
const FILE_TYPE_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
    csv: { icon: FileSpreadsheet, color: "text-emerald-400", label: "CSV" },
    xlsx: { icon: FileSpreadsheet, color: "text-blue-400", label: "Excel" },
    xls: { icon: FileSpreadsheet, color: "text-blue-400", label: "Excel" },
    json: { icon: FileText, color: "text-yellow-400", label: "JSON" },
    xml: { icon: FileCode, color: "text-orange-400", label: "XML" },
};

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
            subtext: "Still being analyzed"
        };
        if (d.quality_score && d.quality_score > 80) return {
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/20",
            icon: Shield,
            label: "Good Quality",
            subtext: "Data looks healthy"
        };
        return {
            color: "text-blue-400",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20",
            icon: CheckCircle,
            label: "Needs Review",
            subtext: "Some issues found"
        };
    };

    const status = getStatusConfig(dataset);
    const fileConfig = FILE_TYPE_CONFIG[dataset.file_type] || FILE_TYPE_CONFIG.csv;
    const FileIcon = fileConfig.icon;

    // Format file size for humans
    const formatSize = (bytes: number) => {
        if (!bytes) return "—";
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    };

    // Format date simply
    const formatDate = (dateStr: string) => {
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        } catch {
            return "—";
        }
    };

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
            {/* Header: Name, Type Badge & Delete */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3 overflow-hidden flex-1">
                    <div className="p-2.5 bg-slate-800 rounded-xl border border-white/5 group-hover:border-indigo-500/30 transition-colors shrink-0">
                        <FileIcon className={`w-5 h-5 ${fileConfig.color}`} />
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
                            <span className="text-[10px] text-slate-400 truncate">
                                {status.subtext}
                            </span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Are you sure you want to delete this dataset?')) onDelete(dataset.id);
                    }}
                    className="p-2 hover:bg-red-500/10 rounded-lg group/del transition-colors"
                    title="Delete Dataset"
                >
                    <Trash2 className="w-4 h-4 text-slate-600 group-hover/del:text-red-400" />
                </button>
            </div>

            {/* Info Grid — Shows key dataset properties */}
            <div className="grid grid-cols-2 gap-2 mb-4">
                <InfoCell icon={Rows3} label="Rows" value={(dataset.row_count ?? 0).toLocaleString()} />
                <InfoCell icon={Columns3} label="Columns" value={(dataset.column_count ?? 0).toString()} />
                <InfoCell icon={HardDrive} label="Size" value={formatSize(dataset.file_size_bytes)} />
                <InfoCell
                    icon={Eye}
                    label="Health"
                    value={dataset.quality_score != null ? `${dataset.quality_score}/100` : "N/A"}
                    valueColor={(dataset.quality_score ?? 0) > 80 ? "text-emerald-400" : "text-amber-400"}
                />
            </div>

            {/* File type & date row */}
            <div className="flex items-center justify-between text-[10px] text-slate-500 mb-4 px-1">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md ${fileConfig.color} bg-white/5 font-bold uppercase`}>
                    {fileConfig.label}
                </span>
                <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(dataset.created_at)}
                </span>
            </div>

            {/* Action Toolbar */}
            <div className="mt-auto pt-4 border-t border-white/5 space-y-2">
                <button
                    onClick={() => handleAction('/analyze')}
                    className="w-full flex items-center justify-center py-2.5 text-xs font-bold text-white bg-gradient-to-r from-avis-accent-indigo to-avis-accent-cyan rounded-xl hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all transform hover:-translate-y-0.5 group/btn"
                >
                    <BarChart2 className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform" />
                    Open & Analyze
                </button>
            </div>
        </motion.div>
    );
};

// Small info cell component
const InfoCell = ({ icon: Icon, label, value, valueColor = "text-white" }: { icon: any; label: string; value: string; valueColor?: string }) => (
    <div className="p-2 bg-slate-800/30 rounded-lg border border-white/5 flex flex-col justify-center">
        <div className="flex items-center gap-1 text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">
            <Icon className="w-3 h-3" />
            {label}
        </div>
        <div className={`text-sm font-mono font-bold ${valueColor}`}>{value}</div>
    </div>
);

export default ProjectCard;
