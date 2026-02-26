import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { chatService } from '../services/chatService';
import { ChatMessage } from '../types';

const SUGGESTIONS = [
    'How much did I spend this month?',
    'What is my top spending category?',
    'Show my income vs expenses.',
    'Am I saving money this month?',
];

export const ChatPage = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatService.getHistory()
            .then(setMessages)
            .catch(() => { })
            .finally(() => setHistoryLoading(false));
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async (text?: string) => {
        const msg = text || input.trim();
        if (!msg || loading) return;
        setInput('');

        const optimisticMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: msg,
            createdAt: new Date().toISOString(),
        };
        setMessages(prev => [...prev, optimisticMsg]);
        setLoading(true);

        try {
            const response = await chatService.sendMessage(msg);
            setMessages(prev => [...prev, response]);
        } catch {
            toast.error('Failed to send message');
            setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-10rem)]">
            {/* Header */}
            <div className="mb-4">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Sparkles size={22} className="text-emerald-400" />
                    AI Finance Chat
                </h1>
                <p className="text-sm text-gray-400 mt-0.5">Ask anything about your finances</p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 pb-4">
                {historyLoading ? (
                    <div className="flex justify-center mt-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-400"></div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-6">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                <Bot size={32} className="text-emerald-400" />
                            </div>
                            <h3 className="text-white font-semibold mb-1">Finance Assistant</h3>
                            <p className="text-sm text-gray-500">Powered by Gemini AI. Ask about your spending, savings, or trends.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {SUGGESTIONS.map(s => (
                                <button key={s} onClick={() => sendMessage(s)}
                                    className="text-left text-xs text-gray-400 bg-gray-800/50 hover:bg-gray-700 border border-gray-700 rounded-xl px-3 py-2.5 transition-all hover:text-gray-200">
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    messages.map(msg => (
                        <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center ${msg.role === 'user'
                                    ? 'bg-emerald-600'
                                    : 'bg-gray-800 border border-gray-700'
                                }`}>
                                {msg.role === 'user'
                                    ? <User size={15} className="text-white" />
                                    : <Bot size={15} className="text-emerald-400" />
                                }
                            </div>
                            <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                    ? 'bg-emerald-600 text-white rounded-tr-sm'
                                    : 'bg-gray-800 border border-gray-700/50 text-gray-200 rounded-tl-sm'
                                }`}>
                                <p style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</p>
                            </div>
                        </div>
                    ))
                )}

                {loading && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center bg-gray-800 border border-gray-700">
                            <Bot size={15} className="text-emerald-400" />
                        </div>
                        <div className="bg-gray-800 border border-gray-700/50 px-4 py-3 rounded-2xl rounded-tl-sm">
                            <div className="flex gap-1 items-center h-5">
                                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex gap-3 pt-4 border-t border-gray-800">
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                    placeholder="Ask about your finances…"
                    className="input-field flex-1"
                    disabled={loading}
                />
                <button
                    onClick={() => sendMessage()}
                    disabled={!input.trim() || loading}
                    className="w-11 h-11 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-all flex-shrink-0"
                >
                    <Send size={17} />
                </button>
            </div>
        </div>
    );
};
