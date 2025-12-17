import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { SortableWidget } from './SortableWidget';
import type { Widget } from '../../pages/DashboardBuilderPage';
import { Plus } from 'lucide-react';
import { BarChart2, Activity, PieChart, Hash, Type } from 'lucide-react';

// Placeholder chart components for the preview
const ChartPlaceholder = ({ type }: { type: string }) => {
    const iconClass = "w-8 h-8 opacity-50 mb-2";
    let icon = <Activity className={iconClass} />;

    if (type === 'Bar Chart') icon = <BarChart2 className={iconClass} />;
    if (type === 'Pie Chart') icon = <PieChart className={iconClass} />;
    if (type === 'KPI Card') icon = <Hash className={iconClass} />;
    if (type === 'Text') icon = <Type className={iconClass} />;

    return (
        <div className="h-full flex flex-col items-center justify-center text-avis-text-secondary/30 bg-avis-primary/20 rounded-xl border border-dashed border-avis-border/30">
            {icon}
            <span className="text-xs">Configure Data Source</span>
        </div>
    );
};

interface DashboardCanvasProps {
    widgets: Widget[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    onRemove: (id: string) => void;
}

export const DashboardCanvas: React.FC<DashboardCanvasProps> = ({
    widgets,
    selectedId,
    onSelect,
    onRemove
}) => {
    const { setNodeRef } = useDroppable({
        id: 'canvas',
    });

    return (
        <div className="flex-1 bg-avis-primary p-8 overflow-auto relative">
            {/* Grid Background Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle, #6366F1 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
            </div>

            <SortableContext items={widgets} strategy={rectSortingStrategy}>
                <div
                    ref={setNodeRef}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[600px] content-start"
                >
                    {widgets.map((widget) => (
                        <div key={widget.id} className={widget.type === 'Text' || widget.type === 'KPI Card' ? 'h-40' : 'h-80'}>
                            <SortableWidget
                                id={widget.id}
                                title={widget.config.title || widget.type}
                                type={widget.type}
                                isSelected={selectedId === widget.id}
                                onSelect={() => onSelect(widget.id)}
                                onRemove={() => onRemove(widget.id)}
                            >
                                <ChartPlaceholder type={widget.type} />
                            </SortableWidget>
                        </div>
                    ))}

                    {widgets.length === 0 && (
                        <div className="col-span-full h-80 flex flex-col items-center justify-center text-avis-text-secondary border-2 border-dashed border-avis-border rounded-3xl">
                            <Plus className="w-12 h-12 text-avis-border mb-4" />
                            <p className="text-lg font-medium">Drag components here</p>
                            <p className="text-sm opacity-50">Start building your dashboard</p>
                        </div>
                    )}
                </div>
            </SortableContext>
        </div>
    );
};
