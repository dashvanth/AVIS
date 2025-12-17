import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { EDASummary } from '../types';
import * as api from '../services/api';
import SummaryStats from '../components/eda/SummaryStats';
import CorrelationMatrix from '../components/eda/CorrelationMatrix';

interface EDADashboardProps {
    datasetId: number;
}

const EDADashboard: React.FC<EDADashboardProps> = ({ datasetId }) => {
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState<EDASummary | null>(null);
    const [correlation, setCorrelation] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [summaryData, corrData] = await Promise.all([
                    api.getEDASummary(datasetId),
                    api.getCorrelationMatrix(datasetId)
                ]);
                setSummary(summaryData);
                setCorrelation(corrData);
            } catch (err) {
                console.error(err);
                setError("Failed to load analysis. Please ensure the backend is running.");
            } finally {
                setLoading(false);
            }
        };

        if (datasetId) {
            fetchData();
        }
    }, [datasetId]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                <p className="text-slate-500">Analyzing dataset metrics...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 mt-6">
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-8 mt-6">
            <h2 className="text-2xl font-bold text-slate-800">Automated Data Analysis</h2>

            {summary && (
                <SummaryStats
                    numeric={summary.numeric}
                    categorical={summary.categorical}
                    totalRows={summary.total_rows}
                    totalColumns={summary.total_columns}
                />
            )}

            {correlation && correlation.length > 0 && (
                <CorrelationMatrix data={correlation} />
            )}
        </div>
    );
};

export default EDADashboard;
