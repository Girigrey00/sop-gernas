
import React, { useEffect, useState } from 'react';
import ReactFlow, { 
    Background, 
    useNodesState, 
    useEdgesState, 
    ReactFlowProvider,
    useReactFlow,
    Node,
    Edge
} from 'reactflow';
import { LayoutDashboard, ArrowLeft, Loader2, Info, Check, Settings2, Play, Grid } from 'lucide-react';
import { SopResponse, Product } from '../types';
import { apiService } from '../services/apiService';
import { convertSopToAnalysisData, filterDummyData, FlowNodeType } from '../utils/analysisUtils';

interface ProcessAnalysisPageProps {
    product: Product;
    onBack: () => void;
}

const ProcessAnalysisContent: React.FC<ProcessAnalysisPageProps> = ({ product, onBack }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const [sopData, setSopData] = useState<SopResponse | null>(null);
    const { fitView } = useReactFlow();

    // Custom Flow Config State - Updated to include 'output' by default
    const [selectedComponents, setSelectedComponents] = useState<FlowNodeType[]>(['process', 'data', 'risk', 'control', 'output']);

    useEffect(() => {
        const init = async () => {
            // Check if this is the dummy product
            if (product.id === 'dummy-analysis' || product.product_name.includes('Analysis Demo')) {
                // For demo, we want to immediately show the filtered dummy data (default 5 cols)
                handleGenerateCustomFlow(); 
            } else {
                // Load real data immediately
                fetchRealData();
            }
        };
        init();
    }, [product]);

    const fetchRealData = async () => {
        setIsLoading(true);
        try {
            const data = await apiService.getProcessFlow(product.product_name);
            setSopData(data);
            const { nodes: newNodes, edges: newEdges } = convertSopToAnalysisData(data);
            setNodes(newNodes);
            setEdges(newEdges);
            setTimeout(() => fitView({ padding: 0.2 }), 100);
        } catch (error) {
            console.error("Failed to load process data", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateCustomFlow = () => {
        if (selectedComponents.length < 2) return;
        
        setIsConfigOpen(false);
        setIsLoading(true);

        // Simulate processing delay for effect
        setTimeout(() => {
            const { nodes: newNodes, edges: newEdges } = filterDummyData(selectedComponents);
            setNodes(newNodes as Node[]);
            setEdges(newEdges as Edge[]);
            setIsLoading(false);
            setTimeout(() => fitView({ padding: 0.2 }), 100);
        }, 800);
    };

    const toggleComponent = (type: FlowNodeType) => {
        setSelectedComponents(prev => {
            if (prev.includes(type)) {
                return prev.filter(t => t !== type);
            } else {
                return [...prev, type];
            }
        });
    };

    const isSelected = (type: FlowNodeType) => selectedComponents.includes(type);
    const getOrder = (type: FlowNodeType) => selectedComponents.indexOf(type) + 1;

    return (
        <div className="flex h-full w-full bg-slate-50 relative overflow-hidden">
            
            {/* Header Overlay */}
            <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={onBack}
                        className="bg-white p-2.5 rounded-full shadow-md border border-slate-200 text-slate-600 hover:text-fab-royal transition-colors group"
                    >
                        <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
                    </button>
                    <div className="bg-white px-4 py-2.5 rounded-full shadow-md border border-slate-200 flex items-center gap-3">
                        <span className="text-sm font-bold text-fab-navy">{product.product_name}</span>
                        <div className="h-4 w-px bg-slate-200"></div>
                        <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                            <LayoutDashboard size={14} /> Process Analysis
                        </span>
                    </div>
                </div>
            </div>

            {/* Customizer Button */}
            <div className="absolute top-4 right-4 z-20">
                <button 
                    onClick={() => setIsConfigOpen(true)}
                    className="bg-fab-royal text-white px-4 py-2.5 rounded-full shadow-lg hover:bg-fab-blue transition-all flex items-center gap-2 text-sm font-bold"
                >
                    <Settings2 size={16} />
                    Customize View
                </button>
            </div>

            {/* Config Modal */}
            {isConfigOpen && (
                <div className="absolute top-16 right-4 z-30 bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 w-80 animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Grid size={16} className="text-fab-royal" />
                        Analysis Columns
                    </h3>
                    
                    <div className="space-y-2 mb-6">
                        {[
                            { id: 'process', label: 'L2 Process', desc: 'Process Step Name' },
                            { id: 'data', label: 'Data Consumed', desc: 'Inputs & Documents' },
                            { id: 'risk', label: 'Risks', desc: 'Operational Risks' },
                            { id: 'control', label: 'Controls', desc: 'Mitigation Steps' },
                            { id: 'output', label: 'Data Produced', desc: 'Outputs & Records' }
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => toggleComponent(item.id as FlowNodeType)}
                                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                                    isSelected(item.id as FlowNodeType) 
                                    ? 'bg-blue-50 border-blue-200 shadow-sm' 
                                    : 'bg-slate-50 border-slate-100 hover:bg-slate-100'
                                }`}
                            >
                                <div className="text-left">
                                    <p className={`text-xs font-bold ${isSelected(item.id as FlowNodeType) ? 'text-blue-700' : 'text-slate-600'}`}>{item.label}</p>
                                    <p className="text-[10px] text-slate-400">{item.desc}</p>
                                </div>
                                {isSelected(item.id as FlowNodeType) ? (
                                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-bold">
                                        {getOrder(item.id as FlowNodeType)}
                                    </div>
                                ) : (
                                    <div className="w-6 h-6 rounded-full border-2 border-slate-200"></div>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        <button 
                            onClick={() => setIsConfigOpen(false)}
                            className="flex-1 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleGenerateCustomFlow}
                            disabled={selectedComponents.length < 2}
                            className="flex-[2] py-2 bg-fab-royal text-white rounded-lg text-xs font-bold hover:bg-fab-blue transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <Play size={14} fill="currentColor" />
                            Generate View
                        </button>
                    </div>
                </div>
            )}

            {/* Loading Overlay */}
            {isLoading && (
                <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
                    <Loader2 size={40} className="text-fab-royal animate-spin mb-4" />
                    <p className="text-slate-600 font-medium">Analyzing Process Data...</p>
                </div>
            )}

            {/* Main Canvas */}
            <div className="flex-1 h-full">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    fitView
                    minZoom={0.1}
                    maxZoom={2}
                    attributionPosition="bottom-right"
                >
                    <Background color="#e2e8f0" gap={24} size={2} />
                </ReactFlow>
            </div>

            {/* Footer Legend */}
            <div className="absolute bottom-6 left-6 z-20 flex gap-4 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-sm border border-slate-200">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-50 border border-blue-500"></div>
                    <span className="text-[10px] font-bold text-slate-600">Process</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-50 border border-slate-400 border-dashed"></div>
                    <span className="text-[10px] font-bold text-slate-600">Data Consumed</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-50 border-l-4 border-l-rose-500 border border-rose-200"></div>
                    <span className="text-[10px] font-bold text-slate-600">Risk</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-50 border-l-4 border-l-emerald-500 border border-emerald-200"></div>
                    <span className="text-[10px] font-bold text-slate-600">Control</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-violet-50 border-l-4 border-l-violet-500 border border-violet-200"></div>
                    <span className="text-[10px] font-bold text-slate-600">Data Produced</span>
                </div>
            </div>
        </div>
    );
};

const ProcessAnalysisPage: React.FC<ProcessAnalysisPageProps> = (props) => (
    <ReactFlowProvider>
        <ProcessAnalysisContent {...props} />
    </ReactFlowProvider>
);

export default ProcessAnalysisPage;
