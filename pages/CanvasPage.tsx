
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactFlow, { 
    Background, 
    useNodesState, 
    useEdgesState, 
    Node,
    ReactFlowProvider,
    useReactFlow,
    getRectOfNodes
} from 'reactflow';
import { toJpeg } from 'html-to-image';
import { 
    GitMerge, 
    Columns, 
    ArrowRight,
    Info,
    Layers,
    Maximize,
    MessageSquareText,
    FileText,
    Download,
    ArrowLeft,
    Users,
    X
} from 'lucide-react';

import FlowDetails from '../components/FlowDetails';
import ChatAssistant from '../components/ChatAssistant';
import { generateSopFlow } from '../services/geminiService';
import { convertSopToFlowData, getActorTheme } from '../utils/layoutUtils';
import { MOCK_SOP_DATA } from '../constants';
import { SopResponse, ProcessStep, LayoutType } from '../types';

interface CanvasPageProps {
    initialPrompt?: string;
    initialData?: SopResponse | null;
    onFlowGenerated?: (data: SopResponse, prompt: string) => void;
    onBack: () => void;
}

const CanvasContent: React.FC<CanvasPageProps> = ({ initialPrompt, initialData, onFlowGenerated, onBack }) => {
    // Flow State
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [sopData, setSopData] = useState<SopResponse | null>(null);
    
    // UI State
    const [layoutMode, setLayoutMode] = useState<LayoutType>('SWIMLANE');
    const [activeStage, setActiveStage] = useState<string>('ALL');
    const [selectedStep, setSelectedStep] = useState<ProcessStep | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activePanel, setActivePanel] = useState<'GUIDE' | 'CHAT'>('GUIDE');
    const [isLoading, setIsLoading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isLegendOpen, setIsLegendOpen] = useState(false);

    const { fitView, setCenter, getNodes } = useReactFlow();

    // Helper to safely load data
    const loadData = useCallback((data: SopResponse) => {
        try {
            console.log("Loading data...", data.processDefinition?.title);
            setSopData(data);
            const { nodes: newNodes, edges: newEdges } = convertSopToFlowData(data, layoutMode);
            setNodes(newNodes);
            setEdges(newEdges);
            
            setTimeout(() => {
                fitView({ padding: 0.2, duration: 1000 });
            }, 100);
        } catch (err) {
            console.error("Error loading flow data:", err);
        }
    }, [layoutMode, fitView, setNodes, setEdges]);

    // Initial Load Effect
    useEffect(() => {
        if (initialData) {
            // Use real data passed from App/API
            loadData(initialData);
        } else if (initialPrompt) {
            // Generate from prompt
            handleGenerateFlow(initialPrompt);
        } 
        // Removed default MOCK_SOP_DATA fallback to prevent confusion
    }, [initialPrompt, initialData]);

    // Re-run layout when layoutMode changes
    useEffect(() => {
        if (sopData) {
            loadData(sopData);
        }
    }, [layoutMode, sopData, loadData]);

    // Reset active stage when loading new data
    useEffect(() => {
        setActiveStage('ALL');
    }, [sopData?.processDefinition?.title]);

    const handleGenerateFlow = async (prompt: string) => {
        setIsLoading(true);

        try {
            if (!process.env.API_KEY) {
                console.warn("No API Key found for generation. Demo mode disabled for production accuracy.");
                setIsLoading(false);
                return;
            }
            
            // Real API Call to Gemini
            const response = await generateSopFlow(prompt);
            loadData(response);
            if (onFlowGenerated) onFlowGenerated(response, prompt);
        } catch (error) {
            console.error("Failed to generate flow:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = useCallback(() => {
        const nodes = getNodes();
        if (nodes.length === 0) return;
        
        setIsDownloading(true);

        // Calculate the bounding box of all nodes
        const nodesBounds = getRectOfNodes(nodes);
        const padding = 100;
        const width = nodesBounds.width + padding * 2;
        const height = nodesBounds.height + padding * 2;
        
        // Determine transform to shift the top-left to 0,0 plus padding
        const transformX = -nodesBounds.x + padding;
        const transformY = -nodesBounds.y + padding;

        // Select the viewport element
        const viewportElem = document.querySelector('.react-flow__viewport') as HTMLElement;

        if (viewportElem) {
            toJpeg(viewportElem, {
                backgroundColor: '#f8fafc', // match background
                width: width,
                height: height,
                style: {
                    width: `${width}px`,
                    height: `${height}px`,
                    transform: `translate(${transformX}px, ${transformY}px) scale(1)`,
                },
                quality: 0.95,
                cacheBust: true, // Prevents CORS issues with cached images
                skipAutoScale: true,
            })
            .then((dataUrl) => {
                const link = document.createElement('a');
                link.download = `${sopData?.processDefinition?.title.replace(/\s+/g, '_') || 'sop-flow'}.jpg`;
                link.href = dataUrl;
                link.click();
            })
            .catch((err) => {
                console.error('Failed to download image', err);
            })
            .finally(() => {
                setIsDownloading(false);
            });
        } else {
            setIsDownloading(false);
        }
    }, [getNodes, sopData]);


    // --- Filtering Logic for Stages ---
    const visibleData = useMemo(() => {
        if (activeStage === 'ALL' || !sopData || !sopData.processFlow) {
            return { nodes, edges };
        }

        const currentStageObj = sopData.processFlow.stages.find(s => s.stageId === activeStage);
        if (!currentStageObj) return { nodes, edges };

        const stageStepIds = new Set(currentStageObj.steps.map(s => s.stepId));
        
        // Determine if we should show start/end nodes
        const isFirstStage = sopData.processFlow.stages[0].stageId === activeStage;
        const isLastStage = sopData.processFlow.stages[sopData.processFlow.stages.length - 1].stageId === activeStage;

        const filteredNodes = nodes.filter(node => {
            // Always show the Stage Group Header if in Swimlane
            if (node.id === `stage-${activeStage}`) return true;
            
            // Show Start Node if first stage
            if (isFirstStage && sopData.startNode && node.id === sopData.startNode.stepId) return true;
            
            // Show End Node if last stage
            if (isLastStage && sopData.endNode && node.id === sopData.endNode.stepId) return true;

            // Show steps belonging to this stage
            return stageStepIds.has(node.id);
        });

        const visibleNodeIds = new Set(filteredNodes.map(n => n.id));
        
        const filteredEdges = edges.filter(edge => 
            visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)
        );

        return { nodes: filteredNodes, edges: filteredEdges };
    }, [nodes, edges, activeStage, sopData]);

    // Auto-fit view when stage changes
    useEffect(() => {
        setTimeout(() => {
            fitView({ padding: 0.2, duration: 600 });
        }, 50);
    }, [activeStage, fitView]);


    const onNodeClick = (_: React.MouseEvent, node: Node) => {
        if (node.data && node.data.details) {
            setSelectedStep(node.data.details);
            setIsSidebarOpen(true);
            setActivePanel('GUIDE'); // Force switch to Guide when a node is clicked
            setCenter(node.position.x + 150, node.position.y + 75, { zoom: 1, duration: 800 });
        }
    };

    const handleStepNavigation = (nextStepId: string) => {
        const targetNode = nodes.find(n => n.id === nextStepId);
        if (targetNode && targetNode.data.details) {
            setSelectedStep(targetNode.data.details);
            setCenter(targetNode.position.x + 150, targetNode.position.y + 75, { zoom: 1, duration: 1000 });
            
            // If we are in stage view, switch to the stage containing this step
            if (activeStage !== 'ALL' && sopData && sopData.processFlow) {
                 const stage = sopData.processFlow.stages.find(s => s.steps.some(step => step.stepId === nextStepId));
                 if (stage && stage.stageId !== activeStage) {
                     setActiveStage(stage.stageId);
                 }
            }

        } else if (nextStepId === 'END' && sopData && sopData.endNode) {
            setSelectedStep(sopData.endNode);
            const endNode = nodes.find(n => n.id === sopData.endNode.stepId);
            if (endNode) {
                setCenter(endNode.position.x + 50, endNode.position.y + 50, { zoom: 1, duration: 1000 });
            }
        }
    };

    // Layout Options Config
    const layoutOptions: { id: LayoutType; label: string; icon: any }[] = [
        { id: 'SWIMLANE', label: 'Swimlanes', icon: Columns },
        { id: 'TREE', label: 'Vertical Tree', icon: GitMerge },
        { id: 'HORIZONTAL', label: 'Horizontal Tree', icon: ArrowRight },
    ];

    // Dynamic Actor Legend
    const actorLegend = useMemo(() => {
        if (!sopData || !sopData.processFlow) return [];
        const actors = new Set<string>();
        sopData.processFlow.stages.forEach(s => s.steps.forEach(st => {
            if (st.actor && st.actor !== 'Start' && st.actor !== 'End') {
                actors.add(st.actor);
            }
        }));

        return Array.from(actors).map(actor => {
            const theme = getActorTheme(actor);
            return { label: actor, bg: theme.bg, border: theme.border, text: theme.text };
        });
    }, [sopData]);


    return (
        <div className="flex h-full w-full bg-slate-50 relative overflow-hidden">
            
            {/* Top Control Bar Container */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3 w-full max-w-7xl px-4 pointer-events-none">
                
                {/* Controls Row */}
                <div className="flex items-center gap-3 pointer-events-auto w-full justify-center relative">
                    
                    {/* Back Button */}
                    <button 
                        onClick={onBack}
                        className="absolute left-0 bg-white text-slate-600 hover:bg-slate-100 shadow-md border border-slate-200 rounded-full p-2.5 flex items-center gap-2 text-xs font-bold transition-all"
                        title="Back to Hub"
                    >
                        <ArrowLeft size={16} />
                        <span className="hidden md:inline">Back to Hub</span>
                    </button>

                    {/* 1. Layout Switcher */}
                    <div className="bg-white shadow-lg border border-slate-200 rounded-full p-1.5 flex items-center gap-1 overflow-x-auto max-w-[200px] md:max-w-none scrollbar-hide">
                        {layoutOptions.map(opt => {
                            const Icon = opt.icon;
                            return (
                                <button 
                                    key={opt.id}
                                    onClick={() => setLayoutMode(opt.id)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                                        layoutMode === opt.id 
                                        ? 'bg-slate-800 text-white shadow-md' 
                                        : 'text-slate-500 hover:bg-slate-100'
                                    }`}
                                    title={opt.label}
                                >
                                    <Icon size={14} />
                                    <span className="hidden md:inline">{opt.label}</span>
                                </button>
                            )
                        })}
                    </div>

                     {/* 2. Download Button */}
                    <button
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className="bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20 border border-blue-500 rounded-full p-2.5 px-4 flex items-center gap-2 text-xs font-bold transition-all disabled:opacity-70 flex-shrink-0"
                        title="Download as JPG"
                    >
                        {isDownloading ? (
                             <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <Download size={14} />
                        )}
                        <span className="hidden md:inline">Download JPG</span>
                    </button>
                </div>

                {/* 3. Stage Navigation Bar */}
                {sopData && sopData.processFlow && sopData.processFlow.stages && (
                    <div className="bg-white/90 backdrop-blur shadow-md border border-slate-200 rounded-xl p-1 flex items-center gap-1 overflow-x-auto max-w-full pointer-events-auto no-scrollbar w-auto">
                         <button 
                            onClick={() => setActiveStage('ALL')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                                activeStage === 'ALL'
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                            <Maximize size={12} />
                            All Stages
                        </button>
                        <div className="w-px h-4 bg-slate-200 mx-1"></div>
                        {sopData.processFlow.stages.map((stage) => (
                            <button
                                key={stage.stageId}
                                onClick={() => setActiveStage(stage.stageId)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                                    activeStage === stage.stageId
                                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                    : 'text-slate-500 hover:bg-slate-100'
                                }`}
                            >
                                <Layers size={12} className={activeStage === stage.stageId ? 'text-blue-500' : 'text-slate-400'} />
                                {stage.stageName}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Responsible Actors Legend & Toggle */}
            <div className="absolute bottom-6 left-6 z-30 flex flex-col items-start gap-2">
                {/* Legend Card */}
                {isLegendOpen && (
                    <div className="bg-white/90 backdrop-blur-md border border-slate-200/50 shadow-xl rounded-2xl p-4 w-52 animate-in fade-in slide-in-from-bottom-2 duration-200 mb-2">
                        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200/50">
                            <div className="flex items-center gap-2 text-slate-600">
                                <Info size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Responsible Actors</span>
                            </div>
                            <button onClick={() => setIsLegendOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={14} />
                            </button>
                        </div>
                        <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                            {actorLegend.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <div 
                                        className="w-2.5 h-2.5 rounded-full shadow-sm ring-1 ring-inset ring-black/5" 
                                        style={{ backgroundColor: item.bg, borderColor: item.border }}
                                    ></div>
                                    <span 
                                        className="text-[10px] font-bold uppercase truncate text-slate-600"
                                    >
                                        {item.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Toggle Button */}
                <button 
                    onClick={() => setIsLegendOpen(!isLegendOpen)}
                    className={`p-3 rounded-full shadow-lg border transition-all duration-200 ${
                        isLegendOpen 
                        ? 'bg-slate-800 text-white border-slate-700' 
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:scale-105'
                    }`}
                    title="View Actors"
                >
                    <Users size={20} />
                </button>
            </div>

            {/* Canvas */}
            <div className="flex-1 h-full relative z-0">
                {isLoading && (
                    <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
                        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                        <p className="text-lg font-medium text-slate-700">Generating Flow...</p>
                    </div>
                )}
                
                <ReactFlow
                    nodes={visibleData.nodes}
                    edges={visibleData.edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onNodeClick={onNodeClick}
                    fitView
                    minZoom={0.1}
                    maxZoom={2}
                    attributionPosition="bottom-right"
                >
                    <Background color="#e2e8f0" gap={24} size={2} />
                </ReactFlow>
            </div>

            {/* Right Sidebar - Process Guide / Chat */}
            <div 
                className={`bg-white border-l border-slate-200 shadow-2xl z-30 transition-all duration-300 flex flex-col absolute right-0 top-0 h-full w-full md:w-[420px] ${
                    isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                {/* Sidebar Toggle Tabs */}
                <div className="absolute right-full top-6 flex flex-col gap-2 mr-[-1px]">
                     <button 
                        onClick={() => {
                            if (isSidebarOpen && activePanel === 'GUIDE') setIsSidebarOpen(false);
                            else {
                                setIsSidebarOpen(true);
                                setActivePanel('GUIDE');
                            }
                        }}
                        className={`p-3 rounded-l-xl shadow-md border-y border-l border-slate-200 transition-all ${
                            isSidebarOpen && activePanel === 'GUIDE' ? 'bg-white text-blue-600 translate-x-1' : 'bg-slate-50 text-slate-500 hover:bg-white'
                        }`}
                        title="Process Guide"
                    >
                        <FileText size={20} />
                    </button>
                    <button 
                        onClick={() => {
                            if (isSidebarOpen && activePanel === 'CHAT') setIsSidebarOpen(false);
                            else {
                                setIsSidebarOpen(true);
                                setActivePanel('CHAT');
                            }
                        }}
                        className={`p-3 rounded-l-xl shadow-md border-y border-l border-slate-200 transition-all ${
                            isSidebarOpen && activePanel === 'CHAT' ? 'bg-white text-emerald-600 translate-x-1' : 'bg-slate-50 text-slate-500 hover:bg-white'
                        }`}
                        title="AI Knowledge Base"
                    >
                        <MessageSquareText size={20} />
                    </button>
                </div>

                {sopData && (
                    <>
                        {activePanel === 'GUIDE' ? (
                            <FlowDetails 
                                step={selectedStep} 
                                processData={sopData}
                                onClose={() => setIsSidebarOpen(false)}
                                onNextStep={handleStepNavigation}
                            />
                        ) : (
                            <ChatAssistant 
                                sopData={sopData}
                                onClose={() => setIsSidebarOpen(false)}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

const CanvasPage = ({ initialPrompt, initialData, onFlowGenerated, onBack }: { 
    initialPrompt?: string, 
    initialData?: SopResponse | null,
    onFlowGenerated?: (data: SopResponse, prompt: string) => void,
    onBack: () => void
}) => {
    return (
        <ReactFlowProvider>
             <CanvasContent 
                initialPrompt={initialPrompt} 
                initialData={initialData} 
                onFlowGenerated={onFlowGenerated} 
                onBack={onBack}
             />
        </ReactFlowProvider>
    );
};

export default CanvasPage;
