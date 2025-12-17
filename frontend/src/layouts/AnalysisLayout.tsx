import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, useParams, useNavigate } from 'react-router-dom';
import { BarChart2, TrendingUp, Lightbulb, MessageSquare, ArrowLeft } from 'lucide-react';
import { getDatasets } from '../services/api';
import type { Dataset } from '../types';

const AnalysisLayout: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [dataset, setDataset] = useState<Dataset | null>(null);

    useEffect(() => {
        const fetchDataset = async () => {
            if (!id) return;
            try {
                // In a real app we might have getDatasetById endpoint, but specific list is fine for now
                const datasets = await getDatasets();
                const found = datasets.find(d => d.id === Number(id));
                if (found) setDataset(found);
            } catch (error) {
                console.error("Failed to fetch dataset info", error);
            }
        };
        fetchDataset();
    }, [id]);

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-indigo-100 flex flex-col shadow-xl z-20">
                <div className="p-6 border-b border-indigo-50 bg-gradient-to-br from-indigo-50/50 to-purple-50/50">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors mb-4 uppercase tracking-wider"
                    >
                        <ArrowLeft className="w-3 h-3 mr-1" />
                        Back to Hub
                    </button>
                    <h2 className="font-bold text-slate-800 text-lg leading-tight truncate" title={dataset?.filename}>
                        {dataset?.filename || "Loading..."}
                    </h2>
                    <div className="flex items-center mt-2 space-x-2">
                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase rounded-full">
                            {dataset?.file_type}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                            {dataset?.row_count.toLocaleString()} rows
                        </span>
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                    <NavLink
                        to={`/dashboard/${id}/eda`}
                        className={({ isActive }) => `flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 translate-x-1' : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'}`}
                    >
                        <BarChart2 className="w-5 h-5 mr-3" />
                        ED Analysis
                    </NavLink>
                    <NavLink
                        to={`/dashboard/${id}/viz`}
                        className={({ isActive }) => `flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${isActive ? 'bg-purple-600 text-white shadow-lg shadow-purple-200 translate-x-1' : 'text-slate-600 hover:bg-slate-50 hover:purple-600'}`}
                    >
                        <BarChart2 className="w-5 h-5 mr-3" />
                        Visualization
                    </NavLink>
                    <NavLink
                        to={`/dashboard/${id}/forecast`}
                        className={({ isActive }) => `flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${isActive ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 translate-x-1' : 'text-slate-600 hover:bg-slate-50 hover:text-emerald-600'}`}
                    >
                        <TrendingUp className="w-5 h-5 mr-3" />
                        Forecasting
                    </NavLink>
                    <NavLink
                        to={`/dashboard/${id}/insights`}
                        className={({ isActive }) => `flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${isActive ? 'bg-amber-500 text-white shadow-lg shadow-amber-200 translate-x-1' : 'text-slate-600 hover:bg-slate-50 hover:text-amber-600'}`}
                    >
                        <Lightbulb className="w-5 h-5 mr-3" />
                        AI Insights
                    </NavLink>
                    <NavLink
                        to={`/dashboard/${id}/chat`}
                        className={({ isActive }) => `flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${isActive ? 'bg-slate-800 text-white shadow-lg shadow-slate-300 translate-x-1' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'}`}
                    >
                        <MessageSquare className="w-5 h-5 mr-3" />
                        Data Chat
                    </NavLink>
                </nav>

                <div className="p-4 border-t border-indigo-50">
                    <div className="bg-indigo-50 rounded-xl p-4">
                        <p className="text-xs text-indigo-800 font-medium text-center">
                            AVIS Intelligence System
                        </p>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-auto bg-slate-50 relative">
                <div className="max-w-7xl mx-auto px-8 py-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <Outlet context={{ dataset }} />
                </div>
            </main>
        </div>
    );
};

export default AnalysisLayout;
