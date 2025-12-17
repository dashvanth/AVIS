import React from 'react';
import { FileText, CheckCircle, X, Upload } from 'lucide-react';
import type { PreviewData } from '../types';

interface PreviewConfirmationProps {
    preview: PreviewData;
    onConfirm: () => void;
    onCancel: () => void;
    isUploading: boolean;
}

const PreviewConfirmation: React.FC<PreviewConfirmationProps> = ({ preview, onConfirm, onCancel, isUploading }) => {
    const { filename, row_count, column_count, quality_score, columns, preview_data, dtypes } = preview;

    return (
        <div className="bg-avis-secondary border border-avis-border rounded-2xl p-6 shadow-2xl max-w-4xl mx-auto">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-2xl font-bold text-avis-text-primary mb-1">Confirm Upload</h3>
                    <p className="text-avis-text-secondary text-sm">Review your dataset details before proceeding.</p>
                </div>
                <button onClick={onCancel} className="p-2 hover:bg-avis-primary rounded-full text-avis-text-secondary transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="p-4 bg-avis-primary rounded-xl border border-avis-border">
                    <p className="text-xs text-avis-text-secondary uppercase tracking-wide font-semibold mb-1">File Name</p>
                    <p className="font-medium text-avis-text-primary truncate" title={filename}>{filename}</p>
                </div>
                <div className="p-4 bg-avis-primary rounded-xl border border-avis-border">
                    <p className="text-xs text-avis-text-secondary uppercase tracking-wide font-semibold mb-1">Dimensions</p>
                    <p className="font-medium text-avis-text-primary">{row_count.toLocaleString()} rows × {column_count} cols</p>
                </div>
                <div className="p-4 bg-avis-primary rounded-xl border border-avis-border">
                    <p className="text-xs text-avis-text-secondary uppercase tracking-wide font-semibold mb-1">Quality Score</p>
                    <div className={`flex items-center gap-2 font-bold ${quality_score.rating === 'Good' ? 'text-green-400' :
                        quality_score.rating === 'Fair' ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                        <span>{quality_score.score}/100</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${quality_score.rating === 'Good' ? 'border-green-400/30 bg-green-400/10' :
                            quality_score.rating === 'Fair' ? 'border-yellow-400/30 bg-yellow-400/10' : 'border-red-400/30 bg-red-400/10'
                            }`}>
                            {quality_score.rating}
                        </span>
                    </div>
                </div>
                <div className="p-4 bg-avis-primary rounded-xl border border-avis-border">
                    <p className="text-xs text-avis-text-secondary uppercase tracking-wide font-semibold mb-1">Issues</p>
                    {quality_score.issues.length === 0 ? (
                        <span className="text-green-400 flex items-center text-sm"><CheckCircle className="w-3 h-3 mr-1" /> None</span>
                    ) : (
                        <p className="text-sm text-red-400">{quality_score.issues[0]} {quality_score.issues.length > 1 && `+${quality_score.issues.length - 1} more`}</p>
                    )}
                </div>
            </div>

            {/* Data Preview Table */}
            <div className="mb-8">
                <h4 className="text-sm font-semibold text-avis-text-secondary mb-3 flex items-center"><FileText className="w-4 h-4 mr-2" /> Data Preview (First 5 Rows)</h4>
                <div className="overflow-x-auto border border-avis-border rounded-xl bg-avis-primary/50">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-avis-secondary text-avis-text-secondary font-medium">
                            <tr>
                                {columns.map(col => (
                                    <th key={col} className="px-4 py-3 border-b border-avis-border whitespace-nowrap">
                                        {col}
                                        <span className="block text-[10px] font-mono opacity-50 font-normal mt-0.5">{dtypes[col]}</span>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-avis-border">
                            {preview_data.map((row, i) => (
                                <tr key={i} className="hover:bg-avis-secondary/50 transition-colors">
                                    {columns.map(col => (
                                        <td key={col} className="px-4 py-3 text-avis-text-primary whitespace-nowrap max-w-[200px] truncate">
                                            {row[col]?.toString() ?? <span className="text-avis-text-secondary italic">null</span>}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
                <button
                    onClick={onCancel}
                    className="px-6 py-2 rounded-xl text-avis-text-secondary hover:text-avis-text-primary hover:bg-avis-primary transition-colors font-medium"
                    disabled={isUploading}
                >
                    Cancel
                </button>
                <button
                    onClick={onConfirm}
                    disabled={isUploading}
                    className="flex items-center px-6 py-2 bg-gradient-to-r from-avis-accent-indigo to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl shadow-lg shadow-indigo-500/25 transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed font-medium"
                >
                    {isUploading ? (
                        <>Processing...</>
                    ) : (
                        <>
                            <Upload className="w-4 h-4 mr-2" />
                            Confirm Upload
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default PreviewConfirmation;
