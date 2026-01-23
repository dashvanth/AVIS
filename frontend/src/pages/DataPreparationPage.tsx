
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Loader2,
    AlertCircle,
    CheckCircle2,
    FileText,
    Table,
    Database,
    ShieldAlert,
    ArrowRight,
    Trash2,
    AlertTriangle,
    RotateCcw
} from "lucide-react";
import { motion } from "framer-motion";
import * as api from "../services/api";
import type { PreviewData, PreparationSuggestions } from "../types";

const DataPreparationPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [preview, setPreview] = useState<PreviewData | null>(null);
    const [suggestions, setSuggestions] = useState<PreparationSuggestions | null>(null);

    // Configuration State
    const [fillConfig, setFillConfig] = useState<Record<string, string>>({});
    const [typeConfig, setTypeConfig] = useState<Record<string, string>>({});
    const [removeDuplicates, setRemoveDuplicates] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const [previewData, suggestionData] = await Promise.all([
                    api.getDatasetPreview(Number(id)),
                    api.getPreparationSuggestions(Number(id))
                ]);
                setPreview(previewData);
                setSuggestions(suggestionData);
            } catch (err: any) {
                console.error("Prep Fetch Error:", err);
                setError("Unable to load data preparation options.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleApply = async () => {
        if (!id) return;
        setSubmitting(true);
        try {
            const config = {
                fill_missing: fillConfig,
                convert_types: typeConfig,
                remove_duplicates: removeDuplicates
            };
            const result = await api.applyCleaning(Number(id), config);
            // Redirect to the NEW dataset dashboard
            navigate(`/dashboard/${result.new_dataset_id}/viz`);
        } catch (err: any) {
            console.error("Apply Error:", err);
            // Show error handling UI/Toast here in real app
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950">
                <Loader2 className="w-16 h-16 text-emerald-500 animate-spin" />
                <p className="text-slate-400 font-mono text-sm mt-6 animate-pulse tracking-widest">SCANNING FOR IMPROVEMENTS...</p>
            </div>
        );
    }

    if (error || !preview || !suggestions) return <div className="p-10 text-white text-center">{error}</div>;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen bg-[#0B0F19] text-slate-200 font-sans pb-32">
            {/* Header */}
            <div className="w-full max-w-[98%] mx-auto px-6 pt-16 pb-12">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="flex items-center gap-3 text-emerald-400 text-xs font-black uppercase tracking-[0.3em] mb-4">
                        <ShieldAlert className="w-4 h-4" /> Safe Preparation
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-4">
                        Data <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Preparation</span>
                    </h1>
                    <p className="text-slate-400 max-w-2xl text-lg leading-relaxed font-light">
                        We identified potential issues. <span className="text-white font-medium">You decide how to fix them.</span><br />
                        Your original file will <span className="text-emerald-400 font-bold">never</span> be changed.
                    </p>

                    {/* 🔹 NEW: Educational Context Block */}
                    <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                        <div className="p-6 bg-slate-900/40 border border-white/5 rounded-2xl">
                            <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                                <ShieldAlert className="w-4 h-4 text-emerald-400" /> Why is this needed?
                            </h3>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Missing values and wrong data types can break visualizations or lead to incorrect insights.
                                Fixing them here ensures your analysis is accurate.
                            </p>
                        </div>
                        <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
                            <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-amber-500" /> What if I simple skip this?
                            </h3>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Your charts might be incomplete, and some automated insights may fail.
                                It is safer to address these issues now.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="w-full max-w-[98%] mx-auto space-y-16 px-6 relative z-10"
            >
                {/* 🔹 SECTION 1: IDENTITY */}
                <motion.section variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                        { label: "Dataset", value: preview.filename, icon: FileText, color: "text-blue-400" },
                        { label: "Rows", value: preview.row_count, icon: Table, color: "text-emerald-400" },
                        { label: "Columns", value: preview.column_count, icon: Database, color: "text-purple-400" },
                        { label: "File Type", value: preview.file_type.toUpperCase(), icon: FileText, color: "text-amber-400" },
                    ].map((item, idx) => (
                        <div key={idx} className="p-6 bg-slate-900/40 border border-white/5 rounded-3xl flex flex-col items-center text-center gap-2 backdrop-blur-sm">
                            <span className="text-xs text-slate-500 uppercase tracking-widest">{item.label}</span>
                            <span className={`text-xl font-bold ${item.color}`}>{item.value}</span>
                        </div>
                    ))}
                </motion.section>

                {/* 🔹 SECTION 2: PROBLEMS FOUND */}
                <motion.section variants={itemVariants}>
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <AlertTriangle className="text-amber-500" />
                        Issues Detected
                    </h2>
                    {suggestions.missing_values.length === 0 && suggestions.duplicates.count === 0 && suggestions.wrong_types.length === 0 ? (
                        <div className="p-10 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl text-center">
                            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white">No Issues Found</h3>
                            <p className="text-emerald-200/70">Your data looks clean! You can proceed directly.</p>
                        </div>
                    ) : (
                        <div className="overflow-hidden bg-slate-900/60 border border-white/5 rounded-3xl backdrop-blur-md">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-black/20 text-slate-400 uppercase text-[10px] font-black tracking-widest">
                                    <tr>
                                        <th className="px-8 py-4">Column</th>
                                        <th className="px-8 py-4">Problem</th>
                                        <th className="px-8 py-4">Count</th>
                                        <th className="px-8 py-4">Severity</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {suggestions.missing_values.map((issue, i) => (
                                        <tr key={`m-${i}`}>
                                            <td className="px-8 py-4 font-bold text-white">{issue.column}</td>
                                            <td className="px-8 py-4 text-amber-400">Missing Values</td>
                                            <td className="px-8 py-4">{issue.count}</td>
                                            <td className="px-8 py-4"><span className="bg-amber-500/10 text-amber-500 px-2 py-1 rounded text-[10px] font-bold uppercase">Medium</span></td>
                                        </tr>
                                    ))}
                                    {suggestions.wrong_types.map((issue, i) => (
                                        <tr key={`t-${i}`}>
                                            <td className="px-8 py-4 font-bold text-white">{issue.column}</td>
                                            <td className="px-8 py-4 text-amber-400">Wrong Type ({issue.detected} vs {issue.expected})</td>
                                            <td className="px-8 py-4">All</td>
                                            <td className="px-8 py-4"><span className="bg-amber-500/10 text-amber-500 px-2 py-1 rounded text-[10px] font-bold uppercase">Medium</span></td>
                                        </tr>
                                    ))}
                                    {suggestions.duplicates.count > 0 && (
                                        <tr>
                                            <td className="px-8 py-4 font-bold text-white">Entire Row</td>
                                            <td className="px-8 py-4 text-amber-400">Duplicate Rows</td>
                                            <td className="px-8 py-4">{suggestions.duplicates.count}</td>
                                            <td className="px-8 py-4"><span className="bg-amber-500/10 text-amber-500 px-2 py-1 rounded text-[10px] font-bold uppercase">Low</span></td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                            <div className="p-4 bg-amber-500/10 border-t border-amber-500/20 text-center text-amber-200 text-sm">
                                We have <strong>NOT</strong> fixed these yet. You decide what to do below.
                            </div>
                        </div>
                    )}
                </motion.section>

                {/* 🔹 SECTION 3: MISSING VALUES HANDLING */}
                {suggestions.missing_values.length > 0 && (
                    <motion.section variants={itemVariants} className="space-y-6">
                        <h2 className="text-2xl font-bold text-white">Fix Missing Values</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {suggestions.missing_values.map((m, idx) => {
                                // Dynamic Recommendation Logic
                                const options = suggestions.suggestions.fill_missing[m.column] || [];
                                const hasMean = options.some(o => o.includes("Mean"));
                                const isSmallCount = m.count < (preview.row_count * 0.1); // Less than 10%

                                let recText = "Most users fill missing values to prevent data loss.";
                                if (hasMean) recText = "For numeric columns, filling with Average (Mean) keeps the data balanced.";
                                else if (isSmallCount && options.some(o => o.includes("Drop"))) recText = "Since only a few rows are missing, dropping them is safe.";
                                else recText = "Filling with 'Unknown' allows you to keep the rows for analysis.";

                                return (
                                    <div key={idx} className="bg-slate-900/40 border border-white/10 rounded-3xl p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="font-bold text-lg text-white">{m.column}</h3>
                                            <span className="text-red-400 text-xs font-mono bg-red-500/10 px-2 py-1 rounded">{m.count} Empty</span>
                                        </div>

                                        {/* Recommendation Badge */}
                                        <div className="mb-4">
                                            <p className="text-xs text-emerald-400 mb-1 flex items-center gap-1">
                                                <CheckCircle2 className="w-3 h-3" /> Recommendation:
                                            </p>
                                            <p className="text-xs text-slate-400 italic">
                                                {recText}
                                            </p>
                                        </div>

                                        <div className="space-y-3">
                                            {options.map((option) => (
                                                <label key={option} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${fillConfig[m.column] === option ? 'bg-emerald-500/20 border-emerald-500/50' : 'bg-black/20 border-white/5 hover:bg-white/5'}`}>
                                                    <input
                                                        type="radio"
                                                        name={`missing-${m.column}`}
                                                        value={option}
                                                        checked={fillConfig[m.column] === option}
                                                        onChange={(e) => setFillConfig({ ...fillConfig, [m.column]: e.target.value })}
                                                        className="w-4 h-4 text-emerald-500 accent-emerald-500"
                                                    />
                                                    <span className="text-sm text-slate-300">
                                                        {option}
                                                        {option.includes("Mean") && <span className="block text-[10px] text-slate-500">Best for numeric columns</span>}
                                                        {option.includes("Drop") && <span className="block text-[10px] text-slate-500">Removes entire row</span>}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </motion.section>
                )}

                {/* 🔹 SECTION 4: TYPE CORRECTION */}
                {suggestions.wrong_types.length > 0 && (
                    <motion.section variants={itemVariants} className="space-y-6">
                        <h2 className="text-2xl font-bold text-white">Correct Data Types</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {suggestions.wrong_types.map((t, idx) => (
                                <div key={idx} className="bg-slate-900/40 border border-white/10 rounded-3xl p-6">
                                    <div className="mb-4">
                                        <h3 className="font-bold text-lg text-white">{t.column}</h3>
                                        <p className="text-xs text-slate-500 mt-1">Stored as {t.detected}, looks like {t.expected}</p>
                                    </div>

                                    {/* 🔹 Educational Context */}
                                    <div className="mb-4 p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                                        <p className="text-[10px] text-indigo-300 leading-relaxed">
                                            <strong>Why fix this?</strong> This column contains numbers but is saved as text.
                                            You must convert it to calculate averages or sum values.
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        {(suggestions.suggestions.convert_types[t.column] || []).map((option) => (
                                            <label key={option} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${typeConfig[t.column] === option ? 'bg-indigo-500/20 border-indigo-500/50' : 'bg-black/20 border-white/5 hover:bg-white/5'}`}>
                                                <input
                                                    type="radio"
                                                    name={`type-${t.column}`}
                                                    value={option}
                                                    checked={typeConfig[t.column] === option}
                                                    onChange={(e) => setTypeConfig({ ...typeConfig, [t.column]: e.target.value })}
                                                    className="w-4 h-4 text-indigo-500 accent-indigo-500"
                                                />
                                                <span className="text-sm text-slate-300">
                                                    {option}
                                                    {option.includes("To") && <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full font-bold">Recommended</span>}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.section>
                )}

                {/* 🔹 SECTION 5: DUPLICATES */}
                {suggestions.duplicates.count > 0 && (
                    <motion.section variants={itemVariants} className="p-8 bg-slate-900/40 border border-white/10 rounded-3xl flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">Duplicate Rows Detected</h3>
                            <p className="text-slate-400">Found {suggestions.duplicates.count} identical rows. This can skew analysis.</p>
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setRemoveDuplicates(false)}
                                className={`px-6 py-3 rounded-xl font-medium text-sm transition-all ${!removeDuplicates ? 'bg-slate-700 text-white' : 'bg-transparent text-slate-500 hover:text-white'}`}
                            >
                                Keep Them
                            </button>
                            <button
                                onClick={() => setRemoveDuplicates(true)}
                                className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${removeDuplicates ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                            >
                                <Trash2 className="w-4 h-4" /> Remove Duplicates
                            </button>
                        </div>
                    </motion.section>
                )}

                {/* 🔹 SECTION 6: ROW SAFETY */}
                <motion.section variants={itemVariants} className="pt-8 border-t border-white/5">
                    <div className="bg-black/40 border border-white/5 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-emerald-500/10 rounded-full text-emerald-400">
                                <ShieldAlert className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white uppercase tracking-wider">Safety Guarantee</h3>
                                <p className="text-slate-400 text-sm">No rows will be removed unless you explicitly selected it.</p>
                            </div>
                        </div>
                        <div className="flex gap-12 text-center">
                            <div>
                                <div className="text-[10px] uppercase tracking-widest text-slate-500">Before</div>
                                <div className="text-2xl font-mono text-white">{preview.row_count}</div>
                            </div>
                            <ArrowRight className="w-6 h-6 text-slate-600 mt-2" />
                            <div>
                                <div className="text-[10px] uppercase tracking-widest text-emerald-400">After</div>
                                {/* IMPACT PREVIEW LOGIC */}
                                {(() => {
                                    const rowsRemoved = removeDuplicates ? suggestions.duplicates.count : 0;
                                    const newCount = preview.row_count - rowsRemoved;
                                    const isSafe = rowsRemoved === 0;

                                    return (
                                        <>
                                            <div className={`text-2xl font-mono ${isSafe ? "text-emerald-400" : "text-amber-400"}`}>
                                                {newCount}
                                            </div>
                                            <p className={`text-[10px] mt-1 ${isSafe ? "text-emerald-500/50" : "text-amber-500/80"}`}>
                                                {isSafe ? "No rows removed" : `${rowsRemoved} rows will be removed`}
                                            </p>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* 🔹 SECTION 7: APPLY */}
                <motion.section variants={itemVariants} className="pt-8 flex flex-col items-center gap-6 pb-12">
                    <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl text-amber-200/80 text-sm max-w-xl text-center">
                        This will create a <strong>new</strong> prepared dataset. Your original file remains unchanged.
                    </div>
                    <div className="flex gap-4 w-full max-w-md">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold uppercase tracking-widest text-xs"
                        >
                            Go Back
                        </button>
                        <button
                            onClick={handleApply}
                            disabled={submitting}
                            className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-400 text-black rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all transform hover:scale-105"
                        >
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                            Prepare & Visualize
                        </button>
                    </div>
                </motion.section>

                {/* 🔹 SECTION 8: OPTIONAL AUTO PREPARATION */}
                <motion.section variants={itemVariants} className="pt-12 pb-20 border-t border-white/5">
                    <div className="max-w-4xl mx-auto bg-indigo-500/5 border border-indigo-500/10 rounded-[2.5rem] p-10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

                        <div className="relative z-10 space-y-8">
                            <div className="text-center space-y-2">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest mb-2">
                                    <RotateCcw className="w-3 h-3" /> Optional Mode
                                </div>
                                <h2 className="text-3xl font-black text-white">Automatic Preparation</h2>
                                <p className="text-slate-400 leading-relaxed max-w-xl mx-auto">
                                    If you prefer, A.V.I.S. can automatically apply safe fixes using common data-cleaning rules.
                                    You will see exactly what was changed before anything is applied.
                                </p>
                            </div>

                            {/* Rules Table */}
                            <div className="bg-slate-950/50 border border-white/5 rounded-3xl overflow-hidden">
                                <div className="p-4 bg-white/5 border-b border-white/5">
                                    <h4 className="text-xs font-bold text-white uppercase tracking-widest">Automatic Fix Rules (Preview)</h4>
                                </div>
                                <table className="w-full text-left text-sm">
                                    <thead className="text-[10px] text-slate-500 uppercase font-black tracking-widest bg-white/5">
                                        <tr>
                                            <th className="px-6 py-3">Issue Type</th>
                                            <th className="px-6 py-3">Rule Used</th>
                                            <th className="px-6 py-3">Why</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 text-slate-400">
                                        <tr>
                                            <td className="px-6 py-4 font-bold text-white">Missing numeric values</td>
                                            <td className="px-6 py-4 text-emerald-400">Fill with Average</td>
                                            <td className="px-6 py-4">Keeps row count unchanged</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-4 font-bold text-white">Missing text values</td>
                                            <td className="px-6 py-4 text-emerald-400">Fill with "Unknown"</td>
                                            <td className="px-6 py-4">Preserves category meaning</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-4 font-bold text-white">Wrong data type</td>
                                            <td className="px-6 py-4 text-emerald-400">Convert to Number</td>
                                            <td className="px-6 py-4">Enables calculations</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-4 font-bold text-white">Extremely broken rows</td>
                                            <td className="px-6 py-4 text-amber-400">Keep rows</td>
                                            <td className="px-6 py-4">Avoids accidental data loss</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Auto Impact Preview */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 bg-black/20 rounded-2xl p-6 border border-white/5">
                                <div className="text-center">
                                    <div className="text-[9px] uppercase tracking-widest text-slate-500 mb-1">Rows Before</div>
                                    <div className="text-xl font-mono text-white">{preview.row_count}</div>
                                </div>
                                <div className="text-center border-l border-white/5 pl-4 md:pl-0">
                                    <div className="text-[9px] uppercase tracking-widest text-emerald-400 mb-1">Rows After</div>
                                    <div className="text-xl font-mono text-emerald-400">
                                        {preview.row_count}
                                        <span className="block text-[8px] opacity-60 font-sans tracking-normal mt-1">(Data Preserved)</span>
                                    </div>
                                </div>
                                <div className="text-center border-l border-white/5 pl-4 md:pl-0">
                                    <div className="text-[9px] uppercase tracking-widest text-indigo-400 mb-1">Columns Fixed</div>
                                    <div className="text-xl font-mono text-indigo-400">{suggestions.wrong_types.length}</div>
                                </div>
                                <div className="text-center border-l border-white/5 pl-4 md:pl-0">
                                    <div className="text-[9px] uppercase tracking-widest text-amber-400 mb-1">Missing Fixed</div>
                                    <div className="text-xl font-mono text-amber-400">{suggestions.missing_values.length}</div>
                                </div>
                            </div>

                            {/* Explicit Action Button */}
                            <div className="text-center">
                                <button
                                    onClick={() => {
                                        // Auto Logic Construct
                                        const autoFill: Record<string, string> = {};
                                        suggestions.missing_values.forEach(m => {
                                            const options = suggestions.suggestions.fill_missing[m.column] || [];
                                            if (options.some(o => o.includes("Mean"))) autoFill[m.column] = options.find(o => o.includes("Mean"))!; // Use Mean if avail
                                            else if (options.some(o => o.includes("Unknown"))) autoFill[m.column] = "Fill with 'Unknown'";
                                            else autoFill[m.column] = "Keep Empty"; // Fallback
                                        });

                                        const autoType: Record<string, string> = {};
                                        suggestions.wrong_types.forEach(t => {
                                            autoType[t.column] = "Convert to Number";
                                        });

                                        if (window.confirm("Confirm Automatic Preparation?\n\nThis will create a new dataset with automatic fixes applied.\nYour original dataset will remain unchanged.")) {
                                            setFillConfig(autoFill);
                                            setTypeConfig(autoType);
                                            setRemoveDuplicates(false); // Safety: Keep rows

                                            // Trigger Apply (need to wait for state update in real React, but here we can just call API directly logic is cleaner)
                                            // Actually, setFillConfig/etc are async. Better to call apply directly with values.
                                            setSubmitting(true);
                                            api.applyCleaning(Number(id), {
                                                fill_missing: autoFill,
                                                convert_types: autoType,
                                                remove_duplicates: false
                                            }).then((result) => navigate(`/dashboard/${result.new_dataset_id}/export`));
                                        }
                                    }}
                                    className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold uppercase tracking-widest text-xs shadow-[0_0_30px_rgba(79,70,229,0.4)] transition-all hover:scale-105"
                                >
                                    Create Prepared Dataset Automatically
                                </button>
                                <p className="text-[10px] text-indigo-300 mt-4 font-medium opacity-60">
                                    * Safest mode: No rows will be removed.
                                </p>
                            </div>

                        </div>
                    </div>
                </motion.section>

            </motion.div>
        </div>
    );
};

export default DataPreparationPage;
