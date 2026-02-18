import React, { useState, useRef, useEffect } from 'react';
import { 
    ArrowLeft, Send, Plus, FileText, X, Loader2, 
    CheckCircle2, List, Bot, User, Upload, Play,
    FileSpreadsheet, Edit3, Save, RotateCcw, Trash2, HelpCircle
} from 'lucide-react';
import { apiService } from '../services/apiService';
import { BuilderResponse, ProcessDefinitionRow, SopResponse } from '../types';

interface ProcessBuilderPageProps {
    onBack: () => void;
    onFlowGenerated?: (data: SopResponse, prompt: string) => void;
}

type BuilderStep = 'INTRO' | 'NAME' | 'STAGES' | 'DOCUMENTS' | 'GENERATING' | 'REVIEW';

interface StageDraft {
    id: number;
    name: string;
    files: File[];
    raci: string;
}

interface Message {
    id: string;
    role: 'system' | 'user';
    content: React.ReactNode;
}

const ProcessBuilderPage: React.FC<ProcessBuilderPageProps> = ({ onBack, onFlowGenerated }) => {
    const [currentStep, setCurrentStep] = useState<BuilderStep>('INTRO');
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    
    // Data State
    const [processName, setProcessName] = useState('');
    const [stages, setStages] = useState<StageDraft[]>([]);
    const [currentStageIndex, setCurrentStageIndex] = useState<number>(0); 
    
    // Generation State
    const [logs, setLogs] = useState<string[]>([]);
    const [progress, setProgress] = useState(0);
    const [builderResult, setBuilderResult] = useState<BuilderResponse | null>(null);
    const [tableData, setTableData] = useState<ProcessDefinitionRow[]>([]);
    const [sopResult, setSopResult] = useState<SopResponse | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping, logs]);

    const addMessage = (role: 'system' | 'user', content: React.ReactNode) => {
        setMessages(prev => [...prev, { id: Date.now().toString(), role, content }]);
    };

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
                                <ul className="list-disc pl-4 space-y-2 marker:text-blue-400">
                                    <li>
                                        <strong>Procedure Name</strong>: What is the name of the Service?
                                    </li>
                                    <li>
                                        <strong>Define Stages</strong>: List the L2 process stages one by one.
                                    </li>
                                    <li>
                                        <strong>Supporting Documents</strong>: Upload relevant docs for each stage.
                                    </li>
                                    <li>
                                        <strong>Generate</strong>: The builder will generate a detailed process table.
                                    </li>
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

    const handleInputSend = async () => {
        if (!inputValue.trim()) return;
        const text = inputValue;
        setInputValue('');
        addMessage('user', text);

        setIsTyping(true);
        // Process Input based on Step
        setTimeout(() => {
            processStepLogic(text);
        }, 500);
    };

    const processStepLogic = (text: string) => {
        if (currentStep === 'NAME') {
            setProcessName(text);
            setStages([]);
            setCurrentStep('STAGES');
            addMessage('system', (
                <div>
                    <p>Great! The procedure is named <strong>"{text}"</strong>.</p>
                    <p className="mt-2">Now, list the <strong>L2 Process Stages</strong>. Enter them one by one.</p>
                    <p className="text-xs text-slate-500 mt-1">Type "Done" when you have finished listing stages.</p>
                </div>
            ));
        } else if (currentStep === 'STAGES') {
            if (text.toLowerCase() === 'done') {
                if (stages.length === 0) {
                    addMessage('system', "Please add at least one stage before finishing.");
                } else {
                    setCurrentStep('DOCUMENTS');
                    setCurrentStageIndex(0);
                    addMessage('system', (
                        <div>
                            <p>Stages recorded. Now let's upload documents for the first stage:</p>
                            <div className="mt-2 p-3 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-indigo-200 text-indigo-700 flex items-center justify-center text-xs font-bold">1</span>
                                <span className="font-bold text-indigo-900">{stages[0].name}</span>
                            </div>
                            <p className="mt-2 text-sm">Upload files using the button below, or type "Skip" if no documents are available for this stage.</p>
                        </div>
                    ));
                }
            } else {
                const newStage: StageDraft = {
                    id: stages.length + 1,
                    name: text,
                    files: [],
                    raci: ''
                };
                setStages(prev => [...prev, newStage]);
                addMessage('system', (
                    <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-emerald-500" />
                        <span>Added stage: <strong>{text}</strong></span>
                    </div>
                ));
            }
        } else if (currentStep === 'DOCUMENTS') {
            if (text.toLowerCase() === 'skip' || text.toLowerCase() === 'next') {
                moveToNextStageDoc();
            } else {
                addMessage('system', "Please use the upload button for files, or type 'Skip' to move to the next stage.");
            }
        }
        setIsTyping(false);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);
            setStages(prev => prev.map((s, i) => {
                if (i === currentStageIndex) {
                    return { ...s, files: [...s.files, ...newFiles] };
                }
                return s;
            }));
            
            addMessage('user', `Uploaded ${newFiles.length} file(s)`);
            addMessage('system', (
                <div>
                    <div className="flex flex-col gap-1 mt-1 mb-2">
                        {newFiles.map((f, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                                <FileText size={12} /> {f.name}
                            </div>
                        ))}
                    </div>
                    <p>Files received. You can upload more, or click "Next Stage" / Type "Next" to proceed.</p>
                </div>
            ));
        }
    };

    const moveToNextStageDoc = () => {
        const nextIndex = currentStageIndex + 1;
        if (nextIndex < stages.length) {
            setCurrentStageIndex(nextIndex);
            const nextStage = stages[nextIndex];
            addMessage('system', (
                <div>
                    <p>Moving to next stage:</p>
                    <div className="mt-2 p-3 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-indigo-200 text-indigo-700 flex items-center justify-center text-xs font-bold">{nextIndex + 1}</span>
                        <span className="font-bold text-indigo-900">{nextStage.name}</span>
                    </div>
                </div>
            ));
        } else {
            setCurrentStep('GENERATING');
            startGeneration();
        }
    };

    const startGeneration = async () => {
        addMessage('system', "All inputs received. Initializing Process Generation...");
        setIsGenerating(true);
        setLogs(["Initializing..."]);
        
        try {
            const response = await apiService.generateTableFromBuilder({
                productName: processName,
                stages: stages,
                onLog: (msg, prog) => {
                    setLogs(prev => [...prev, msg]);
                    setProgress(prog);
                }
            });

            setBuilderResult(response);
            setTableData(response.definition);
            setCurrentStep('REVIEW');
            addMessage('system', "Process generated successfully! Please review the table below.");
        } catch (e: any) {
            addMessage('system', `Error: ${e.message || "Generation failed"}`);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleTableChange = (id: string, field: keyof ProcessDefinitionRow, value: string) => {
        setTableData(prev => prev.map(row => row.id === id ? { ...row, [field]: value } : row));
    };

    const handleRegenerate = async () => {
        if (!builderResult) return;
        setIsGenerating(true);
        try {
            const newSop = await apiService.updateProcessFlowFromTable(
                processName, 
                tableData, 
                undefined, // originalSop
                builderResult.objectives,
                builderResult.risks,
                builderResult.processId
            );
            setSopResult(newSop);
            if (onFlowGenerated) onFlowGenerated(newSop, "Generated from Builder");
        } catch (e) {
            console.error(e);
            alert("Failed to regenerate flow.");
        } finally {
            setIsGenerating(false);
        }
    };

    // --- RENDER ---

    if (currentStep === 'INTRO') {
        return (
            <div className="flex h-full w-full bg-slate-50 relative items-center justify-center p-6">
                 <button 
                    onClick={onBack}
                    className="absolute top-6 left-6 flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors"
                >
                    <ArrowLeft size={20} /> Back
                </button>
                <div className="max-w-md w-full text-center space-y-6">
                    <div className="w-20 h-20 bg-blue-600 rounded-3xl mx-auto flex items-center justify-center shadow-xl shadow-blue-200 rotate-3">
                        <FileSpreadsheet className="text-white w-10 h-10" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold text-slate-900">Process Builder</h1>
                        <p className="text-slate-500">Conversational wizard to generate detailed SOPs from your documents and structure.</p>
                    </div>
                    <button 
                        onClick={handleStartBuilding}
                        className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                    >
                        <Play size={20} fill="currentColor" />
                        Start Building
                    </button>
                </div>
            </div>
        );
    }

    if (currentStep === 'REVIEW' && builderResult) {
        return (
            <div className="flex flex-col h-full w-full bg-slate-50">
                 <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center shadow-sm">
                    <div className="flex items-center gap-3">
                        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg"><ArrowLeft size={20} /></button>
                        <div>
                            <h2 className="font-bold text-slate-800">{processName}</h2>
                            <p className="text-xs text-slate-500">Generated Process Definition</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                         <button 
                            onClick={handleRegenerate}
                            disabled={isGenerating}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50"
                        >
                            {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
                            Visualize Flow
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-6">
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                         <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="p-3 font-bold text-slate-600 border-r w-24">ID</th>
                                    <th className="p-3 font-bold text-slate-600 border-r w-32">Stage</th>
                                    <th className="p-3 font-bold text-slate-600 border-r w-48">Step Name</th>
                                    <th className="p-3 font-bold text-slate-600 border-r">Description</th>
                                    <th className="p-3 font-bold text-slate-600 border-r w-24">Actor</th>
                                    <th className="p-3 font-bold text-slate-600 border-r w-24">Type</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {tableData.map((row) => (
                                    <tr key={row.id} className="hover:bg-slate-50">
                                        <td className="p-2 border-r text-slate-500 font-mono">{row.id}</td>
                                        <td className="p-2 border-r text-slate-700">{row.l2Process}</td>
                                        <td className="p-2 border-r">
                                            <input 
                                                value={row.stepName}
                                                onChange={(e) => handleTableChange(row.id, 'stepName', e.target.value)}
                                                className="w-full bg-transparent border-none focus:ring-0 p-0 font-bold text-slate-800"
                                            />
                                        </td>
                                        <td className="p-2 border-r">
                                            <textarea 
                                                value={row.description}
                                                onChange={(e) => handleTableChange(row.id, 'description', e.target.value)}
                                                className="w-full bg-transparent border-none focus:ring-0 p-0 text-slate-600 resize-none h-auto"
                                                rows={2}
                                            />
                                        </td>
                                        <td className="p-2 border-r">
                                            <input 
                                                value={row.actor}
                                                onChange={(e) => handleTableChange(row.id, 'actor', e.target.value)}
                                                className="w-full bg-transparent border-none focus:ring-0 p-0 text-slate-700"
                                            />
                                        </td>
                                        <td className="p-2 border-r text-slate-500">{row.stepType}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-full w-full bg-white relative flex-col">
            {/* Header */}
            <div className="h-16 border-b border-slate-100 flex items-center justify-between px-6 bg-white shrink-0">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="text-slate-400 hover:text-slate-600"><ArrowLeft size={20} /></button>
                    <h2 className="font-bold text-slate-800">Process Builder</h2>
                    {processName && <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-500">{processName}</span>}
                </div>
                {/* Progress Indicator */}
                <div className="flex items-center gap-1">
                    {['NAME', 'STAGES', 'DOCUMENTS', 'GENERATING'].map((step, i) => {
                        const stepOrder = ['NAME', 'STAGES', 'DOCUMENTS', 'GENERATING', 'REVIEW'];
                        const currentIndex = stepOrder.indexOf(currentStep);
                        const myIndex = stepOrder.indexOf(step);
                        return (
                            <div key={step} className={`h-1.5 w-8 rounded-full transition-colors ${myIndex <= currentIndex ? 'bg-blue-600' : 'bg-slate-100'}`} />
                        );
                    })}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
                <div className="max-w-3xl mx-auto space-y-6">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-in slide-in-from-bottom-2`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${msg.role === 'user' ? 'bg-slate-800 text-white border-slate-700' : 'bg-white text-blue-600 border-slate-200'}`}>
                                {msg.role === 'user' ? <User size={14} /> : <Bot size={16} />}
                            </div>
                            <div className={`px-5 py-3.5 rounded-2xl shadow-sm text-sm leading-relaxed max-w-[85%] ${
                                msg.role === 'user' 
                                ? 'bg-blue-600 text-white rounded-tr-none' 
                                : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'
                            }`}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    
                    {isTyping && (
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center"><Bot size={16} className="text-blue-600" /></div>
                            <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    )}
                    
                    {/* Logs during generation */}
                    {isGenerating && (
                         <div className="max-w-lg mx-auto bg-slate-900 rounded-xl p-4 text-xs font-mono text-green-400 shadow-xl border border-slate-800">
                            <div className="flex justify-between items-center mb-2 border-b border-slate-800 pb-2">
                                <span className="text-slate-400 font-bold">SYSTEM LOGS</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="space-y-1 h-32 overflow-y-auto">
                                {logs.map((log, i) => (
                                    <div key={i}>&gt; {log}</div>
                                ))}
                                <div className="animate-pulse">&gt; _</div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            {currentStep !== 'GENERATING' && (
                <div className="p-4 bg-white border-t border-slate-200">
                    <div className="max-w-3xl mx-auto flex items-center gap-2">
                        {currentStep === 'DOCUMENTS' && (
                            <>
                                <input type="file" ref={fileInputRef} onChange={handleFileUpload} multiple className="hidden" />
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-3 rounded-xl bg-slate-100 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                    title="Upload Files"
                                >
                                    <Upload size={20} />
                                </button>
                            </>
                        )}
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleInputSend()}
                            placeholder={currentStep === 'DOCUMENTS' ? "Type 'Next' to finish stage..." : "Type your response..."}
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all text-sm"
                            autoFocus
                        />
                        <button 
                            onClick={handleInputSend}
                            disabled={!inputValue.trim()}
                            className="p-3 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 disabled:opacity-50 transition-all"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                    {currentStep === 'DOCUMENTS' && (
                        <div className="max-w-3xl mx-auto mt-2 flex justify-end">
                            <button 
                                onClick={moveToNextStageDoc}
                                className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                            >
                                Skip / Next Stage <ArrowLeft className="rotate-180" size={12} />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProcessBuilderPage;