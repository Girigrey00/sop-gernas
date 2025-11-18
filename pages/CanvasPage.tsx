
import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, { 
    Background, 
    useNodesState, 
    useEdgesState, 
    Node,
    ReactFlowProvider,
    useReactFlow
} from 'reactflow';
import { 
    GitMerge, 
    Columns, 
    BookOpen, 
    ArrowRight,
    Info
} from 'lucide-react';

import FlowDetails from '../components/FlowDetails';
import { generateSopFlow } from '../services/geminiService';
import { convertSopToFlowData } from '../utils/layoutUtils';
import { MOCK_SOP_DATA } from '../constants';
import { SopResponse, ProcessStep, LayoutType } from '../types';

interface CanvasPageProps {
    initialPrompt?: string;
    initialData?: SopResponse | null;
    onFlowGenerated?: (data: SopResponse, prompt: string) => void;
}

const CanvasContent: React.FC<CanvasPageProps> = ({ initialPrompt, initialData, onFlowGenerated }) => {
    // Flow State
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [sopData, setSopData] = useState<SopResponse | null>(null);
    
    // UI State
    const [layoutMode, setLayoutMode] = useState<LayoutType>('SWIMLANE');
    const [selectedStep, setSelectedStep] = useState<ProcessStep | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const { fitView, setCenter } = useReactFlow();

    // Helper to safely load data
    const loadData = useCallback((data: SopResponse) => {
        try {
            console.log("Loading data...", data.processDefinition.title);
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
            // If history data is passed, use it directly
            loadData(initialData);
        } else if (initialPrompt) {
            // Otherwise generate from prompt
            handleGenerateFlow(initialPrompt);
        } else {
            // Fallback / Default
            loadData(MOCK_SOP_DATA);
        }
    }, [initialPrompt, initialData]);

    // Re-run layout when layoutMode changes
    useEffect(() => {
        if (sopData) {
            loadData(sopData);
        }
    }, [layoutMode, sopData, loadData]);

    const handleGenerateFlow = async (prompt: string) => {
        setIsLoading(true);

        // SHORTCUT: If the prompt matches our demo content, load it immediately without API calls
        if (prompt.includes("Personal Income Loan") || prompt.includes("PIL")) {
            console.log("Loading Matching Mock Data for:", prompt);
            loadData(MOCK_SOP_DATA);
            if (onFlowGenerated) onFlowGenerated(MOCK_SOP_DATA, prompt);
            setIsLoading(false);
            return;
        }

        try {
            if (!process.env.API_KEY) {
                console.log("Demo Mode: Simulating Generation");
                setTimeout(() => {
                    try {
                        loadData(MOCK_SOP_DATA);
                        if (onFlowGenerated) onFlowGenerated(MOCK_SOP_DATA, prompt);
                    } catch (e) {
                        console.error("Mock load failed", e);
                    } finally {
                        setIsLoading(false);
                    }
                }, 1500);
                return;
            }
            
            // Real API Call
            const response = await generateSopFlow(prompt);
            loadData(response);
            if (onFlowGenerated) onFlowGenerated(response, prompt);
        } catch (error) {
            console.error("Failed to generate flow:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const onNodeClick = (_: React.MouseEvent, node: Node) => {
        if (node.data && node.data.details) {
            setSelectedStep(node.data.details);
            setIsSidebarOpen(true);
            setCenter(node.position.x + 150, node.position.y + 75, { zoom: 1, duration: 800 });
        }
    };

    const handleStepNavigation = (nextStepId: string) => {
        const targetNode = nodes.find(n => n.id === nextStepId);
        if (targetNode && targetNode.data.details) {
            setSelectedStep(targetNode.data.details);
            setCenter(targetNode.position.x + 150, targetNode.position.y + 75, { zoom: 1, duration: 1000 });
        } else if (nextStepId === 'END' && sopData) {
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

    // Legend Config
    const legendItems = [
        { label: 'Start', color: 'bg-emerald-50 border-emerald-400', text: 'text-emerald-700' },
        { label: 'Process Step', color: 'bg-white border-slate-300', text: 'text-slate-600' },
        { label: 'Decision', color: 'bg-orange-50 border-orange-400', text: 'text-orange-700' },
        { label: 'Control', color: 'bg-sky-50 border-sky-400', text: 'text-sky-700' },
        { label: 'Customer Input', color: 'bg-fuchsia-50 border-fuchsia-400', text: 'text-fuchsia-700' },
        { label: 'End', color: 'bg-rose-50 border-rose-400', text: 'text-rose-700' },
    ];

    return (
        <div className="flex h-full w-full bg-slate-50 relative overflow-hidden">
            
            {/* Top Control Bar */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
                <div className="bg-white shadow-lg border border-slate-200 rounded-full p-1.5 flex items-center gap-1">
                    {layoutOptions.map(opt => {
                        const Icon = opt.icon;
                        return (
                            <button 
                                key={opt.id}
                                onClick={() => setLayoutMode(opt.id)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-bold transition-all ${
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
            </div>

            {/* Legend Overlay - Moved to Top Left */}
            <div className="absolute top-6 left-6 z-10 bg-white/90 backdrop-blur border border-slate-200 p-4 rounded-xl shadow-xl w-48">
                <div className="flex items-center gap-2 mb-3 text-slate-400 pb-2 border-b border-slate-100">
                    <Info size={14} />
                    <span className="text-xs font-bold uppercase tracking-wider">Node Legend</span>
                </div>
                <div className="space-y-2">
                    {legendItems.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full border ${item.color}`}></div>
                            <span className={`text-[10px] font-bold uppercase ${item.text}`}>{item.label}</span>
                        </div>
                    ))}
                </div>
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
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onNodeClick={onNodeClick}
                    fitView
                    minZoom={0.1}
                    maxZoom={2}
                    attributionPosition="bottom-left"
                >
                    <Background color="#e2e8f0" gap={24} size={2} />
                </ReactFlow>
            </div>

            {/* Right Sidebar - Process Guide */}
            <div 
                className={`bg-white border-l border-slate-200 shadow-2xl z-30 transition-all duration-300 flex flex-col ${
                    isSidebarOpen ? 'w-[420px] translate-x-0' : 'w-0 translate-x-full opacity-0 overflow-hidden'
                }`}
            >
                {sopData && (
                    <FlowDetails 
                        step={selectedStep} 
                        processData={sopData}
                        onClose={() => setIsSidebarOpen(false)}
                        onNextStep={handleStepNavigation}
                    />
                )}
            </div>

            {/* Sidebar Toggle Button (when closed) */}
            {!isSidebarOpen && (
                <button 
                    onClick={() => setIsSidebarOpen(true)}
                    className="absolute top-6 right-6 z-20 bg-white p-3 rounded-full shadow-lg border border-slate-200 text-slate-600 hover:text-blue-600 transition-all"
                >
                    <BookOpen size={20} />
                </button>
            )}
        </div>
    );
};

const CanvasPage = ({ initialPrompt, initialData, onFlowGenerated }: { 
    initialPrompt?: string, 
    initialData?: SopResponse | null,
    onFlowGenerated?: (data: SopResponse, prompt: string) => void
}) => {
    return (
        <ReactFlowProvider>
             <CanvasContent 
                initialPrompt={initialPrompt} 
                initialData={initialData} 
                onFlowGenerated={onFlowGenerated} 
             />
        </ReactFlowProvider>
    );
};

export default CanvasPage;
