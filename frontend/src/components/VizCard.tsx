import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

interface VizCardProps {
    title: string;
    type: string;
    date: string;
    thumbnailColor: string; // Tailwind class like 'bg-indigo-500'
}

const VizCard: React.FC<VizCardProps> = ({ title, type, date, thumbnailColor }) => {
    return (
        <motion.div
            whileHover={{ scale: 1.02, rotateX: 2 }}
            className="group relative bg-avis-secondary border border-avis-border rounded-2xl overflow-hidden cursor-pointer hover:border-avis-accent-indigo/50 transition-all"
        >
            <div className={`h-32 ${thumbnailColor} opacity-20 group-hover:opacity-30 transition-opacity`}></div>
            <div className="absolute top-4 right-4 p-2 bg-avis-glass backdrop-blur-md rounded-full border border-avis-border opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight className="w-4 h-4 text-white" />
            </div>

            <div className="p-5 relative">
                <div className="absolute -top-6 left-5">
                    <div className={`h-12 w-12 rounded-xl border border-avis-border bg-avis-primary flex items-center justify-center shadow-lg ${thumbnailColor.replace('bg-', 'text-')}`}>
                        {/* Icon placeholder based on type could go here */}
                        <div className={`w-3 h-3 rounded-full ${thumbnailColor}`}></div>
                    </div>
                </div>
                <div className="mt-6">
                    <h4 className="text-lg font-bold text-avis-text-primary mb-1 group-hover:text-avis-accent-cyan transition-colors">{title}</h4>
                    <div className="flex items-center justify-between text-xs text-avis-text-secondary mt-3">
                        <span className="bg-avis-primary px-2 py-1 rounded-md border border-avis-border capitalize">{type}</span>
                        <span>{date}</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default VizCard;
