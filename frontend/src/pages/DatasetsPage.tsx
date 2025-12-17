import React, { useState, useEffect } from 'react';
import FileUpload from '../components/FileUpload';
import DatasetCard from '../components/DatasetCard';
import DataPreviewTable from '../components/DataPreviewTable';
import PreviewConfirmation from '../components/PreviewConfirmation';
import { getDatasets, deleteDataset, uploadDataset } from '../services/api';
import type { Dataset, PreviewData } from '../types';
import { Database, Search, Info, CheckCircle2, BarChart2, Layout, Zap } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const DatasetsPage: React.FC = () => {
    const [datasets, setDatasets] = useState<Dataset[]>([]);
    const [selectedDatasetId, setSelectedDatasetId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    // Wizard State
    const [uploadStep, setUploadStep] = useState<'upload' | 'preview' | 'success'>('upload');
    const [previewFile, setPreviewFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<PreviewData | null>(null);
    const [isConfirming, setIsConfirming] = useState(false);
    const [justUploadedDataset, setJustUploadedDataset] = useState<Dataset | null>(null);

    const fetchDatasets = async () => {
        try {
            const data = await getDatasets();
            setDatasets(data);
        } catch (error) {
            console.error("Failed to fetch datasets", error);
        }
    };

    useEffect(() => {
        fetchDatasets();
    }, []);

    const handlePreviewReady = (file: File, data: PreviewData) => {
        setPreviewFile(file);
        setPreviewData(data);
        setUploadStep('preview');
    };

    const handleConfirmUpload = async () => {
        if (!previewFile) return;
        setIsConfirming(true);
        try {
            const newDataset = await uploadDataset(previewFile);
            setDatasets(prev => [newDataset, ...prev]);
            setJustUploadedDataset(newDataset);
            setUploadStep('success');
            setPreviewFile(null);
            setPreviewData(null);
        } catch (error) {
            console.error("Upload failed", error);
        } finally {
            setIsConfirming(false);
        }
    };

    const handleCancelPreview = () => {
        setUploadStep('upload');
        setPreviewFile(null);
        setPreviewData(null);
    };

    const handleResetWizard = () => {
        setUploadStep('upload');
        setJustUploadedDataset(null);
    };

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure you want to delete this dataset?")) {
            await deleteDataset(id);
            setDatasets(prev => prev.filter(d => d.id !== id));
        }
    };

    // Deduplicate datasets: keep only the latest version of each filename
    const uniqueDatasets = React.useMemo(() => {
        const map = new Map<string, Dataset>();
        // Sort by ID descending (newest first) to ensure we keep the latest
        const sorted = [...datasets].sort((a, b) => b.id - a.id);

        sorted.forEach(d => {
            if (!map.has(d.filename)) {
                map.set(d.filename, d);
            }
        });
        return Array.from(map.values());
    }, [datasets]);

    const filteredDatasets = uniqueDatasets.filter(d =>
        d.filename.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold text-avis-text-primary tracking-tight">Data Hub</h1>
                    <p className="text-avis-text-secondary text-lg max-w-2xl">
                        Manage your analytical assets. Upload raw data, inspect schema integrity, and prepare sources for insights.
                    </p>
                </div>
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-avis-text-secondary group-focus-within:text-avis-accent-indigo transition-colors" />
                    <input
                        type="text"
                        placeholder="Search specific file..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-3 bg-avis-secondary border border-avis-border rounded-xl text-avis-text-primary text-sm focus:outline-none focus:border-avis-accent-indigo focus:ring-1 focus:ring-avis-accent-indigo transition-all w-72 shadow-sm"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
                {/* Upload Section - 2/3 width */}
                <div className="lg:col-span-2">
                    <AnimatePresence mode="wait">
                        {uploadStep === 'upload' ? (
                            <motion.div
                                key="upload"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                            >
                                <FileUpload
                                    onPreview={handlePreviewReady}
                                    autoUpload={false}
                                />
                            </motion.div>
                        ) : uploadStep === 'preview' ? (
                            <motion.div
                                key="preview"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                {previewData && (
                                    <PreviewConfirmation
                                        preview={previewData}
                                        onConfirm={handleConfirmUpload}
                                        onCancel={handleCancelPreview}
                                        isUploading={isConfirming}
                                    />
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-avis-secondary border border-avis-border rounded-2xl p-8 text-center"
                            >
                                <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                                    <CheckCircle2 className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-bold text-avis-text-primary mb-2">Upload Complete!</h3>
                                <p className="text-avis-text-secondary mb-8">"{justUploadedDataset?.filename}" has been successfully processed.</p>

                                <h4 className="text-sm font-semibold text-avis-text-secondary uppercase tracking-wider mb-4">What's Next?</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <button
                                        onClick={() => navigate(`/dashboard/${justUploadedDataset?.id}/eda`)}
                                        className="p-4 bg-avis-primary hover:bg-avis-accent-indigo/10 border border-avis-border hover:border-avis-accent-indigo/50 rounded-xl transition-all group text-left"
                                    >
                                        <div className="p-2 bg-avis-secondary rounded-lg w-fit mb-3 group-hover:scale-110 transition-transform">
                                            <BarChart2 className="w-5 h-5 text-avis-accent-cyan" />
                                        </div>
                                        <p className="font-bold text-avis-text-primary text-sm">Run EDA</p>
                                        <p className="text-xs text-avis-text-secondary mt-1">Explore stats & charts</p>
                                    </button>
                                    <button
                                        onClick={() => navigate(`/app/builder`)} // Assuming builder might take ID later or manually select
                                        className="p-4 bg-avis-primary hover:bg-avis-accent-indigo/10 border border-avis-border hover:border-avis-accent-indigo/50 rounded-xl transition-all group text-left"
                                    >
                                        <div className="p-2 bg-avis-secondary rounded-lg w-fit mb-3 group-hover:scale-110 transition-transform">
                                            <Layout className="w-5 h-5 text-purple-400" />
                                        </div>
                                        <p className="font-bold text-avis-text-primary text-sm">Dashboard</p>
                                        <p className="text-xs text-avis-text-secondary mt-1">Build a custom view</p>
                                    </button>
                                    <button
                                        onClick={() => navigate(`/dashboard/${justUploadedDataset?.id}/insights`)}
                                        className="p-4 bg-avis-primary hover:bg-avis-accent-indigo/10 border border-avis-border hover:border-avis-accent-indigo/50 rounded-xl transition-all group text-left"
                                    >
                                        <div className="p-2 bg-avis-secondary rounded-lg w-fit mb-3 group-hover:scale-110 transition-transform">
                                            <Zap className="w-5 h-5 text-yellow-400" />
                                        </div>
                                        <p className="font-bold text-avis-text-primary text-sm">Get Insights</p>
                                        <p className="text-xs text-avis-text-secondary mt-1">AI-powered analysis</p>
                                    </button>
                                </div>
                                <button onClick={handleResetWizard} className="mt-8 text-sm text-avis-text-secondary hover:text-avis-text-primary underline">
                                    Upload another file
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Info / Quick Tips - 1/3 width */}
                <div className="bg-gradient-to-br from-avis-secondary to-avis-primary border border-avis-border rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-avis-accent-cyan/10 rounded-full blur-3xl -mr-16 -mt-16 transition-transform group-hover:scale-150"></div>

                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-avis-accent-cyan/20 rounded-lg text-avis-accent-cyan">
                                <Info className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-bold text-avis-text-primary">Why Upload Here?</h3>
                        </div>
                        <ul className="space-y-4">
                            {[
                                'Automatic Schema Detection',
                                'Instant Data Quality Check',
                                'Secure & Private Storage',
                                'Ready for One-Click Forecasting'
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-avis-accent-success shrink-0 mt-0.5" />
                                    <span className="text-avis-text-secondary text-sm">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Datasets Grid */}
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-avis-border">
                <Database className="w-5 h-5 text-avis-accent-indigo" />
                <h2 className="text-xl font-bold text-avis-text-primary">Available Datasets <span className="text-avis-text-secondary font-normal ml-2 text-base">({uniqueDatasets.length})</span></h2>
            </div>

            {/* Suggested Actions (Only show if datasets > 0) */}
            {datasets.length > 0 && (
                <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Could act as 'Success' prompt area, but keeping persistent for now */}
                </div>
            )}

            {filteredDatasets.length === 0 ? (
                <div className="text-center py-24 bg-avis-secondary/30 border border-dashed border-avis-border rounded-3xl backdrop-blur-sm">
                    <div className="w-16 h-16 bg-avis-secondary rounded-full flex items-center justify-center mx-auto mb-4 border border-avis-border">
                        <Database className="w-8 h-8 text-avis-text-secondary" />
                    </div>
                    <p className="text-avis-text-secondary text-lg">No datasets found.</p>
                    <p className="text-sm text-avis-text-secondary mt-1">Try uploading a new file or adjusting your search.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <AnimatePresence>
                        {filteredDatasets.map((dataset, idx) => (
                            <motion.div
                                key={dataset.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <DatasetCard
                                    dataset={dataset}
                                    onDelete={handleDelete}
                                    onPreview={setSelectedDatasetId}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Preview Modal for Existing Datasets */}
            <AnimatePresence>
                {selectedDatasetId && (
                    <DataPreviewTable
                        datasetId={selectedDatasetId}
                        onClose={() => setSelectedDatasetId(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default DatasetsPage;
