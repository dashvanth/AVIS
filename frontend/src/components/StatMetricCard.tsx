import React, { type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Info } from "lucide-react";

interface StatMetricCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon | ReactNode;
  description?: string;
  colorClass?: string;
  onClick?: () => void;
  tooltip?: string;
}

export const StatMetricCard: React.FC<StatMetricCardProps> = ({
  title,
  value,
  icon: Icon,
  description,
  colorClass = "text-indigo-500",
  onClick,
  tooltip = "Click to see how this is calculated"
}) => {
  const isLucideIcon = (icon: any): icon is LucideIcon => {
    return typeof icon === 'function' || (typeof icon === 'object' && icon !== null);
  };

  return (
    <div 
      onClick={onClick}
      title={tooltip}
      className={`
        bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm rounded-xl p-5 
        transition-all duration-200 group relative
        ${onClick ? "cursor-pointer hover:border-indigo-500/60 hover:shadow-lg hover:shadow-indigo-500/10 hover:scale-[1.02] active:scale-[0.98]" : ""}
      `}
    >
      {onClick && (
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <Info className="w-3.5 h-3.5 text-indigo-400" />
        </div>
      )}
      <div className="flex justify-between items-start mb-2 pr-6">
        <p className="text-slate-400 font-medium text-sm">{title}</p>
        {Icon && (
          typeof Icon === 'function' || isLucideIcon(Icon) ? (
            <Icon className={`w-5 h-5 ${colorClass}`} />
          ) : (
            Icon
          )
        )}
      </div>
      <h3 className="text-3xl font-bold text-slate-100">{value}</h3>
      {description && (
        <p className="text-xs text-slate-500 mt-2">{description}</p>
      )}
    </div>
  );
};
