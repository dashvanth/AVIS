import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    AlertTriangle, CheckCircle,
    XCircle, ArrowRight, Database,
    Search, BarChart2, Shield
} from "lucide-react";
import { motion } from "framer-motion";

import { getDatasetPreview } from "../services/api";
import type { PreviewData } from "../types";

const DatasetUnderstandingPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [data, setData] = useState<PreviewData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            try {
                const result = await getDatasetPreview(Number(id));
                setData(result);
            } catch (err) {
                console.error("Failed to load preview data", err);
                setError("Failed to load dataset understanding.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    // Helper to render simple bold markdown
    const renderMarkdown = (text: string) => {
        if (!text) return "";
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, index) => {
            if (part.startsWith("**") && part.endsWith("**")) {
                return <strong key={index} className="text-white font-bold">{part.slice(2, -2)}</strong>;
            }
            return part;
        });
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-slate-400 text-sm animate-pulse">Analyzing dataset structure...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="bg-red-500/10 p-4 rounded-full mb-4">
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Analysis Failed</h3>
                <p className="text-slate-400 mb-6 max-w-md">{error || "Could not load dataset details."}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium text-sm"
                >
                    Retry Analysis
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-full bg-slate-950 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px]" />
            </div>

            {/* MAIN CONTENT CENTERED CONTAINER */}
            <main className="w-full max-w-5xl mx-auto px-6 py-10 space-y-12">

                {/* 1. DATASET IDENTITY & CONTEXT */}
                <section id="summary" className="scroll-mt-6">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="space-y-6"
                    >
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-4">
                            <div>
                                <h2 className="text-4xl font-black text-white tracking-tighter italic mb-2">
                                    Understanding Your Data
                                </h2>
                                <p className="text-slate-400 max-w-xl">
                                    We've analyzed <strong>{data.filename}</strong> to give you a complete forensic overview before you start exploring.
                                </p>
                            </div>

                            {/* Stats Cards */}
                            <div className="flex gap-3">
                                <div className="bg-slate-800/50 backdrop-blur border border-white/5 px-5 py-3 rounded-2xl text-center min-w-[100px]">
                                    <div className="text-3xl font-black text-white leading-none tracking-tight">{(data.row_count ?? 0).toLocaleString()}</div>
                                    <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">Rows</div>
                                </div>
                                <div className="bg-slate-800/50 backdrop-blur border border-white/5 px-5 py-3 rounded-2xl text-center min-w-[100px]">
                                    <div className="text-3xl font-black text-white leading-none tracking-tight">{data.column_count ?? 0}</div>
                                    <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">Columns</div>
                                </div>
                            </div>
                        </div>

                        {/* "What is this data?" Card */}
                        <motion.div
                            whileHover={{ scale: 1.002 }}
                            className="bg-gradient-to-br from-blue-900/20 to-slate-900/50 border border-blue-500/20 rounded-[2rem] p-8 backdrop-blur-xl relative overflow-hidden group shadow-2xl"
                        >
                            <div className="absolute top-0 right-[-20px] p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Database className="w-40 h-40 text-blue-400" />
                            </div>
                            <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2 uppercase tracking-widest">
                                <Search className="w-5 h-5 text-blue-400" />
                                What is this data?
                            </h3>
                            <p className="text-slate-300 leading-relaxed max-w-4xl text-lg font-medium opacity-90">
                                {renderMarkdown(data.dataset_explanation?.description || "A collection of records containing structured information.")}
                            </p>
                            {data.dataset_explanation?.usage_examples && (
                                <div className="mt-6 flex flex-wrap gap-2">
                                    {data.dataset_explanation.usage_examples.map((ex, i) => (
                                        <span key={i} className="px-3 py-1.5 bg-blue-500/10 text-blue-300 text-xs font-bold uppercase tracking-wider rounded-lg border border-blue-500/20">
                                            {ex}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                </section>

                {/* 2. DETECTED COLUMN TYPES */}
                <section id="columns" className="scroll-mt-12">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        className="bg-slate-900/40 border border-white/5 rounded-[2rem] p-8 backdrop-blur-sm"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-bold text-white mb-1">Detected Columns</h3>
                                <p className="text-slate-400 text-sm">Automated type inference scan.</p>
                            </div>
                            <div className="p-3 bg-indigo-500/10 rounded-xl">
                                <BarChart2 className="w-6 h-6 text-indigo-400" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {data.column_types?.map((col, idx) => (
                                <motion.div
                                    key={idx}
                                    whileHover={{ y: -2 }}
                                    className="bg-slate-800/30 p-4 rounded-xl border border-white/5 hover:border-indigo-500/30 transition-colors group"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-mono text-xs text-slate-500">#{idx + 1}</span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-md uppercase font-black tracking-widest ${col.representation === 'Number' ? 'bg-emerald-500/10 text-emerald-400' :
                                            col.representation === 'Date' ? 'bg-amber-500/10 text-amber-400' :
                                                'bg-slate-700 text-slate-300'
                                            }`}>
                                            {col.representation}
                                        </span>
                                    </div>
                                    <div className="font-bold text-white truncate text-sm group-hover:text-indigo-400 transition-colors" title={col.column_name}>
                                        {col.column_name}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </section>

                {/* 3. PROBLEMS FOUND */}
                <section id="problems" className="scroll-mt-12">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <h3 className="text-2xl font-black text-white tracking-tight">Health Check</h3>
                            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                        </div>

                        {(!data.data_issues || data.data_issues.length === 0) ? (
                            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-[2rem] p-10 text-center">
                                <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                                <h4 className="text-xl font-bold text-white mb-2">Clean Dataset</h4>
                                <p className="text-emerald-200/70 text-sm">No critical issues were found via forensic scan.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {data.data_issues.map((issue, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ scale: 0.95, opacity: 0 }}
                                        whileInView={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className={`p-6 rounded-[2rem] border backdrop-blur-sm ${issue.severity === 'High'
                                            ? 'bg-red-500/10 border-red-500/30'
                                            : 'bg-amber-500/10 border-amber-500/30'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                {issue.severity === 'High' ? (
                                                    <XCircle className="w-5 h-5 text-red-400" />
                                                ) : (
                                                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                                                )}
                                                <span className={`font-black text-sm uppercase tracking-wider ${issue.severity === 'High' ? 'text-red-400' : 'text-amber-400'
                                                    }`}>
                                                    {issue.issue_type}
                                                </span>
                                            </div>
                                            <span className="text-[10px] uppercase font-bold tracking-wider opacity-60 bg-black/20 px-2 py-1 rounded-lg">
                                                {issue.severity}
                                            </span>
                                        </div>
                                        <p className="text-white font-bold text-sm mb-2">
                                            Column: <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-white/80">{issue.column_name}</span>
                                        </p>
                                        <p className="text-sm opacity-80 leading-relaxed mb-4">
                                            {issue.explanation}
                                        </p>

                                        {/* ISSUE LOCATIONS DROPDOWN */}
                                        {issue.affected_rows && issue.affected_rows.length > 0 && (
                                            <details className="mt-2 group">
                                                <summary className="list-none flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider cursor-pointer opacity-70 hover:opacity-100 transition-opacity select-none p-2 hover:bg-white/5 rounded-lg">
                                                    <Search className="w-3 h-3" />
                                                    View First {issue.affected_rows.length} Rows
                                                </summary>
                                                <div className="mt-3 p-3 bg-black/40 rounded-xl text-[10px] font-mono text-slate-300 border border-white/5 animate-in fade-in slide-in-from-top-2">
                                                    <p className="mb-2 opacity-60">Zero-indexed Row Numbers:</p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {issue.affected_rows.map((rowIdx) => (
                                                            <span key={rowIdx} className="px-2 py-1 bg-white/10 rounded hover:bg-white/20 transition-colors cursor-default">
                                                                #{rowIdx}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </details>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </section>

                {/* 4. VISUAL PREVIEW */}
                <section id="preview" className="scroll-mt-12">
                    <div className="bg-slate-900 border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-white/5 bg-slate-900/50 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-white">Data Preview</h3>
                            <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-rose-500/20 border border-rose-500 rounded-full" />
                                    <span className="text-rose-400">Missing</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-slate-800 border border-slate-600 rounded-full" />
                                    <span className="text-slate-400">Clean</span>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead className="text-xs text-slate-400 uppercase bg-slate-950/50">
                                    <tr>
                                        {data.columns.map((col) => (
                                            <th key={col} className="px-6 py-4 font-black tracking-wider whitespace-nowrap border-b border-white/5">
                                                {col}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {(data.full_data || []).slice(0, 8).map((row, i) => (
                                        <tr key={i} className="hover:bg-white/5 transition-colors">
                                            {data.columns.map((col) => {
                                                const val = row[col];
                                                const isMissing = val === null || val === "" || val === "MISSING";
                                                return (
                                                    <td key={col} className={`px-6 py-3 whitespace-nowrap ${isMissing
                                                        ? "bg-rose-500/10 text-rose-400 font-bold border-l-4 border-l-rose-500"
                                                        : "text-slate-300 font-medium"
                                                        }`}>
                                                        {isMissing ? "MISSING" : String(val)}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-3 bg-slate-950/50 border-t border-white/5 text-center text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            Showing preview of {(data.row_count ?? 0).toLocaleString()} rows
                        </div>
                    </div>
                </section>

                {/* 5. QUALITY SCORE & NEXT STEPS */}
                <section id="score" className="scroll-mt-12 pb-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Score Card */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="bg-gradient-to-br from-indigo-900/20 to-slate-900 border border-indigo-500/20 rounded-[2.5rem] p-8 backdrop-blur-xl"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-2xl font-black text-white">Quality Score</h3>
                                    <p className="text-slate-400 text-xs mt-1">Automated algorithmic assessment</p>
                                </div>
                                <div className="relative">
                                    <svg className="w-20 h-20 transform -rotate-90">
                                        <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
                                        <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="transparent"
                                            className={data.quality_score.score > 80 ? "text-emerald-500" : data.quality_score.score > 50 ? "text-amber-500" : "text-rose-500"}
                                            strokeDasharray={226}
                                            strokeDashoffset={226 - (226 * data.quality_score.score) / 100}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                                        <span className="text-xl font-black text-white">{data.quality_score.score}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {data.score_breakdown?.map((factor, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-rose-500" />
                                            <span className="text-slate-200 text-sm font-medium">{factor.reason}</span>
                                        </div>
                                        <span className="text-rose-400 font-mono font-bold text-sm bg-rose-500/10 px-2 py-1 rounded">{factor.score_change}</span>
                                    </div>
                                ))}
                                {(!data.score_breakdown || data.score_breakdown.length === 0) && (
                                    <div className="flex items-center gap-3 p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400 text-sm font-bold">
                                        <CheckCircle className="w-5 h-5" />
                                        <span>Perfect score! No issues found.</span>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Readiness & ACTION */}
                        <div className="flex flex-col gap-6">
                            <motion.div
                                whileHover={{ y: -5 }}
                                className={`p-8 rounded-[2.5rem] border backdrop-blur-xl flex-1 flex flex-col justify-center ${data.readiness?.status === "Ready"
                                    ? "bg-emerald-900/10 border-emerald-500/30"
                                    : "bg-amber-900/10 border-amber-500/30"
                                    }`}
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <div className={`p-3 rounded-2xl ${data.readiness?.status === "Ready" ? "bg-emerald-500" : "bg-amber-500"
                                        }`}>
                                        <Shield className="w-6 h-6 text-white" />
                                    </div>
                                    <h4 className="text-xl font-black text-white">
                                        {data.readiness?.status === "Ready" ? "Analysis Ready" : "Cleaning Suggested"}
                                    </h4>
                                </div>
                                <p className="text-sm opacity-80 leading-relaxed font-medium pl-1">
                                    {data.readiness?.explanation}
                                </p>
                            </motion.div>

                            {/* CRITICAL ACTION BUTTON */}
                            <button
                                onClick={() => navigate(`/dashboard/${id}/eda`)}
                                className="w-full py-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-[2rem] shadow-xl shadow-indigo-500/30 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-3 group"
                            >
                                <span className="text-lg font-black uppercase tracking-widest">Move to Next Step: EDA</span>
                                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default DatasetUnderstandingPage;
