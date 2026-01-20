
import React, { useState, useEffect } from 'react';
import { 
    X, Shield, AlertOctagon, Activity, ArrowRight, 
    CheckCircle2, Split, Target, BarChart3, Map,
    ChevronDown, ChevronUp, Book, ScrollText, Compass,
    Download, FileText, User, Play, Layout, FileType,
    Layers, ArrowRightCircle, ListChecks, FileInput, FileOutput, CheckCircle,
    Clock, Users, Timer, AlertTriangle
} from 'lucide-react';
import { ProcessStep, SopResponse, ProcessStage } from '../types';
import { getActorTheme } from '../utils/layoutUtils';

interface FlowDetailsProps {
  step: ProcessStep | null;
  stage?: ProcessStage | null; // Added stage prop
  processData: SopResponse;
  onClose: () => void;
  onNextStep: (stepId: string) => void;
}

const FlowDetails: React.FC<FlowDetailsProps> = ({ step, stage, processData, onClose, onNextStep }) => {
  
  // State for collapsible sections
  const [isControlsOpen, setIsControlsOpen] = useState(true);
  const [isRisksOpen, setIsRisksOpen] = useState(true);
  const [isPoliciesOpen, setIsPoliciesOpen] = useState(true);
  
  // State for download options
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);

  // Reset expanded state when the step/stage changes
  useEffect(() => {
    setIsControlsOpen(true);
    setIsRisksOpen(true);
    setIsPoliciesOpen(true);
  }, [step?.stepId, stage?.stageId]);

  // Get dynamic actor theme if step exists
  const actorTheme = step ? getActorTheme(step.actor) : null;

  const handleDownload = (type: 'json' | 'pdf' | 'docx') => {
      // Mock download functionality
      const element = document.createElement("a");
      let content = "";
      let filename = "";
      
      if (type === 'json') {
          content = JSON.stringify(processData, null, 2);
          filename = `${processData.processDefinition.title.replace(/\s+/g, '_')}.json`;
      } else {
          content = "Dummy content for download demo.";
          filename = `${processData.processDefinition.title.replace(/\s+/g, '_')}.${type}`;
      }
      
      const file = new Blob([content], {type: type === 'json' ? 'application/json' : 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = filename;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      
      setShowDownloadOptions(false);
  };

  // Helper title
  const getViewTitle = () => {
      if (step) return 'Step Details';
      if (stage) return 'Stage Summary';
      return 'Process Overview';
  }

  // Combined Policies and Standards
  const combinedPolicies = [
      ...(step?.policies || []),
      ...(step?.standards || [])
  ];

  return (
    <div className="flex flex-col h-full bg-white relative">
        
        {/* Branded Header */}
        <div className="p-4 border-b border-slate-100 bg-white flex justify-between items-center shadow-sm z-20 h-16 shrink-0">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-fab-navy to-fab-royal flex items-center justify-center text-white shadow-md">
                    <Compass className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-900 text-sm">Process Guide</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                        <p className="text-[10px] text-slate-500 font-medium">{getViewTitle()}</p>
                    </div>
                </div>
            </div>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-colors">
                <X size={20} />
            </button>
        </div>

        {/* View 1: Step Details (Highest Priority) */}
        {step ? (
            <div className="flex-1 overflow-y-auto">
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
                    
                    {/* Metadata Tags Row (New) */}
                    <div className="flex flex-wrap gap-2">
                        {/* Responsible Actor Badge */}
                        {actorTheme && (
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full shadow-sm">
                                <div 
                                    className="w-3 h-3 rounded-full shadow-sm ring-2 ring-white" 
                                    style={{ backgroundColor: actorTheme.left }}
                                ></div>
                                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                                    {step.actor}
                                </span>
                            </div>
                        )}

                        {/* Processing Time Badge */}
                        {step.processingTime && (
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full shadow-sm" title="Estimated Processing Time">
                                <Timer size={13} className="text-slate-400" />
                                <span className="text-xs font-bold text-slate-600">
                                    {isNaN(Number(step.processingTime)) ? step.processingTime : `${step.processingTime}s`}
                                </span>
                            </div>
                        )}

                        {/* RACI Teams Badge */}
                        {step.raciTeams && (
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full shadow-sm" title="RACI / Teams">
                                <Users size={13} className="text-slate-400" />
                                <span className="text-xs font-medium text-slate-600 truncate max-w-[180px]">
                                    {step.raciTeams}
                                </span>
                            </div>
                        )}

                        {/* SLA Badge */}
                        {step.sla && (
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full shadow-sm" title="Service Level Agreement">
                                <Clock size={13} className="text-amber-500" />
                                <span className="text-xs font-bold text-amber-700">
                                    SLA: {step.sla}
                                </span>
                            </div>
                        )}

                        {/* KPI Badge */}
                        {step.kpi && (
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-full shadow-sm" title="Key Performance Indicator">
                                <Target size={13} className="text-indigo-500" />
                                <span className="text-xs font-bold text-indigo-700">
                                    KPI: {step.kpi}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="p-6 space-y-8">
                    
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

                    {/* Policies & Standards Section */}
                    {combinedPolicies.length > 0 && (
                        <div className="border border-slate-200 rounded-xl overflow-hidden">
                            <button onClick={() => setIsPoliciesOpen(!isPoliciesOpen)} className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"><div className="flex items-center gap-2"><Book size={16} className="text-slate-500" /><span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Policies & Standards</span><span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-[10px] rounded-full font-bold">{combinedPolicies.length}</span></div>{isPoliciesOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}</button>
                            {isPoliciesOpen && (<div className="p-4 bg-white border-t border-slate-100 space-y-2">{combinedPolicies.map((item, idx) => (<div key={idx} className="flex items-start gap-2.5"><ScrollText size={14} className="text-blue-400 mt-0.5 shrink-0" /><span className="text-sm text-slate-700 font-medium">{item}</span></div>))}</div>)}
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-6">
                        {step.controls && step.controls.length > 0 && (
                            <div className="border border-slate-200 rounded-xl overflow-hidden">
                                <button onClick={() => setIsControlsOpen(!isControlsOpen)} className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"><div className="flex items-center gap-2"><Shield size={16} className="text-slate-500" /><span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Required Controls</span><span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-[10px] rounded-full font-bold">{step.controls.length}</span></div>{isControlsOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}</button>
                                {isControlsOpen && (<div className="p-4 bg-white border-t border-slate-100 space-y-3">{step.controls.map(ctrl => (<div key={ctrl.controlId} className="bg-white border border-slate-100 p-3 rounded-lg shadow-sm relative overflow-hidden"><div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div><div className="flex justify-between items-start mb-1 pl-2"><span className="text-[10px] font-bold text-slate-400">{ctrl.controlId}</span><span className="text-[9px] uppercase text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">{ctrl.type}</span></div><p className="text-sm text-slate-800 font-medium pl-2">{ctrl.name}</p><p className="text-xs text-slate-500 mt-1 pl-2 leading-relaxed">{ctrl.description}</p></div>))}</div>)}
                            </div>
                        )}
                        {step.risksMitigated && step.risksMitigated.length > 0 && (
                            <div className="border border-slate-200 rounded-xl overflow-hidden">
                                <button onClick={() => setIsRisksOpen(!isRisksOpen)} className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"><div className="flex items-center gap-2"><AlertOctagon size={16} className="text-slate-500" /><span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Risks Mitigated</span><span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-[10px] rounded-full font-bold">{step.risksMitigated.length}</span></div>{isRisksOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}</button>
                                {isRisksOpen && (<div className="p-4 bg-white border-t border-slate-100 space-y-2">{step.risksMitigated.map(riskId => { const risk = processData.inherentRisks.find(r => r.riskId === riskId); return (<div key={riskId} className="p-3 bg-rose-50/50 border border-rose-100 rounded-lg flex gap-3 items-start"><div className="mt-0.5 text-rose-500"><AlertOctagon size={14} /></div><div className="flex-1"><div className="flex justify-between items-center mb-1"><p className="text-xs font-bold text-rose-800">{risk?.riskType || 'Uncategorized Risk'}</p><span className="text-[9px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded border border-rose-200 font-bold">{riskId}</span></div><p className="text-xs text-rose-700 leading-relaxed">{risk?.description || 'No description available.'}</p></div></div>)})}</div>)}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        ) : stage ? (
            /* --- View 2: Stage Details (New) --- */
            <div className="flex-1 overflow-y-auto">
                
                {/* Stage Header */}
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded border bg-blue-100 text-blue-700 border-blue-200 text-[10px] font-bold uppercase tracking-wider">Stage {stage.stageId}</span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 leading-tight mb-2">{stage.stageName}</h2>
                    {stage.summary && (
                        <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-lg border border-slate-200 shadow-sm mt-3 italic">
                            "{stage.summary}"
                        </p>
                    )}
                </div>

                <div className="p-6 space-y-8">
                    
                    {/* Data Flow (Inputs -> Outputs) */}
                    {(stage.inputs?.length || stage.outputs?.length) && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                    <FileInput size={12} /> Data Inputs
                                </h4>
                                {stage.inputs && stage.inputs.length > 0 ? (
                                    stage.inputs.map((inp, i) => (
                                        <div key={i} className="bg-slate-50 border border-slate-200 p-2 rounded text-xs font-medium text-slate-700 shadow-sm">{inp}</div>
                                    ))
                                ) : <p className="text-xs text-slate-400 italic">None</p>}
                            </div>
                            
                            <div className="space-y-2">
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                    <FileOutput size={12} /> Data Outputs
                                </h4>
                                {stage.outputs && stage.outputs.length > 0 ? (
                                    stage.outputs.map((out, i) => (
                                        <div key={i} className="bg-violet-50 border border-violet-100 p-2 rounded text-xs font-medium text-violet-800 shadow-sm">{out}</div>
                                    ))
                                ) : <p className="text-xs text-slate-400 italic">None</p>}
                            </div>
                        </div>
                    )}

                    {/* Key Activities */}
                    {stage.keyActivities && stage.keyActivities.length > 0 && (
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                                <ListChecks size={16} className="text-blue-500" /> Key Activities
                            </h4>
                            <div className="space-y-2">
                                {stage.keyActivities.map((act, i) => (
                                    <div key={i} className="flex gap-3 items-start">
                                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0"></div>
                                        <p className="text-sm text-slate-700 leading-relaxed">{act}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Key Risks & Controls Side-by-Side (Mobile stack) */}
                    <div className="grid grid-cols-1 gap-6">
                        
                        {/* Risks */}
                        {stage.keyRisks && stage.keyRisks.length > 0 && (
                            <div className="bg-rose-50/30 border border-rose-100 rounded-xl p-4">
                                <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-2 mb-3">
                                    <AlertOctagon size={14} /> Key Risks
                                </h4>
                                <ul className="space-y-2">
                                    {stage.keyRisks.map((risk, i) => (
                                        <li key={i} className="flex items-start gap-2 text-xs text-rose-800 font-medium">
                                            <span className="mt-1 w-1 h-1 rounded-full bg-rose-400 shrink-0"></span>
                                            {risk}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Controls */}
                        {stage.keyControls && stage.keyControls.length > 0 && (
                            <div className="bg-emerald-50/30 border border-emerald-100 rounded-xl p-4">
                                <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-2 mb-3">
                                    <Shield size={14} /> Key Controls
                                </h4>
                                <ul className="space-y-2">
                                    {stage.keyControls.map((ctrl, i) => (
                                        <li key={i} className="flex items-start gap-2 text-xs text-emerald-800 font-medium">
                                            <span className="mt-1 w-1 h-1 rounded-full bg-emerald-400 shrink-0"></span>
                                            {ctrl}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Navigation to first step */}
                    {stage.steps && stage.steps.length > 0 && (
                        <div className="pt-4 border-t border-slate-100">
                            <button 
                                onClick={() => onNextStep(stage.steps[0].stepId)}
                                className="w-full py-3 bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-600 rounded-xl font-bold text-sm text-slate-600 shadow-sm transition-all flex items-center justify-center gap-2"
                            >
                                <Play size={14} /> View First Step ({stage.steps[0].stepName})
                            </button>
                        </div>
                    )}
                </div>
            </div>
        ) : (
            /* --- View 3: Process Overview (Existing) --- */
            <>
                <div className="flex-1 overflow-y-auto">
                    {/* Process Definition Header */}
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                        <h2 className="text-xl font-bold text-slate-900 leading-tight mb-2">{processData.processDefinition.title}</h2>
                        <a href={processData.processDefinition.documentLink} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                            <FileText size={12} /> View Source Document
                        </a>
                        {processData.processFlow?.stages && (
                            <div className="mt-4 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                                {processData.processFlow.stages.map((s) => (
                                    <div key={s.stageId} className="shrink-0 px-2 py-1 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-600 shadow-sm whitespace-nowrap">
                                        Stage {s.stageId}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-6 space-y-8">
                        {/* Objectives */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <Target size={14} /> Process Objectives
                            </h4>
                            <div className="space-y-2">
                                {processData.processObjectives.length > 0 ? (
                                    processData.processObjectives.map((obj, i) => (
                                        <div key={i} className="flex gap-3 items-start p-3 bg-white border border-slate-100 rounded-lg shadow-sm">
                                            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></div>
                                            <p className="text-sm text-slate-700 leading-relaxed">{obj.description}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-slate-400 italic">No specific objectives defined.</p>
                                )}
                            </div>
                        </div>

                        {/* Inherent Risks Summary */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <AlertOctagon size={14} /> Inherent Risks
                            </h4>
                            <div className="grid grid-cols-1 gap-2">
                                {processData.inherentRisks.slice(0, 5).map(risk => (
                                    <div key={risk.riskId} className="flex items-center gap-2 p-2 bg-rose-50 border border-rose-100 rounded text-xs text-rose-800">
                                        <span className="font-bold">{risk.riskId}:</span>
                                        <span className="truncate">{risk.riskType}</span>
                                    </div>
                                ))}
                                {processData.inherentRisks.length > 5 && (
                                    <p className="text-xs text-slate-400 text-center italic">+ {processData.inherentRisks.length - 5} more risks</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sticky Footer */}
                <div className="p-4 border-t border-slate-200 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20 space-y-3 shrink-0">
                    <button 
                        onClick={() => onNextStep(processData.startNode.stepId)}
                        className="w-full py-3 bg-fab-royal text-white rounded-xl font-bold shadow-lg shadow-fab-royal/20 hover:bg-fab-blue hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                    >
                        <Play size={18} fill="currentColor" /> Start Guide
                    </button>

                    <div className="relative">
                        <button 
                            onClick={() => setShowDownloadOptions(!showDownloadOptions)}
                            className="w-full py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:border-fab-royal hover:text-fab-royal hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                        >
                            <Download size={18} /> Download Documentation
                            {showDownloadOptions ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                        
                        {/* Download Options Dropdown */}
                        {showDownloadOptions && (
                            <div className="absolute bottom-full left-0 w-full mb-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in slide-in-from-bottom-2 fade-in">
                                <button onClick={() => handleDownload('pdf')} className="w-full text-left px-4 py-3 hover:bg-slate-50 text-slate-700 text-sm font-medium flex items-center gap-3 border-b border-slate-100">
                                    <FileType size={16} className="text-rose-500" /> Process Definition (PDF)
                                </button>
                                <button onClick={() => handleDownload('docx')} className="w-full text-left px-4 py-3 hover:bg-slate-50 text-slate-700 text-sm font-medium flex items-center gap-3">
                                    <FileText size={16} className="text-blue-500" /> Standard Operating Procedure (DOCX)
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </>
        )}
    </div>
  );
};

export default FlowDetails;
