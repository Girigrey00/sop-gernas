
import React, { useState, useRef, useEffect } from 'react';
import { 
    ChevronLeft, Paperclip, Plus, X, 
    FileText, PlayCircle, Loader2, CheckCircle2,
    Sparkles, ArrowUp, TableProperties, Hammer, Zap,
    Workflow, Layers, Network, 
    Boxes, FileStack, ArrowRightCircle,
    Bot, Rocket, Send, Edit2, Trash2
} from 'lucide-react';
import { motion } from 'motion/react';
import { apiService } from '../services/apiService';
import { ProcessDefinitionRow, SopResponse } from '../types';

interface ProcessBuilderPageProps {
    onBack: () => void;
    onFlowGenerated: (data: SopResponse) => void;
}

type BuilderStep = 'WELCOME' | 'NAME' | 'START' | 'END' | 'STAGES' | 'REVIEW';

interface Message {
    id: string;
    role: 'system' | 'user';
    content: React.ReactNode;
}

interface StageData {
    id: number;
    name: string;
    file: File | null;
}

// --- Animated Robot Component (Gemini Style) ---
const RobotAvatar = ({ compact = false }: { compact?: boolean }) => {
    return (
        <div className={`relative ${compact ? 'w-12 h-12' : 'w-48 h-48'} flex items-center justify-center transition-all duration-500`}>
            {/* Background Glow */}
            {!compact && <div className="absolute inset-0 bg-blue-400/20 blur-[60px] rounded-full animate-pulse"></div>}
            
            <motion.svg
                viewBox="0 0 200 200"
                className="w-full h-full relative z-10"
                animate={{ y: compact ? 0 : [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            >
                <defs>
                    <linearGradient id="robotGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#4285F4" /> {/* Google Blue */}
                        <stop offset="100%" stopColor="#8AB4F8" /> {/* Lighter Blue */}
                    </linearGradient>
                </defs>

                {/* Head */}
                <rect x="60" y="60" width="80" height="70" rx="20" fill="url(#robotGradient)" />
                
                {/* Face/Screen */}
                <rect x="70" y="75" width="60" height="40" rx="12" fill="#FFFFFF" fillOpacity="0.9" />

                {/* Eyes */}
                <motion.g animate={{ scaleY: [1, 0.1, 1, 1, 1] }} transition={{ repeat: Infinity, duration: 4, times: [0, 0.05, 0.1, 0.8, 1], delay: 1 }}>
                    <circle cx="90" cy="95" r="5" fill="#4285F4" /> 
                    <circle cx="110" cy="95" r="5" fill="#4285F4" /> 
                </motion.g>

                {/* Antenna */}
                <line x1="100" y1="60" x2="100" y2="40" stroke="#4285F4" strokeWidth="4" strokeLinecap="round" />
                <motion.circle cx="100" cy="35" r="6" fill="#EA4335" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2 }} />

                {/* Body (Simple Curve) */}
                {!compact && (
                    <path d="M 70 140 Q 50 140 50 160 L 50 170 L 150 170 L 150 160 Q 150 140 130 140 Z" fill="#E8F0FE" />
                )}
            </motion.svg>
        </div>
    );
};

// --- Google Style Message Bubble ---
const MessageBubble = ({ role, content, isTyping }: { role: 'system' | 'user', content: React.ReactNode, isTyping?: boolean }) => {
    const isSystem = role === 'system';
    
    if (isSystem) {
        return (
            <div className="flex gap-4 animate-in slide-in-from-bottom-2 fade-in duration-500 w-full max-w-4xl mx-auto mb-6">
                <div className="shrink-0 mt-1">
                    <div className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                        <Sparkles size={16} className="text-blue-500 fill-blue-100" />
                    </div>
                </div>
                <div className="flex-1 space-y-2">
                    <div className="text-sm font-bold text-slate-800">Process Architect</div>
                    <div className="text-base text-slate-600 leading-relaxed font-normal">
                        {isTyping ? (
                            <div className="flex items-center gap-1 h-6">
                                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-75"></span>
                                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-150"></span>
                            </div>
                        ) : content}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-end animate-in slide-in-from-bottom-2 fade-in duration-500 w-full max-w-4xl mx-auto mb-8">
            <div className="bg-slate-100 text-slate-800 px-6 py-3 rounded-3xl rounded-tr-lg text-base max-w-[80%] shadow-sm border border-slate-200/50">
                {content}
            </div>
        </div>
    );
};

// --- Material Style Stage Card ---
const StageCard = ({ stage, index, onDelete }: { stage: StageData, index: number, onDelete?: () => void }) => (
    <div className="group flex items-start gap-4 mb-4 w-full animate-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center pt-2 gap-1">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-md z-10 ring-4 ring-white">
                {index + 1}
            </div>
            <div className="w-0.5 h-full bg-slate-200 min-h-[20px] rounded-full group-last:hidden"></div>
        </div>
        
        <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all group-hover:border-blue-200 flex justify-between items-start">
            <div>
                <h4 className="font-semibold text-slate-800 text-sm">{stage.name}</h4>
                {stage.file && (
                    <div className="mt-2 inline-flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                        <FileStack size={12} className="text-blue-500" /> 
                        <span className="truncate max-w-[200px]">{stage.file.name}</span>
                    </div>
                )}
            </div>
            {onDelete && (
                <button onClick={onDelete} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 size={16} />
                </button>
            )}
        </div>
    </div>
);

// --- Google Keep Style Input ---
const StageInputForm = ({ onAdd }: { onAdd: (name: string, file: File | null) => void }) => {
    const [name, setName] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleSubmit = () => {
        if (!name.trim() && !file) return;
        onAdd(name, file);
        setName('');
        setFile(null);
        if (fileRef.current) fileRef.current.value = '';
    };

    return (
        <div className="flex items-start gap-4 mb-8 w-full animate-in fade-in">
            <div className="pt-3">
                <div className="w-6 h-6 rounded-full border-2 border-slate-300 border-dashed flex items-center justify-center">
                    <Plus size={12} className="text-slate-400" />
                </div>
            </div>
            
            <div className="flex-1">
                <div className="bg-white border border-slate-200 shadow-lg shadow-slate-100/50 rounded-2xl p-2 flex flex-col gap-2 transition-shadow focus-within:shadow-xl focus-within:border-blue-300">
                    <div className="flex items-center px-2">
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                            placeholder="Add a process stage..."
                            className="flex-1 py-3 px-2 bg-transparent outline-none text-sm text-slate-800 placeholder:text-slate-400 font-medium"
                            autoFocus
                        />
                    </div>
                    
                    <div className="flex items-center justify-between px-2 pb-1">
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => fileRef.current?.click()}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
                                    file 
                                    ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                                    : 'text-slate-500 hover:bg-slate-100 border border-transparent'
                                }`}
                            >
                                <Paperclip size={14} />
                                {file ? <span className="max-w-[100px] truncate">{file.name}</span> : "Attach Doc"}
                            </button>
                            {file && (
                                <button onClick={() => { setFile(null); if(fileRef.current) fileRef.current.value=''; }} className="text-slate-400 hover:text-rose-500">
                                    <X size={14} />
                                </button>
                            )}
                            <input type="file" ref={fileRef} onChange={(e) => e.target.files && setFile(e.target.files[0])} className="hidden" accept=".pdf,.docx,.txt" />
                        </div>

                        <button 
                            onClick={handleSubmit}
                            disabled={!name.trim() && !file}
                            className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:scale-95 transition-all shadow-md shadow-blue-200"
                        >
                            <ArrowUp size={18} strokeWidth={3} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProcessBuilderPage: React.FC<ProcessBuilderPageProps> = ({ onBack, onFlowGenerated }) => {
    // State
    const [currentStep, setCurrentStep] = useState<BuilderStep>('WELCOME');
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false); // Bot typing indicator
    const [isLoading, setIsLoading] = useState(false); // API loading

    // Data Store
    const [productName, setProductName] = useState('');
    const [startTrigger, setStartTrigger] = useState('');
    const [endTrigger, setEndTrigger] = useState('');
    const [stages, setStages] = useState<StageData[]>([]);
    
    // Table State
    const [tableData, setTableData] = useState<ProcessDefinitionRow[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping, stages.length, currentStep]);

    // Initial Welcome
    useEffect(() => {
        if (messages.length === 0 && currentStep === 'WELCOME') {
            // No initial message in list, handled by renderWelcome
        }
    }, []);

    // Helper to add messages
    const addSystemMessage = (text: string, delay = 600) => {
        setIsTyping(true);
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'system',
                content: formatText(text)
            }]);
            setIsTyping(false);
        }, delay);
    };

    const addUserMessage = (content: React.ReactNode) => {
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'user',
            content: content
        }]);
    };

    const formatText = (text: string) => {
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return (
            <span>
                {parts.map((part, i) => 
                    part.startsWith('**') && part.endsWith('**') 
                        ? <strong key={i} className="font-bold text-slate-900">{part.slice(2, -2)}</strong> 
                        : <span key={i}>{part}</span>
                )}
            </span>
        );
    };

    // Handlers
    const handleSendMessage = async () => {
        if (!inputValue.trim() && currentStep !== 'STAGES') return;
        
        const text = inputValue.trim();
        setInputValue('');

        if (currentStep === 'NAME') {
            addUserMessage(text);
            setProductName(text);
            setCurrentStep('START');
            addSystemMessage(`Great! We're building **${text}**. What triggers this process?`);
        } 
        else if (currentStep === 'START') {
            addUserMessage(text);
            setStartTrigger(text);
            setCurrentStep('END');
            addSystemMessage("Got it. What is the expected outcome or end state?");
        } 
        else if (currentStep === 'END') {
            addUserMessage(text);
            setEndTrigger(text);
            setCurrentStep('STAGES');
            addSystemMessage("Now, list the high-level process stages.");
        } 
    };

    const handleAddStage = (name: string, file: File | null) => {
        const newStage: StageData = {
            id: Date.now(),
            name: name,
            file: file
        };
        setStages(prev => [...prev, newStage]);
    };

    const handleDeleteStage = (id: number) => {
        setStages(prev => prev.filter(s => s.id !== id));
    };

    const handleFinishStages = async () => {
        if (stages.length === 0) return;

        setIsLoading(true);
        setCurrentStep('REVIEW'); 

        try {
            const data = await apiService.generateTableFromBuilder({
                productName,
                startTrigger,
                endTrigger,
                stages: stages.map(s => ({ name: s.name }))
            });
            setTableData(data);
        } catch (e) {
            console.error("Failed", e);
            setCurrentStep('STAGES'); 
        } finally {
            setIsLoading(false);
        }
    };

    const handleStartBuilding = () => {
        setCurrentStep('NAME');
        setIsTyping(true);
        setTimeout(() => {
            setMessages([{
                id: 'init',
                role: 'system',
                content: formatText("Let's design your new process. \n\nTo begin, please enter the **Product or Policy Name**.")
            }]);
            setIsTyping(false);
        }, 600);
    };

    const handleTableChange = (id: string, field: keyof ProcessDefinitionRow, value: string) => {
        setTableData(prev => prev.map(row => row.id === id ? { ...row, [field]: value } : row));
    };

    const handleFinalGenerate = async () => {
        setIsLoading(true);
        try {
            const baseSop: SopResponse = {
                startNode: { stepId: 'START', stepName: 'Start', description: startTrigger, actor: 'System', stepType: 'Start', nextStep: null },
                endNode: { stepId: 'END', stepName: 'End', description: endTrigger, actor: 'System', stepType: 'End', nextStep: null },
                processDefinition: { title: productName, version: '1.0', classification: 'Internal', documentLink: '#' },
                processObjectives: [],
                inherentRisks: [],
                processFlow: { stages: stages.map((s, i) => ({ stageId: `S${i+1}`, stageName: s.name, description: s.name, steps: [] })) },
                metadata: { product_name: productName }
            };

            const flowData = await apiService.updateProcessFlowFromTable(productName, tableData, baseSop);
            onFlowGenerated(flowData);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    // --- VIEW RENDERERS ---

    if (currentStep === 'WELCOME') {
        return (
            <div className="flex flex-col h-full w-full bg-slate-50 relative overflow-hidden font-sans items-center justify-center">
                <button onClick={onBack} className="absolute top-6 left-6 p-3 rounded-full bg-white hover:bg-slate-100 shadow-sm border border-slate-200 transition-colors z-10 text-slate-500">
                    <ChevronLeft size={24} />
                </button>

                <div className="flex flex-col items-center max-w-2xl px-6 text-center animate-in fade-in zoom-in-95 duration-700">
                    <RobotAvatar />
                    <h1 className="text-4xl font-bold text-slate-800 mt-8 mb-4 tracking-tight">
                        Process Architect
                    </h1>
                    <p className="text-lg text-slate-500 mb-10 leading-relaxed">
                        Design complex enterprise workflows with AI assistance.<br/>
                        From concept to structured SOP in minutes.
                    </p>
                    
                    <button 
                        onClick={handleStartBuilding}
                        className="group relative flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-full font-bold text-lg shadow-xl shadow-blue-200 hover:shadow-2xl hover:shadow-blue-300 hover:scale-105 transition-all active:scale-95"
                    >
                        <Sparkles size={20} className="text-blue-100" />
                        Create New Process
                        <div className="absolute inset-0 rounded-full ring-2 ring-white/20 group-hover:ring-4 transition-all"></div>
                    </button>
                </div>
            </div>
        );
    }

    if (currentStep === 'REVIEW') {
        return (
            <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden font-sans">
                {/* Header */}
                <div className="px-8 py-6 bg-white border-b border-slate-200 flex justify-between items-center shadow-sm z-10 sticky top-0">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <TableProperties size={20} className="text-blue-600" />
                            Review Process Definition
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">Refine step details before generating the final diagram.</p>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setCurrentStep('STAGES')}
                            className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold text-sm transition-colors"
                        >
                            Back
                        </button>
                        <button 
                            onClick={handleFinalGenerate}
                            disabled={isLoading}
                            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-70"
                        >
                            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <PlayCircle size={18} />}
                            Generate Flow
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-auto p-8">
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden ring-1 ring-black/5">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="p-4 font-bold text-slate-500 w-20">ID</th>
                                    <th className="p-4 font-bold text-slate-500 w-48">L2 Process</th>
                                    <th className="p-4 font-bold text-slate-500 w-64">Step Name</th>
                                    <th className="p-4 font-bold text-slate-500">Description</th>
                                    <th className="p-4 font-bold text-slate-500 w-32">Actor</th>
                                    <th className="p-4 font-bold text-slate-500 w-32">Type</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {tableData.map((row) => (
                                    <tr key={row.id} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="p-4 font-mono text-xs font-medium text-slate-400">{row.id}</td>
                                        <td className="p-4 text-slate-600 font-medium">{row.l2Process}</td>
                                        <td className="p-4">
                                            <input 
                                                type="text" 
                                                value={row.stepName} 
                                                onChange={(e) => handleTableChange(row.id, 'stepName', e.target.value)}
                                                className="w-full bg-transparent border-b border-transparent focus:border-blue-400 focus:bg-white outline-none font-bold text-slate-800 transition-all"
                                            />
                                        </td>
                                        <td className="p-4">
                                            <textarea 
                                                value={row.stepDescription} 
                                                onChange={(e) => handleTableChange(row.id, 'stepDescription', e.target.value)}
                                                className="w-full bg-transparent border border-transparent focus:border-blue-400 focus:bg-white outline-none resize-none h-10 focus:h-20 text-slate-600 leading-snug transition-all"
                                            />
                                        </td>
                                        <td className="p-4">
                                            <input 
                                                type="text" 
                                                value={row.actor} 
                                                onChange={(e) => handleTableChange(row.id, 'actor', e.target.value)}
                                                className="w-full bg-transparent border-b border-transparent focus:border-blue-400 focus:bg-white outline-none text-slate-700 font-medium transition-all"
                                            />
                                        </td>
                                        <td className="p-4">
                                            <input 
                                                type="text" 
                                                value={row.stepType} 
                                                onChange={(e) => handleTableChange(row.id, 'stepType', e.target.value)}
                                                className="w-full bg-transparent border-b border-transparent focus:border-blue-400 focus:bg-white outline-none text-slate-500 font-medium transition-all"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    // --- MAIN CHAT / BUILDER VIEW ---
    return (
        <div className="flex flex-col h-full bg-slate-50 font-sans">
            
            {/* Header */}
            <div className="px-6 py-4 bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-20 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                    <div className="flex items-center gap-2">
                        <RobotAvatar compact />
                        <div>
                            <h2 className="text-base font-bold text-slate-800">Process Architect</h2>
                            {productName && <p className="text-xs text-slate-500">Drafting: {productName}</p>}
                        </div>
                    </div>
                </div>
                
                {/* Progress Indicators */}
                <div className="hidden md:flex items-center gap-2">
                    {['NAME', 'START', 'END', 'STAGES'].map((step, i) => {
                        const steps = ['NAME', 'START', 'END', 'STAGES'];
                        const currIdx = steps.indexOf(currentStep);
                        const stepIdx = steps.indexOf(step);
                        const isActive = stepIdx <= currIdx;
                        
                        return (
                            <div key={step} className="flex items-center gap-2">
                                <div className={`w-2.5 h-2.5 rounded-full transition-colors ${isActive ? 'bg-blue-600' : 'bg-slate-300'}`}></div>
                                {i < steps.length - 1 && <div className={`w-8 h-0.5 rounded-full ${isActive && stepIdx < currIdx ? 'bg-blue-600' : 'bg-slate-200'}`}></div>}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 pb-32 scroll-smooth">
                {messages.map((msg) => (
                    <MessageBubble key={msg.id} role={msg.role} content={msg.content} isTyping={msg.isTyping} />
                ))}
                
                {/* Stages List */}
                {currentStep === 'STAGES' && (
                    <div className="w-full max-w-4xl mx-auto pl-12 animate-in fade-in">
                        {stages.map((stage, idx) => (
                            <StageCard key={stage.id} stage={stage} index={idx} onDelete={() => handleDeleteStage(stage.id)} />
                        ))}
                        <StageInputForm onAdd={handleAddStage} />
                        
                        {stages.length > 0 && (
                            <div className="flex justify-end pt-4 border-t border-slate-200 mt-8">
                                <button 
                                    onClick={handleFinishStages}
                                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-bold shadow-xl shadow-blue-200 hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-2"
                                >
                                    {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
                                    Generate Process Table
                                </button>
                            </div>
                        )}
                    </div>
                )}
                
                <div ref={messagesEndRef} />
            </div>

            {/* Floating Input Bar (Only show if NOT in stages mode) */}
            {currentStep !== 'STAGES' && (
                <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent z-20">
                    <div className="max-w-3xl mx-auto relative">
                        <div className="bg-white border border-slate-200 shadow-xl shadow-slate-200/50 rounded-full p-2 pl-6 flex items-center gap-4 transition-all focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Type your response..."
                                className="flex-1 bg-transparent outline-none text-slate-800 placeholder:text-slate-400"
                                autoFocus
                                disabled={isTyping}
                            />
                            <button 
                                onClick={handleSendMessage}
                                disabled={!inputValue.trim() || isTyping}
                                className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:scale-95 transition-all shadow-md"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProcessBuilderPage;
