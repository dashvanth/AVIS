import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import { Loader2, Save, Trash2, Layout } from 'lucide-react';
import { getChartData, getEDASummary, saveDashboard, getDashboards, deleteDashboard } from '../services/api';
import type { Dashboard } from '../types';

interface VisualizationDashboardProps {
    datasetId: number;
}

const VisualizationDashboard: React.FC<VisualizationDashboardProps> = ({ datasetId }) => {
    const [loading, setLoading] = useState(false);
    const [columns, setColumns] = useState<string[]>([]);

    // Selectors
    const [xColumn, setXColumn] = useState<string>('');
    const [yColumn, setYColumn] = useState<string>('');
    const [chartType, setChartType] = useState<string>('bar');

    const [chartData, setChartData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    // Dashboard State
    const [dashboards, setDashboards] = useState<Dashboard[]>([]);
    const [dashboardName, setDashboardName] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Initial load
    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const [summary, dashboardsData] = await Promise.all([
                    getEDASummary(datasetId),
                    getDashboards(datasetId)
                ]);

                const cols = [
                    ...summary.numeric.map((c: any) => c.column),
                    ...summary.categorical.map((c: any) => c.column)
                ];
                setColumns(cols);
                setDashboards(dashboardsData);

                if (cols.length > 0) setXColumn(cols[0]);
                if (cols.length > 1) setYColumn(cols[1]);
            } catch (err) {
                console.error("Failed to load metadata", err);
            }
        };
        if (datasetId) fetchMetadata();
    }, [datasetId]);

    // Fetch chart data
    const fetchChart = async (x: string, y: string, type: string) => {
        if (!x) return;
        setLoading(true);
        setError(null);
        try {
            const yInfo = type === 'pie' ? undefined : y;
            const data = await getChartData(datasetId, x, type, yInfo);
            setChartData(data);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.detail || "Failed to generate chart");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (datasetId && xColumn) {
            fetchChart(xColumn, yColumn, chartType);
        }
    }, [datasetId, xColumn, yColumn, chartType]);

    const handleSaveDashboard = async () => {
        if (!dashboardName.trim()) return;
        setIsSaving(true);
        try {
            const config = { xColumn, yColumn, chartType };
            const newDashboard = await saveDashboard(datasetId, dashboardName, config);
            setDashboards([newDashboard, ...dashboards]);
            setDashboardName('');
        } catch (err) {
            console.error("Failed to save dashboard", err);
            alert("Failed to save dashboard");
        } finally {
            setIsSaving(false);
        }
    };

    const handleLoadDashboard = (dashboard: Dashboard) => {
        try {
            const config = JSON.parse(dashboard.layout_config);
            setXColumn(config.xColumn);
            setYColumn(config.yColumn);
            setChartType(config.chartType);
        } catch (e) {
            console.error("Invalid config", e);
        }
    };

    const handleDeleteDashboard = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm("Delete this saved view?")) {
            await deleteDashboard(id);
            setDashboards(prev => prev.filter(d => d.id !== id));
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
            <div className="lg:col-span-3 space-y-6">
                <h2 className="text-2xl font-bold text-slate-800">Visual Analytics</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Chart Type</label>
                        <select
                            value={chartType}
                            onChange={(e) => setChartType(e.target.value)}
                            className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="bar">Bar Chart</option>
                            <option value="pie">Pie Chart</option>
                            <option value="line">Line Chart</option>
                            <option value="scatter">Scatter Plot</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">X Axis</label>
                        <select
                            value={xColumn}
                            onChange={(e) => setXColumn(e.target.value)}
                            className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        >
                            {columns.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Y Axis {chartType === 'pie' && '(Ignored)'}</label>
                        <select
                            value={yColumn}
                            onChange={(e) => setYColumn(e.target.value)}
                            className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
                            disabled={chartType === 'pie'}
                        >
                            <option value="">(None - Count Frequency)</option>
                            {columns.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 min-h-[500px] flex items-center justify-center relative">
                    {loading ? (
                        <div className="flex flex-col items-center text-slate-500">
                            <Loader2 className="w-10 h-10 animate-spin mb-2" />
                            <p>Generating visualization...</p>
                        </div>
                    ) : error ? (
                        <div className="text-red-500">{error}</div>
                    ) : chartData ? (
                        <Plot
                            data={chartData.data}
                            layout={{
                                ...chartData.layout,
                                autosize: true,
                                width: undefined,
                                height: 500,
                                margin: { l: 50, r: 50, b: 50, t: 50, pad: 4 }
                            }}
                            style={{ width: '100%', height: '100%' }}
                            useResizeHandler={true}
                            config={{ responsive: true }}
                        />
                    ) : (
                        <p className="text-slate-400">Select parameters to visualize</p>
                    )}
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex items-center space-x-4">
                    <input
                        type="text"
                        placeholder="Name this view..."
                        value={dashboardName}
                        onChange={(e) => setDashboardName(e.target.value)}
                        className="flex-1 p-2 border border-slate-300 rounded-md"
                    />
                    <button
                        onClick={handleSaveDashboard}
                        disabled={!dashboardName || isSaving}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        Save View
                    </button>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 h-fit">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center">
                    <Layout className="w-4 h-4 mr-2" />
                    Saved Views
                </h3>
                <div className="space-y-3">
                    {dashboards.length === 0 ? (
                        <p className="text-sm text-slate-400">No saved views yet.</p>
                    ) : (
                        dashboards.map(dash => (
                            <div
                                key={dash.id}
                                onClick={() => handleLoadDashboard(dash)}
                                className="group p-3 border border-slate-100 rounded-md hover:bg-blue-50 hover:border-blue-200 cursor-pointer transition-all flex justify-between items-center"
                            >
                                <div>
                                    <p className="font-medium text-slate-700 text-sm group-hover:text-blue-700">{dash.name}</p>
                                    <p className="text-xs text-slate-400">{new Date(dash.created_at).toLocaleDateString()}</p>
                                </div>
                                <button
                                    onClick={(e) => handleDeleteDashboard(dash.id, e)}
                                    className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default VisualizationDashboard;
