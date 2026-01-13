
import React, { useState, useEffect } from 'react';
import { 
    X, Shield, AlertOctagon, Activity, ArrowRight, 
    CheckCircle2, Split, Target, BarChart3, Map,
    ChevronDown, ChevronUp, Book, ScrollText, Compass,
    Download, FileText, User
} from 'lucide-react';
import { ProcessStep, SopResponse } from '../types';
import { getActorTheme } from '../utils/layoutUtils';

interface FlowDetailsProps {
  step: ProcessStep | null;
  processData: SopResponse;
  onClose: () => void;
  onNextStep: (stepId: string) => void;
}

const FlowDetails: React.FC<FlowDetailsProps> = ({ step, processData, onClose, onNextStep }) => {
  
  // State for collapsible sections
  const [isControlsOpen, setIsControlsOpen] = useState(true);
  const [isRisksOpen, setIsRisksOpen] = useState(true);
  const [isPoliciesOpen, setIsPoliciesOpen] = useState(true);

  // Reset expanded state when the step changes
  useEffect(() => {
    setIsControlsOpen(true);
    setIsRisksOpen(true);
    setIsPoliciesOpen(true);
  }, [step?.stepId]);

  // Get dynamic actor theme if step exists
  const actorTheme = step ? getActorTheme(step.actor) : null;

  return (
    <div className="flex flex-col h-full bg-white relative">
        
        {/* Branded Header - Consistent with ChatAssistant */}
        <div className="p-4 border-b border-slate-100 bg-white flex justify-between items-center shadow-sm z-20 h-16 shrink-0">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-fab-navy to-fab-royal flex items-center justify-center text-white shadow-md">
                    <Compass className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-900 text-sm">Process Guide</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                        <p className="text-[10px] text-slate-500 font-medium">Standard Operating Procedure</p>
                    </div>
                </div>
            </div>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-colors">
                <X size={20} />
            </button>
        </div>

        {/* View: Step Details */}
        {step ? (
            <>
                {/* Step Sub-Header */}
                <div className="p-5 border-b border-slate-100 bg-white">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border ${
                                step.stepType === 'Decision' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                step.stepType === 'Control' ? 'bg-sky-50 text-sky-600 border-sky-100' :
                                'bg-slate-100 text-slate-600 border-slate-200'
                            }`}>
                                {step.stepType}
                            </span>
                            <span className="text-xs text-slate-400 font-mono">ID: {step.stepId}</span>
                        </div>
                    </div>
                    
                    <h3 className="font-bold text-slate-900 text-xl leading-tight mb-3">{step.stepName}</h3>
                    
                    {/* Responsible Actor Badge with Dynamic Color Circle */}
                    {actorTheme && (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full">
                            <div 
                                className="w-3 h-3 rounded-full shadow-sm ring-2 ring-white" 
                                style={{ backgroundColor: actorTheme.left }}
                            ></div>
                            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                                {step.actor}
                            </span>
                        </div>
                    )}
                </div>

                {/* Scrollable Content */}
                <div className="p-6 overflow-y-auto space-y-8 flex-1">
                    
                    {/* Actions / Navigation */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                            {step.decisionBranches && step.decisionBranches.length > 0 ? (
                                <><Split size={14} className="text-orange-500" /> Decision Path</>
                            ) : (
                                <><CheckCircle2 size={14} className="text-emerald-500" /> Progression</>
                            )}
                        </h4>
                        
                        <div className="grid grid-cols-1 gap-2">
                            {step.decisionBranches && step.decisionBranches.length > 0 ? (
                                step.decisionBranches.map((branch, idx) => (
                                    <button 
                                        key={idx} 
                                        onClick={() => onNextStep(branch.nextStep)}
                                        className="group relative flex items-center justify-between p-4 rounded-xl border-2 border-orange-100 bg-white hover:bg-orange-50 hover:border-orange-300 transition-all text-left shadow-sm"
                                    >
                                        <span className="text-sm font-bold text-slate-700 group-hover:text-orange-800">{branch.condition}</span>
                                        <ArrowRight size={18} className="text-orange-300 group-hover:text-orange-600 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                ))
                            ) : step.nextStep ? (
                                <button 
                                    onClick={() => onNextStep(step.nextStep!)}
                                    className="group w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-blue-600 hover:bg-blue-700 shadow-md transition-all text-left"
                                >
                                    <span className="text-sm font-bold text-white">Proceed to next step</span>
                                    <ArrowRight size={18} className="text-white/70 group-hover:text-white group-hover:translate-x-1 transition-transform" />
                                </button>
                            ) : (
                                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-sm font-bold flex items-center gap-3 justify-center">
                                    <CheckCircle2 size={20} /> Process End
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="border-t border-slate-100"></div>

                    {/* Policies Section */}
                    {step.policies && step.policies.length > 0 && (
                        <div className="border border-slate-200 rounded-xl overflow-hidden">
                            <button 
                                onClick={() => setIsPoliciesOpen(!isPoliciesOpen)}
                                className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <Book size={16} className="text-slate-500" />
                                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Policies & Standards</span>
                                    <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-[10px] rounded-full font-bold">{step.policies.length}</span>
                                </div>
                                {isPoliciesOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                            </button>
                            
                            {isPoliciesOpen && (
                                <div className="p-4 bg-white border-t border-slate-100 space-y-2">
                                    {step.policies.map((policy, idx) => (
                                        <div key={idx} className="flex items-start gap-2.5">
                                            <ScrollText size={14} className="text-blue-400 mt-0.5 shrink-0" />
                                            <span className="text-sm text-slate-700 font-medium">{policy}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Risk & Control Grid */}
                    <div className="grid grid-cols-1 gap-6">
                        {/* Controls Section */}
                        {step.controls && step.controls.length > 0 && (
                            <div className="border border-slate-200 rounded-xl overflow-hidden">
                                <button 
                                    onClick={() => setIsControlsOpen(!isControlsOpen)}
                                    className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        <Shield size={16} className="text-slate-500" />
                                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Required Controls</span>
                                        <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-[10px] rounded-full font-bold">{step.controls.length}</span>
                                    </div>
                                    {isControlsOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                                </button>
                                
                                {isControlsOpen && (
                                    <div className="p-4 bg-white border-t border-slate-100 space-y-3">
                                        {step.controls.map(ctrl => (
                                            <div key={ctrl.controlId} className="bg-white border border-slate-100 p-3 rounded-lg shadow-sm relative overflow-hidden">
                                                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                                                <div className="flex justify-between items-start mb-1 pl-2">
                                                    <span className="text-[10px] font-bold text-slate-400">{ctrl.controlId}</span>
                                                    <span className="text-[9px] uppercase text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">{ctrl.type}</span>
                                                </div>
                                                <p className="text-sm text-slate-800 font-medium pl-2">{ctrl.name}</p>
                                                <p className="text-xs text-slate-500 mt-1 pl-2 leading-relaxed">{ctrl.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Risks Section */}
                        {step.risksMitigated && step.risksMitigated.length > 0 && (
                            <div className="border border-slate-200 rounded-xl overflow-hidden">
                                <button 
                                    onClick={() => setIsRisksOpen(!isRisksOpen)}
                                    className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        <AlertOctagon size={16} className="text-slate-500" />
                                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Risks Mitigated</span>
                                        <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-[10px] rounded-full font-bold">{step.risksMitigated.length}</span>
                                    </div>
                                    {isRisksOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                                </button>

                                {isRisksOpen && (
                                    <div className="p-4 bg-white border-t border-slate-100 space-y-2">
                                        {step.risksMitigated.map(riskId => {
                                            const risk = processData.inherentRisks.find(r => r.riskId === riskId);
                                            return (
                                                <div key={riskId} className="p-3 bg-rose-50/50 border border-rose-100 rounded-lg flex gap-3 items-start">
                                                    <div className="mt-0.5 text-rose-500"><AlertOctagon size={14} /></div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <p className="text-xs font-bold text-rose-800">{risk?.riskType || 'Uncategorized Risk'}</p>
                                                            <span className="text-[9px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded border border-rose-200 font-bold">{riskId}</span>
                                                        </div>
                                                        <p className="text-xs text-rose-700 leading-relaxed">{risk?.description || 'No description available.'}</p>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </>
        ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                <Target size={48} className="mb-4 opacity-20" />
                <p className="text-sm font-medium">Select a step from the flowchart to view detailed controls, risks, and policies.</p>
            </div>
        )}
    </div>
  );
};

export default FlowDetails;
