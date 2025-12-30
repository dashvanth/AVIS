import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DashboardHint: React.FC = () => {
    const [visible, setVisible] = useState(true);

    if (!visible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, padding: 0, margin: 0 }}
                className="bg-indigo-900/20 border border-indigo-500/20 rounded-xl p-4 mb-6 flex items-start justify-between relative overflow-hidden"
            >
                <div className="flex gap-4 relative z-10">
                    <div className="p-2 bg-indigo-500/20 rounded-lg shrink-0">
                        <Sparkles className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white mb-1">Command Hub</h3>
                        <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                            Welcome to your central control station. Here you can efficiently manage your persistent data assets, monitor their processing status, and launch specialized analysis modules (EDA, Visualization, Forensic Insights).
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => setVisible(false)}
                    className="text-slate-500 hover:text-white transition-colors p-1"
                >
                    <X className="w-4 h-4" />
                </button>

                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
            </motion.div>
        </AnimatePresence>
    );
};

export default DashboardHint;
