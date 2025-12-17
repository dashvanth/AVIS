import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { BarChart2, PieChart, Activity, Type, Hash } from 'lucide-react';

interface SidebarItemProps {
    id: string;
    type: string;
    label: string;
    icon: React.ReactNode;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ id, type, label, icon }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: id,
        data: { type, label }
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className="flex items-center gap-3 p-3 mb-2 bg-avis-secondary border border-avis-border rounded-xl cursor-grab hover:border-avis-accent-indigo/50 hover:bg-avis-accent-indigo/5 transition-all text-avis-text-secondary hover:text-avis-text-primary"
        >
            <div className="p-1.5 bg-avis-primary rounded-lg border border-avis-border">
                {icon}
            </div>
            <span className="text-sm font-medium">{label}</span>
        </div>
    );
};

export const WidgetSidebar: React.FC = () => {
    return (
        <div className="w-64 bg-avis-primary border-r border-avis-border p-4 flex flex-col h-full overflow-y-auto">
            <h3 className="text-xs font-mono text-avis-text-secondary uppercase tracking-widest mb-4">Components</h3>

            <div className="mb-6">
                <p className="text-[10px] text-avis-text-secondary mb-2 font-semibold">CHARTS</p>
                <SidebarItem id="new-bar" type="Bar Chart" label="Bar Chart" icon={<BarChart2 className="w-4 h-4 text-avis-accent-cyan" />} />
                <SidebarItem id="new-line" type="Line Chart" label="Line Chart" icon={<Activity className="w-4 h-4 text-avis-accent-indigo" />} />
                <SidebarItem id="new-pie" type="Pie Chart" label="Pie Chart" icon={<PieChart className="w-4 h-4 text-pink-400" />} />
            </div>

            <div className="mb-6">
                <p className="text-[10px] text-avis-text-secondary mb-2 font-semibold">UTILITIES</p>
                <SidebarItem id="new-kpi" type="KPI Card" label="KPI Metric" icon={<Hash className="w-4 h-4 text-emerald-400" />} />
                <SidebarItem id="new-text" type="Text" label="Text Block" icon={<Type className="w-4 h-4 text-purple-400" />} />
            </div>

            <div className="mt-auto p-4 bg-avis-secondary/50 rounded-xl border border-avis-border">
                <p className="text-xs text-avis-text-secondary leading-relaxed">
                    Drag items to the canvas to build your dashboard.
                </p>
            </div>
        </div>
    );
};
