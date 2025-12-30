import React from "react";
import { useParams } from "react-router-dom";
import InsightsChat from "../components/insights/InsightsChat";
import { MessageSquareText, Zap } from "lucide-react";

const ChatDashboard: React.FC = () => {
    const { id } = useParams<{ id: string }>();

    if (!id) return null;

    return (
        <div className="max-w-[1200px] mx-auto px-6 py-8 space-y-6 bg-avis-primary min-h-screen">
            {/* Header */}
            <div className="flex items-end justify-between border-b border-avis-border/40 pb-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3 text-avis-accent-indigo text-[10px] font-black uppercase tracking-[0.4em]">
                        <Zap className="w-4 h-4" /> Intelligence Node
                    </div>
                    <h2 className="text-4xl font-black text-white tracking-tighter italic">
                        Contextual Chat
                    </h2>
                    <p className="text-avis-text-secondary text-sm font-medium max-w-xl leading-relaxed">
                        Query your dataset using natural language. The Assistant can explain patterns, identify anomalies, and generate visualizations on demand.
                    </p>
                </div>
            </div>

            {/* Chat Component */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Main Chat Area */}
                <div className="lg:col-span-3">
                    <InsightsChat datasetId={Number(id)} />
                </div>

                {/* Sidebar Tips */}
                <div className="space-y-4">
                    <div className="bg-avis-secondary/30 border border-avis-border p-5 rounded-2xl space-y-4">
                        <div className="flex items-center gap-2 text-avis-text-primary font-bold text-xs uppercase tracking-wider">
                            <MessageSquareText className="w-4 h-4 text-avis-accent-teal" /> Suggested Queries
                        </div>
                        <div className="space-y-2">
                            {["What are the top trends?", "Show me a distribution of Sales", "Are there any outliers?", "Summarize the dataset"].map((q, i) => (
                                <div key={i} className="p-3 bg-avis-primary/50 border border-avis-border rounded-xl text-xs text-avis-text-secondary cursor-pointer hover:border-avis-accent-teal/50 hover:text-avis-accent-teal transition-all">
                                    "{q}"
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatDashboard;
