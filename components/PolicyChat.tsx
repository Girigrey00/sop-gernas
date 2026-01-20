
import React, { useState, useRef, useEffect } from 'react';
import { 
    Send, Loader2, Sparkles, ShieldCheck, 
    ArrowRight, MessageSquare, Copy, ThumbsUp, ThumbsDown, Info,
    AlertTriangle, FileText, List, Image as ImageIcon, Mic, ArrowLeft
} from 'lucide-react';
import { SopResponse, Product } from '../types';
import { apiService } from '../services/apiService';
import { MessageRenderer, CitationBlock, GIcon, cleanQuestions } from './ChatAssistant';

interface PolicyChatProps {
    sopData: SopResponse;
    productContext?: Product | null;
    onBack?: () => void;
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

const PolicyChat: React.FC<PolicyChatProps> = ({ sopData, productContext, onBack }) => {
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
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    // Streaming Logic
    useEffect(() => {
        streamInterval.current = setInterval(() => {
            if (activeMessageId.current) {
                const hasData = streamQueue.current.length > 0;
                if (hasData) {
                    const chunk = streamQueue.current.substring(0, 5); 
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

    const handleOpenCitation = (docName: string, page?: string) => {
        const pageNum = page ? page.replace(/\D/g, '') : '';
      //   const fakeUrl = `/documents/${docName}${pageNum ? `#page=${pageNum}` : ''}`;
        // Placeholder for actual document viewer logic
        alert(`Opening document: ${docName}\nNavigating to page: ${pageNum || '1'}\n(Link simulated)`);
        // window.open(fakeUrl, '_blank'); 
    };

    // --- Header Component (Shared) ---
    const Header = () => (
        <div className="bg-white px-6 py-4 flex items-center gap-4 z-10 shrink-0">
            {onBack && (
                <button onClick={onBack} className="text-slate-500 hover:text-slate-800 transition-colors">
                    <ArrowLeft size={20} />
                </button>
            )}
            <div className="flex items-center gap-3">
                <h2 className="text-base font-medium text-slate-700">
                    {productContext?.product_name || sopData.processDefinition.title || 'Policy Standards'}
                </h2>
                <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                    Knowledge Base
                </span>
            </div>
        </div>
    );

    // --- Input Component (Shared) ---
    const InputBar = ({ centered = false }) => (
        <div className={`w-full ${centered ? 'max-w-3xl mx-auto' : 'bg-white border-t border-slate-100 p-4'}`}>
            <div className={`relative flex items-center bg-slate-100 rounded-full transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-slate-200 focus-within:shadow-md ${centered ? 'h-14' : 'h-12'}`}>
                <div className="flex items-center gap-2 pl-4 text-slate-400">
                    <button className="p-2 hover:bg-slate-200 rounded-full transition-colors"><ImageIcon size={20} /></button>
                    <button className="p-2 hover:bg-slate-200 rounded-full transition-colors"><Mic size={20} /></button>
                </div>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                    placeholder="Enter a prompt here"
                    className="flex-1 bg-transparent border-none focus:ring-0 text-slate-700 placeholder:text-slate-400 px-4 h-full outline-none"
                />
                <div className="pr-2">
                    <button 
                        onClick={() => handleSend()}
                        disabled={!input.trim() || isLoading}
                        className={`p-2 rounded-full transition-all ${
                            input.trim() 
                            ? 'text-fab-royal hover:bg-blue-50' 
                            : 'text-slate-300 cursor-not-allowed'
                        }`}
                    >
                        {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                    </button>
                </div>
            </div>
            {centered && (
                <p className="text-[10px] text-center text-slate-400 mt-4">
                    Policy Standards AI may display inaccurate info, including about people, so double-check its responses.
                </p>
            )}
        </div>
    );

    // --- LANDING VIEW ---
    if (messages.length === 0) {
        return (
            <div className="flex flex-col h-full bg-white relative">
                <Header />
                
                <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto">
                    <div className="w-full max-w-5xl flex flex-col items-center">
                        
                        {/* Hero Title */}
                        <div className="text-center mb-12 space-y-1">
                            <h1 className="text-5xl md:text-6xl font-medium tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-rose-500 to-rose-500" style={{ lineHeight: 1.1 }}>
                                Interactive Policy
                            </h1>
                            <h1 className="text-5xl md:text-6xl font-medium tracking-tight text-slate-300">
                                Knowledge Base
                            </h1>
                        </div>

                        {/* Suggestion Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full mb-16">
                            <button onClick={() => handleSend("What are the risks in Step 3?")} className="text-left p-5 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all h-48 flex flex-col justify-between group">
                                <div className="p-2 bg-white rounded-full w-fit shadow-sm text-slate-700 group-hover:scale-110 transition-transform">
                                    <AlertTriangle size={20} />
                                </div>
                                <span className="text-sm font-medium text-slate-700">What are the risks in Step 3?</span>
                            </button>

                            <button onClick={() => handleSend("List controls for Credit Underwriting")} className="text-left p-5 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all h-48 flex flex-col justify-between group">
                                <div className="p-2 bg-white rounded-full w-fit shadow-sm text-slate-700 group-hover:scale-110 transition-transform">
                                    <ShieldCheck size={20} />
                                </div>
                                <span className="text-sm font-medium text-slate-700">List controls for Credit Underwriting</span>
                            </button>

                            <button onClick={() => handleSend("How is EID validated?")} className="text-left p-5 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all h-48 flex flex-col justify-between group">
                                <div className="p-2 bg-white rounded-full w-fit shadow-sm text-slate-700 group-hover:scale-110 transition-transform">
                                    <FileText size={20} />
                                </div>
                                <span className="text-sm font-medium text-slate-700">How is EID validated?</span>
                            </button>

                            <button onClick={() => handleSend("Summarize Loan Disbursal process")} className="text-left p-5 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all h-48 flex flex-col justify-between group">
                                <div className="p-2 bg-white rounded-full w-fit shadow-sm text-slate-700 group-hover:scale-110 transition-transform">
                                    <List size={20} />
                                </div>
                                <span className="text-sm font-medium text-slate-700">Summarize Loan Disbursal process</span>
                            </button>
                        </div>

                    </div>
                </div>

                {/* Footer Input */}
                <div className="shrink-0 pb-8 px-4">
                    <InputBar centered />
                </div>
            </div>
        );
    }

    // --- CHAT VIEW ---
    return (
        <div className="flex flex-col h-full bg-white">
            <Header />

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
                                        <CitationBlock citations={msg.citations} onCitationClick={handleOpenCitation} />
                                    </div>
                                )}

                                {/* Suggestions */}
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
            <InputBar />
        </div>
    );
};

export default PolicyChat;
