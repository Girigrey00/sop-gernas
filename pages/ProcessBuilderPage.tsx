
import React, { useState, useRef, useEffect } from 'react';
import { 
    ChevronLeft, Paperclip, Plus, X, 
    FileText, PlayCircle, Loader2, CheckCircle2,
    Sparkles, ArrowUp, TableProperties, Hammer, Zap,
    GitCommit, Workflow, Layers, HardHat, Network, 
    GitBranch, Boxes, FileStack, ArrowRightCircle,
    Bot, Rocket
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

// --- Animated Robot Component (Lottie Style) ---
const RobotAvatar = () => {
    return (
        <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-cyan-500/20 blur-3xl rounded-full animate-pulse"></div>
            
            <motion.svg
                viewBox="0 0 200 200"
                className="w-full h-full relative z-10 drop-shadow-2xl"
                animate={{ y: [0, -15, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            >
                <defs>
                    <linearGradient id="robotGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#06b6d4" /> {/* Cyan-500 */}
                        <stop offset="100%" stopColor="#3b82f6" /> {/* Blue-500 */}
                    </linearGradient>
                </defs>

                {/* Antenna */}
                <motion.g animate={{ rotate: [-5, 5, -5] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} style={{ originX: "100px", originY: "60px" }}>
                    <line x1="100" y1="60" x2="100" y2="30" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
                    <circle cx="100" cy="25" r="8" fill="#f43f5e" className="animate-pulse" />
                </motion.g>

                {/* Head */}
                <rect x="60" y="60" width="80" height="70" rx="20" fill="url(#robotGradient)" stroke="white" strokeWidth="3" />
                
                {/* Face/Screen */}
                <rect x="70" y="75" width="60" height="40" rx="10" fill="#0f172a" />

                {/* Eyes */}
                <motion.g animate={{ scaleY: [1, 0.1, 1, 1, 1] }} transition={{ repeat: Infinity, duration: 3, times: [0, 0.05, 0.1, 0.8, 1] }}>
                    <circle cx="85" cy="95" r="6" fill="#22d3ee" /> {/* Left Eye */}
                    <circle cx="115" cy="95" r="6" fill="#22d3ee" /> {/* Right Eye */}
                </motion.g>

                {/* Mouth */}
                <path d="M 90 108 Q 100 112 110 108" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" fill="none" />

                {/* Body */}
                <path d="M 70 140 Q 50 140 50 160 L 50 180 L 150 180 L 150 160 Q 150 140 130 140 Z" fill="white" stroke="#e2e8f0" strokeWidth="2" />
                <rect x="85" y="150" width="30" height="20" rx="4" fill="#e2e8f0" />

                {/* Arms */}
                <motion.path d="M 50 160 Q 30 160 30 140" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" fill="none" 
                    animate={{ rotate: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2, delay: 0.5 }} style={{ originX: "50px", originY: "160px" }}
                />
                <motion.path d="M 150 160 Q 170 160 170 140" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" fill="none" 
                    animate={{ rotate: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 2, delay: 0.5 }} style={{ originX: "150px", originY: "160px" }}
                />
            </motion.svg>
        </div>
    );
};

// Interactive Stage Card Component (Display in History)
const StageCard = ({ stage, index }: { stage: StageData, index: number }) => (
    <div className="relative pl-8 py-2 group">
        {/* Visual Connector Line for Flow Effect - Constrained to prevent overlap */}
        <div className="absolute left-[9px] top-0 bottom-0 w-px border-l-2 border-dashed border-indigo-200 group-first:top-1/2 group-last:bottom-1/2"></div>
        
        {/* Node Dot / Number */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-indigo-600 text-white border-2 border-white shadow-md flex items-center justify-center z-10 text-[10px] font-bold">
            {index + 1}
        </div>

        {/* Card Body */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm min-w-[260px] max-w-sm relative group-hover:border-indigo-300 group-hover:shadow-md transition-all animate-in slide-in-from-left-2 duration-300 ml-2">
            <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider flex items-center gap-1.5 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                    <Boxes size={10} /> L2 Stage
                </span>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                </div>
            </div>
            
            <h4 className="font-bold text-slate-800 text-sm leading-tight flex items-center gap-2">
                {stage.name}
            </h4>
            
            {stage.file && (
                <div className="flex items-center gap-2 mt-3 bg-slate-50 p-2 rounded-lg border border-slate-100 w-fit group-hover:bg-indigo-50/30 transition-colors">
                    <div className="bg-white p-1.5 rounded border border-slate-200 shadow-sm text-indigo-500">
                        <FileStack size={12} />
                    </div>
                    <span className="text-[10px] text-slate-600 font-medium truncate max-w-[140px]">{stage.file.name}</span>
                </div>
            )}
        </div>
    </div>
);

// Input Form Component (Modern AI Node Creator Style)
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
        <div className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl shadow-indigo-100/50 border border-indigo-50 overflow-hidden animate-in zoom-in-95 duration-300 group ring-1 ring-indigo-50 relative ml-2">
            
            {/* Header */}
            <div className="px-5 py-3 border-b border-indigo-50/50 flex justify-between items-center bg-gradient-to-r from-white to-indigo-50/30">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg text-white shadow-md shadow-indigo-200">
                        <Workflow size={14} strokeWidth={2.5} />
                    </div>
                    <span className="text-xs font-bold text-slate-700 tracking-wide uppercase">Define Process Step</span>
                </div>
                <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-200 animate-pulse"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-200 animate-pulse delay-100"></div>
                </div>
            </div>
            
            <div className="p-5 relative z-10">
                <div className="space-y-4">
                    {/* Modern Input */}
                    <div className="relative group/input">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <Zap size={16} className="text-slate-300 group-focus-within/input:text-indigo-500 transition-colors fill-slate-100" />
                        </div>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                            placeholder="Name of this stage (e.g. Verification)"
                            className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all font-semibold placeholder:font-normal placeholder:text-slate-400 text-slate-800 shadow-inner"
                            autoFocus
                        />
                    </div>
                    
                    <div className="flex items-center justify-between gap-3 pt-1">
                        {/* File Trigger */}
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => fileRef.current?.click()}
                                className={`px-3 py-2 rounded-xl border transition-all text-xs font-bold flex items-center gap-2 ${
                                    file 
                                    ? 'bg-indigo-50 border-indigo-200 text-indigo-600 shadow-sm' 
                                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 hover:border-slate-300 hover:shadow-sm'
                                }`}
                            >
                                <Paperclip size={14} />
                                {file ? <span className="max-w-[80px] truncate">{file.name}</span> : "Ref Doc"}
                            </button>
                            
                            {file && (
                                <button 
                                    onClick={() => { setFile(null); if(fileRef.current) fileRef.current.value=''; }} 
                                    className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            )}
                            <input type="file" ref={fileRef} onChange={(e) => e.target.files && setFile(e.target.files[0])} className="hidden" accept=".pdf,.docx,.txt" />
                        </div>

                        {/* Action Button */}
                        <button 
                            onClick={handleSubmit}
                            disabled={!name.trim() && !file}
                            className="bg-indigo-600 text-white pl-4 pr-5 py-2.5 rounded-xl text-xs font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:scale-95 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-200 flex items-center gap-2 hover:-translate-y-0.5 active:translate-y-0"
                        >
                            Add Step <ArrowUp size={14} strokeWidth={3} />
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
    
    // Stage Input State
    const [currentStageFile, setCurrentStageFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const hasInitialized = useRef(false);

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

    // Initial Welcome - Fixed double render with ref
    useEffect(() => {
        if (!hasInitialized.current) {
            hasInitialized.current = true;
            // Add Welcome Hero immediately
            setMessages([{
                id: 'welcome-hero',
                role: 'system',
                content: <WelcomeHero />
            }]);
        }
    }, []);

    // Welcome Component with Robot and CTA
    const WelcomeHero = () => (
        <div className="w-full flex flex-col items-center justify-center py-8 animate-in fade-in zoom-in-95 duration-500">
            <RobotAvatar />
            <h2 className="text-2xl font-bold text-slate-800 mt-6 mb-2 text-center">
                Welcome to GERNAS Architect
            </h2>
            <p className="text-slate-500 text-center max-w-md mb-8 text-sm leading-relaxed">
                I'm your AI Process Assistant. I can help you structure complex standard operating procedures (SOPs), define risks, and visualize workflows in minutes.
            </p>
            <button 
                onClick={handleStartBuilding}
                className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full font-bold text-base shadow-xl shadow-cyan-200 hover:shadow-cyan-300 transition-all hover:scale-105 active:scale-95 overflow-hidden"
            >
                <span className="relative z-10 flex items-center gap-2">
                    <Rocket size={20} className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                    Start Building
                </span>
                <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-500 skew-x-12 -translate-x-full"></div>
            </button>
        </div>
    );

    const handleStartBuilding = () => {
        setMessages(prev => [
            ...prev,
            { id: 'start-action', role: 'user', content: 'Start Building' }
        ]);
        
        setCurrentStep('NAME');
        setIsTyping(true);
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'system',
                content: formatText("Let's get started! 🚀\n\nFirst, please enter the **Product or Policy Name** you are working on.")
            }]);
            setIsTyping(false);
        }, 800);
    };

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

    // Text formatting helper
    const formatText = (text: string) => {
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return (
            <span>
                {parts.map((part, i) => 
                    part.startsWith('**') && part.endsWith('**') 
                        ? <strong key={i} className="font-bold text-slate-800">{part.slice(2, -2)}</strong> 
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
            addSystemMessage(`Great! Working on **${text}**.\n\nWhat **triggers** or starts this process?`);
        } 
        else if (currentStep === 'START') {
            addUserMessage(text);
            setStartTrigger(text);
            setCurrentStep('END');
            addSystemMessage("Got it. And what defines the **End Trigger** or successful outcome?");
        } 
        else if (currentStep === 'END') {
            addUserMessage(text);
            setEndTrigger(text);
            setCurrentStep('STAGES');
            addSystemMessage("Understood. Now, let's define the **L2 Process Stages**.\n\nUse the node creator below to build your flow structure.");
        } 
        // STAGES step now handled by StageInputForm or Footer Button
    };

    // New Handler for Stage Card Input
    const handleAddStage = (name: string, file: File | null) => {
        const newStage: StageData = {
            id: Date.now(),
            name: name,
            file: file
        };

        const newIndex = stages.length;
        setStages(prev => [...prev, newStage]);
        
        // Render Stage Card in chat history as user action
        addUserMessage(<StageCard stage={newStage} index={newIndex} />);
    };

    const handleFinishStages = async () => {
        if (stages.length === 0) {
            addSystemMessage("Please add at least one stage before generating.");
            return;
        }

        addUserMessage(<span className="flex items-center gap-2"><Sparkles size={14} /> Generate Process Table</span>);
        setIsLoading(true);
        setCurrentStep('REVIEW'); 

        try {
            // Mock API call
            const data = await apiService.generateTableFromBuilder({
                productName,
                startTrigger,
                endTrigger,
                stages: stages.map(s => ({ name: s.name }))
            });
            setTableData(data);
        } catch (e) {
            console.error("Failed", e);
            addSystemMessage("Sorry, I encountered an issue generating the table. Please try again.");
            setCurrentStep('STAGES'); 
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setCurrentStageFile(e.target.files[0]);
        }
    };

    // Table Handlers
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

    // --- RENDERERS ---

    if (currentStep === 'REVIEW') {
        return (
            <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden font-sans">
                {/* Header */}
                <div className="px-8 py-6 bg-white border-b border-slate-200 flex justify-between items-center shadow-sm z-10">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <TableProperties size={20} className="text-blue-600" />
                            Review Process Table
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">Refine step details before generating the final visualization.</p>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setCurrentStep('STAGES')}
                            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-bold text-sm transition-colors"
                        >
                            Back to Chat
                        </button>
                        <button 
                            onClick={handleFinalGenerate}
                            disabled={isLoading}
                            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold text-sm shadow-md shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-70 disabled:scale-100 hover:scale-[1.02]"
                        >
                            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <PlayCircle size={16} />}
                            Generate Flow
                        </button>
                    </div>
                </div>

                {/* Table Area */}
                <div className="flex-1 overflow-auto p-6 bg-slate-50/50">
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden ring-1 ring-black/5">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                                <tr>
                                    <th className="p-4 font-bold text-slate-500 border-r border-slate-200 w-24 text-xs uppercase tracking-wider">ID</th>
                                    <th className="p-4 font-bold text-slate-500 border-r border-slate-200 w-48 text-xs uppercase tracking-wider">L2 Process</th>
                                    <th className="p-4 font-bold text-slate-500 border-r border-slate-200 w-64 text-xs uppercase tracking-wider">Step Name</th>
                                    <th className="p-4 font-bold text-slate-500 border-r border-slate-200 min-w-[200px] text-xs uppercase tracking-wider">Description</th>
                                    <th className="p-4 font-bold text-slate-500 border-r border-slate-200 w-28 text-xs uppercase tracking-wider">Actor</th>
                                    <th className="p-4 font-bold text-slate-500 border-r border-slate-200 w-24 text-xs uppercase tracking-wider">Type</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {tableData.map((row) => (
                                    <tr key={row.id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="p-3 border-r border-slate-100 font-mono text-xs font-medium text-slate-400 bg-slate-50/30">{row.id}</td>
                                        <td className="p-3 border-r border-slate-100 text-slate-600 font-medium">{row.l2Process}</td>
                                        <td className="p-3 border-r border-slate-100">
                                            <input 
                                                type="text" 
                                                value={row.stepName} 
                                                onChange={(e) => handleTableChange(row.id, 'stepName', e.target.value)}
                                                className="w-full bg-transparent border-b border-transparent focus:border-blue-400 focus:bg-white outline-none transition-all px-1 py-0.5 font-bold text-slate-800 placeholder-slate-300"
                                            />
                                        </td>
                                        <td className="p-3 border-r border-slate-100">
                                            <textarea 
                                                value={row.stepDescription} 
                                                onChange={(e) => handleTableChange(row.id, 'stepDescription', e.target.value)}
                                                className="w-full bg-transparent border border-transparent focus:border-blue-400 focus:bg-white outline-none transition-all px-1 py-0.5 resize-none h-10 focus:h-20 text-slate-600 leading-snug placeholder-slate-300"
                                            />
                                        </td>
                                        <td className="p-3 border-r border-slate-100">
                                            <input 
                                                type="text" 
                                                value={row.actor} 
                                                onChange={(e) => handleTableChange(row.id, 'actor', e.target.value)}
                                                className="w-full bg-transparent border-b border-transparent focus:border-blue-400 focus:bg-white outline-none transition-all px-1 py-0.5 text-slate-700 font-medium"
                                            />
                                        </td>
                                        <td className="p-3 border-r border-slate-100">
                                            <input 
                                                type="text" 
                                                value={row.stepType} 
                                                onChange={(e) => handleTableChange(row.id, 'stepType', e.target.value)}
                                                className="w-full bg-transparent border-b border-transparent focus:border-blue-400 focus:bg-white outline-none transition-all px-1 py-0.5 text-slate-500 font-medium"
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

    // Chat View
    return (
        <div className="flex h-full w-full bg-white relative overflow-hidden flex-col font-sans">
            
            {/* Header */}
            <div className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between shrink-0 z-10 sticky top-0">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="text-slate-400 hover:text-slate-800 hover:bg-slate-50 p-2 rounded-full transition-all">
                        <ChevronLeft size={24} />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center text-white shadow-lg ring-2 ring-cyan-50">
                            <Network size={22} className="text-white drop-shadow-sm" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">Process Builder</h1>
                            <p className="text-xs text-slate-500 font-medium">Interactive Flow Builder</p>
                        </div>
                    </div>
                </div>
                
                {/* Progress Steps (Hide if in Welcome) */}
                {currentStep !== 'WELCOME' && (
                    <div className="flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 hidden md:flex animate-in fade-in">
                        <div className={`h-2 w-2 rounded-full transition-all duration-300 ${currentStep === 'NAME' ? 'bg-blue-600 scale-125' : 'bg-slate-300'}`}></div>
                        <div className="w-4 h-px bg-slate-200"></div>
                        <div className={`h-2 w-2 rounded-full transition-all duration-300 ${currentStep === 'START' ? 'bg-blue-600 scale-125' : 'bg-slate-300'}`}></div>
                        <div className="w-4 h-px bg-slate-200"></div>
                        <div className={`h-2 w-2 rounded-full transition-all duration-300 ${currentStep === 'END' ? 'bg-blue-600 scale-125' : 'bg-slate-300'}`}></div>
                        <div className="w-4 h-px bg-slate-200"></div>
                        <div className={`h-2 w-2 rounded-full transition-all duration-300 ${currentStep === 'STAGES' ? 'bg-blue-600 scale-125' : 'bg-slate-300'}`}></div>
                    </div>
                )}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 bg-slate-50/50">
                <div className={`max-w-3xl mx-auto flex flex-col gap-6 pl-4 md:pl-0 ${currentStep === 'WELCOME' ? 'h-full justify-center' : ''}`}>
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                            {/* Avatar Column */}
                            {msg.role !== 'system' || currentStep !== 'WELCOME' ? (
                                <div className="flex flex-col items-center gap-1 shrink-0">
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shadow-sm border transition-all ${
                                        msg.role === 'user' ? 'bg-slate-800 text-white border-slate-700' : 'bg-white text-fab-royal border-slate-200'
                                    }`}>
                                        {msg.role === 'user' ? (
                                            <span className="text-[10px] font-bold">YOU</span>
                                        ) : (
                                            <Network size={18} className="text-cyan-600 fill-cyan-100" />
                                        )}
                                    </div>
                                    {msg.role === 'system' && (
                                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider text-center w-16 leading-none mt-0.5">
                                            Process<br/>Builder
                                        </span>
                                    )}
                                </div>
                            ) : null}
                            
                            {/* Bubble or Custom Content */}
                            <div className={`max-w-[85%] md:max-w-[80%] ${
                                typeof msg.content === 'string' || (React.isValidElement(msg.content) && msg.content.type === 'span') 
                                ? `px-6 py-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
                                    msg.role === 'user' 
                                    ? 'bg-blue-600 text-white rounded-tr-none shadow-md' 
                                    : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-[0_2px_10px_-2px_rgba(0,0,0,0.05)]'
                                  }` 
                                : 'w-full' 
                            }`}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    
                    {isTyping && (
                        <div className="flex gap-4 animate-in fade-in">
                            <div className="flex flex-col items-center gap-1 shrink-0">
                                <div className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-blue-600 shadow-sm">
                                    <Network size={18} className="text-cyan-600 fill-cyan-100" />
                                </div>
                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider text-center w-16 leading-none mt-0.5">
                                    Process<br/>Builder
                                </span>
                            </div>
                            
                            {/* Construction Loader */}
                            <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-3 w-fit h-fit">
                                {/* Hammer Animation */}
                                <Hammer size={16} className="text-orange-500 animate-bounce" />
                                
                                {/* Bricks Animation */}
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-orange-300 rounded-sm animate-pulse"></div>
                                    <div className="w-2 h-2 bg-orange-400 rounded-sm animate-pulse delay-100"></div>
                                    <div className="w-2 h-2 bg-orange-500 rounded-sm animate-pulse delay-200"></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Inline Input Card for Stages */}
                    {currentStep === 'STAGES' && (
                        <div className="flex justify-start w-full relative">
                            {/* Visual Guide Line connecting to input */}
                            <div className="absolute left-[18px] top-[-30px] bottom-1/2 w-px border-l-2 border-dashed border-slate-300 z-0"></div>
                            
                            <div className="w-[52px] shrink-0 mr-4"></div> {/* Spacer for alignment with bot avatar */}
                            <StageInputForm onAdd={handleAddStage} />
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area / Footer Actions */}
            {currentStep !== 'WELCOME' && (
                <div className="p-4 md:p-6 shrink-0 relative z-20 bg-gradient-to-t from-white via-white to-transparent">
                    <div className="max-w-3xl mx-auto">
                        
                        {currentStep === 'STAGES' ? (
                            /* Generate Button for Stages Step */
                            <button 
                                onClick={handleFinishStages}
                                disabled={stages.length === 0}
                                className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-2xl font-bold shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:shadow-none hover:scale-[1.01] active:scale-[0.99] border-t border-white/20"
                            >
                                <Sparkles size={20} className={stages.length > 0 ? "animate-pulse" : ""} />
                                Generate Process Flow Table
                                <span className="bg-white/20 px-2 py-0.5 rounded text-xs ml-2">
                                    {stages.length} Stage{stages.length !== 1 ? 's' : ''} Added
                                </span>
                            </button>
                        ) : (
                            /* Standard Chat Input for other steps */
                            <div className="bg-white border border-slate-200 shadow-xl rounded-full p-1.5 pl-5 flex items-center gap-2 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-300 transition-all">
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    onChange={handleFileUpload} 
                                    className="hidden" 
                                    accept=".pdf,.docx,.txt" 
                                />
                                
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder={
                                        currentStep === 'NAME' ? "Enter Product / Policy Name..." :
                                        currentStep === 'START' ? "What starts the process?..." :
                                        currentStep === 'END' ? "What ends the process?..." :
                                        "Type message..."
                                    }
                                    className="flex-1 bg-transparent border-none outline-none text-sm text-slate-800 placeholder:text-slate-400 h-10"
                                    autoFocus
                                />

                                <button 
                                    onClick={handleSendMessage}
                                    disabled={!inputValue.trim()}
                                    className="p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all shadow-md disabled:opacity-50 disabled:shadow-none hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 mr-1"
                                >
                                    <ArrowUp size={20} strokeWidth={2.5} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProcessBuilderPage;
