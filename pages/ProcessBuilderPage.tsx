
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
    ChevronLeft, Paperclip, Plus, X, 
    FileText, PlayCircle, Loader2, CheckCircle2,
    Sparkles, ArrowUp, TableProperties, Hammer, Zap,
    Workflow, Layers, Network, 
    Boxes, FileStack, ArrowRightCircle,
    Bot, Rocket, Send, Edit2, Trash2, Cpu, File, List,
    Target, ShieldAlert, LayoutList, Lock, Unlock, Users,
    Download, Save
} from 'lucide-react';
import { motion } from 'motion/react';
import { apiService } from '../services/apiService';
import { ProcessDefinitionRow, SopResponse, BuilderResponse, KeyValueItem } from '../types';

interface ProcessBuilderPageProps {
    onBack: () => void;
    onFlowGenerated: (data: SopResponse) => void;
}

// Simplified Flow: Welcome -> Name -> Stages -> Review
type BuilderStep = 'WELCOME' | 'NAME' | 'STAGES' | 'REVIEW';
type ReviewTab = 'OBJECTIVES' | 'DEFINITION' | 'RISKS';

interface Message {
    id: string;
    role: 'system' | 'user';
    content: React.ReactNode;
    isTyping?: boolean;
}

interface StageData {
    id: number;
    name: string;
    files: File[];
    raci?: string;
}

// --- High-Fidelity Animated Robot (Image Based) ---
const RobotAvatar = ({ compact = false }: { compact?: boolean }) => {
    const ROBOT_IMAGE_SRC = "/gernas-robot.png"; 

    return (
        <div className={`relative ${compact ? 'w-12 h-12' : 'w-72 h-72'} flex items-center justify-center pointer-events-none`}>
            {!compact && (
                <>
                    <motion.div 
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-cyan-400/30 rounded-full blur-[60px]"
                        animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    />
                    <motion.div 
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] h-[100%] bg-blue-500/10 rounded-full blur-[80px]"
                        animate={{ scale: [1.1, 0.9, 1.1], opacity: [0.2, 0.4, 0.2] }}
                        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 1 }}
                    />
                </>
            )}
            <motion.img
                src={ROBOT_IMAGE_SRC}
                alt="GERNAS AI Assistant"
                className="w-full h-full object-contain relative z-10 drop-shadow-2xl"
                animate={{ 
                    y: compact ? 0 : [0, -15, 0],
                    scale: compact ? 1 : [1, 1.02, 1]
                }}
                transition={{ 
                    repeat: Infinity, 
                    duration: 4.5, 
                    ease: "easeInOut" 
                }}
                onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
            />
            <div className="hidden absolute inset-0 flex items-center justify-center text-slate-300">
                <Bot size={compact ? 24 : 100} />
            </div>
        </div>
    );
};

// --- Google Style Message Bubble ---
const MessageBubble = ({ role, content, isTyping }: { 
    role: 'system' | 'user', 
    content: React.ReactNode, 
    isTyping?: boolean
}) => {
    const isSystem = role === 'system';
    
    if (isSystem) {
        return (
            <div className="flex flex-col gap-2 w-full max-w-4xl mx-auto mb-6">
                <div className="flex gap-4 animate-in slide-in-from-bottom-2 fade-in duration-500">
                    <div className="shrink-0 mt-1">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-white to-blue-50 border border-blue-100 flex items-center justify-center shadow-sm overflow-hidden">
                            <RobotAvatar compact />
                        </div>
                    </div>
                    <div className="flex-1 space-y-2">
                        <div className="text-sm font-bold text-slate-800">Process Builder</div>
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

// --- Updated Stage Card ---
const StageCard = ({ stage, index, onDelete }: { stage: StageData, index: number, onDelete?: () => void }) => (
    <div className="group flex items-start gap-4 mb-4 w-full animate-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center pt-2 gap-1">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-md z-10 ring-4 ring-white">
                {index + 1}
            </div>
            <div className="w-0.5 h-full bg-slate-200 min-h-[20px] rounded-full group-last:hidden"></div>
        </div>
        
        <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all group-hover:border-blue-200 flex flex-col gap-2">
            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <h4 className="font-extrabold text-slate-800 text-lg mb-1">{stage.name}</h4>
                    <div className="text-xs text-slate-500 flex items-start gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <FileStack size={14} className="text-blue-500 mt-0.5 shrink-0" />
                        <span className="leading-relaxed">
                            Documents: <strong className="text-slate-700">{stage.files.length > 0 ? stage.files.map(f => f.name).join(', ') : 'No document attached'}</strong>
                        </span>
                    </div>
                </div>
                {onDelete && (
                    <button onClick={onDelete} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors opacity-0 group-hover:opacity-100">
                        <Trash2 size={16} />
                    </button>
                )}
            </div>
            {stage.raci && (
                <div className="text-xs text-slate-500 flex items-start gap-2 px-1">
                    <Users size={14} className="text-slate-400 mt-0.5 shrink-0" />
                    <span className="leading-relaxed text-slate-600 italic">{stage.raci}</span>
                </div>
            )}
        </div>
    </div>
);

// --- Updated Stage Input Form with Mandatory Upload & Optional RACI ---
const StageInputForm = ({ onAdd }: { onAdd: (name: string, files: File[], raci?: string) => void }) => {
    const [name, setName] = useState('');
    const [raci, setRaci] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleSubmit = () => {
        if (!name.trim() || files.length === 0) return;
        onAdd(name, files, raci);
        setName('');
        setRaci('');
        setFiles([]);
        if (fileRef.current) fileRef.current.value = '';
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFiles(prev => [...prev, ...Array.from(e.target.files || [])]);
        }
    };

    const removeFile = (idx: number) => {
        setFiles(prev => prev.filter((_, i) => i !== idx));
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
                    {/* Stage Name */}
                    <div className="flex items-center px-2">
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Add a process stage name..."
                            className="flex-1 py-3 px-2 bg-transparent outline-none text-sm text-slate-800 placeholder:text-slate-400 font-medium"
                            autoFocus
                        />
                    </div>

                    {/* RACI Input */}
                    <div className="flex items-center px-2 border-t border-slate-100">
                        <Users size={14} className="text-slate-400 mr-2" />
                        <input
                            type="text"
                            value={raci}
                            onChange={(e) => setRaci(e.target.value)}
                            placeholder="RACI (Optional, e.g. R=Sales, A=Product)"
                            className="flex-1 py-2 bg-transparent outline-none text-xs text-slate-600 placeholder:text-slate-300"
                        />
                    </div>
                    
                    {/* Files Display */}
                    {files.length > 0 && (
                        <div className="flex flex-wrap gap-2 px-2 pb-2 mt-1">
                            {files.map((f, i) => (
                                <div key={i} className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 px-2 py-1 rounded-md text-[10px] text-blue-700 font-medium">
                                    <span className="truncate max-w-[100px]">{f.name}</span>
                                    <button onClick={() => removeFile(i)} className="text-blue-400 hover:text-blue-700"><X size={10} /></button>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    <div className="flex items-center justify-between px-2 pb-1 pt-1">
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => fileRef.current?.click()}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 border ${
                                    files.length === 0 
                                    ? 'text-rose-500 bg-rose-50 border-rose-200 animate-pulse' 
                                    : 'text-slate-500 hover:bg-slate-100 border-transparent hover:border-slate-200'
                                }`}
                            >
                                <Paperclip size={14} />
                                {files.length === 0 ? "Upload Required" : "Add More Docs"}
                            </button>
                            <input 
                                type="file" 
                                ref={fileRef} 
                                onChange={handleFileChange} 
                                className="hidden" 
                                accept=".pdf,.docx,.txt,.xlsx" 
                                multiple 
                            />
                        </div>

                        <button 
                            onClick={handleSubmit}
                            disabled={!name.trim() || files.length === 0}
                            className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:scale-95 transition-all shadow-md shadow-blue-200"
                            title={files.length === 0 ? "Document upload is mandatory" : "Add Stage"}
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
    const [isTyping, setIsTyping] = useState(false); 
    const [isLoading, setIsLoading] = useState(false);
    
    // Loading Status State
    const [loadingMessage, setLoadingMessage] = useState('Generating process...');
    const [loadingProgress, setLoadingProgress] = useState(0);

    // Data Store
    const [itemName, setItemName] = useState('');
    const [stages, setStages] = useState<StageData[]>([]);
    
    // Review Tab State
    const [activeReviewTab, setActiveReviewTab] = useState<ReviewTab>('OBJECTIVES');
    const [builderData, setBuilderData] = useState<BuilderResponse | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Dynamic Columns State
    const tableColumns = useMemo(() => {
        if (!builderData || !builderData.definition || builderData.definition.length === 0) return [];
        
        // Get all unique keys from all rows
        const allKeys = new Set<string>();
        builderData.definition.forEach(row => {
            Object.keys(row).forEach(key => allKeys.add(key));
        });

        // Filter out internal/system keys
        const ignoredKeys = new Set(['originalStageId', 'stageId', 'steps', 'documentsSummary']);
        const availableKeys = Array.from(allKeys).filter(k => !ignoredKeys.has(k));

        // Define preferred order
        const order = ['id', 'l2Process', 'stepName', 'description', 'actor', 'stepType', 'controls', 'risksMitigated', 'policies', 'systemInUse', 'processingTime'];
        
        return availableKeys.sort((a, b) => {
            const idxA = order.indexOf(a);
            const idxB = order.indexOf(b);
            
            // If both are in the order list, sort by index
            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
            // If only A is in list, A comes first
            if (idxA !== -1) return -1;
            // If only B is in list, B comes first
            if (idxB !== -1) return 1;
            // Otherwise sort alphabetically
            return a.localeCompare(b);
        });
    }, [builderData?.definition]);

    // Scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping, stages.length, currentStep]);

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
                        ? <strong key={i} className="font-bold text-blue-600">{part.slice(2, -2)}</strong> 
                        : <span key={i}>{part}</span>
                )}
            </span>
        );
    };

    // --- HANDLERS ---

    const handleStartBuilding = () => {
        setCurrentStep('NAME');
        setIsTyping(true);
        
        setTimeout(() => {
            setMessages([{
                id: 'init',
                role: 'system',
                content: (
                    <div className="space-y-4">
                        <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                            <List size={20} className="text-blue-600 mt-1 shrink-0" />
                            <div className="space-y-2 text-sm text-slate-700">
                                <h4 className="font-bold text-blue-900">Create a new Procedure</h4>
                                <ul className="list-disc pl-4 space-y-1 marker:text-blue-400">
                                    <li><strong>Procedure Name</strong>: What is the name of the Service (refer to the Enterprise Service Architecture)</li>
                                    <li><strong>Define Stages</strong>: List the L2 process stages one by one.</li>
                                    <li><strong>Supporting Documents</strong>: Which of the associated documents are relevant at each state. This does not have to be a 1:1 relationship (e.g. an existing SOP might cover 2-3 of the sub-processes, a checklist may only be relevant in one of the sub-processes etc)</li>
                                    <li><strong>Generate</strong>: The IOP builder will generate a procedures table that includes the detailed process steps using what you have provided</li>
                                </ul>
                            </div>
                        </div>
                        <p>Please enter the <strong className="text-blue-600">Procedure Name</strong> to begin.</p>
                    </div>
                )
            }]);
            setIsTyping(false);
        }, 600);
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim() && currentStep !== 'STAGES') return;
        
        const text = inputValue.trim();
        setInputValue('');

        if (currentStep === 'NAME') {
            addUserMessage(text);
            setItemName(text);
            setCurrentStep('STAGES');
            addSystemMessage(`Now, list the L2 process stages for **${text}**.\n\nYou must upload documents for each stage to generate specific logic.`);
        } 
    };

    const handleAddStage = (name: string, files: File[], raci?: string) => {
        const newStage: StageData = {
            id: Date.now(),
            name: name,
            files: files,
            raci: raci
        };
        setStages(prev => [...prev, newStage]);
    };

    const handleDeleteStage = (id: number) => {
        setStages(prev => prev.filter(s => s.id !== id));
    };

    const handleFinishStages = async () => {
        if (stages.length === 0) return;

        setIsLoading(true);
        setLoadingMessage('Initializing upload...');
        setLoadingProgress(0);
        
        try {
            const data = await apiService.generateTableFromBuilder({
                productName: itemName,
                stages: stages, 
                onLog: (msg, progress) => {
                    setLoadingMessage(msg);
                    setLoadingProgress(progress);
                }
            });
            
            setBuilderData(data);
            setCurrentStep('REVIEW'); 
            setActiveReviewTab('OBJECTIVES'); 
        } catch (e: any) {
            console.error("Failed", e);
            addSystemMessage(`Error: ${e.message || "Process creation failed."}`);
            setCurrentStep('STAGES'); 
        } finally {
            setIsLoading(false);
        }
    };

    // Generic handler for Key/Value pair updates (Objectives/Risks)
    const handleKeyValueChange = (section: 'objectives' | 'risks', id: string, field: 'key' | 'value', val: string) => {
        setBuilderData(prev => {
            if (!prev) return null;
            return {
                ...prev,
                [section]: prev[section].map(item => item.id === id ? { ...item, [field]: val } : item)
            };
        });
    };

    const handleTableChange = (id: string, field: string, value: string) => {
        setBuilderData(prev => {
            if (!prev) return null;
            return {
                ...prev,
                definition: prev.definition.map(row => row.id === id ? { ...row, [field]: value } : row)
            };
        });
    };

    const handleSaveChanges = async () => {
        if (!builderData) return;
        setIsLoading(true);
        setLoadingMessage('Saving changes...');
        
        try {
            const baseSop: SopResponse = {
                startNode: { stepId: 'START', stepName: 'Start', description: 'Start', actor: 'System', stepType: 'Start', nextStep: null },
                endNode: { stepId: 'END', stepName: 'End', description: 'End', actor: 'System', stepType: 'End', nextStep: null },
                processDefinition: { title: itemName, version: '1.0', classification: 'Internal', documentLink: '#' },
                processObjectives: [],
                inherentRisks: [],
                processFlow: { stages: [] },
                metadata: { product_name: itemName }
            };

            await apiService.updateProcessFlowFromTable(
                itemName, 
                builderData.definition, 
                baseSop, 
                builderData.objectives, 
                builderData.risks,
                builderData.processId 
            );
            addSystemMessage("**Success:** Changes saved to process definition.");
        } catch (e) {
            console.error(e);
            addSystemMessage(`Save Error: ${e}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFinalGenerate = async () => {
        if (!builderData) return;
        setIsLoading(true);
        setLoadingMessage('Generating Process Flow...');
        
        try {
            const baseSop: SopResponse = {
                startNode: { stepId: 'START', stepName: 'Start', description: 'Start', actor: 'System', stepType: 'Start', nextStep: null },
                endNode: { stepId: 'END', stepName: 'End', description: 'End', actor: 'System', stepType: 'End', nextStep: null },
                processDefinition: { title: itemName, version: '1.0', classification: 'Internal', documentLink: '#' },
                processObjectives: [],
                inherentRisks: [],
                processFlow: { stages: [] },
                metadata: { product_name: itemName }
            };

            const flowData = await apiService.updateProcessFlowFromTable(
                itemName, 
                builderData.definition, 
                baseSop, 
                builderData.objectives, 
                builderData.risks,
                builderData.processId 
            );
            
            onFlowGenerated(flowData);
        } catch (e) {
            console.error(e);
            addSystemMessage(`Flow Generation Error: ${e}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Helper: Determine if column should use textarea
    const isLongTextColumn = (key: string) => {
        const lower = key.toLowerCase();
        return lower.includes('description') || 
               lower.includes('control') || 
               lower.includes('risk') || 
               lower.includes('polic') ||
               lower.includes('doc');
    };

    // Helper: Label formatter
    const formatLabel = (key: string) => {
        // Handle camelCase to Title Case
        const spaced = key.replace(/([A-Z])/g, ' $1').trim();
        return spaced.charAt(0).toUpperCase() + spaced.slice(1);
    };

    // --- VIEW RENDERERS ---

    if (currentStep === 'WELCOME') {
        return (
            <div className="flex flex-col h-full w-full relative overflow-hidden font-sans items-center justify-center">
                
                {/* Modern Dynamic Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-50/50 -z-20"></div>
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-[100px] animate-pulse -z-10"></div>
                <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-100/40 rounded-full blur-[80px] animate-pulse delay-1000 -z-10"></div>

                <button 
                    onClick={onBack} 
                    className="absolute top-8 left-8 p-3 rounded-full bg-white/80 backdrop-blur-md hover:bg-white shadow-sm border border-slate-200 transition-all z-20 text-slate-500 hover:text-slate-800 hover:scale-105 active:scale-95 group"
                >
                    <ChevronLeft size={24} className="group-hover:-translate-x-0.5 transition-transform" />
                </button>

                <div className="flex flex-col items-center max-w-4xl px-6 text-center z-10">
                    
                    {/* Animated Robot Avatar */}
                    <div className="mb-8 hover:scale-105 transition-transform duration-700 ease-out cursor-default">
                        <RobotAvatar />
                    </div>

                    {/* Typography */}
                    <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-900 mb-6 tracking-tight leading-tight drop-shadow-sm">
                        Design Your <br className="hidden md:block"/> Process Workflow
                    </h1>
                    
                    <p className="text-lg md:text-xl text-slate-500 mb-10 leading-relaxed max-w-2xl font-medium">
                        AI-powered architecture for complex SOPs.<br/>
                        Transform your concepts into structured diagrams in minutes.
                    </p>
                    
                    {/* CTA Button */}
                    <button 
                        onClick={handleStartBuilding}
                        className="group relative flex items-center gap-4 px-10 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-bold text-lg shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
                        <span className="relative z-10 flex items-center gap-3">
                            <Rocket size={22} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            Start Building
                        </span>
                    </button>

                    {/* Footer Info */}
                    <div className="mt-12 flex gap-8 text-xs font-semibold text-slate-400 uppercase tracking-widest opacity-60">
                        <span className="flex items-center gap-2"><Cpu size={14} /> AI Powered</span>
                        <span className="flex items-center gap-2"><Workflow size={14} /> Smart Routing</span>
                        <span className="flex items-center gap-2"><Zap size={14} /> Instant Gen</span>
                    </div>
                </div>
            </div>
        );
    }

    if (currentStep === 'REVIEW') {
        const excelUrl = builderData?.rawResultData?.excelDownloadUrl;

        return (
            <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden font-sans">
                {/* Header */}
                <div className="px-8 py-6 bg-white border-b border-slate-200 flex justify-between items-center shadow-sm z-10 sticky top-0">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <TableProperties size={20} className="text-blue-600" />
                            Review Process Definition
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">Refine objectives, steps, and risks before generating the final diagram.</p>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setCurrentStep('STAGES')}
                            className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold text-sm transition-colors"
                        >
                            Back
                        </button>
                        
                        {excelUrl && (
                            <a 
                                href={excelUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="px-5 py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl font-bold text-sm transition-all flex items-center gap-2"
                            >
                                <Download size={16} /> Excel Export
                            </a>
                        )}

                        <button 
                            onClick={handleSaveChanges}
                            disabled={isLoading}
                            className="px-5 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl font-bold text-sm transition-all flex items-center gap-2 disabled:opacity-70"
                        >
                            <Save size={16} /> Save Changes
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

                {/* Tab Navigation */}
                <div className="px-8 pt-4 pb-0 bg-white border-b border-slate-200 sticky top-[88px] z-10">
                    <div className="flex gap-6">
                        {[
                            { id: 'OBJECTIVES', label: 'Process Objective', icon: Target },
                            { id: 'DEFINITION', label: 'Process Definition', icon: LayoutList },
                            { id: 'RISKS', label: 'Process Risks', icon: ShieldAlert }
                        ].map(tab => {
                            const Icon = tab.icon;
                            const isActive = activeReviewTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveReviewTab(tab.id as ReviewTab)}
                                    className={`flex items-center gap-2 pb-4 text-sm font-bold border-b-2 transition-all ${
                                        isActive 
                                        ? 'text-blue-600 border-blue-600' 
                                        : 'text-slate-500 border-transparent hover:text-slate-700 hover:border-slate-300'
                                    }`}
                                >
                                    <Icon size={16} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-auto p-8 bg-slate-50/50">
                    {builderData ? (
                        <>
                            {/* OBJECTIVES TAB */}
                            {activeReviewTab === 'OBJECTIVES' && (
                                <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-2">
                                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4 flex items-center gap-3">
                                        <Target size={20} className="text-blue-600" />
                                        <p className="text-sm text-blue-900 font-medium">Define the core goals and success criteria for this process.</p>
                                    </div>
                                    {builderData.objectives.length > 0 ? builderData.objectives.map((obj) => (
                                        <div key={obj.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex gap-4">
                                                <div className="w-1/3">
                                                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Objective Type</label>
                                                    <div className="relative">
                                                        <input 
                                                            type="text" 
                                                            value={obj.key}
                                                            onChange={(e) => handleKeyValueChange('objectives', obj.id, 'key', e.target.value)}
                                                            disabled={!obj.editable}
                                                            className={`w-full p-2.5 rounded-lg border text-sm font-bold ${
                                                                obj.editable 
                                                                ? 'bg-white border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100' 
                                                                : 'bg-slate-50 border-transparent text-slate-600'
                                                            }`}
                                                        />
                                                        {!obj.editable && <Lock size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />}
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Description</label>
                                                    <textarea 
                                                        value={obj.value}
                                                        onChange={(e) => handleKeyValueChange('objectives', obj.id, 'value', e.target.value)}
                                                        disabled={!obj.editable}
                                                        rows={2}
                                                        className={`w-full p-2.5 rounded-lg border text-sm resize-none ${
                                                            obj.editable 
                                                            ? 'bg-white border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100' 
                                                            : 'bg-slate-50 border-transparent text-slate-600'
                                                        }`}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-center p-8 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                                            No objectives extracted yet.
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* DEFINITION TAB (Dynamic Table) */}
                            {activeReviewTab === 'DEFINITION' && (
                                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-x-auto ring-1 ring-black/5 animate-in fade-in slide-in-from-bottom-2">
                                    <table className="w-full text-left border-collapse text-sm min-w-[1200px]">
                                        <thead className="bg-slate-50 border-b border-slate-200">
                                            <tr>
                                                {tableColumns.map(key => (
                                                    <th key={key} className="p-4 font-bold text-slate-500 min-w-[120px] whitespace-nowrap uppercase text-xs tracking-wide">
                                                        {formatLabel(key)}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {builderData.definition.map((row) => (
                                                <tr key={row.id} className="hover:bg-blue-50/30 transition-colors group">
                                                    {tableColumns.map(key => {
                                                        const isLong = isLongTextColumn(key);
                                                        const val = row[key];
                                                        return (
                                                            <td key={key} className="p-4 align-top">
                                                                {key === 'id' ? (
                                                                    <span className="font-mono text-xs font-medium text-slate-400">{val}</span>
                                                                ) : key === 'l2Process' ? (
                                                                    <span className="text-slate-600 font-medium">{val}</span>
                                                                ) : isLong ? (
                                                                    <textarea 
                                                                        value={val || ''} 
                                                                        onChange={(e) => handleTableChange(row.id, key, e.target.value)}
                                                                        className="w-full bg-transparent border border-transparent focus:border-blue-400 focus:bg-white outline-none resize-none h-16 focus:h-24 text-slate-600 leading-snug transition-all text-xs"
                                                                    />
                                                                ) : (
                                                                    <input 
                                                                        type="text" 
                                                                        value={val || ''} 
                                                                        onChange={(e) => handleTableChange(row.id, key, e.target.value)}
                                                                        className="w-full bg-transparent border-b border-transparent focus:border-blue-400 focus:bg-white outline-none transition-all"
                                                                    />
                                                                )}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* RISKS TAB */}
                            {activeReviewTab === 'RISKS' && (
                                <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-2">
                                    <div className="bg-rose-50 border border-rose-100 rounded-lg p-4 mb-4 flex items-center gap-3">
                                        <ShieldAlert size={20} className="text-rose-600" />
                                        <p className="text-sm text-rose-900 font-medium">Identify potential operational, financial, or regulatory risks.</p>
                                    </div>
                                    {builderData.risks.length > 0 ? builderData.risks.map((risk) => (
                                        <div key={risk.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow group">
                                            <div className="flex gap-4">
                                                <div className="w-1/3">
                                                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Risk Category</label>
                                                    <div className="relative">
                                                        <input 
                                                            type="text" 
                                                            value={risk.key}
                                                            onChange={(e) => handleKeyValueChange('risks', risk.id, 'key', e.target.value)}
                                                            disabled={!risk.editable}
                                                            className={`w-full p-2.5 rounded-lg border text-sm font-bold text-rose-700 ${
                                                                risk.editable 
                                                                ? 'bg-white border-slate-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-100' 
                                                                : 'bg-slate-50 border-transparent'
                                                            }`}
                                                        />
                                                        {!risk.editable && <Lock size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />}
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Risk Description</label>
                                                    <textarea 
                                                        value={risk.value}
                                                        onChange={(e) => handleKeyValueChange('risks', risk.id, 'value', e.target.value)}
                                                        disabled={!risk.editable}
                                                        rows={2}
                                                        className={`w-full p-2.5 rounded-lg border text-sm resize-none ${
                                                            risk.editable 
                                                            ? 'bg-white border-slate-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-100' 
                                                            : 'bg-slate-50 border-transparent text-slate-600'
                                                        }`}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-center p-8 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                                            No risks extracted yet.
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                            <Loader2 size={32} className="animate-spin mb-4" />
                            <p>Loading process details...</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // --- MAIN CHAT / BUILDER VIEW ---
    return (
        <div className="flex flex-col h-full bg-slate-50 font-sans relative">
            
            {/* Loading Overlay for Process Generation */}
            {isLoading && (
                <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Bot size={24} className="text-blue-600 animate-pulse" />
                        </div>
                    </div>
                    <h3 className="mt-6 text-xl font-bold text-slate-800">{loadingMessage}</h3>
                    
                    {/* Progress Bar */}
                    <div className="w-64 h-2 bg-slate-100 rounded-full mt-4 overflow-hidden">
                        <div 
                            className="h-full bg-blue-600 transition-all duration-500 ease-out" 
                            style={{ width: `${loadingProgress}%` }}
                        ></div>
                    </div>
                    <p className="text-sm font-mono text-slate-500 mt-2">{loadingProgress}% Complete</p>
                </div>
            )}

            {/* Header */}
            <div className="px-6 py-4 bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-20 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                    <div className="flex items-center gap-2">
                        <RobotAvatar compact />
                        <div>
                            <h2 className="text-base font-bold text-slate-800">Process Builder</h2>
                            {itemName && <p className="text-xs text-slate-500">Drafting: {itemName}</p>}
                        </div>
                    </div>
                </div>
                
                {/* Progress Indicators */}
                <div className="hidden md:flex items-center gap-2">
                    {['NAME', 'STAGES'].map((step, i) => {
                        const logicalOrder = ['NAME', 'STAGES', 'REVIEW'];
                        const currIdx = logicalOrder.indexOf(currentStep);
                        const isActive = i <= currIdx;
                        
                        return (
                            <div key={step} className="flex items-center gap-2">
                                <div className={`w-2.5 h-2.5 rounded-full transition-colors ${isActive ? 'bg-blue-600' : 'bg-slate-300'}`}></div>
                                {i < 1 && <div className={`w-8 h-0.5 rounded-full ${isActive && (i+1) <= currIdx ? 'bg-blue-600' : 'bg-slate-200'}`}></div>}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 pb-32 scroll-smooth">
                {messages.map((msg) => (
                    <MessageBubble 
                        key={msg.id} 
                        role={msg.role} 
                        content={msg.content} 
                        isTyping={msg.isTyping} 
                    />
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
                                    disabled={isLoading}
                                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-bold shadow-xl shadow-blue-200 hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-70 disabled:scale-100"
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
