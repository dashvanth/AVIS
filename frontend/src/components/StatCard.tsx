import React from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: string;
    trendUp?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, trendUp }) => {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="bg-avis-secondary border border-avis-border p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all"
        >
            <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-avis-primary rounded-xl border border-avis-border text-avis-accent-indigo">
                    {icon}
                </div>
                {trend && (
                    <span className={`text-xs font-mono px-2 py-1 rounded-full ${trendUp ? 'bg-avis-accent-success/10 text-avis-accent-success' : 'bg-red-500/10 text-red-400'}`}>
                        {trend}
                    </span>
                )}
            </div>
            <h3 className="text-avis-text-secondary text-sm font-medium mb-1">{title}</h3>
            <div className="text-2xl font-bold text-avis-text-primary">{value}</div>
        </motion.div>
    );
};

export default StatCard;
