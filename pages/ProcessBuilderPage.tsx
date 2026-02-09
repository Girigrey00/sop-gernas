
import React, { useState, useRef } from 'react';
import { 
    ChevronRight, ChevronLeft, Upload, Plus, Trash2, 
    FileText, Save, Loader2, PlayCircle, CheckCircle2, RotateCcw
} from 'lucide-react';
import { apiService } from '../services/apiService';
import { ProcessDefinitionRow, SopResponse } from '../types';

interface ProcessBuilderPageProps {
    onBack: () => void;
    onFlowGenerated: (data: SopResponse) => void;
}

interface StageInput {
    id: number;
    name: string;
    file: File | null;
}

const ProcessBuilderPage: React.FC<ProcessBuilderPageProps> = ({ onBack, onFlowGenerated }) => {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    
    // Form State
    const [productName, setProductName] = useState('');
    const [startTrigger, setStartTrigger] = useState('');
    const [endTrigger, setEndTrigger] = useState('');
    const [stages, setStages] = useState<StageInput[]>([{ id: 1, name: '', file: null }]);
    
    // Generated Table State
    const [tableData, setTableData] = useState<ProcessDefinitionRow[]>([]);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [activeFileStageId, setActiveFileStageId] = useState<number | null>(null);

    const handleStageAdd = () => {
        setStages(prev => [...prev, { id: Date.now(), name: '', file: null }]);
    };

    const handleStageRemove = (id: number) => {
        if(stages.length > 1) {
            setStages(prev => prev.filter(s => s.id !== id));
        }
    };

    const handleStageNameChange = (id: number, val: string) => {
        setStages(prev => prev.map(s => s.id === id ? { ...s, name: val } : s));
    };

    const triggerFileUpload = (id: number) => {
        setActiveFileStageId(id);
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && activeFileStageId !== null) {
            const file = e.target.files[0];
            setStages(prev => prev.map(s => s.id === activeFileStageId ? { ...s, file } : s));
        }
        // Reset input
        if(fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleGenerateTable = async () => {
        if (!productName || !startTrigger || !endTrigger || stages.some(s => !s.name)) return;
        setIsLoading(true);
        try {
            // Mock API call to generate initial structure
            const data = await apiService.generateTableFromBuilder({
                productName,
                startTrigger,
                endTrigger,
                stages: stages.map(s => ({ name: s.name }))
            });
            setTableData(data);
            setStep(5); // Move to Table View
        } catch (e) {
            console.error("Failed to generate table", e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTableChange = (id: string, field: keyof ProcessDefinitionRow, value: string) => {
        setTableData(prev => prev.map(row => row.id === id ? { ...row, [field]: value } : row));
    };

    const handleFinalGenerate = async () => {
        setIsLoading(true);
        try {
            // Create a base SOP structure to hydrate
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
            console.error("Failed to generate final flow", e);
        } finally {
            setIsLoading(false);
        }
    };

    // --- Render Logic ---

    const renderStepContent = () => {
        switch(step) {
            case 1:
                return (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="text-center mb-6">
                            <h3 className="text-xl font-bold text-fab-navy">Product / Policy Name</h3>
                            <p className="text-sm text-slate-500">What is the name of the process you want to build?</p>
                        </div>
                        <input 
                            type="text" 
                            className="w-full p-4 text-lg border border-slate-200 rounded-xl focus:ring-2 focus:ring-fab-royal/20 outline-none text-center font-medium"
                            placeholder="e.g. Credit Card Issuance"
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            autoFocus
                        />
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="text-center mb-6">
                            <h3 className="text-xl font-bold text-fab-navy">Start Trigger</h3>
                            <p className="text-sm text-slate-500">What initiates this process?</p>
                        </div>
                        <textarea 
                            className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-fab-royal/20 outline-none h-32 resize-none text-center"
                            placeholder="e.g. Customer submits application via Mobile App"
                            value={startTrigger}
                            onChange={(e) => setStartTrigger(e.target.value)}
                            autoFocus
                        />
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="text-center mb-6">
                            <h3 className="text-xl font-bold text-fab-navy">End Trigger / Outcome</h3>
                            <p className="text-sm text-slate-500">What marks the successful completion?</p>
                        </div>
                        <textarea 
                            className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-fab-royal/20 outline-none h-32 resize-none text-center"
                            placeholder="e.g. Card delivered and activated by customer"
                            value={endTrigger}
                            onChange={(e) => setEndTrigger(e.target.value)}
                            autoFocus
                        />
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300 h-full flex flex-col">
                        <div className="text-center mb-4 shrink-0">
                            <h3 className="text-xl font-bold text-fab-navy">L2 Process Stages</h3>
                            <p className="text-sm text-slate-500">Define the high-level stages. You can upload reference docs for each.</p>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto space-y-3 px-1 custom-scrollbar max-h-[400px]">
                            {stages.map((stage, idx) => (
                                <div key={stage.id} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl shadow-sm group hover:border-fab-royal/30 transition-all">
                                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold shrink-0">
                                        {idx + 1}
                                    </span>
                                    <input 
                                        type="text" 
                                        className="flex-1 bg-transparent outline-none text-sm font-medium"
                                        placeholder={`Stage ${idx + 1} Name`}
                                        value={stage.name}
                                        onChange={(e) => handleStageNameChange(stage.id, e.target.value)}
                                    />
                                    <div className="flex items-center gap-2">
                                        {stage.file && (
                                            <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded truncate max-w-[100px]" title={stage.file.name}>
                                                {stage.file.name}
                                            </span>
                                        )}
                                        <button 
                                            onClick={() => triggerFileUpload(stage.id)}
                                            className="p-2 text-slate-400 hover:text-fab-royal hover:bg-fab-royal/5 rounded-lg transition-colors"
                                            title="Upload Reference Doc"
                                        >
                                            <Upload size={16} />
                                        </button>
                                        <button 
                                            onClick={() => handleStageRemove(stage.id)}
                                            className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                            disabled={stages.length === 1}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <button 
                                onClick={handleStageAdd}
                                className="w-full py-3 border-2 border-dashed border-slate-200 text-slate-400 hover:border-fab-royal/40 hover:text-fab-royal hover:bg-fab-royal/5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                            >
                                <Plus size={16} /> Add Stage
                            </button>
                        </div>
                        {/* Hidden File Input */}
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            onChange={handleFileChange}
                            accept=".pdf,.docx,.txt" 
                        />
                    </div>
                );
            default:
                return null;
        }
    };

    if (step === 5) {
        // Table View
        return (
            <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">
                <div className="px-8 py-6 bg-white border-b border-slate-200 flex justify-between items-center shadow-sm z-10">
                    <div>
                        <h2 className="text-xl font-bold text-fab-navy flex items-center gap-2">
                            <FileText size={20} className="text-fab-royal" />
                            Review Process Definitions
                        </h2>
                        <p className="text-sm text-slate-500">Edit the generated steps before creating the visual flow.</p>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setStep(4)}
                            className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg font-bold text-sm transition-colors"
                        >
                            Back to Stages
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

    // Wizard Layout
    return (
        <div className="h-full w-full bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-fab-royal/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-blue-100/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="absolute top-6 left-6">
                <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-fab-royal font-bold text-sm transition-colors">
                    <ChevronLeft size={18} /> Back
                </button>
            </div>

            <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-8 border border-slate-100 relative flex flex-col min-h-[500px]">
                {/* Progress Bar */}
                <div className="flex gap-2 mb-8">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-fab-royal' : 'bg-slate-100'}`}></div>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col">
                    {renderStepContent()}
                </div>

                {/* Footer Controls */}
                <div className="flex justify-between mt-8 pt-6 border-t border-slate-100">
                    <button 
                        onClick={() => setStep(prev => prev - 1)}
                        disabled={step === 1}
                        className="px-6 py-2.5 text-slate-500 font-bold text-sm hover:bg-slate-50 rounded-xl transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                        Back
                    </button>
                    
                    <button 
                        onClick={() => {
                            if (step < 4) setStep(prev => prev + 1);
                            else handleGenerateTable();
                        }}
                        disabled={
                            (step === 1 && !productName) || 
                            (step === 2 && !startTrigger) || 
                            (step === 3 && !endTrigger) ||
                            (step === 4 && (stages.length === 0 || !stages[0].name)) ||
                            isLoading
                        }
                        className="px-8 py-2.5 bg-fab-royal text-white font-bold text-sm rounded-xl shadow-lg shadow-fab-royal/20 hover:bg-fab-blue transition-all disabled:opacity-50 disabled:shadow-none flex items-center gap-2"
                    >
                        {isLoading && <Loader2 size={16} className="animate-spin" />}
                        {step === 4 ? 'Review Table' : 'Next'}
                        {!isLoading && step < 4 && <ChevronRight size={16} />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProcessBuilderPage;
