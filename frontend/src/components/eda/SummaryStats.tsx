import React from 'react';
import type { NumericSummary, CategoricalSummary } from '../../types';

interface SummaryStatsProps {
    numeric: NumericSummary[];
    categorical: CategoricalSummary[];
    totalRows: number;
    totalColumns: number;
}

const SummaryStats: React.FC<SummaryStatsProps> = ({ numeric, categorical, totalRows, totalColumns }) => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                    <p className="text-sm text-slate-500">Total Rows</p>
                    <p className="text-2xl font-bold text-slate-800">{totalRows.toLocaleString()}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                    <p className="text-sm text-slate-500">Total Columns</p>
                    <p className="text-2xl font-bold text-slate-800">{totalColumns}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                    <p className="text-sm text-slate-500">Numeric Features</p>
                    <p className="text-2xl font-bold text-blue-600">{numeric.length}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                    <p className="text-sm text-slate-500">Categorical Features</p>
                    <p className="text-2xl font-bold text-purple-600">{categorical.length}</p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200">
                    <h3 className="font-semibold text-slate-800">Numeric Data Distribution</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-600">
                        <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
                            <tr>
                                <th className="px-6 py-3">Column</th>
                                <th className="px-6 py-3">Mean</th>
                                <th className="px-6 py-3">Std Dev</th>
                                <th className="px-6 py-3">Min</th>
                                <th className="px-6 py-3">Median</th>
                                <th className="px-6 py-3">Max</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {numeric.map((stat) => (
                                <tr key={stat.column} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 font-medium text-slate-900">{stat.column}</td>
                                    <td className="px-6 py-4">{stat.mean.toFixed(2)}</td>
                                    <td className="px-6 py-4">{stat.std.toFixed(2)}</td>
                                    <td className="px-6 py-4">{stat.min}</td>
                                    <td className="px-6 py-4">{stat.max}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200">
                    <h3 className="font-semibold text-slate-800">Categorical Summary</h3>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categorical.map((stat) => (
                        <div key={stat.column} className="border border-slate-100 rounded-md p-4 bg-slate-50">
                            <h4 className="font-medium text-slate-800 mb-2">{stat.column}</h4>
                            <p className="text-xs text-slate-500 mb-2">{stat.unique_count} Unique Values</p>
                            <ul className="space-y-1">
                                {Object.entries(stat.top_values).map(([val, count]) => (
                                    <li key={val} className="flex justify-between text-sm">
                                        <span className="text-slate-600 truncate max-w-[150px]" title={val}>{val}</span>
                                        <span className="font-mono text-slate-400">{count}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SummaryStats;
