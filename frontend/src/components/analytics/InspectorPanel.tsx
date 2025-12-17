import React from 'react';
import type { Widget } from '../../pages/AnalyticsPage';
import { Settings, BarChart2 } from 'lucide-react';

interface InspectorPanelProps {
    widget: Widget | null;
    onChange: (id: string, newConfig: any) => void;
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({ widget, onChange }) => {
    if (!widget) {
        return (
            <div className="w-80 bg-avis-primary border-l border-avis-border p-8 flex flex-col items-center justify-center text-center text-avis-text-secondary">
                <Settings className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-sm">Select a widget to configure its properties.</p>
            </div>
        );
    }

    const handleChange = (key: string, value: any) => {
        onChange(widget.id, { ...widget.config, [key]: value });
    };

    return (
        <div className="w-80 bg-avis-secondary border-l border-avis-border flex flex-col h-full">
            <div className="p-4 border-b border-avis-border">
                <h3 className="font-bold text-avis-text-primary flex items-center gap-2">
                    <Settings className="w-4 h-4 text-avis-accent-indigo" />
                    Configuration
                </h3>
            </div>

            <div className="p-4 space-y-6 overflow-y-auto flex-1">
                <div>
                    <label className="block text-xs font-semibold text-avis-text-secondary uppercase tracking-wider mb-2">
                        Title
                    </label>
                    <input
                        type="text"
                        value={widget.config.title || ''}
                        onChange={(e) => handleChange('title', e.target.value)}
                        className="w-full bg-avis-primary border border-avis-border rounded-lg px-3 py-2 text-sm text-avis-text-primary focus:border-avis-accent-indigo outline-none transition-colors"
                        placeholder="Widget Title"
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-avis-text-secondary uppercase tracking-wider mb-2">
                        Chart Type
                    </label>
                    <div className="flex items-center gap-2 p-2 bg-avis-primary border border-avis-border rounded-lg text-avis-text-primary text-sm opacity-50 cursor-not-allowed">
                        <BarChart2 className="w-4 h-4" />
                        {widget.type}
                    </div>
                </div>

                {(widget.type === 'Bar Chart' || widget.type === 'Line Chart') && (
                    <>
                        <div>
                            <label className="block text-xs font-semibold text-avis-text-secondary uppercase tracking-wider mb-2">
                                X-Axis Column
                            </label>
                            <select
                                className="w-full bg-avis-primary border border-avis-border rounded-lg px-3 py-2 text-sm text-avis-text-primary focus:border-avis-accent-indigo outline-none"
                                disabled
                            >
                                <option>Select Column...</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-avis-text-secondary uppercase tracking-wider mb-2">
                                Y-Axis Column
                            </label>
                            <select
                                className="w-full bg-avis-primary border border-avis-border rounded-lg px-3 py-2 text-sm text-avis-text-primary focus:border-avis-accent-indigo outline-none"
                                disabled
                            >
                                <option>Select Column...</option>
                            </select>
                        </div>
                    </>
                )}
                {widget.type === 'Text' && (
                    <div>
                        <label className="block text-xs font-semibold text-avis-text-secondary uppercase tracking-wider mb-2">
                            Content
                        </label>
                        <textarea
                            className="w-full bg-avis-primary border border-avis-border rounded-lg px-3 py-2 text-sm text-avis-text-primary focus:border-avis-accent-indigo outline-none h-32 resize-none"
                            placeholder="Type your text here..."
                        ></textarea>
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-avis-border bg-avis-primary/30">
                <button className="w-full py-2 bg-avis-accent-indigo hover:bg-indigo-600 text-white text-sm font-bold rounded-lg transition-colors shadow-lg shadow-indigo-500/20">
                    Apply Changes
                </button>
            </div>
        </div>
    );
};
