import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import { Loader2, TrendingUp } from 'lucide-react';
import { getEDASummary, generateForecast } from '../services/api';

interface ForecastDashboardProps {
    datasetId: number;
}

const ForecastDashboard: React.FC<ForecastDashboardProps> = ({ datasetId }) => {
    const [loading, setLoading] = useState(false);
    const [columns, setColumns] = useState<string[]>([]);

    const [dateColumn, setDateColumn] = useState('');
    const [valueColumn, setValueColumn] = useState('');
    const [periods, setPeriods] = useState(30);

    const [forecastData, setForecastData] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const summary = await getEDASummary(datasetId);
                // We need all columns to let user pick Date (pandas inference handles strings)
                const cols = [
                    ...summary.numeric.map((c: any) => c.column),
                    ...summary.categorical.map((c: any) => c.column)
                ];
                setColumns(cols);

                // Heuristic to guess Date column
                const dateCol = cols.find((c: string) => c.toLowerCase().includes('date') || c.toLowerCase().includes('time'));
                if (dateCol) setDateColumn(dateCol);

                // Heuristic for Value (first numeric)
                if (summary.numeric.length > 0) setValueColumn(summary.numeric[0].column);

            } catch (err) {
                console.error("Failed to load metadata", err);
            }
        };
        if (datasetId) fetchMetadata();
    }, [datasetId]);

    const handleForecast = async () => {
        if (!dateColumn || !valueColumn) return;
        setLoading(true);
        setError(null);
        try {
            const data = await generateForecast(datasetId, dateColumn, valueColumn, periods);
            setForecastData(data);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.detail || "Forecast failed. Ensure the Date column is valid.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 mt-6">
            <div className="flex items-center space-x-2">
                <TrendingUp className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-slate-800">Time-Series Forecasting</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-white p-6 rounded-lg shadow-sm border border-slate-200 items-end">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Date Column</label>
                    <select
                        value={dateColumn}
                        onChange={(e) => setDateColumn(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select Date Column</option>
                        {columns.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Value Column (Target)</label>
                    <select
                        value={valueColumn}
                        onChange={(e) => setValueColumn(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select Value Column</option>
                        {columns.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Horizon (Days: {periods})</label>
                    <input
                        type="range"
                        min="7"
                        max="365"
                        value={periods}
                        onChange={(e) => setPeriods(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                    />
                </div>

                <button
                    onClick={handleForecast}
                    disabled={loading || !dateColumn || !valueColumn}
                    className="flex justify-center items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 h-[42px]"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : 'Run Forecast'}
                </button>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 min-h-[500px] flex items-center justify-center">
                {loading ? (
                    <div className="flex flex-col items-center text-slate-500">
                        <Loader2 className="w-10 h-10 animate-spin mb-2" />
                        <p>Model Training & Forecasting...</p>
                    </div>
                ) : error ? (
                    <div className="text-red-500">{error}</div>
                ) : forecastData.length > 0 ? (
                    <Plot
                        data={[
                            {
                                x: forecastData.filter(d => d.actual !== null).map(d => d.date),
                                y: forecastData.filter(d => d.actual !== null).map(d => d.actual),
                                type: 'scatter',
                                mode: 'lines',
                                name: 'Historical Data',
                                line: { color: '#2563eb' }
                            },
                            {
                                x: forecastData.filter(d => d.predicted !== null).map(d => d.date),
                                y: forecastData.filter(d => d.predicted !== null).map(d => d.predicted),
                                type: 'scatter',
                                mode: 'lines',
                                name: 'Forecast',
                                line: { color: '#16a34a', dash: 'dot', width: 2 }
                            }
                        ]}
                        layout={{
                            title: `Forecast: ${valueColumn}`,
                            autosize: true,
                            height: 500,
                            margin: { l: 50, r: 50, b: 50, t: 50, pad: 4 },
                            showlegend: true,
                            legend: { x: 0, y: 1 }
                        }}
                        style={{ width: '100%', height: '100%' }}
                        useResizeHandler={true}
                        config={{ responsive: true }}
                    />
                ) : (
                    <p className="text-slate-400">Configure parameters to generate forecast.</p>
                )}
            </div>
        </div>
    );
};

export default ForecastDashboard;
