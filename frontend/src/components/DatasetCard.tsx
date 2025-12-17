import React from 'react';
import { FileText, Eye, Trash2, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Dataset } from '../types';

interface DatasetCardProps {
    dataset: Dataset;
    onDelete: (id: number) => void;
    onPreview: (id: number) => void;
}

const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const DatasetCard: React.FC<DatasetCardProps> = ({ dataset, onDelete, onPreview }) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ y: -5, borderColor: 'rgba(99,102,241,0.5)' }}
            className="group bg-avis-secondary border border-avis-border rounded-2xl p-6 relative overflow-hidden transition-all shadow-md hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
        >
            {/* Glowing Highlight Effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-avis-accent-indigo opacity-0 group-hover:opacity-10 blur-[60px] transition-opacity -mr-10 -mt-10 pointer-events-none"></div>

            <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="p-3 bg-avis-primary rounded-xl border border-avis-border group-hover:border-avis-accent-indigo/50 transition-colors">
                    <FileText className="w-6 h-6 text-avis-accent-indigo" />
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => { e.stopPropagation(); onPreview(dataset.id); }}
                        className="p-2 bg-avis-primary hover:bg-avis-accent-indigo hover:text-white text-avis-text-secondary rounded-lg transition-colors border border-avis-border"
                        title="Preview Data"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(dataset.id); }}
                        className="p-2 bg-avis-primary hover:bg-red-500 hover:text-white text-avis-text-secondary rounded-lg transition-colors border border-avis-border"
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="relative z-10">
                <h3 className="font-bold text-avis-text-primary text-lg truncate mb-1" title={dataset.filename}>
                    {dataset.filename}
                </h3>
                <div className="flex items-center gap-3 text-xs text-avis-text-secondary mb-4">
                    <span className="uppercase font-mono bg-avis-primary px-2 py-0.5 rounded border border-avis-border">
                        {dataset.file_type}
                    </span>
                    <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(dataset.created_at).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                        {formatBytes(dataset.file_size_bytes)}
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-avis-primary p-2 rounded-lg border border-avis-border">
                        <div className="text-[10px] text-avis-text-secondary uppercase tracking-wider">Rows</div>
                        <div className="font-mono font-bold text-avis-text-primary">{dataset.row_count.toLocaleString()}</div>
                    </div>
                    <div className="bg-avis-primary p-2 rounded-lg border border-avis-border">
                        <div className="text-[10px] text-avis-text-secondary uppercase tracking-wider">Cols</div>
                        <div className="font-mono font-bold text-avis-text-primary">{dataset.column_count.toLocaleString()}</div>
                    </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${dataset.analyzed ? 'bg-avis-accent-cyan/10 text-avis-accent-cyan' : 'bg-avis-accent-success/10 text-avis-accent-success'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-2 ${dataset.analyzed ? 'bg-avis-accent-cyan' : 'bg-avis-accent-success'}`}></span>
                        {dataset.analyzed ? 'Analyzed' : 'Ready'}
                    </span>
                </div>
            </div>
        </motion.div>
    );
};

export default DatasetCard;
