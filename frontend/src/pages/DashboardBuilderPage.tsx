import React, { useState } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragStartEvent,
    type DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { useParams } from 'react-router-dom';
import { WidgetSidebar } from '../components/analytics/WidgetSidebar';
import { DashboardCanvas } from '../components/analytics/DashboardCanvas';
import { InspectorPanel } from '../components/analytics/InspectorPanel';
import { Save, Share2 } from 'lucide-react';

export interface Widget {
    id: string;
    type: string;
    config: any;
}

const DashboardBuilderPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [widgets, setWidgets] = useState<Widget[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        setActiveId(active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) {
            setActiveId(null);
            return;
        }

        // Check if dropping from Sidebar (new item)
        if (active.id.toString().startsWith('new-')) {
            const type = active.data.current?.type || 'Unknown';
            const newWidget: Widget = {
                id: `widget-${Date.now()}`,
                type,
                config: { title: `New ${type}` }
            };

            setWidgets((items) => [...items, newWidget]);
        }
        // Reordering existing items
        else if (active.id !== over.id) {
            setWidgets((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }

        setActiveId(null);
    };

    const handleUpdateConfig = (id: string, newConfig: any) => {
        setWidgets(prev => prev.map(w => w.id === id ? { ...w, config: newConfig } : w));
    };

    const handleRemoveWidget = (id: string) => {
        setWidgets(prev => prev.filter(w => w.id !== id));
        if (selectedWidgetId === id) setSelectedWidgetId(null);
    };

    const selectedWidget = widgets.find(w => w.id === selectedWidgetId) || null;

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex flex-col h-screen bg-avis-primary text-avis-text-primary overflow-hidden">
                {/* Builder Toolbar */}
                <div className="h-14 border-b border-avis-border bg-avis-secondary flex items-center justify-between px-6 shrink-0">
                    <div className="flex items-center gap-4">
                        <h1 className="font-bold text-lg">Dashboard Builder</h1>
                        <div className="h-4 w-px bg-avis-border"></div>
                        <span className="text-sm text-avis-text-secondary font-mono">Dataset {id}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center px-3 py-1.5 text-xs font-bold text-avis-text-primary bg-avis-primary border border-avis-border rounded-lg hover:border-avis-accent-indigo transition-colors">
                            <Share2 className="w-3.5 h-3.5 mr-2" />
                            Share
                        </button>
                        <button className="flex items-center px-3 py-1.5 text-xs font-bold text-white bg-avis-accent-indigo rounded-lg hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/20">
                            <Save className="w-3.5 h-3.5 mr-2" />
                            Save Layout
                        </button>
                    </div>
                </div>

                {/* Main Workspace */}
                <div className="flex flex-1 overflow-hidden">
                    <WidgetSidebar />

                    <DashboardCanvas
                        widgets={widgets}
                        selectedId={selectedWidgetId}
                        onSelect={setSelectedWidgetId}
                        onRemove={handleRemoveWidget}
                    />

                    <InspectorPanel
                        widget={selectedWidget}
                        onChange={handleUpdateConfig}
                    />
                </div>

                <DragOverlay>
                    {activeId ? (
                        <div className="p-3 bg-avis-accent-indigo text-white rounded-lg shadow-xl cursor-grabbing">
                            Scanning...
                        </div>
                    ) : null}
                </DragOverlay>
            </div>
        </DndContext>
    );
};

export default DashboardBuilderPage;
