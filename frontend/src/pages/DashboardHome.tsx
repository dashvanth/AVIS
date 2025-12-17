import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import FileUpload from '../components/FileUpload';
import DatasetList from '../components/DatasetList';
import StatCard from '../components/StatCard';
import { getDatasets, deleteDataset } from '../services/api';
import type { Dataset } from '../types';
import { Database, Activity, TrendingUp, Layout } from 'lucide-react';

const DashboardHome: React.FC = () => {
    const [datasets, setDatasets] = useState<Dataset[]>([]);
    const navigate = useNavigate();

    const fetchDatasets = async () => {
        try {
            const data = await getDatasets();

            // Filter out duplicates based on filename, keeping the latest upload
            const latestDatasetsMap = new Map();
            data.forEach(item => {
                const existing = latestDatasetsMap.get(item.filename);
                if (!existing || item.id > existing.id) {
                    latestDatasetsMap.set(item.filename, item);
                }
            });

            // Convert to array and sort by latest
            const uniqueDatasets = Array.from(latestDatasetsMap.values())
                .sort((a: any, b: any) => b.id - a.id);

            setDatasets(uniqueDatasets);
        } catch (error) {
            console.error("Failed to fetch datasets", error);
        }
    };

    useEffect(() => {
        fetchDatasets();
    }, []);

    const handleUploadSuccess = (newDataset: Dataset) => {
        setDatasets(prev => {
            // Check if already exists just in case
            if (prev.some(d => d.id === newDataset.id)) return prev;
            return [newDataset, ...prev];
        });
    };

    const handleDelete = async (id: number) => {
        // Optimistic update
        setDatasets(prev => prev.filter(d => d.id !== id));
        try {
            await deleteDataset(id);
        } catch (error) {
            console.error("Failed to delete dataset", error);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                duration: 0.5
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 100 } as any
        }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-7xl mx-auto px-6 py-8"
        >
            {/* Header Section */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-avis-text-primary tracking-tight">Your Dashboard</h1>
                    <p className="text-avis-text-secondary">Track your analysis results, insights, and visualizations.</p>
                </div>
                {/* Icons Removed as requested */}
            </motion.div>

            {/* Stats Bar */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <StatCard
                    title="Total Datasets"
                    value={datasets.length}
                    icon={<Database className="w-5 h-5" />}
                    trend="+2 this week"
                    trendUp={true}
                />
                <StatCard
                    title="Analyses Done"
                    value="12"
                    icon={<Activity className="w-5 h-5" />}
                    trend="+5 today"
                    trendUp={true}
                />
                <StatCard
                    title="Last Forecast"
                    value="2h ago"
                    icon={<TrendingUp className="w-5 h-5" />}
                />
                <StatCard
                    title="Active Dashboard"
                    value="3"
                    icon={<Layout className="w-5 h-5" />}
                />
            </motion.div>

            {/* Main Content Grid */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 gap-8">
                {/* History / Recent Datasets Section */}
                <div className="bg-avis-secondary border border-avis-border rounded-2xl p-6 min-h-[500px] shadow-sm relative overflow-hidden">
                    {/* Ambient background glow for aesthetics */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-avis-accent-indigo/5 blur-[100px] rounded-full pointer-events-none"></div>

                    <div className="flex justify-between items-center mb-6 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-avis-accent-indigo to-purple-600 rounded-lg shadow shadow-indigo-500/20">
                                <Database className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-avis-text-primary">History</h3>
                        </div>
                        <button
                            onClick={fetchDatasets}
                            className="text-sm text-avis-text-secondary hover:text-white transition-colors bg-avis-primary/50 px-3 py-1 rounded-lg border border-transparent hover:border-avis-border"
                        >
                            Refresh
                        </button>
                    </div>

                    {datasets.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
                            <div className="w-20 h-20 bg-avis-primary rounded-full flex items-center justify-center mb-4 border border-avis-border shadow-inner">
                                <Database className="w-10 h-10 text-avis-text-secondary/50" />
                            </div>
                            <h4 className="text-lg font-semibold text-avis-text-primary mb-2">No History Yet</h4>
                            <p className="text-avis-text-secondary max-w-sm mb-6">Upload your first dataset to start generating insights and visualizations.</p>
                            <FileUpload onUploadSuccess={handleUploadSuccess} />
                        </div>
                    ) : (
                        <DatasetList
                            datasets={datasets}
                            onDelete={handleDelete}
                            onAnalyze={(id) => navigate(`/dashboard/${id}/eda`)}
                            onVisualize={(id) => navigate(`/dashboard/${id}/viz`)}
                            onForecast={(id) => navigate(`/dashboard/${id}/forecast`)}
                            onInsights={(id) => navigate(`/dashboard/${id}/insights`)}
                            onChat={(id) => navigate(`/dashboard/${id}/chat`)}
                        />
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default DashboardHome;
