import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, FileText, Activity } from 'lucide-react';

interface DataPreviewTableProps {
    datasetId: number | null;
    onClose: () => void;
}

const DataPreviewTable: React.FC<DataPreviewTableProps> = ({ datasetId, onClose }) => {
    const [data, setData] = useState<any[]>([]);
    const [columns, setColumns] = useState<string[]>([]);
    const [colTypes, setColTypes] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (datasetId) {
            setLoading(true);
            setError(null);
            // Assuming base URL is properly set in axios global or we use relative path if proxied.
            // Using direct full path for now based on previous api.ts
            axios.get(`http://localhost:8000/api/datasets/${datasetId}/preview`)
                .then(res => {
                    setData(res.data.data);
                    setColumns(res.data.columns);
                    setColTypes(res.data.dtypes);
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Failed to fetch preview", err);
                    setError("Failed to load data preview.");
                    setLoading(false);
                });
        }
    }, [datasetId]);

    if (!datasetId) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose}></div>

            <div className="relative w-full max-w-4xl bg-avis-primary border-l border-avis-border shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-300">
                <div className="flex justify-between items-center p-6 border-b border-avis-border bg-avis-secondary/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-avis-accent-indigo/20 rounded-lg text-avis-accent-indigo">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-avis-text-primary">Data Preview</h3>
                            <p className="text-sm text-avis-text-secondary">First 100 rows</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-avis-border rounded-full text-avis-text-secondary transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-auto p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full text-avis-accent-indigo">
                            <Activity className="w-10 h-10 mb-4 animate-spin" />
                            <p>Loading data...</p>
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center h-full text-red-400">
                            {error}
                        </div>
                    ) : (
                        <div className="overflow-x-auto border border-avis-border rounded-xl">
                            <table className="min-w-full divide-y divide-avis-border bg-avis-secondary">
                                <thead className="bg-avis-primary">
                                    <tr>
                                        {columns.map(col => (
                                            <th key={col} className="px-6 py-4 text-left text-xs font-mono font-bold text-avis-text-secondary uppercase tracking-wider whitespace-nowrap group relative">
                                                {col}
                                                <div className="absolute top-0 right-0 h-full w-1 bg-gradient-to-b from-transparent via-avis-border to-transparent opacity-0 group-hover:opacity-100"></div>
                                                <div className="text-[10px] text-avis-accent-cyan normal-case mt-1">{colTypes[col]}</div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-avis-border">
                                    {data.map((row, idx) => (
                                        <tr key={idx} className="hover:bg-avis-primary transition-colors">
                                            {columns.map(col => (
                                                <td key={col} className="px-6 py-3 text-sm text-avis-text-primary whitespace-nowrap font-mono max-w-xs truncate">
                                                    {row[col] !== null ? String(row[col]) : <span className="text-avis-text-secondary italic">null</span>}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DataPreviewTable;
