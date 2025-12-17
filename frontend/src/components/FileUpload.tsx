import React, { useCallback, useState } from 'react';
import { UploadCloud, AlertCircle, Loader2 } from 'lucide-react';
import { uploadDataset, previewDataset } from '../services/api'; // Import previewDataset
import type { Dataset, PreviewData } from '../types';
import { motion } from 'framer-motion';

interface FileUploadProps {
    onUploadSuccess?: (dataset: Dataset) => void;
    onPreview?: (file: File, data: PreviewData) => void;
    autoUpload?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUploadSuccess, onPreview, autoUpload = true }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragging(true);
        } else if (e.type === 'dragleave') {
            setIsDragging(false);
        }
    }, []);

    const processFile = async (file: File) => {
        setIsUploading(true);
        setError(null);
        try {
            if (onPreview) {
                // Preview Mode
                const previewData = await previewDataset(file);
                onPreview(file, previewData);
            } else if (autoUpload && onUploadSuccess) {
                // Auto Upload Mode (Legacy)
                const dataset = await uploadDataset(file);
                onUploadSuccess(dataset);
            }
        } catch (err: any) {
            const msg = err.response?.data?.detail || "Process failed. Please try again.";
            setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
        } finally {
            setIsUploading(false);
        }
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    }, [onPreview, onUploadSuccess, autoUpload]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    };

    return (
        <div className="w-full">
            <motion.div
                whileHover={{ scale: 1.01 }}
                animate={isDragging ? { scale: 1.02, borderColor: 'rgba(99,102,241,0.8)', backgroundColor: 'rgba(99,102,241,0.05)' } : {}}
                className={`
                    relative group border-2 border-dashed rounded-3xl p-12 transition-all duration-300 ease-in-out cursor-pointer overflow-hidden
                    ${isDragging
                        ? 'border-avis-accent-indigo bg-avis-accent-indigo/5 shadow-[0_0_30px_rgba(99,102,241,0.2)]'
                        : 'border-avis-border bg-avis-glass hover:border-avis-accent-indigo/50 hover:bg-avis-secondary'
                    }
                `}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-upload')?.click()}
            >
                <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    onChange={handleChange}
                    disabled={isUploading}
                    accept=".csv,.xlsx,.xls,.json,.xml,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/json,text/xml"
                />

                <div className="flex flex-col items-center justify-center text-center space-y-6 relative z-10">
                    <div className={`
                        p-6 rounded-full transition-all duration-500
                        ${isDragging ? 'bg-avis-accent-indigo/20 text-avis-accent-indigo rotate-12 scale-110' : 'bg-avis-secondary border border-avis-border text-avis-text-secondary group-hover:text-avis-accent-indigo group-hover:border-avis-accent-indigo/50 group-hover:-translate-y-2'}
                    `}>
                        <UploadCloud className="w-12 h-12" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-avis-text-primary mb-2">
                            {isDragging ? "Drop it like it's hot!" : "Upload your dataset"}
                        </p>
                        <p className="text-avis-text-secondary max-w-sm mx-auto leading-relaxed">
                            Drag & drop your CSV, Excel, JSON or XML file here, or click to browse.
                        </p>
                    </div>

                    <div className="flex gap-3 pt-2">
                        {['CSV', 'Excel', 'JSON', 'XML'].map(fmt => (
                            <span key={fmt} className="px-3 py-1 bg-avis-primary border border-avis-border rounded-lg text-xs font-mono text-avis-text-secondary">
                                {fmt}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Animated Background Gradient for flair */}
                <div className="absolute inset-0 bg-gradient-to-tr from-avis-accent-indigo/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

                {isUploading && (
                    <div className="absolute inset-0 bg-avis-primary/90 backdrop-blur-sm flex items-center justify-center z-20 transition-all">
                        <div className="flex flex-col items-center space-y-4">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            >
                                <Loader2 className="w-12 h-12 text-avis-accent-indigo" />
                            </motion.div>
                            <p className="text-lg font-semibold text-avis-accent-indigo animate-pulse">Analyzing structure...</p>
                        </div>
                    </div>
                )}
            </motion.div>

            {error && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 bg-red-500/10 border-l-4 border-red-500 text-red-200 rounded-r-lg flex items-center shadow-lg"
                >
                    <AlertCircle className="w-5 h-5 mr-3 text-red-500" />
                    <div>
                        <span className="font-bold text-red-500 mr-2">Error:</span> {error}
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default FileUpload;
