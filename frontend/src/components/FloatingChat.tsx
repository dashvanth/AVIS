
import React, { useState, useEffect, useRef } from "react";
import { useLocation, useParams } from "react-router-dom";
import { MessageSquare, X, Send, Zap, BrainCircuit, ChevronDown, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as api from "../services/api";

interface Message {
    role: "user" | "assistant";
    content: string;
}

const FloatingChat: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const datasetId = Number(id);
    const location = useLocation();

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "Hi! I'm A.V.I.S. I can explain the analysis you see on this page. What would you like to know?" }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(scrollToBottom, [messages]);

    // Determine Context based on URL
    const getPageContext = () => {
        const path = location.pathname;
        if (path.includes("/eda")) return { page: "EDA", focus: "Statistics & Distributions" };
        if (path.includes("/prepare")) return { page: "Preparation", focus: "Data Cleaning & Quality" };
        if (path.includes("/viz")) return { page: "Visualization", focus: "Charts & Graphs" };
        if (path.includes("/understanding")) return { page: "Understanding", focus: "Dataset Metadata" };
        if (path.includes("/export")) return { page: "Export", focus: "Download Options" };
        return { page: "Dashboard", focus: "General Overview" };
    };

    const handleSend = async () => {
        if (!input.trim() || !datasetId) return;

        const userMsg = input;
        setInput("");
        setMessages(prev => [...prev, { role: "user", content: userMsg }]);
        setLoading(true);

        try {
            const context = getPageContext();

            // Call the unified chat endpoint
            // Note: We are using a direct fetch here or need to add a specialized API method
            // For MVP consistency, let's assume api.sendMessage (from `api.ts`) is updated or we use a custom fetch here
            // We previously updated backend to accept `page_context` in body

            // Since api.ts might not have the new payload signature yet, let's verify/update api.ts next.
            // For now, I will use the existing signature but if it fails I'll fix api.ts
            // Actually, I should check api.ts first. But I'll write this assuming api.chatWithDataset can take the extra arg
            // or I'll implementation a direct axios call if needed.
            // Let's implement the logic assuming api.ts will be updated.
            const response = await api.chatWithDataset(datasetId, userMsg, context);

            setMessages(prev => [...prev, { role: "assistant", content: response.response }]);

        } catch (error) {
            setMessages(prev => [...prev, { role: "assistant", content: "I'm having trouble connecting to the Intelligence Node." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* TOGGLE BUTTON */}
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-8 right-8 z-50 p-4 rounded-full shadow-2xl transition-all border border-white/10 ${isOpen ? "bg-red-500/80 hover:bg-red-500" : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-110"
                    }`}
            >
                {isOpen ? <X className="w-6 h-6 text-white" /> : <Zap className="w-6 h-6 text-white fill-white" />}
            </motion.button>

            {/* CHAT PANEL */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className="fixed bottom-24 right-8 z-40 w-96 max-h-[600px] h-[500px] bg-slate-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl"
                    >
                        {/* HEADER */}
                        <div className="p-4 bg-slate-950 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-500/20 rounded-lg">
                                    <BrainCircuit className="w-5 h-5 text-indigo-400" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-sm">A.V.I.S. Assistant</h3>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                                            Context: {getPageContext().page}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* MESSAGES */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                    <div className={`
                                        max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed
                                        ${msg.role === "user"
                                            ? "bg-indigo-600 text-white rounded-tr-none"
                                            : "bg-slate-800 border border-white/5 text-slate-300 rounded-tl-none shadow-sm"
                                        }
                                    `}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-white/5">
                                        <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* INPUT */}
                        <div className="p-4 bg-slate-950/80 border-t border-white/5">
                            {/* QUICK TIPS (Dynamic based on page) */}
                            <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar mask-fade-right">
                                {getPageContext().page === "EDA" && (
                                    <>
                                        <button onClick={() => setInput("Summarize these stats")} className="whitespace-nowrap px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-full text-[10px] text-slate-400 border border-white/5 transition-colors">Summarize findings</button>
                                        <button onClick={() => setInput("Are there outliers?")} className="whitespace-nowrap px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-full text-[10px] text-slate-400 border border-white/5 transition-colors">Check outliers</button>
                                    </>
                                )}
                                {getPageContext().page === "Visualization" && (
                                    <>
                                        <button onClick={() => setInput("What does this chart show?")} className="whitespace-nowrap px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-full text-[10px] text-slate-400 border border-white/5 transition-colors">Explain chart</button>
                                        <button onClick={() => setInput("Suggest another chart")} className="whitespace-nowrap px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-full text-[10px] text-slate-400 border border-white/5 transition-colors">Next steps</button>
                                    </>
                                )}
                            </div>

                            <form
                                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                className="relative"
                            >
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder={`Ask about ${getPageContext().page}...`}
                                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all pr-10"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || loading}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Send className="w-3 h-3" />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default FloatingChat;
