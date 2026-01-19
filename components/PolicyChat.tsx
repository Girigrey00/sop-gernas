
import React, { useState, useRef, useEffect } from 'react';
import { 
    Send, Loader2, Sparkles, ShieldCheck, 
    ArrowRight, MessageSquare, Copy, ThumbsUp, ThumbsDown
} from 'lucide-react';
import { SopResponse, Product } from '../types';
import { apiService } from '../services/apiService';
import { MessageRenderer, CitationBlock, GIcon } from './ChatAssistant';

interface PolicyChatProps {
    sopData: SopResponse;
    productContext?: Product | null;
}

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    citations?: any;
    isTyping?: boolean;
}

const SUGGESTIONS = [
    "What is the Data Classification Policy?",
    "How do I report a security incident?",
    "Show me the Access Control Standards",
    "What are the Password Complexity Requirements?"
];

const PolicyChat: React.FC<PolicyChatProps> = ({ sopData, productContext }) => {
    const [hasStarted, setHasStarted] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // Streaming Refs
    const streamQueue = useRef<string>('');
    const activeMessageId = useRef<string | null>(null);
    const streamInterval = useRef<any>(null);
    const isGenerationComplete = useRef<boolean>(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom on new message
    useEffect(() => {
        if (hasStarted) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, hasStarted]);

    // Streaming Logic (Ported/Simplified from ChatAssistant)
    useEffect(() => {
        streamInterval.current = setInterval(() => {
            if (activeMessageId.current) {
                const hasData = streamQueue.current.length > 0;
                if (hasData) {
                    const chunk = streamQueue.current.substring(0, 5); // Fast consumption
                    streamQueue.current = streamQueue.current.substring(chunk.length);

                    setMessages(prev => prev.map(msg => 
                        msg.id === activeMessageId.current 
                        ? { ...msg, content: msg.content + chunk, isTyping: true } 
                        : msg
                    ));
                } else if (isGenerationComplete.current) {
                    setMessages(prev => prev.map(msg => 
                        msg.id === activeMessageId.current 
                        ? { ...msg, isTyping: false } 
                        : msg
                    ));
                    activeMessageId.current = null;
                    isGenerationComplete.current = false;
                    setIsLoading(false);
                }
            }
        }, 16);
        return () => clearInterval(streamInterval.current);
    }, []);

    const handleSend = async (text?: string) => {
        const query = text || input;
        if (!query.trim() || isLoading) return;

        setHasStarted(true);
        setInput('');
        setIsLoading(true);

        const userMsgId = Date.now().toString();
        const botMsgId = `bot-${Date.now()}`;

        // Add User Message
        setMessages(prev => [
            ...prev,
            { id: userMsgId, role: 'user', content: query, timestamp: new Date() },
            { id: botMsgId, role: 'assistant', content: '', timestamp: new Date(), isTyping: true }
        ]);

        activeMessageId.current = botMsgId;
        streamQueue.current = '';
        isGenerationComplete.current = false;

        try {
            await apiService.chatInference({
                question: query,
                index_name: productContext?.index_name || "cbgknowledgehub",
                product: productContext?.product_name || sopData.processDefinition.title,
                session_id: `policy-${Date.now()}`, // Simple session ID for now
                question_id: botMsgId,
                onToken: (token) => { streamQueue.current += token; },
                onComplete: (data) => {
                    isGenerationComplete.current = true;
                    if (data?.citations) {
                        setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, citations: data.citations } : m));
                    }
                },
                onError: (err) => {
                    streamQueue.current += `\n[Error: ${err}]`;
                    isGenerationComplete.current = true;
                }
            });
        } catch (e) {
            console.error(e);
            isGenerationComplete.current = true;
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // --- Landing View ---
    if (!hasStarted) {
        return (
            <div className="flex flex-col items-center justify-center h-full w-full bg-gradient-to-b from-white to-slate-50 p-6">
                <div className="max-w-3xl w-full flex flex-col items-center gap-8 animate-in fade-in zoom-in-95 duration-500">
                    
                    {/* Hero Section */}
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-fab-navy to-fab-royal rounded-2xl shadow-xl shadow-fab-royal/20 mb-2">
                            <ShieldCheck size={48} className="text-white" />
                        </div>
                        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-fab-navy to-fab-royal">
                            Hello, User
                        </h1>
                        <p className="text-xl text-slate-500 font-medium">
                            How can I help you with Policy Standards today?
                        </p>
                    </div>

                    {/* Suggestions Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                        {SUGGESTIONS.map((suggestion, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSend(suggestion)}
                                className="group p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-fab-royal/30 hover:bg-blue-50/30 transition-all text-left flex flex-col gap-2 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ArrowRight size={20} className="text-fab-royal" />
                                </div>
                                <div className="p-2 bg-slate-100 rounded-lg w-fit text-fab-royal group-hover:bg-white group-hover:text-fab-royal transition-colors">
                                    <Sparkles size={20} />
                                </div>
                                <span className="text-sm font-semibold text-slate-700 group-hover:text-fab-navy">
                                    {suggestion}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Input Bar (Centered) */}
                    <div className="w-full relative shadow-lg rounded-full group">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask a question about policies..."
                            className="w-full pl-6 pr-14 py-4 rounded-full border border-slate-300 focus:border-fab-royal focus:ring-4 focus:ring-fab-royal/10 outline-none text-base transition-all bg-white"
                        />
                        <button 
                            onClick={() => handleSend()}
                            disabled={!input.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-fab-royal text-white rounded-full hover:bg-fab-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- Chat View ---
    return (
        <div className="flex flex-col h-full bg-slate-50">
            {/* Minimal Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-3 shadow-sm z-10">
                <div className="p-2 bg-fab-royal/10 rounded-lg text-fab-royal">
                    <ShieldCheck size={20} />
                </div>
                <div>
                    <h2 className="text-sm font-bold text-fab-navy">Policy Standards Assistant</h2>
                    <p className="text-[10px] text-slate-500">{productContext?.product_name || 'General Policy Context'}</p>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <div className="max-w-3xl mx-auto flex flex-col gap-6 pb-4">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            {/* Avatar */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                                msg.role === 'user' ? 'bg-slate-800 text-white border-slate-700' : 'bg-white text-fab-royal border-slate-200 shadow-sm'
                            }`}>
                                {msg.role === 'user' ? <span className="text-[10px] font-bold">YOU</span> : <GIcon className="w-5 h-5" />}
                            </div>

                            {/* Bubble */}
                            <div className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                <div className={`px-5 py-3.5 rounded-2xl shadow-sm text-sm leading-relaxed ${
                                    msg.role === 'user' 
                                    ? 'bg-fab-royal text-white rounded-tr-none' 
                                    : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'
                                }`}>
                                    {/* Reusing the Renderer Logic */}
                                    <MessageRenderer 
                                        content={msg.content} 
                                        role={msg.role} 
                                        sopData={sopData} 
                                    />
                                </div>
                                
                                {msg.citations && Object.keys(msg.citations).length > 0 && (
                                    <div className="mt-2 w-full max-w-lg">
                                        <CitationBlock citations={msg.citations} onCitationClick={(doc, page, url) => window.open(url, '_blank')} />
                                    </div>
                                )}

                                {/* Timestamp & Actions */}
                                <div className="mt-1 flex items-center gap-2 px-1">
                                    <span className="text-[10px] text-slate-400">
                                        {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                    {msg.role === 'assistant' && !msg.isTyping && (
                                        <>
                                            <button className="text-slate-300 hover:text-fab-royal transition-colors"><Copy size={12} /></button>
                                            <button className="text-slate-300 hover:text-emerald-500 transition-colors"><ThumbsUp size={12} /></button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-fab-royal shadow-sm animate-pulse">
                                <GIcon className="w-5 h-5" />
                            </div>
                            <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                                <Loader2 size={16} className="animate-spin text-fab-royal" />
                                <span className="text-xs text-slate-500 font-medium">Analyzing policies...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-100">
                <div className="max-w-3xl mx-auto relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isLoading}
                        placeholder="Ask follow-up question..."
                        className="w-full pl-5 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-fab-royal/20 focus:border-fab-royal text-sm shadow-inner transition-all"
                    />
                    <button 
                        onClick={() => handleSend()}
                        disabled={!input.trim() || isLoading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-fab-royal text-white rounded-full hover:bg-fab-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                        {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    </button>
                </div>
                <p className="text-[10px] text-center text-slate-400 mt-2">AI can make mistakes. Please verify policy details.</p>
            </div>
        </div>
    );
};

export default PolicyChat;
