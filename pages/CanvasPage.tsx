
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
    Download,
    ArrowLeft,
    Users,
    X,
    LayoutDashboard,
    Compass,
    Brain,
    FilePenLine,
    Save,
    RotateCcw
} from 'lucide-react';

import FlowDetails from '../components/FlowDetails';
import ChatAssistant from '../components/ChatAssistant';
import { generateSopFlow } from '../services/geminiService';
import { apiService } from '../services/apiService';
import { convertSopToFlowData, getActorTheme } from '../utils/layoutUtils';
import { SopResponse, ProcessStep, LayoutType, Product, ProcessDefinitionRow } from '../types';

interface CanvasPageProps {
    initialPrompt?: string;
    initialData?: SopResponse | null;
    onFlowGenerated?: (data: SopResponse, prompt: string) => void;
    onBack: () => void;
    productContext?: Product | null;
    initialSessionId?: string;
}

const EMPTY_SOP: SopResponse = {
    startNode: { stepId: 'START', stepName: 'Start', description: 'Process Initiation', actor: 'System', stepType: 'Start', nextStep: null },
    endNode: { stepId: 'END', stepName: 'End', description: 'Process Completion', actor: 'System', stepType: 'End', nextStep: null },
    processDefinition: { title: 'New Canvas', version: '1.0', classification: 'Internal', documentLink: '#' },
    processObjectives: [],
    inherentRisks: [],
    processFlow: { stages: [] },
    metadata: {}
};

// Internal component containing the logic that requires the ReactFlow context
const CanvasPageContent: React.FC<CanvasPageProps> = ({ initialPrompt, initialData, onFlowGenerated, onBack, productContext, initialSessionId }) => {
    // Flow State
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    // Use fallback SOP if no initial data to ensure UI (Sidebar/Chat) renders
    const [sopData, setSopData] = useState<SopResponse | null>(initialData || EMPTY_SOP);
    
    // UI State
    const [layoutMode, setLayoutMode] = useState<LayoutType>('SWIMLANE');
    const [activeStage, setActiveStage] = useState<string>('ALL');
    const [selectedStep, setSelectedStep] = useState<ProcessStep | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Open by default
    const [activePanel, setActivePanel] = useState<'GUIDE' | 'CHAT'>('CHAT'); // Default to Chat for interaction
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState<string>('Generating Flow...');
    const [isDownloading, setIsDownloading] = useState(false);
    
    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [processTable, setProcessTable] = useState<ProcessDefinitionRow[]>([]);
    const [isTableLoading, setIsTableLoading] = useState(false);
    
    // CHANGED: Set to true by default as requested
    const [isLegendOpen, setIsLegendOpen] = useState(true);
    
    // Maximized Sidebar State
    const [isSidebarMaximized, setIsSidebarMaximized] = useState(false);

    // This hook requires the component to be wrapped in ReactFlowProvider
    const { fitView, setCenter, getNodes } = useReactFlow();

    // Helper to safely load data
    const loadData = useCallback((data: SopResponse) => {
        try {
            console.log("Loading data into Canvas...", data?.processDefinition?.title);
            if (!data || !data.processFlow) {
                console.warn("Cannot load data: missing processFlow structure");
                return;
            }
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

    // Polling Logic
    const pollFlowData = useCallback(async (productName: string) => {
        setIsLoading(true);
        // Set initial message based on context status if available
        if (productContext?.flow_status === 'Draft') {
             setLoadingMessage('Please upload documents to generate flow or wait for flow generated...');
        } else {
             setLoadingMessage('Checking flow status...');
        }

        const poll = async () => {
             try {
                 const flowData = await apiService.getProcessFlow(productName);
                 loadData(flowData);
                 setIsLoading(false);
             } catch (e: any) {
                 if (e.status === 'Processing') {
                     setLoadingMessage('Flow generation in progress...');
                     // Keep polling
                     setTimeout(poll, 3000);
                 } else if (e.status === 'Failed') {
                      setIsLoading(false);
                      console.error("Flow failed to generate");
                 } else {
                      // Fallback for 404 (Draft/Missing) or other errors
                      // Matches requirement: "show loader and message"
                      setLoadingMessage('Please upload documents to generate flow or wait for flow generated...');
                      // Continue polling slowly in case user is just waiting for backend to start
                      setTimeout(poll, 5000);
                 }
             }
        };
        poll();
    }, [loadData, productContext]);


    // Initial Load Effect
    useEffect(() => {
        if (initialData) {
            loadData(initialData);
        } else if (initialPrompt) {
            handleGenerateFlow(initialPrompt);
        } else if (productContext) {
            // No data, but we have a product context. Fetch/Poll flow.
            pollFlowData(productContext.product_name);
        } else {
            // No context, just load empty
            loadData(EMPTY_SOP);
        }
    }, [initialPrompt, initialData, productContext]);

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
        setLoadingMessage('Generating Flow...');

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

    const handleEditProcessClick = async () => {
        if (!sopData) return;
        setIsEditModalOpen(true);
        setIsTableLoading(true);
        try {
            const table = await apiService.getProcessTable(productContext?.product_name || 'demo', sopData);
            setProcessTable(table);
        } catch (e) {
            console.error("Failed to load process table", e);
        } finally {
            setIsTableLoading(false);
        }
    };

    const handleTableChange = (id: string, field: keyof ProcessDefinitionRow, value: string) => {
        setProcessTable(prev => prev.map(row => row.id === id ? { ...row, [field]: value } : row));
    };

    const handleRegenerateFlow = async () => {
        if (!sopData) return;
        setIsTableLoading(true);
        try {
            const newSop = await apiService.updateProcessFlowFromTable(
                productContext?.product_name || 'demo',
                processTable,
                sopData
            );
            loadData(newSop);
            setIsEditModalOpen(false);
        } catch (e) {
            console.error("Failed to regenerate flow", e);
        } finally {
            setIsTableLoading(false);
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
        if (activeStage === 'ALL' || !sopData || !sopData.processFlow || !sopData.processFlow.stages) {
            return { nodes, edges };
        }

        const currentStageObj = sopData.processFlow.stages.find(s => s.stageId === activeStage);
        if (!currentStageObj) return { nodes, edges };

        const stageStepIds = new Set(currentStageObj.steps.map(s => s.stepId));
        
        // Determine if we should show start/end nodes
        const isFirstStage = sopData.processFlow.stages[0]?.stageId === activeStage;
        const isLastStage = sopData.processFlow.stages[sopData.processFlow.stages.length - 1]?.stageId === activeStage;

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
            // If user clicked a node, we probably want to see context, so standard width is good.
            // But if it was maximized, we keep it maximized.
            setCenter(node.position.x + 150, node.position.y + 75, { zoom: 1, duration: 800 });
        }
    };

    const handleStepNavigation = (nextStepId: string) => {
        const targetNode = nodes.find(n => n.id === nextStepId);
        if (targetNode && targetNode.data.details) {
            setSelectedStep(targetNode.data.details);
            setCenter(targetNode.position.x + 150, targetNode.position.y + 75, { zoom: 1, duration: 1000 });
            
            // If we are in stage view, switch to the stage containing this step
            if (activeStage !== 'ALL' && sopData && sopData.processFlow && sopData.processFlow.stages) {
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
        // Strict null checks to prevent crashes if data is partial
        if (!sopData || !sopData.processFlow || !Array.isArray(sopData.processFlow.stages)) return [];
        
        const actors = new Set<string>();
        sopData.processFlow.stages.forEach(s => {
            if (s && Array.isArray(s.steps)) {
                s.steps.forEach(st => {
                    if (st && st.actor && st.actor !== 'Start' && st.actor !== 'End') {
                        actors.add(st.actor);
                    }
                });
            }
        });

        return Array.from(actors).map(actor => {
            const theme = getActorTheme(actor);
            return { label: actor, bg: theme.bg, border: theme.border, text: theme.text };
        });
    }, [sopData]);

    // Derived active stage object for passing to sidebar
    const currentActiveStageObject = useMemo(() => {
        if (!sopData || !sopData.processFlow || !sopData.processFlow.stages) return null;
        return sopData.processFlow.stages.find(s => s.stageId === activeStage) || null;
    }, [activeStage, sopData]);


    return (
        <div className="flex h-full w-full bg-slate-50 relative overflow-hidden">
            
            {/* Top Control Bar Container */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3 w-full max-w-7xl px-4 pointer-events-none">
                
                {/* Controls Row */}
                <div className="flex items-center gap-3 pointer-events-auto w-full justify-center relative">
                    
                    {/* Back Button (Moved to consistent place but floating) */}
                    <button 
                        onClick={onBack}
                        className="absolute left-0 bg-white text-slate-500 hover:text-fab-royal hover:bg-slate-50 shadow-md border border-slate-200 rounded-full py-2.5 px-4 flex items-center gap-2 transition-all group"
                        title="Back to Hub"
                    >
                        <LayoutDashboard size={18} className="group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold hidden md:inline">Back to Hub</span>
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

                    <div className="flex items-center gap-2 flex-shrink-0">
                        {/* 2. Edit Process Definition Button */}
                        <button
                            onClick={handleEditProcessClick}
                            className="bg-white text-fab-royal hover:bg-fab-royal/5 shadow-lg border border-fab-royal/20 rounded-full p-2.5 px-4 flex items-center gap-2 text-xs font-bold transition-all"
                            title="Edit Process Definition"
                        >
                            <FilePenLine size={14} />
                            <span className="hidden md:inline">Edit Process</span>
                        </button>

                        {/* 3. Download Button */}
                        <button
                            onClick={handleDownload}
                            disabled={isDownloading}
                            className="bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20 border border-blue-500 rounded-full p-2.5 px-4 flex items-center gap-2 text-xs font-bold transition-all disabled:opacity-70"
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
                </div>

                {/* 3. Stage Navigation Bar */}
                {sopData && sopData.processFlow && sopData.processFlow.stages && sopData.processFlow.stages.length > 0 && (
                    <div className="bg-white/90 backdrop-blur shadow-md border border-slate-200 rounded-xl p-1 flex items-center gap-1 overflow-x-auto max-w-full pointer-events-auto no-scrollbar w-auto">
                         <button 
                            onClick={() => {
                                setActiveStage('ALL');
                                // 'ALL' generally closes the sidebar or reverts to process overview
                                setSelectedStep(null);
                                setIsSidebarOpen(true);
                                setActivePanel('GUIDE');
                            }}
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
                                onClick={() => {
                                    setActiveStage(stage.stageId);
                                    // Open Sidebar to show Stage Summary when a stage is specifically selected
                                    setSelectedStep(null); // Clear specific step to show Stage View
                                    setIsSidebarOpen(true);
                                    setActivePanel('GUIDE');
                                }}
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
                {isLegendOpen && actorLegend.length > 0 && (
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
                        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4 shadow-lg"></div>
                        <p className="text-lg font-medium text-slate-700 text-center px-4 animate-pulse">{loadingMessage}</p>
                        <div className="mt-4 max-w-xs w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 w-1/3 animate-[shimmer_2s_infinite]"></div>
                        </div>
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
                className={`bg-white border-l border-slate-200 shadow-2xl z-30 transition-all duration-300 flex flex-col absolute right-0 top-0 h-full ${
                    isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
                } ${
                    isSidebarMaximized ? 'w-full md:w-[95%]' : 'w-full md:w-[500px]' // Widened default sidebar
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
                        <Compass size={20} />
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
                        <Brain size={20} />
                    </button>
                </div>

                {sopData && (
                    <>
                        {activePanel === 'GUIDE' ? (
                            <FlowDetails 
                                step={selectedStep}
                                stage={currentActiveStageObject}
                                processData={sopData}
                                onClose={() => setIsSidebarOpen(false)}
                                onNextStep={handleStepNavigation}
                            />
                        ) : (
                            <ChatAssistant 
                                sopData={sopData}
                                onClose={() => setIsSidebarOpen(false)}
                                productContext={productContext}
                                onToggleMaximize={() => setIsSidebarMaximized(!isSidebarMaximized)}
                                isMaximized={isSidebarMaximized}
                                initialSessionId={initialSessionId}
                                onNavigateToStep={handleStepNavigation}
                            />
                        )}
                    </>
                )}
            </div>

            {/* Edit Process Definition Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        
                        {/* Modal Header */}
                        <div className="p-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-fab-navy flex items-center gap-2">
                                    <FilePenLine size={20} className="text-fab-royal" />
                                    Edit Process Definition
                                </h3>
                                <p className="text-xs text-slate-500 mt-1">Modify step details, actors, and descriptions. Click "Regenerate Flow" to update the diagram.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Table Content */}
                        <div className="flex-1 overflow-auto bg-white p-6 relative">
                            {isTableLoading ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10">
                                    <div className="w-12 h-12 border-4 border-fab-royal/20 border-t-fab-royal rounded-full animate-spin mb-3"></div>
                                    <p className="text-sm font-medium text-slate-600 animate-pulse">Processing Table Data...</p>
                                </div>
                            ) : (
                                <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead className="bg-slate-100 border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                                            <tr>
                                                <th className="p-3 font-bold text-slate-600 border-r border-slate-200 w-24">ID</th>
                                                <th className="p-3 font-bold text-slate-600 border-r border-slate-200 w-48">L2 Process</th>
                                                <th className="p-3 font-bold text-slate-600 border-r border-slate-200 w-64">Step Name</th>
                                                <th className="p-3 font-bold text-slate-600 border-r border-slate-200 min-w-[200px]">Description</th>
                                                <th className="p-3 font-bold text-slate-600 border-r border-slate-200 w-28">Actor</th>
                                                <th className="p-3 font-bold text-slate-600 border-r border-slate-200 w-24">Type</th>
                                                <th className="p-3 font-bold text-slate-600 border-r border-slate-200 w-24">System</th>
                                                <th className="p-3 font-bold text-slate-600 border-r border-slate-200 w-20">Time (s)</th>
                                                <th className="p-3 font-bold text-slate-600">Risks</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {processTable.map((row) => (
                                                <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="p-2 border-r border-slate-100 font-mono font-medium text-slate-500 bg-slate-50/50">{row.id}</td>
                                                    <td className="p-2 border-r border-slate-100">{row.l2Process}</td>
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
                                                    <td className="p-2 border-r border-slate-100 text-slate-500">{row.system}</td>
                                                    <td className="p-2 border-r border-slate-100 text-slate-500">{row.processingTime}</td>
                                                    <td className="p-2 text-rose-600 font-medium">{row.risks}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-5 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
                            <p className="text-xs text-slate-500">
                                Note: Updating the table will trigger a logic re-evaluation. Ensure all connected steps (Next Step logic) are consistent.
                            </p>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-4 py-2.5 text-slate-600 font-bold text-sm hover:bg-slate-200 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleRegenerateFlow}
                                    disabled={isTableLoading}
                                    className="px-6 py-2.5 bg-fab-royal text-white rounded-lg font-bold text-sm shadow-lg shadow-fab-royal/20 hover:bg-fab-blue hover:scale-105 transition-all disabled:opacity-70 flex items-center gap-2"
                                >
                                    <RotateCcw size={16} />
                                    Regenerate Flow
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Wrapper Component to provide ReactFlow Context
const CanvasPage: React.FC<CanvasPageProps> = (props) => {
    return (
        <ReactFlowProvider>
            <CanvasPageContent {...props} />
        </ReactFlowProvider>
    );
};

export default CanvasPage;
