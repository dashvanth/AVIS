import React from 'react';
import { FileText, Trash2, BarChart2, TrendingUp, Lightbulb, MessageSquare } from 'lucide-react';
import type { Dataset } from '../types';

interface DatasetListProps {
    datasets: Dataset[];
    onDelete: (id: number) => void;
    onAnalyze: (id: number) => void;
    onVisualize: (id: number) => void;
    onForecast: (id: number) => void;
    onInsights: (id: number) => void;
    onChat: (id: number) => void;
}

const DatasetList: React.FC<DatasetListProps> = ({ datasets, onDelete, onAnalyze, onVisualize, onForecast, onInsights, onChat }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {datasets.map((dataset) => (
                <div key={dataset.id} className="group bg-avis-primary rounded-2xl shadow-lg border border-avis-border p-6 flex flex-col hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] hover:border-avis-accent-indigo/50 transition-all duration-300 relative overflow-hidden">
                    {/* Glow Effect */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-avis-accent-indigo opacity-0 group-hover:opacity-10 blur-[60px] transition-opacity"></div>

                    <div className="flex items-start justify-between mb-6 relative z-10">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-gradient-to-br from-avis-accent-indigo to-purple-600 rounded-xl shadow-inner">
                                <FileText className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-avis-text-primary truncate max-w-[150px] text-lg group-hover:text-avis-accent-indigo transition-colors" title={dataset.filename}>{dataset.filename}</h3>
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-avis-secondary text-avis-text-secondary border border-avis-border uppercase tracking-wide mt-1">
                                    {dataset.file_type}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={() => onDelete(dataset.id)}
                            className="text-avis-text-secondary hover:text-red-500 transition-colors p-2 hover:bg-red-500/10 rounded-lg"
                            title="Delete Datset"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
                        <div className="bg-avis-secondary p-3 rounded-xl border border-avis-border group-hover:border-avis-accent-indigo/30 transition-colors">
                            <span className="text-xs text-avis-text-secondary font-semibold uppercase tracking-wider block mb-1">Rows</span>
                            <span className="text-avis-text-primary font-bold font-mono">{dataset.row_count.toLocaleString()}</span>
                        </div>
                        <div className="bg-avis-secondary p-3 rounded-xl border border-avis-border group-hover:border-avis-accent-indigo/30 transition-colors">
                            <span className="text-xs text-avis-text-secondary font-semibold uppercase tracking-wider block mb-1">Columns</span>
                            <span className="text-avis-text-primary font-bold font-mono">{dataset.column_count.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="mt-auto pt-4 border-t border-avis-border flex items-center justify-between relative z-10 mb-4">
                        <span className="text-xs text-avis-text-secondary/70 font-medium">
                            Uploaded {new Date(dataset.created_at).toLocaleDateString()}
                        </span>
                    </div>

                    {/* Action Grid */}
                    <div className="grid grid-cols-2 gap-2 relative z-10">
                        <button
                            onClick={() => onAnalyze(dataset.id)}
                            className="flex items-center justify-center px-4 py-2 text-xs font-bold text-indigo-300 bg-indigo-900/20 border border-indigo-500/20 rounded-lg hover:bg-indigo-500/20 hover:text-white transition-all"
                        >
                            <BarChart2 className="w-3 h-3 mr-2" />
                            Analyze
                        </button>
                        <button
                            onClick={() => onVisualize(dataset.id)}
                            className="flex items-center justify-center px-4 py-2 text-xs font-bold text-purple-300 bg-purple-900/20 border border-purple-500/20 rounded-lg hover:bg-purple-500/20 hover:text-white transition-all"
                        >
                            <BarChart2 className="w-3 h-3 mr-2" />
                            Visualize
                        </button>
                        <button
                            onClick={() => onForecast(dataset.id)}
                            className="flex items-center justify-center px-4 py-2 text-xs font-bold text-emerald-300 bg-emerald-900/20 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 hover:text-white transition-all"
                        >
                            <TrendingUp className="w-3 h-3 mr-2" />
                            Forecast
                        </button>
                        <button
                            onClick={() => onInsights(dataset.id)}
                            className="flex items-center justify-center px-4 py-2 text-xs font-bold text-amber-300 bg-amber-900/20 border border-amber-500/20 rounded-lg hover:bg-amber-500/20 hover:text-white transition-all"
                        >
                            <Lightbulb className="w-3 h-3 mr-2" />
                            Insights
                        </button>
                        <button
                            onClick={() => onChat(dataset.id)}
                            className="col-span-2 flex items-center justify-center px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-avis-accent-indigo to-avis-accent-cyan rounded-lg hover:shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all transform hover:-translate-y-0.5"
                        >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Chat with Data
                        </button>
                    </div>
                </div>
            ))}

            {datasets.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-400">
                    <p>No datasets uploaded yet.</p>
                </div>
            )}
        </div>
    );
};

export default DatasetList;
