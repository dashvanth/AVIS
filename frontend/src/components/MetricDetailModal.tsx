import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Info, Calculator, Lightbulb, Target } from "lucide-react";

interface MetricDetailModalProps {
  open: boolean;
  title: string;
  description: string;
  calculation?: string;
  example?: string;
  impact?: string;
  onClose: () => void;
}

const MetricDetailModal: React.FC<MetricDetailModalProps> = ({
  open,
  title,
  description,
  calculation,
  example,
  impact,
  onClose
}) => {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-slate-900 border border-indigo-500/30 rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 rounded-lg">
                  <Info className="w-5 h-5 text-indigo-400" />
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight">{title}</h3>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh]">
              {/* Description (WHAT) */}
              <section className="space-y-2">
                <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                  <Target className="w-4 h-4" /> What is this?
                </h4>
                <p className="text-lg text-slate-200 font-medium leading-relaxed">
                  {description}
                </p>
              </section>

              {/* Calculation (HOW) */}
              {calculation && (
                <section className="space-y-4">
                  <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                    <Calculator className="w-4 h-4" /> How is it calculated?
                  </h4>
                  <div className="bg-black/30 border border-emerald-500/20 rounded-xl p-4 font-mono text-emerald-300 text-sm italic">
                    {calculation}
                  </div>
                </section>
              )}

              {/* Example (REAL CASE) */}
              {example && (
                <section className="space-y-3">
                  <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" /> Real-world Example
                  </h4>
                  <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-4 text-slate-300 text-sm leading-relaxed italic border-l-4 border-l-amber-500">
                    "{example}"
                  </div>
                </section>
              )}

              {/* Impact (WHY) */}
              {impact && (
                <section className="space-y-2 bg-indigo-500/5 rounded-xl p-4 border border-indigo-500/10">
                  <h4 className="text-xs font-black text-indigo-300 uppercase tracking-widest mb-2">Research Impact</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {impact}
                  </p>
                </section>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-950/50 border-t border-white/5 flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-sm shadow-lg shadow-indigo-500/20 transition-all"
              >
                Understood
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default MetricDetailModal;
