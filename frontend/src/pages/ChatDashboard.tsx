import React from "react";
import { useParams } from "react-router-dom";
import InsightsChat from "../components/insights/InsightsChat";
import { MessageSquareText, Zap } from "lucide-react";

const ChatDashboard: React.FC = () => {
    const { id } = useParams<{ id: string }>();

    if (!id) return null;

    return (
        <div className="space-y-6 py-8">
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
