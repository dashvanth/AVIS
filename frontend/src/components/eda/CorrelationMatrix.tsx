import React from 'react';

interface CorrelationMatrixProps {
    data: any[]; // List of objects { column: "A", "A": 1, "B": 0.5, ... }
}

const CorrelationMatrix: React.FC<CorrelationMatrixProps> = ({ data }) => {
    if (!data || data.length === 0) return <div>No numeric data available for correlation.</div>;

    const columns = data.map((d: any) => d.column);

    // Transform data for Heatmap-like scatter plot (Recharts doesn't have a native Heatmap)
    // Or we can just build a CSS grid/table heatmap which is often better/cleaner for correlation matrices

    // Let's use a nice colored Table for simplicity and precision
    return (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden overflow-x-auto">
            <div className="px-6 py-4 border-b border-slate-200">
                <h3 className="font-semibold text-slate-800">Pearson Correlation Matrix</h3>
            </div>
            <div className="p-6">
                <table className="w-full text-sm text-center border-collapse">
                    <thead>
                        <tr>
                            <th className="p-2 border border-slate-100 bg-slate-50"></th>
                            {columns.map(col => (
                                <th key={col} className="p-2 border border-slate-100 bg-slate-50 font-semibold text-slate-600 transform -rotate-45 origin-bottom-left h-24 align-bottom">
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row) => (
                            <tr key={row.column}>
                                <th className="p-2 border border-slate-100 bg-slate-50 font-semibold text-slate-600 text-left">{row.column}</th>
                                {columns.map((col) => {
                                    const val = row[col];
                                    let bgClass = "bg-white";
                                    let textClass = "text-slate-900";

                                    if (val === 1) bgClass = "bg-blue-600";
                                    else if (val > 0.7) bgClass = "bg-blue-500";
                                    else if (val > 0.4) bgClass = "bg-blue-300";
                                    else if (val > 0) bgClass = "bg-blue-100";
                                    else if (val < -0.7) bgClass = "bg-red-500";
                                    else if (val < -0.4) bgClass = "bg-red-300";
                                    else if (val < 0) bgClass = "bg-red-100";

                                    if (Math.abs(val) > 0.5) textClass = "text-white";

                                    return (
                                        <td key={`${row.column}-${col}`} className={`p-2 border border-slate-100 ${bgClass} ${textClass}`}>
                                            {typeof val === 'number' ? val.toFixed(2) : '-'}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CorrelationMatrix;
