import React, { useEffect, useState } from 'react';
import { Loader2, Lightbulb, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { getInsights } from '../services/api';

interface Insight {
    type: "insight" | "recommendation";
    severity: "low" | "medium" | "high";
    column: string;
    message: string;
}

interface InsightsDashboardProps {
    datasetId: number;
}

const InsightsDashboard: React.FC<InsightsDashboardProps> = ({ datasetId }) => {
    const [loading, setLoading] = useState(true);
    const [insights, setInsights] = useState<Insight[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchInsights = async () => {
            setLoading(true);
            try {
                const data = await getInsights(datasetId);
                setInsights(data);
            } catch (err) {
                console.error("Failed to load insights", err);
                setError("Failed to generate insights.");
            } finally {
                setLoading(false);
            }
        };
        if (datasetId) fetchInsights();
    }, [datasetId]);

    const getIcon = (type: string, severity: string) => {
        if (type === 'recommendation') {
            if (severity === 'high') return <AlertTriangle className="w-5 h-5 text-red-500" />;
            return <Info className="w-5 h-5 text-blue-500" />;
        }
        // Insight
        if (severity === 'low' && type === 'insight' && !severity) return <CheckCircle className="w-5 h-5 text-green-500" />; // Clean data case
        return <Lightbulb className="w-5 h-5 text-amber-500" />;
    };

    const getBgColor = (type: string, severity: string) => {
        if (severity === 'high') return 'bg-red-50 border-red-100';
        if (type === 'recommendation') return 'bg-blue-50 border-blue-100';
        return 'bg-amber-50 border-amber-100';
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-purple-600 animate-spin mb-4" />
                <p className="text-slate-500">Generating automated insights...</p>
            </div>
        );
    }

    if (error) return <div className="text-red-500">{error}</div>;

    const recommendations = insights.filter(i => i.type === 'recommendation');
    const dataInsights = insights.filter(i => i.type === 'insight');

    return (
        <div className="space-y-8 mt-6">
            <h2 className="text-2xl font-bold text-slate-800">Automated AI Insights</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Recommendations Section */}
                <div>
                    <h3 className="font-semibold text-slate-700 mb-4 flex items-center">
                        <AlertTriangle className="w-5 h-5 mr-2 text-blue-600" />
                        Actionable Recommendations
                    </h3>
                    <div className="space-y-3">
                        {recommendations.length === 0 ? (
                            <div className="p-4 bg-green-50 text-green-700 rounded-lg border border-green-100">
                                No critical issues found. Data looks good!
                            </div>
                        ) : (
                            recommendations.map((item, idx) => (
                                <div key={idx} className={`p-4 rounded-lg border flex items-start space-x-3 ${getBgColor(item.type, item.severity)}`}>
                                    <div className="mt-0.5">{getIcon(item.type, item.severity)}</div>
                                    <div>
                                        <p className="font-semibold text-slate-800 text-sm">{item.column}</p>
                                        <p className="text-sm text-slate-600">{item.message}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Insights Section */}
                <div>
                    <h3 className="font-semibold text-slate-700 mb-4 flex items-center">
                        <Lightbulb className="w-5 h-5 mr-2 text-amber-500" />
                        Data Insights
                    </h3>
                    <div className="space-y-3">
                        {dataInsights.length === 0 ? (
                            <p className="text-slate-500">No specific patterns detected.</p>
                        ) : (
                            dataInsights.map((item, idx) => (
                                <div key={idx} className={`p-4 rounded-lg border flex items-start space-x-3 ${getBgColor(item.type, item.severity)}`}>
                                    <div className="mt-0.5">{getIcon(item.type, item.severity)}</div>
                                    <div>
                                        <p className="font-semibold text-slate-800 text-sm">{item.column}</p>
                                        <p className="text-sm text-slate-600">{item.message}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InsightsDashboard;
