
import React, { useState, useRef, useEffect } from 'react';
import { 
    ChevronLeft, Send, Paperclip, Plus, X, 
    FileText, PlayCircle, Loader2, CheckCircle2, RotateCcw,
    Sparkles, ArrowUp, Bot
} from 'lucide-react';
import { apiService } from '../services/apiService';
import { ProcessDefinitionRow, SopResponse } from '../types';
import { GIcon } from '../components/ChatAssistant'; // Reusing the brand icon

interface ProcessBuilderPageProps {
    onBack: () => void;
    onFlowGenerated: (data: SopResponse) => void;
}

type BuilderStep = 'NAME' | 'START' | 'END' | 'STAGES' | 'REVIEW';

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

const ProcessBuilderPage: React.FC<ProcessBuilderPageProps> = ({ onBack, onFlowGenerated }) => {
    // State
    const [currentStep, setCurrentStep] = useState<BuilderStep>('NAME');
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
    }, [messages, isTyping]);

    // Initial Welcome - Fixed double render with ref
    useEffect(() => {
        if (!hasInitialized.current) {
            hasInitialized.current = true;
            addSystemMessage("Hello! I'm your Process Architect. Let's build a new Standard Operating Procedure (SOP) together.\n\nFirst, please enter the **Product or Policy Name** you are working on.");
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

    const addUserMessage = (text: string | React.ReactNode) => {
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'user',
            content: text
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
        
        // STAGES step logic is handled differently (can submit with just file or special button)
        // But assuming standard text entry first:
        
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
            addSystemMessage("Understood. Now, let's define the **L2 Process Stages**.\n\nEnter a stage name and click send (or press Enter). You can also attach a reference document for each stage using the clip icon.");
        } 
        else if (currentStep === 'STAGES') {
            if (!text && !currentStageFile) return;
            
            // Add Stage Logic
            const newStage: StageData = {
                id: Date.now(),
                name: text || (currentStageFile ? `Stage from ${currentStageFile.name}` : 'Untitled Stage'),
                file: currentStageFile
            };

            setStages(prev => [...prev, newStage]);
            
            // User Message Display
            addUserMessage(
                <div className="flex flex-col gap-1">
                    <span className="font-medium">{newStage.name}</span>
                    {newStage.file && (
                        <div className="flex items-center gap-2 text-xs bg-white/20 p-2 rounded-lg border border-white/30 w-fit mt-1 backdrop-blur-sm">
                            <Paperclip size={12} /> {newStage.file.name}
                        </div>
                    )}
                </div>
            );

            setCurrentStageFile(null); // Reset file
            if(fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleFinishStages = async () => {
        if (stages.length === 0) {
            addSystemMessage("Please add at least one stage before generating.");
            return;
        }

        addUserMessage("Generate Process Table");
        setIsLoading(true);
        setCurrentStep('REVIEW'); // Switch to Review Mode immediately or after loading

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
            setCurrentStep('STAGES'); // Go back
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
                            <FileText size={20} className="text-blue-600" />
                            Review & Refine
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">Review the drafted steps before generating the visualization.</p>
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
                    <div>
                        <h1 className="text-lg font-bold text-slate-800 tracking-tight">Process Architect</h1>
                        <p className="text-xs text-slate-500 font-medium">AI-Guided Builder</p>
                    </div>
                </div>
                {/* Progress Steps */}
                <div className="flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                    <div className={`h-2 w-2 rounded-full transition-all duration-300 ${currentStep === 'NAME' ? 'bg-blue-600 scale-125' : 'bg-slate-300'}`}></div>
                    <div className="w-4 h-px bg-slate-200"></div>
                    <div className={`h-2 w-2 rounded-full transition-all duration-300 ${currentStep === 'START' ? 'bg-blue-600 scale-125' : 'bg-slate-300'}`}></div>
                    <div className="w-4 h-px bg-slate-200"></div>
                    <div className={`h-2 w-2 rounded-full transition-all duration-300 ${currentStep === 'END' ? 'bg-blue-600 scale-125' : 'bg-slate-300'}`}></div>
                    <div className="w-4 h-px bg-slate-200"></div>
                    <div className={`h-2 w-2 rounded-full transition-all duration-300 ${currentStep === 'STAGES' ? 'bg-blue-600 scale-125' : 'bg-slate-300'}`}></div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 bg-slate-50/30">
                <div className="max-w-3xl mx-auto flex flex-col gap-6">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                            {/* Avatar */}
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-sm border ${
                                msg.role === 'user' ? 'bg-slate-900 text-white border-slate-800' : 'bg-white text-blue-600 border-slate-200'
                            }`}>
                                {msg.role === 'user' ? <span className="text-[10px] font-bold">YOU</span> : <GIcon className="w-5 h-5" />}
                            </div>
                            
                            {/* Bubble */}
                            <div className={`max-w-[85%] md:max-w-[80%] px-6 py-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
                                msg.role === 'user' 
                                ? 'bg-blue-600 text-white rounded-tr-none shadow-md' 
                                : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-[0_2px_10px_-2px_rgba(0,0,0,0.05)]'
                            }`}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    
                    {isTyping && (
                        <div className="flex gap-4 animate-in fade-in">
                            <div className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-blue-600 shrink-0 shadow-sm">
                                <GIcon className="w-5 h-5" />
                            </div>
                            <div className="bg-white border border-slate-200 px-5 py-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5 w-fit">
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="p-4 md:p-6 shrink-0 relative z-20 bg-gradient-to-t from-white via-white to-transparent">
                <div className="max-w-3xl mx-auto">
                    {/* File Attachment Pill */}
                    {currentStageFile && (
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 transform -translate-y-full mb-4 bg-white border border-slate-200 shadow-lg rounded-full py-1.5 px-3 flex items-center gap-3 animate-in slide-in-from-bottom-2">
                            <div className="p-1 bg-blue-50 text-blue-600 rounded-full">
                                <FileText size={14} />
                            </div>
                            <span className="text-xs font-bold text-slate-700 max-w-[200px] truncate">{currentStageFile.name}</span>
                            <button onClick={() => setCurrentStageFile(null)} className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full p-0.5 transition-colors">
                                <X size={14} />
                            </button>
                        </div>
                    )}

                    {/* Input Bar */}
                    <div className="bg-white border border-slate-200 shadow-xl rounded-full p-1.5 pl-5 flex items-center gap-2 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-300 transition-all">
                        {currentStep === 'STAGES' && (
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors shrink-0"
                                title="Upload Reference Document"
                            >
                                <Paperclip size={20} />
                            </button>
                        )}
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
                                "Type stage name..."
                            }
                            className="flex-1 bg-transparent border-none outline-none text-sm text-slate-800 placeholder:text-slate-400 h-10"
                            autoFocus
                        />

                        {currentStep === 'STAGES' ? (
                            <div className="flex gap-2">
                                <button 
                                    onClick={handleSendMessage}
                                    className="p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all shadow-md disabled:opacity-50 disabled:shadow-none hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                                    disabled={!inputValue.trim() && !currentStageFile}
                                    title="Add Stage"
                                >
                                    <Plus size={20} />
                                </button>
                                <button 
                                    onClick={handleFinishStages}
                                    disabled={stages.length === 0}
                                    className="px-4 py-2 bg-emerald-500 text-white rounded-full font-bold text-xs hover:bg-emerald-600 transition-all shadow-md flex items-center gap-2 disabled:opacity-50 disabled:shadow-none whitespace-nowrap mr-1"
                                >
                                    <Sparkles size={14} />
                                    Done
                                </button>
                            </div>
                        ) : (
                            <button 
                                onClick={handleSendMessage}
                                disabled={!inputValue.trim()}
                                className="p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all shadow-md disabled:opacity-50 disabled:shadow-none hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 mr-1"
                            >
                                <ArrowUp size={20} strokeWidth={2.5} />
                            </button>
                        )}
                    </div>
                    
                    {currentStep === 'STAGES' && stages.length > 0 && (
                        <div className="mt-4 flex gap-2 overflow-x-auto pb-2 px-1 no-scrollbar justify-center">
                            {stages.map((s, i) => (
                                <div key={s.id} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-600 shadow-sm whitespace-nowrap animate-in fade-in slide-in-from-bottom-2">
                                    <span className="w-4 h-4 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-[9px]">{i+1}</span>
                                    {s.name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProcessBuilderPage;
