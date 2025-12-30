import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from "react";
import { Send, Bot, User, Sparkles, Loader2 } from "lucide-react";
import { chatWithDataset, getChartData } from "../../services/api";
import { motion, AnimatePresence } from "framer-motion";
import Plot from "react-plotly.js";

interface Message {
    role: "user" | "ai";
    text: string;
    chartData?: any; // Stores the Plotly data object
}

interface InsightsChatProps {
    datasetId: number;
}

export interface InsightsChatRef {
    ask: (question: string) => void;
}

const InsightsChat = forwardRef<InsightsChatRef, InsightsChatProps>(({ datasetId }, ref) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "ai",
            text: "Hello. I am ready to answer questions about your data analysis.",
        },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
        ask: (question: string) => {
            handleSend(question);
        }
    }));

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (manualInput?: string) => {
        const textToSend = manualInput || input;
        if (!textToSend.trim()) return;

        if (!manualInput) setInput("");

        setMessages((prev) => [...prev, { role: "user", text: textToSend }]);
        setLoading(true);

        try {
            // 1. Send Message to Intelligence Node
            const response = await chatWithDataset(datasetId, textToSend);

            let chartData = null;

            // 2. Check for Plot Request
            if (response.plot_config) {
                try {
                    chartData = await getChartData(
                        datasetId,
                        response.plot_config.xColumn,
                        response.plot_config.chartType,
                        response.plot_config.yColumn
                    );
                } catch (err) {
                    console.error("Plot fetch failed:", err);
                }
            }

            // 3. Update Chat
            setMessages((prev) => [
                ...prev,
                {
                    role: "ai",
                    text: response.response,
                    chartData: chartData
                },
            ]);
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                { role: "ai", text: "Connection interruption. Please retry." },
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-avis-secondary/30 border border-avis-border rounded-3xl overflow-hidden flex flex-col h-[600px] shadow-2xl">
            {/* Header */}
            <div className="bg-avis-secondary p-4 border-b border-avis-border flex items-center gap-3">
                <div className="p-2 bg-avis-accent-indigo/20 rounded-lg text-avis-accent-indigo">
                    <Bot className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-white font-bold text-sm">Data Assistant</h3>
                    <p className="text-avis-text-secondary text-[10px] uppercase tracking-wider">
                        Ask about your data
                    </p>
                </div>
            </div>

            {/* Messages */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-avis-border scrollbar-track-transparent"
            >
                <AnimatePresence>
                    {messages.map((msg, idx) => (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={idx}
                            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"
                                }`}
                        >
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user"
                                    ? "bg-avis-accent-teal/20 text-avis-accent-teal"
                                    : "bg-avis-accent-indigo/20 text-avis-accent-indigo"
                                    }`}
                            >
                                {msg.role === "user" ? (
                                    <User className="w-4 h-4" />
                                ) : (
                                    <Sparkles className="w-4 h-4" />
                                )}
                            </div>
                            <div className="flex flex-col gap-2 max-w-[85%]">
                                <div
                                    className={`p-3 rounded-2xl text-sm leading-relaxed ${msg.role === "user"
                                        ? "bg-avis-accent-teal/10 text-white rounded-tr-none border border-avis-accent-teal/20"
                                        : "bg-avis-secondary text-avis-text-primary rounded-tl-none border border-avis-border"
                                        }`}
                                >
                                    {msg.text}
                                </div>

                                {/* Dynamic Chart Rendering */}
                                {msg.chartData && (
                                    <div className="bg-white p-2 rounded-2xl overflow-hidden shadow-lg border border-avis-border/50">
                                        <Plot
                                            data={msg.chartData.data}
                                            layout={{
                                                ...msg.chartData.layout,
                                                autosize: true,
                                                width: undefined,
                                                height: 250,
                                                margin: { l: 30, r: 10, b: 30, t: 30 },
                                                paper_bgcolor: 'rgba(0,0,0,0)',
                                                font: { size: 10 }
                                            }}
                                            style={{ width: "100%", height: "100%" }}
                                            useResizeHandler={true}
                                            config={{ responsive: true, displayModeBar: false }}
                                        />
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                    {loading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex gap-3"
                        >
                            <div className="w-8 h-8 rounded-full bg-avis-accent-indigo/20 text-avis-accent-indigo flex items-center justify-center shrink-0">
                                <Bot className="w-4 h-4" />
                            </div>
                            <div className="bg-avis-secondary p-3 rounded-2xl rounded-tl-none border border-avis-border text-avis-text-secondary text-xs flex items-center gap-2">
                                <Loader2 className="w-3 h-3 animate-spin" /> Thinking...
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Input */}
            <div className="p-4 bg-avis-secondary/50 border-t border-avis-border">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        placeholder="Type your question..."
                        className="flex-1 bg-avis-primary border border-avis-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-avis-accent-indigo transition-colors placeholder:text-avis-text-secondary/50"
                    />
                    <button
                        onClick={() => handleSend()}
                        disabled={loading || !input.trim()}
                        className="p-3 bg-avis-accent-indigo hover:bg-avis-accent-indigo/80 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
});

export default InsightsChat;
