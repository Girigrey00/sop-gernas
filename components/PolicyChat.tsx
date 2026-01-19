
import React, { useState, useRef, useEffect } from 'react';
import { 
    Send, Loader2, Sparkles, ShieldCheck, 
    ArrowRight, MessageSquare, Copy, ThumbsUp, ThumbsDown, Info
} from 'lucide-react';
import { SopResponse, Product } from '../types';
import { apiService } from '../services/apiService';
import { MessageRenderer, CitationBlock, GIcon, cleanQuestions } from './ChatAssistant';

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
    suggestions?: string[];
    feedback?: 'thumbs_up' | 'thumbs_down';
}

const DEFAULT_SUGGESTIONS = [
    "What is the Data Classification Policy?",
    "How do I report a security incident?",
    "Show me the Access Control Standards",
    "What are the Password Complexity Requirements?"
];

const PolicyChat: React.FC<PolicyChatProps> = ({ sopData, productContext }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // Streaming Refs
    const streamQueue = useRef<string>('');
    const activeMessageId = useRef<string | null>(null);
    const streamInterval = useRef<any>(null);
    const isGenerationComplete = useRef<boolean>(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initial Welcome Message - Runs once on mount
    useEffect(() => {
        if (messages.length === 0) {
            setMessages([
                {
                    id: 'init-welcome',
                    role: 'assistant',
                    content: `### Policy Standards Assistant\nI am here to help you navigate the ${productContext?.product_name || 'Policy Standards'}. \n\nYou can ask me about specific policies, compliance requirements, or procedures.`,
                    timestamp: new Date(),
                    suggestions: sopData.metadata?.suggested_questions || DEFAULT_SUGGESTIONS
                }
            ]);
        }
    }, []); // Empty dependency array ensures this runs only once

    // Scroll to bottom on new message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    // Streaming Logic
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

        setInput('');
        setIsLoading(true);

        const userMsgId = Date.now().toString();
        const botMsgId = `bot-${Date.now()}`;

        // Add User Message & Placeholder Bot Message
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
                session_id: `policy-${Date.now()}`,
                question_id: botMsgId,
                onToken: (token) => { streamQueue.current += token; },
                onComplete: (data) => {
                    isGenerationComplete.current = true;
                    if (data) {
                        setMessages(prev => prev.map(m => 
                            m.id === botMsgId 
                            ? { ...m, citations: data.citations, suggestions: data.related_questions } 
                            : m
                        ));
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

    // --- Chat View (Rendered Immediately) ---
    return (
        <div className="flex flex-col h-full bg-slate-50">
            {/* Minimal Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-3 shadow-sm z-10 shrink-0">
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
                        <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
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

                                {/* Suggestions (only for assistant messages that are done typing) */}
                                {msg.role === 'assistant' && !msg.isTyping && msg.suggestions && msg.suggestions.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-2 animate-in fade-in delay-300">
                                        {cleanQuestions(msg.suggestions).map((s, i) => (
                                            <button 
                                                key={i}
                                                onClick={() => handleSend(s)}
                                                className="px-3 py-1.5 bg-white border border-fab-royal/20 text-fab-royal hover:bg-fab-royal hover:text-white rounded-full text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                                            >
                                                <Sparkles size={10} /> {s}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Timestamp */}
                                <div className="mt-1 flex items-center gap-2 px-1">
                                    <span className="text-[10px] text-slate-400">
                                        {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
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
            <div className="p-4 bg-white border-t border-slate-100 shrink-0">
                <div className="max-w-3xl mx-auto relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isLoading}
                        placeholder="Ask about policy details..."
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
                <div className="mt-2 flex justify-center">
                    <p className="text-[9px] text-slate-400 font-medium flex items-center gap-1">
                        <Info size={10} /> AI generated responses can be inaccurate. Verify important information.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PolicyChat;
