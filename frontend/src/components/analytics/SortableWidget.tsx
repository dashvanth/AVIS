import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X, Info } from 'lucide-react';

interface DashboardWidgetProps {
    id: string;
    title: string;
    type: string;
    onRemove?: () => void;
    onSelect?: () => void;
    isSelected?: boolean;
    children: React.ReactNode;
}

export const SortableWidget: React.FC<DashboardWidgetProps> = ({
    id,
    title,
    type,
    onRemove,
    onSelect,
    isSelected,
    children
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 100 : 1
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`
                relative h-full w-full rounded-2xl border transition-all duration-200
                ${isSelected
                    ? 'border-avis-accent-indigo ring-2 ring-avis-accent-indigo/20 bg-avis-secondary'
                    : 'border-avis-border bg-avis-glass hover:border-avis-border/80'
                }
                ${isDragging ? 'opacity-50 scale-95' : 'opacity-100'}
            `}
            onClick={onSelect}
        >
            <div className={`
                flex items-center justify-between p-3 border-b border-avis-border/50
                ${isSelected ? 'bg-avis-accent-indigo/5' : ''}
            `}>
                <div className="flex items-center gap-2 overflow-hidden">
                    <div {...attributes} {...listeners} className="cursor-grab hover:text-avis-text-primary text-avis-text-secondary transition-colors">
                        <GripVertical className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-semibold text-avis-text-primary truncate">{title}</span>
                </div>

                <div className="flex items-center gap-1">
                    <div className="group relative">
                        <Info className="w-3.5 h-3.5 text-avis-text-secondary cursor-help" />
                        <div className="absolute right-0 top-6 w-48 p-2 bg-black/90 border border-avis-border rounded-lg text-[10px] text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                            {type} widget. Click to configure properties.
                        </div>
                    </div>
                    {onRemove && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onRemove(); }}
                            className="p-1 hover:bg-red-500/20 hover:text-red-400 text-avis-text-secondary rounded transition-colors"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>

            <div className="p-4 h-[calc(100%-48px)] overflow-hidden">
                {children}
            </div>
        </div>
    );
};
