import React, { useState, useEffect } from 'react';
import { 
    X, Shield, AlertOctagon, Activity, ArrowRight, 
    CheckCircle2, Split, Target, BarChart3, Map,
    ChevronDown, ChevronUp
} from 'lucide-react';
import { ProcessStep, SopResponse } from '../types';

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

  // Reset expanded state when the step changes
  useEffect(() => {
    setIsControlsOpen(true);
    setIsRisksOpen(true);
  }, [step?.stepId]);

  // View: Process Overview (When no step selected)
  if (!step) {
      return (
        <div className="flex flex-col h-full bg-white">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider rounded">SOP Overview</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 leading-snug">{processData.processDefinition.title}</h2>
                <p className="text-xs text-slate-500 mt-2">v{processData.processDefinition.version} • {processData.processDefinition.classification}</p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                
                {/* Objectives */}
                <section>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                        <Target size={14} /> Process Objectives
                    </h3>
                    <div className="space-y-3">
                        {processData.processObjectives.map(obj => (
                            <div key={obj.id} className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-lg">
                                <p className="text-sm text-slate-700 font-medium">{obj.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Metrics */}
                {processData.metricsAndMeasures && (
                    <section>
                         <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                            <BarChart3 size={14} /> Key Metrics
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            {processData.metricsAndMeasures.slice(0, 4).map((m: any, i: number) => (
                                <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
                                    <p className="text-[10px] text-slate-500 uppercase truncate">{m.type}</p>
                                    <p className="text-lg font-bold text-blue-600 mt-1">{m.target}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Risks Summary */}
                <section>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                        <AlertOctagon size={14} /> Inherent Risks ({processData.inherentRisks.length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {processData.inherentRisks.slice(0, 6).map(r => (
                            <span key={r.riskId} className="px-2 py-1 text-xs bg-rose-50 text-rose-700 border border-rose-100 rounded">
                                {r.riskType}
                            </span>
                        ))}
                    </div>
                </section>

                 <div className="pt-4">
                    <button 
                        onClick={() => onNextStep(processData.startNode.stepId)}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
                    >
                        <Map size={18} /> Start Guide
                    </button>
                </div>
            </div>
        </div>
      );
  }

  // View: Step Details
  return (
    <div className="flex flex-col h-full bg-white">
      
      {/* Header */}
      <div className="p-5 border-b border-slate-100 bg-white flex justify-between items-start">
         <div>
            <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border ${
                    step.stepType === 'Decision' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                    step.stepType === 'Control' ? 'bg-sky-50 text-sky-600 border-sky-100' :
                    'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                    {step.stepType}
                </span>
                <span className="text-xs text-slate-400 font-mono">ID: {step.stepId}</span>
            </div>
            <h3 className="font-bold text-slate-900 text-xl leading-tight">{step.stepName}</h3>
         </div>
         <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
         </button>
      </div>

      {/* Scrollable Content */}
      <div className="p-6 overflow-y-auto space-y-8 flex-1">
        
        {/* Description */}
        <div>
             <p className="text-sm text-slate-700 leading-relaxed p-4 bg-slate-50 rounded-xl border border-slate-100">
                {step.description}
             </p>
        </div>

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

        {/* Risk & Control Grid - Collapsible */}
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
                                                 <span className="text-[9px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded font-mono">{riskId}</span>
                                            </div>
                                            <p className="text-xs text-rose-700/80 leading-tight">{risk?.description || 'Description not available'}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Actor Info */}
             <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 shadow-sm">
                    <Activity size={20} />
                </div>
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Responsible Actor</p>
                    <p className="text-sm font-bold text-slate-800">{step.actor}</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default FlowDetails;