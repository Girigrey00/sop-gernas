
import React, { useState, useRef, useEffect } from 'react';
import { 
    ChevronLeft, Send, Paperclip, Plus, X, 
    FileText, PlayCircle, Loader2, CheckCircle2, RotateCcw,
    Sparkles, ArrowUp
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

    // Initial Welcome
    useEffect(() => {
        addSystemMessage("Hello! I'm your Process Architect. Let's build a new Standard Operating Procedure (SOP) together.\n\nFirst, please enter the **Product or Policy Name** you are working on.");
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
                        ? <strong key={i} className="font-bold text-fab-navy">{part.slice(2, -2)}</strong> 
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
                    <span>{newStage.name}</span>
                    {newStage.file && (
                        <div className="flex items-center gap-2 text-xs bg-white/20 p-1.5 rounded w-fit">
                            <Paperclip size={12} /> {newStage.file.name}
                        </div>
                    )}
                </div>
            );

            setCurrentStageFile(null); // Reset file
            if(fileInputRef.current) fileInputRef.current.value = '';

            // System Confirmation doesn't need to happen every single time if we want speed,
            // but for chat feel, a subtle ack is good.
            // We won't add a system message every time to avoid clutter, 
            // the user sees their bubble.
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
            <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">
                {/* Header */}
                <div className="px-8 py-6 bg-white border-b border-slate-200 flex justify-between items-center shadow-sm z-10">
                    <div>
                        <h2 className="text-xl font-bold text-fab-navy flex items-center gap-2">
                            <FileText size={20} className="text-fab-royal" />
                            Review & Refine
                        </h2>
                        <p className="text-sm text-slate-500">I've drafted the process steps. Please review and edit before visualizing.</p>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setCurrentStep('STAGES')}
                            className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg font-bold text-sm transition-colors"
                        >
                            Back to Chat
                        </button>
                        <button 
                            onClick={handleFinalGenerate}
                            disabled={isLoading}
                            className="px-6 py-2 bg-fab-royal text-white rounded-lg font-bold text-sm shadow-lg shadow-fab-royal/20 hover:bg-fab-blue transition-all flex items-center gap-2 disabled:opacity-70"
                        >
                            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <PlayCircle size={16} />}
                            Generate Flow
                        </button>
                    </div>
                </div>

                {/* Table Area */}
                <div className="flex-1 overflow-auto p-6">
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead className="bg-slate-100 border-b border-slate-200 sticky top-0 z-10">
                                <tr>
                                    <th className="p-3 font-bold text-slate-600 border-r border-slate-200 w-24">ID</th>
                                    <th className="p-3 font-bold text-slate-600 border-r border-slate-200 w-48">L2 Process</th>
                                    <th className="p-3 font-bold text-slate-600 border-r border-slate-200 w-64">Step Name</th>
                                    <th className="p-3 font-bold text-slate-600 border-r border-slate-200 min-w-[200px]">Description</th>
                                    <th className="p-3 font-bold text-slate-600 border-r border-slate-200 w-28">Actor</th>
                                    <th className="p-3 font-bold text-slate-600 border-r border-slate-200 w-24">Type</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {tableData.map((row) => (
                                    <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-2 border-r border-slate-100 font-mono font-medium text-slate-500 bg-slate-50/50">{row.id}</td>
                                        <td className="p-2 border-r border-slate-100 text-slate-600">{row.l2Process}</td>
                                        <td className="p-2 border-r border-slate-100">
                                            <input 
                                                type="text" 
                                                value={row.stepName} 
                                                onChange={(e) => handleTableChange(row.id, 'stepName', e.target.value)}
                                                className="w-full bg-transparent border-b border-transparent focus:border-blue-400 focus:bg-white outline-none transition-all px-1 py-0.5 font-bold text-slate-800"
                                            />
                                        </td>
                                        <td className="p-2 border-r border-slate-100">
                                            <textarea 
                                                value={row.stepDescription} 
                                                onChange={(e) => handleTableChange(row.id, 'stepDescription', e.target.value)}
                                                className="w-full bg-transparent border border-transparent focus:border-blue-400 focus:bg-white outline-none transition-all px-1 py-0.5 resize-none h-8 focus:h-16 text-slate-600 leading-tight"
                                            />
                                        </td>
                                        <td className="p-2 border-r border-slate-100">
                                            <input 
                                                type="text" 
                                                value={row.actor} 
                                                onChange={(e) => handleTableChange(row.id, 'actor', e.target.value)}
                                                className="w-full bg-transparent border-b border-transparent focus:border-blue-400 focus:bg-white outline-none transition-all px-1 py-0.5 text-slate-700 font-medium"
                                            />
                                        </td>
                                        <td className="p-2 border-r border-slate-100">
                                            <input 
                                                type="text" 
                                                value={row.stepType} 
                                                onChange={(e) => handleTableChange(row.id, 'stepType', e.target.value)}
                                                className="w-full bg-transparent border-b border-transparent focus:border-blue-400 focus:bg-white outline-none transition-all px-1 py-0.5 text-slate-500"
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
        <div className="flex h-full w-full bg-slate-50 relative overflow-hidden flex-col">
            
            {/* Header */}
            <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 shadow-sm z-10">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-fab-navy">Process Builder</h1>
                        <p className="text-xs text-slate-500">AI-Guided Process Definition</p>
                    </div>
                </div>
                {/* Progress Indicators */}
                <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${currentStep === 'NAME' ? 'bg-fab-royal animate-pulse' : 'bg-slate-300'}`}></div>
                    <div className={`h-2 w-2 rounded-full ${currentStep === 'START' ? 'bg-fab-royal animate-pulse' : 'bg-slate-300'}`}></div>
                    <div className={`h-2 w-2 rounded-full ${currentStep === 'END' ? 'bg-fab-royal animate-pulse' : 'bg-slate-300'}`}></div>
                    <div className={`h-2 w-2 rounded-full ${currentStep === 'STAGES' ? 'bg-fab-royal animate-pulse' : 'bg-slate-300'}`}></div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                            msg.role === 'user' ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-fab-royal'
                        }`}>
                            {msg.role === 'user' ? <span className="text-xs font-bold">YOU</span> : <GIcon className="w-6 h-6" />}
                        </div>
                        <div className={`max-w-[80%] md:max-w-[70%] px-5 py-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
                            msg.role === 'user' 
                            ? 'bg-fab-royal text-white rounded-tr-none' 
                            : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'
                        }`}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                
                {isTyping && (
                    <div className="flex gap-4 animate-in fade-in">
                        <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-fab-royal shrink-0 shadow-sm">
                            <GIcon className="w-6 h-6" />
                        </div>
                        <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white border-t border-slate-200 p-4 md:p-6 shrink-0 relative z-20">
                <div className="max-w-3xl mx-auto">
                    {/* File Attachment Pill */}
                    {currentStageFile && (
                        <div className="absolute top-0 transform -translate-y-full mb-2 bg-white border border-slate-200 shadow-md rounded-lg p-2 flex items-center gap-2 animate-in slide-in-from-bottom-2">
                            <div className="p-1.5 bg-blue-50 text-blue-600 rounded">
                                <FileText size={16} />
                            </div>
                            <span className="text-xs font-medium text-slate-700 max-w-[200px] truncate">{currentStageFile.name}</span>
                            <button onClick={() => setCurrentStageFile(null)} className="text-slate-400 hover:text-rose-500 ml-2">
                                <X size={14} />
                            </button>
                        </div>
                    )}

                    {/* Input Container */}
                    <div className="flex gap-2 items-end">
                        {currentStep === 'STAGES' && (
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="p-3.5 bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-fab-royal rounded-xl transition-colors shrink-0"
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
                        
                        <div className="flex-1 bg-slate-100 rounded-xl flex items-center px-4 py-3 focus-within:ring-2 focus-within:ring-fab-royal/50 transition-all border border-transparent focus-within:border-fab-royal focus-within:bg-white">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder={
                                    currentStep === 'NAME' ? "Enter Product / Policy Name..." :
                                    currentStep === 'START' ? "What starts the process?..." :
                                    currentStep === 'END' ? "What ends the process?..." :
                                    "Enter Stage Name..."
                                }
                                className="bg-transparent border-none outline-none w-full text-sm text-slate-800 placeholder:text-slate-400"
                                autoFocus
                            />
                        </div>

                        {currentStep === 'STAGES' ? (
                            <div className="flex gap-2">
                                <button 
                                    onClick={handleSendMessage}
                                    className="p-3.5 bg-fab-royal text-white rounded-xl shadow-lg shadow-fab-royal/20 hover:bg-fab-blue transition-all disabled:opacity-50"
                                    disabled={!inputValue.trim() && !currentStageFile}
                                    title="Add Stage"
                                >
                                    <Plus size={20} />
                                </button>
                                <button 
                                    onClick={handleFinishStages}
                                    disabled={stages.length === 0}
                                    className="px-4 py-3 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all font-bold text-sm flex items-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Sparkles size={16} />
                                    Done
                                </button>
                            </div>
                        ) : (
                            <button 
                                onClick={handleSendMessage}
                                disabled={!inputValue.trim()}
                                className="p-3.5 bg-fab-royal text-white rounded-xl shadow-lg shadow-fab-royal/20 hover:bg-fab-blue transition-all disabled:opacity-50 disabled:shadow-none"
                            >
                                <ArrowUp size={20} strokeWidth={3} />
                            </button>
                        )}
                    </div>
                    
                    {currentStep === 'STAGES' && stages.length > 0 && (
                        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                            {stages.map((s, i) => (
                                <div key={s.id} className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 whitespace-nowrap">
                                    <span className="w-4 h-4 bg-fab-royal text-white rounded-full flex items-center justify-center text-[9px] font-bold">{i+1}</span>
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
