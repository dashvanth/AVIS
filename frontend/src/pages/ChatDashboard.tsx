import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import Plot from 'react-plotly.js';
import { sendChatMessage, getChartData } from '../services/api';

interface Message {
    id: number;
    sender: 'user' | 'bot';
    text: string;
    plotConfig?: any;
    chartData?: any; // To store fetched chart data for this message
}

interface ChatDashboardProps {
    datasetId: number;
}

const ChatDashboard: React.FC<ChatDashboardProps> = ({ datasetId }) => {
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, sender: 'bot', text: 'Hello! I am your AI Data Assistant. Ask me to "Show summary" or "Plot Sales vs Date".' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim()) return;

        const userMsg: Message = { id: Date.now(), sender: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const data = await sendChatMessage(datasetId, userMsg.text);

            let chartData = null;
            if (data.plot_config) {
                // If the bot returned a plot config, we need to fetch the actual aggregated data
                // This reuses our existing viz API
                try {
                    chartData = await getChartData(
                        datasetId,
                        data.plot_config.xColumn,
                        data.plot_config.chartType,
                        data.plot_config.yColumn || undefined
                    );
                } catch (err) {
                    console.error("Failed to fetch plot data for chat", err);
                    data.response += "\n\n(I tried to generate the chart, but something went wrong.)";
                }
            }

            const botMsg: Message = {
                id: Date.now() + 1,
                sender: 'bot',
                text: data.response,
                plotConfig: data.plot_config,
                chartData: chartData
            };
            setMessages(prev => [...prev, botMsg]);
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: "Sorry, I encountered an error processing your request." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[600px] bg-white rounded-lg shadow-sm border border-slate-200 mt-6">
            <div className="p-4 border-b border-slate-100 flex items-center bg-slate-50 rounded-t-lg">
                <Bot className="w-5 h-5 text-purple-600 mr-2" />
                <h2 className="font-semibold text-slate-800">Contextual Data Chat</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.sender === 'user' ? 'bg-blue-100 ml-2' : 'bg-purple-100 mr-2'}`}>
                                {msg.sender === 'user' ? <User className="w-4 h-4 text-blue-600" /> : <Bot className="w-4 h-4 text-purple-600" />}
                            </div>

                            <div className={`p-3 rounded-lg ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-100 text-slate-800 rounded-tl-none'}`}>
                                <p className="whitespace-pre-wrap text-sm">{msg.text}</p>

                                {msg.chartData && (
                                    <div className="mt-3 bg-white p-2 rounded shadow-sm w-[400px] h-[300px]">
                                        <Plot
                                            data={msg.chartData.data}
                                            layout={{
                                                ...msg.chartData.layout,
                                                autosize: true,
                                                width: undefined,
                                                height: 280,
                                                margin: { l: 40, r: 20, b: 40, t: 30 },
                                                title: undefined
                                            }}
                                            style={{ width: '100%', height: '100%' }}
                                            useResizeHandler={true}
                                            config={{ responsive: true, displayModeBar: false }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-slate-100 p-3 rounded-lg rounded-tl-none ml-10">
                            <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 bg-white rounded-b-lg flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a question about your data..."
                    className="flex-1 p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-purple-500 outline-none"
                    disabled={loading}
                />
                <button
                    type="submit"
                    disabled={!input.trim() || loading}
                    className="p-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
                >
                    <Send className="w-5 h-5" />
                </button>
            </form>
        </div>
    );
};

export default ChatDashboard;
