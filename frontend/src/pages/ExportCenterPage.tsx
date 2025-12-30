
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    Download,
    Package,
    FileText,
    Table,
    Image as ImageIcon,
    AlertTriangle,
    Database,
    Archive,
    CheckCircle2,
    Info
} from "lucide-react";
import { motion } from "framer-motion";
import * as api from "../services/api";
import type { Dataset } from "../types";

const ExportCenterPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const datasetId = Number(id);
    const [dataset, setDataset] = useState<Dataset | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const datasets = await api.getDatasets();
                const found = datasets.find(d => d.id === datasetId);
                if (found) setDataset(found);
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, [datasetId]);

    const handleDownload = (type: "data" | "zip", version?: "original" | "prepared") => {
        const url = api.getDownloadUrl(datasetId, type, version);
        window.open(url, "_blank");
    };

    if (!dataset) return <div className="p-12 text-center text-slate-400">Loading download center...</div>;

    // State Logic
    const isPrepared = dataset.filename.includes("_prepared");

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pb-32">
            <div className="max-w-5xl mx-auto px-6 pt-12 space-y-16">

                {/* SECTION 1: Page Introduction */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-4"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest">
                        <Package className="w-3 h-3" />
                        Download Hub
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight">Export Your Results</h1>
                    <p className="text-slate-400 max-w-2xl mx-auto">
                        This page lets you download the data and results that A.V.I.S. has already prepared for you.
                        <br /><strong className="text-amber-400">No new analysis is performed here.</strong>
                    </p>
                </motion.section>

                {/* SECTION 2: Dataset Versions Available */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Original Card */}
                    <div className={`border rounded-2xl p-6 relative overflow-hidden group transition-all ${!isPrepared ? 'bg-slate-900/50 border-white/5 hover:border-indigo-500/30' : 'bg-slate-900/20 border-white/5 opacity-50 grayscale'}`}>
                        <div className="relative z-10">
                            <h3 className="text-lg font-bold text-white mb-1">Original Dataset</h3>
                            <p className="text-xs text-slate-500 mb-4 uppercase tracking-wider">Raw Upload</p>

                            <ul className="space-y-2 mb-6 text-sm text-slate-400">
                                <li className="flex justify-between border-b border-white/5 pb-1"><span>Filename:</span> <span className="text-slate-200">{dataset.filename}</span></li>
                                <li className="flex justify-between border-b border-white/5 pb-1"><span>Status:</span> <span className={!isPrepared ? "text-emerald-400" : "text-slate-500"}>{!isPrepared ? "Active" : "Archived"}</span></li>
                            </ul>

                            <button
                                onClick={() => handleDownload("data", "original")}
                                disabled={isPrepared}
                                className="w-full py-3 bg-slate-800 hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-900/50 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors border border-white/5"
                            >
                                <Download className="w-4 h-4" /> {!isPrepared ? "Download Original" : "Not Available Here"}
                            </button>
                            <p className="text-[10px] text-center mt-3 text-slate-600">Your original file is never touched.</p>
                        </div>
                    </div>

                    {/* Prepared Card */}
                    <div className={`border rounded-2xl p-6 relative overflow-hidden group transition-all ${isPrepared ? 'bg-indigo-900/10 border-indigo-500/20 hover:bg-indigo-900/20' : 'bg-slate-900/20 border-white/5 opacity-50 grayscale'}`}>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-1">Prepared Dataset</h3>
                                    <p className="text-xs text-indigo-300 mb-4 uppercase tracking-wider">Cleaned & Optimized</p>
                                </div>
                                {isPrepared && <span className="px-2 py-1 bg-emerald-500 text-black text-[10px] font-bold uppercase rounded-full">Current</span>}
                            </div>

                            <ul className="space-y-2 mb-6 text-sm text-indigo-100/70">
                                <li className="flex justify-between border-b border-indigo-500/20 pb-1"><span>Filename:</span> <span className="text-indigo-100">{dataset.filename}</span></li>
                                <li className="flex justify-between border-b border-indigo-500/20 pb-1"><span>Status:</span> <span className={isPrepared ? "text-emerald-400" : "text-slate-500"}>{isPrepared ? "Ready" : "Not Created"}</span></li>
                            </ul>

                            {isPrepared ? (
                                <button
                                    onClick={() => handleDownload("data", "prepared")}
                                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-500/20"
                                >
                                    <CheckCircle2 className="w-4 h-4" /> Download Prepared
                                </button>
                            ) : (
                                <button disabled className="w-full py-3 bg-slate-900/50 border border-white/5 text-slate-500 rounded-lg font-bold text-sm cursor-not-allowed flex items-center justify-center gap-2">
                                    Prepare First
                                </button>
                            )}
                            <p className="text-[10px] text-center mt-3 text-indigo-300/50">Recommended for analysis.</p>
                        </div>
                    </div>
                </section>

                {/* SECTION 3: Data File Export Table */}
                <section>
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Table className="w-5 h-5 text-indigo-400" /> Export Data Formats
                    </h2>
                    <div className="bg-slate-900 border border-white/5 rounded-xl overflow-hidden">
                        <table className="w-full text-left text-sm text-slate-400">
                            <thead className="bg-slate-950 text-slate-500 uppercase text-xs">
                                <tr>
                                    <th className="p-4 font-bold tracking-wider">Format</th>
                                    <th className="p-4 font-bold tracking-wider">Contains</th>
                                    <th className="p-4 text-right font-bold tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                <tr className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 text-white font-medium">CSV (Comma Separated)</td>
                                    <td className="p-4">Best for Excel, Pandas, R</td>
                                    <td className="p-4 text-right">
                                        <button onClick={() => handleDownload("data", isPrepared ? "prepared" : "original")} className="text-indigo-400 hover:text-indigo-300 font-bold text-xs underline decoration-2 underline-offset-4">Download</button>
                                    </td>
                                </tr>
                                <tr className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 text-white font-medium">JSON (Structured)</td>
                                    <td className="p-4">Best for Web Apps, APIs</td>
                                    <td className="p-4 text-right">
                                        <span className="text-slate-600 text-xs italic">Included in ZIP</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* SECTION 4: Chart Export Placeholder */}
                <section>
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-purple-400" /> Chart Gallery
                    </h2>
                    <div className="p-8 border border-dashed border-white/10 rounded-xl text-center bg-white/5">
                        <p className="text-slate-400 mb-2">Charts are generated dynamically in the Visualization Lab.</p>
                        <p className="text-xs text-slate-600">Please visit the "Visualization" tab to create and download specific charts.</p>
                    </div>
                </section>

                {/* SECTION 5 & 6: Reports */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-900 border border-white/10 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-slate-800 rounded-lg"><FileText className="w-5 h-5 text-blue-400" /></div>
                            <div>
                                <h3 className="text-white font-bold">Research Summary</h3>
                                <p className="text-xs text-slate-500">Plain English Findings</p>
                            </div>
                        </div>
                        <p className="text-sm text-slate-400 mb-6 min-h-[40px]">Download a human-readable summary of the key insights and data patterns.</p>
                        <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded font-bold text-xs border border-white/5 transition-colors cursor-not-allowed opacity-50">
                            Included in ZIP
                        </button>
                    </div>

                    <div className="bg-slate-900 border border-white/10 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-slate-800 rounded-lg"><AlertTriangle className="w-5 h-5 text-amber-400" /></div>
                            <div>
                                <h3 className="text-white font-bold">Issue Report</h3>
                                <p className="text-xs text-slate-500">Quality Audit</p>
                            </div>
                        </div>
                        <p className="text-sm text-slate-400 mb-6 min-h-[40px]">Detailed list of missing values, type mismatches, and anomalies.</p>
                        <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded font-bold text-xs border border-white/5 transition-colors cursor-not-allowed opacity-50">
                            Included in ZIP
                        </button>
                    </div>
                </section>

                {/* SECTION 7: Export Everything */}
                <section className="pt-8 border-t border-white/5">
                    <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8 shadow-2xl shadow-black/50">
                        <div className="p-4 bg-indigo-500 rounded-full shadow-lg shadow-indigo-500/40">
                            <Archive className="w-12 h-12 text-white" />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-2xl font-black text-white mb-2">Download Everything</h2>
                            <p className="text-indigo-200 text-sm">Get the full project bundle: Cleaned Data + Research Report + Issues List + Metadata.</p>
                        </div>
                        <button
                            onClick={() => handleDownload("zip")}
                            className="px-8 py-4 bg-white text-indigo-900 rounded-xl font-black text-lg hover:bg-indigo-50 hover:scale-105 transition-all shadow-xl"
                        >
                            Download ZIP Bundle
                        </button>
                    </div>
                </section>

                {/* SECTION 8: Disclaimer */}
                <section className="text-center pb-8 opacity-60">
                    <div className="inline-flex items-center gap-2 text-xs text-slate-500 bg-slate-900 px-4 py-2 rounded-full border border-white/5">
                        <Info className="w-3 h-3" />
                        <span>This export does not include predictions, machine learning results, or automated conclusions.</span>
                    </div>
                </section>

            </div>
        </div>
    );
};

export default ExportCenterPage;
