
import React, { useState, useRef, useEffect } from 'react';
import { 
    ArrowLeft, Send, Sparkles, User, Bot, 
    MoreVertical, ThumbsUp, ThumbsDown, Copy, 
    RotateCcw, Paperclip, Mic, Image as ImageIcon,
    ShieldCheck, Lock, FileText, AlertTriangle, Plus,
    CreditCard, Banknote, Landmark
} from 'lucide-react';
import { Product } from '../types';

interface ProcessLineagePageProps {
    product: Product;
    onBack: () => void;
}

// --- DUMMY DATA CONTEXT (Derived from PDF) ---
const DUMMY_PIL_SOP = {
    title: "Personal Installment Loan (PIL) Process",
    version: "1.0",
    lastUpdated: "Nov 2025",
    owner: "Retail Banking Operations",
    steps: [
        {
            id: "1",
            name: "Customer details & product selection",
            inputs: ["Customer name", "EID", "Email", "Phone"],
            risks: "Fraud (Existing Customer/WIP), Compliance Risk (Restricted Countries)",
            controls: "Automated: Restricted countries check (IP blocking), EID or UAEPASS + OTP authentication."
        },
        {
            id: "2",
            name: "Pre-eligibility + customer ID&V",
            inputs: ["EID copy (digital)"],
            risks: "Fraud (Identity), Reputation Risk (Eligibility)",
            controls: "Automated: OCR EID scan (EFR), Income threshold check (+7K), Minimum age, AECB Risk Score (711+), Negative Checklist (Mubadara)."
        },
        {
            id: "3",
            name: "Employer and salary validation",
            inputs: ["Employer details", "Salary amount", "UID/TL", "EFR/AECB Reports"],
            risks: "Fraud (Fake Employer), Compliance Risk (Salary Variance)",
            controls: "Automated: Employer category check, TML validation, IBAN validation, Salary variance threshold check."
        },
        {
            id: "4",
            name: "Credit underwriting",
            inputs: ["Internal Credit Score", "DBR", "Offer Letter"],
            risks: "Credit Risk, Operational Risk",
            controls: "Automated: Credit decision engine. Automated: Mandatory Life insurance selection."
        },
        {
            id: "5",
            name: "CASA account opening & insurance",
            inputs: ["Account Details", "Insurance Form"],
            risks: "Financial Crime (Screening), Reputation (Cooling off), Operational (FATCA)",
            controls: "Automated: CASA Onboarding journey, FSK + Silent8 screening, BBL verification, CRAM risk rating."
        },
        {
            id: "6",
            name: "Loan conditions validation",
            inputs: ["STL record", "Salary credit date", "Security cheque"],
            risks: "Financial Risk (IBAN mismatch), Operational (Docs), Fin Crime (Block)",
            controls: "Automated: IBAN validation (CASA Vs PIL). Manual: Signature validation, QR code validation for eSTLs."
        },
        {
            id: "7",
            name: "Loan disbursal / funds release",
            inputs: ["Disbursal Confirmation", "T24 Record"],
            risks: "Operational Risk (Maker Checker), Financial Crime",
            controls: "Manual: Maker checker process (T24), Validate salary variance (10%), Document File Management."
        }
    ]
};

const SUGGESTIONS = [
    { text: "What are the risks in Step 3?", icon: AlertTriangle },
    { text: "List controls for Credit Underwriting", icon: ShieldCheck },
    { text: "How is EID validated?", icon: FileText },
    { text: "Summarize Loan Disbursal process", icon: Banknote },
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
        const speed = 10; // ms per char
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
        
        // Step 1: Customer Details
        if (q.includes('customer detail') || q.includes('step 1') || q.includes('product selection')) {
            const s = DUMMY_PIL_SOP.steps[0];
            return `**Step 1: ${s.name}**\n\n**Inputs:** ${s.inputs.join(', ')}\n\n**Risks:**\n${s.risks}\n\n**Controls:**\n${s.controls}`;
        }

        // Step 2: ID&V
        if (q.includes('id&v') || q.includes('eligibility') || q.includes('step 2') || q.includes('eid')) {
            const s = DUMMY_PIL_SOP.steps[1];
            return `**Step 2: ${s.name}**\n\n**Risks Identified:**\n${s.risks}\n\n**Key Controls:**\n${s.controls}\n\n*Note: Income threshold is +7K AED.*`;
        }

        // Step 3: Employer/Salary
        if (q.includes('employer') || q.includes('salary') || q.includes('step 3')) {
            const s = DUMMY_PIL_SOP.steps[2];
            return `**Step 3: ${s.name}**\n\n**Risks:** ${s.risks}\n\n**Controls:**\n${s.controls}`;
        }

        // Step 4: Credit
        if (q.includes('credit') || q.includes('underwriting') || q.includes('step 4')) {
            const s = DUMMY_PIL_SOP.steps[3];
            return `**Step 4: ${s.name}**\n\n**Risks:** ${s.risks}\n\n**Controls:**\n${s.controls}\n*Life insurance selection is mandatory.*`;
        }

        // Step 5: CASA
        if (q.includes('casa') || q.includes('account opening') || q.includes('step 5')) {
            const s = DUMMY_PIL_SOP.steps[4];
            return `**Step 5: ${s.name}**\n\n**Risks:** ${s.risks}\n\n**Controls:**\n${s.controls}\n*Includes FATCA CRS declaration.*`;
        }

        // Step 6: Loan Conditions
        if (q.includes('condition') || q.includes('stl') || q.includes('cheque') || q.includes('step 6')) {
            const s = DUMMY_PIL_SOP.steps[5];
            return `**Step 6: ${s.name}**\n\n**Risks:** ${s.risks}\n\n**Controls:**\n${s.controls}\n*Includes manual QR code validation for eSTLs.*`;
        }

        // Step 7: Disbursal
        if (q.includes('disburs') || q.includes('fund') || q.includes('step 7')) {
            const s = DUMMY_PIL_SOP.steps[6];
            return `**Step 7: ${s.name}**\n\n**Risks:** ${s.risks}\n\n**Controls:**\n${s.controls}\n*Maker checker process via T24.*`;
        }

        // General
        if (q.includes('risk')) {
            return `**Major Risks in PIL Process:**\n\n1. **Fraud**: Identity theft, fake employers, salary manipulation.\n2. **Compliance**: Restricted countries, regulatory breaches.\n3. **Financial**: IBAN mismatches, credit default.\n4. **Operational**: Manual errors in maker-checker, document handling.`;
        }

        return `I can help you with the **${DUMMY_PIL_SOP.title}**. \n\nTry asking about:\n- Specific steps (e.g., "Step 3 details")\n- "Risks" involved\n- "Controls" for specific stages\n- "Salary validation" rules`;
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
        }, 800);
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
