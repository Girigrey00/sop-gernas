
import React, { useState, useRef, useEffect } from 'react';
import { 
    ArrowLeft, Send, Sparkles, User, Bot, 
    MoreVertical, ThumbsUp, ThumbsDown, Copy, 
    RotateCcw, Paperclip, Mic, Image as ImageIcon,
    ShieldCheck, Lock, FileText, AlertTriangle, Plus
} from 'lucide-react';
import { Product } from '../types';

interface ProcessLineagePageProps {
    product: Product;
    onBack: () => void;
}

// --- DUMMY DATA CONTEXT ---
const DUMMY_POLICY_SOP = {
    title: "Group Information Security Policy",
    version: "3.0",
    lastUpdated: "Oct 2025",
    owner: "CISO Office",
    content: {
        overview: "This policy mandates the protection of information assets against unauthorized access, modification, or destruction.",
        scope: "Applies to all employees, contractors, and third-party vendors accessing bank systems.",
        password_policy: "Passwords must be 12+ characters, change every 90 days, and enforce MFA for external access.",
        incident_reporting: "All security incidents must be reported to the SOC within 15 minutes of detection.",
        data_classification: {
            public: "Freely disclosures.",
            internal: "Bank staff only.",
            confidential: "Specific authorized personnel.",
            restricted: "Board level / Legal hold."
        }
    },
    risks: [
        { id: "R-SEC-01", name: "Data Leakage", mitigation: "DLP solution installation on all endpoints." },
        { id: "R-SEC-02", name: "Unauthorized Access", mitigation: "RBAC and PAM implementation." }
    ]
};

const SUGGESTIONS = [
    { text: "What is the password policy?", icon: Lock },
    { text: "How to report an incident?", icon: AlertTriangle },
    { text: "List the inherent risks", icon: ShieldCheck },
    { text: "Summarize the scope", icon: FileText },
];

interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
    isTyping?: boolean;
}

const ProcessLineagePage: React.FC<ProcessLineagePageProps> = ({ product, onBack }) => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
        }
    }, [input]);

    const simulateTyping = (text: string, msgId: string) => {
        let currentText = '';
        const speed = 15; // ms per char
        let i = 0;
        
        const interval = setInterval(() => {
            currentText += text.charAt(i);
            setMessages(prev => prev.map(m => m.id === msgId ? { ...m, text: currentText, isTyping: true } : m));
            i++;
            if (i >= text.length) {
                clearInterval(interval);
                setMessages(prev => prev.map(m => m.id === msgId ? { ...m, isTyping: false } : m));
                setIsLoading(false);
            }
        }, speed);
    };

    const getMockResponse = (query: string): string => {
        const q = query.toLowerCase();
        if (q.includes('password') || q.includes('pwd')) return `**Password Policy Requirements:**\n\n• Length: Minimum 12 characters.\n• Complexity: Alphanumeric + Special chars.\n• Rotation: Every 90 days.\n• **MFA**: Mandatory for all external access.`;
        if (q.includes('incident') || q.includes('breach')) return `**Incident Reporting Protocol:**\n\nSecurity incidents must be reported to the Security Operations Center (SOC) immediately.\n\n**SLA:** Within 15 minutes of detection.\n**Contact:** soc@bankfab.com or Ext 9999.`;
        if (q.includes('risk') || q.includes('threat')) return `**Identified Inherent Risks:**\n\n1. **${DUMMY_POLICY_SOP.risks[0].id}**: ${DUMMY_POLICY_SOP.risks[0].name}\n   *Mitigation*: ${DUMMY_POLICY_SOP.risks[0].mitigation}\n\n2. **${DUMMY_POLICY_SOP.risks[1].id}**: ${DUMMY_POLICY_SOP.risks[1].name}\n   *Mitigation*: ${DUMMY_POLICY_SOP.risks[1].mitigation}`;
        if (q.includes('scope') || q.includes('apply')) return `**Policy Scope:**\n${DUMMY_POLICY_SOP.content.scope}`;
        if (q.includes('class') || q.includes('data')) return `**Data Classification Levels:**\n\n• **Public**: Freely disposable.\n• **Internal**: Bank staff only.\n• **Confidential**: Specific personnel.\n• **Restricted**: Highly sensitive (Board/Legal).`;
        
        return `I can help you with the **${DUMMY_POLICY_SOP.title}**. \n\nTry asking about:\n- Password rules\n- Reporting incidents\n- Data classification\n- Risk controls`;
    };

    const handleSend = async (textOverride?: string) => {
        const text = textOverride || input;
        if (!text.trim() || isLoading) return;

        const userMsgId = Date.now().toString();
        const aiMsgId = (Date.now() + 1).toString();

        setMessages(prev => [
            ...prev, 
            { id: userMsgId, role: 'user', text: text }
        ]);
        setInput('');
        setIsLoading(true);

        // Simulate network delay
        setTimeout(() => {
            const responseText = getMockResponse(text);
            setMessages(prev => [
                ...prev,
                { id: aiMsgId, role: 'model', text: '', isTyping: true }
            ]);
            simulateTyping(responseText, aiMsgId);
        }, 1000);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleNewChat = () => {
        setMessages([]);
        setInput('');
        setIsLoading(false);
    };

    return (
        <div className="flex h-full w-full bg-[#f0f4f9] flex-col font-sans relative overflow-hidden">
            
            {/* Header */}
            <div className="px-6 py-4 flex items-center justify-between shrink-0 z-20">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={onBack} 
                        className="p-2 hover:bg-black/5 rounded-full transition-colors text-slate-600"
                        title="Back"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <span className="text-lg font-medium text-slate-600">{product.product_name}</span>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full uppercase tracking-wide">
                        Knowledge Base
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleNewChat}
                        className="p-2 bg-slate-200 hover:bg-slate-300 rounded-full transition-colors text-slate-600 flex items-center gap-2 px-3"
                        title="Start New Chat"
                    >
                        <Plus size={18} />
                        <span className="text-xs font-bold hidden sm:inline">New Chat</span>
                    </button>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                        AD
                    </div>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 overflow-y-auto px-4 relative scroll-smooth">
                <div className="max-w-3xl mx-auto w-full pt-10 pb-32 min-h-full flex flex-col justify-end">
                    
                    {/* Welcome State */}
                    {messages.length === 0 && (
                        <div className="flex flex-col items-start gap-8 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div>
                                <h1 className="text-5xl font-semibold text-[#c4c7c5] mb-2 tracking-tight">
                                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-rose-500">Interactive Policy</span>
                                </h1>
                                <h1 className="text-5xl font-semibold text-[#c4c7c5] tracking-tight">
                                    Knowledge Base
                                </h1>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
                                {SUGGESTIONS.map((s, i) => (
                                    <button 
                                        key={i}
                                        onClick={() => handleSend(s.text)}
                                        className="h-40 p-4 bg-white hover:bg-slate-50 rounded-2xl flex flex-col justify-between items-start text-left shadow-sm hover:shadow-md transition-all border border-transparent hover:border-blue-100 group"
                                    >
                                        <div className="p-2 bg-slate-100 rounded-full group-hover:bg-blue-100 text-slate-600 group-hover:text-blue-600 transition-colors">
                                            <s.icon size={20} />
                                        </div>
                                        <span className="text-sm font-medium text-slate-700">{s.text}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Message Stream */}
                    <div className="space-y-8 w-full">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex gap-4 w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                
                                {msg.role === 'model' && (
                                    <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 mt-1 shadow-sm">
                                        <Sparkles size={16} className="text-blue-500 fill-blue-500" />
                                    </div>
                                )}

                                <div className={`flex flex-col max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                    {msg.role === 'user' ? (
                                        <div className="bg-[#e7eef6] text-slate-800 px-5 py-3 rounded-[24px] rounded-br-sm text-sm font-medium leading-relaxed max-w-full break-words">
                                            {msg.text}
                                        </div>
                                    ) : (
                                        <div className="text-slate-800 text-sm leading-7 space-y-4 w-full bg-white px-6 py-5 rounded-2xl shadow-sm border border-slate-100">
                                            {/* Simple Markdown Formatting Renderer */}
                                            {msg.text.split('\n').map((line, idx) => {
                                                if (!line.trim()) return <div key={idx} className="h-2"></div>;
                                                const formatted = line.split(/(\*\*.*?\*\*)/g).map((part, pIdx) => 
                                                    part.startsWith('**') && part.endsWith('**') 
                                                        ? <strong key={pIdx} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong> 
                                                        : part
                                                );
                                                return <p key={idx}>{formatted}</p>;
                                            })}
                                            
                                            {!msg.isTyping && (
                                                <div className="flex items-center gap-3 pt-2 mt-2 border-t border-slate-50">
                                                    <button className="text-slate-400 hover:text-slate-600 transition-colors"><Copy size={14} /></button>
                                                    <button className="text-slate-400 hover:text-slate-600 transition-colors"><RotateCcw size={14} /></button>
                                                    <div className="flex-1"></div>
                                                    <button className="text-slate-400 hover:text-slate-600 transition-colors"><ThumbsUp size={14} /></button>
                                                    <button className="text-slate-400 hover:text-slate-600 transition-colors"><ThumbsDown size={14} /></button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {msg.role === 'user' && (
                                    <div className="w-8 h-8 rounded-full bg-fab-navy text-white flex items-center justify-center shrink-0 mt-1 text-[10px] font-bold">
                                        YOU
                                    </div>
                                )}
                            </div>
                        ))}
                        {isLoading && messages[messages.length - 1]?.role === 'user' && (
                            <div className="flex gap-4 w-full">
                                <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 mt-1 shadow-sm">
                                    <Sparkles size={16} className="text-blue-500 fill-blue-500 animate-pulse" />
                                </div>
                                <div className="flex items-center gap-1 h-8">
                                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce delay-75"></div>
                                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce delay-150"></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>
            </div>

            {/* Sticky Input Area */}
            <div className="w-full flex justify-center pb-6 pt-2 px-4 bg-[#f0f4f9]">
                <div className="max-w-3xl w-full relative group">
                    <div className="absolute left-4 top-4 flex items-center gap-3 text-slate-400">
                        <button className="p-1.5 hover:bg-slate-100 rounded-full transition-colors hover:text-fab-royal" title="Upload Image">
                            <ImageIcon size={20} />
                        </button>
                        <button className="p-1.5 hover:bg-slate-100 rounded-full transition-colors hover:text-fab-royal" title="Mic">
                            <Mic size={20} />
                        </button>
                    </div>
                    
                    <textarea 
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Enter a prompt here"
                        className="w-full bg-white border border-slate-200 rounded-[28px] pl-28 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 shadow-sm resize-none overflow-hidden min-h-[56px] text-slate-700 placeholder-slate-400 transition-all"
                        rows={1}
                        disabled={isLoading}
                    />

                    <button 
                        onClick={() => handleSend()}
                        disabled={!input.trim() || isLoading}
                        className="absolute right-3 bottom-3 p-2 bg-transparent hover:bg-slate-100 text-slate-400 hover:text-blue-600 rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>
            
            <div className="text-center pb-2 text-[10px] text-slate-400">
                Policy Standards AI may display inaccurate info, including about people, so double-check its responses.
            </div>
        </div>
    );
};

export default ProcessLineagePage;
