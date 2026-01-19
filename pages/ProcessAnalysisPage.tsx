
import React, { useEffect, useState, useMemo } from 'react';
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

    // Custom Flow Config State - Added 'output' by default
    const [selectedComponents, setSelectedComponents] = useState<FlowNodeType[]>(['process', 'data', 'risk', 'control', 'output']);

    useEffect(() => {
        const init = async () => {
            // Check if this is the dummy product
            if (product.id === 'dummy-analysis' || product.product_name.includes('Analysis Demo')) {
                // For demo: Load full dummy view immediately so the background is populated
                const { nodes: dummyNodes, edges: dummyEdges } = filterDummyData(['process', 'data', 'risk', 'control', 'output']);
                setNodes(dummyNodes as Node[]);
                setEdges(dummyEdges as Edge[]);
                setTimeout(() => fitView({ padding: 0.2 }), 100);
                
                // Then open the config modal to allow customization
                setIsConfigOpen(true);
            } else {
                // Load real data immediately for normal products
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

        // Simulate processing delay for effect (No API Call)
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
                // Add to end to preserve selection order if we want ordered selection
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
                        className="bg-white text-slate-500 hover:text-fab-royal hover:bg-slate-50 shadow-md border border-slate-200 rounded-full py-2.5 px-4 flex items-center gap-2 transition-all group"
                        title="Back to List"
                    >
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-xs font-bold hidden md:inline">Back</span>
                    </button>
                    <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3">
                        <div>
                            <h2 className="text-sm font-bold text-fab-navy">{product.product_name}</h2>
                            <p className="text-[10px] text-slate-500 uppercase tracking-wide">Process Lineage Analysis</p>
                        </div>
                        {/* Re-open Config Button */}
                        {(product.id === 'dummy-analysis' || product.product_name.includes('Analysis Demo')) && !isConfigOpen && (
                            <button 
                                onClick={() => setIsConfigOpen(true)}
                                className="p-1.5 bg-slate-100 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded-lg transition-colors border border-slate-200"
                                title="Configure Flow"
                            >
                                <Settings2 size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="absolute bottom-6 left-6 z-30 pointer-events-none">
                <div className="bg-white/90 backdrop-blur border border-slate-200 shadow-lg rounded-xl p-3 flex flex-col gap-2 pointer-events-auto">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-100 pb-1 mb-1">
                        <Info size={12} /> Legend
                    </div>
                    {selectedComponents.includes('process') && (
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-blue-50 border border-blue-500"></div>
                            <span className="text-[10px] font-medium text-slate-600">L2 Process Step</span>
                        </div>
                    )}
                    {selectedComponents.includes('data') && (
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-slate-50 border border-dashed border-slate-400"></div>
                            <span className="text-[10px] font-medium text-slate-600">Data Inputs</span>
                        </div>
                    )}
                    {selectedComponents.includes('risk') && (
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-rose-50 border border-rose-500 border-l-4"></div>
                            <span className="text-[10px] font-medium text-slate-600">Risks</span>
                        </div>
                    )}
                    {selectedComponents.includes('control') && (
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-emerald-50 border border-emerald-500 border-l-4"></div>
                            <span className="text-[10px] font-medium text-slate-600">Controls</span>
                        </div>
                    )}
                    {selectedComponents.includes('output') && (
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-violet-50 border border-violet-500 border-l-4"></div>
                            <span className="text-[10px] font-medium text-slate-600">Data Produced</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Config Modal */}
            {isConfigOpen && (
                <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-white/20 animate-in zoom-in-95 duration-300">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-fab-royal text-white rounded-lg shadow-md shadow-fab-royal/20">
                                    <Grid size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800">Generate Custom Flow</h3>
                                    <p className="text-xs text-slate-500 font-medium">Select & Arrange components to visualize.</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { id: 'process', label: 'Process Steps', desc: 'Core workflow actions' },
                                    { id: 'data', label: 'Data Inputs', desc: 'Information collected' },
                                    { id: 'risk', label: 'Risks', desc: 'Hazards & compliance' },
                                    { id: 'control', label: 'Controls', desc: 'Mitigation logic' },
                                    { id: 'output', label: 'Data Produced', desc: 'Outputs & records' }
                                ].map((item) => {
                                    const active = isSelected(item.id as FlowNodeType);
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => toggleComponent(item.id as FlowNodeType)}
                                            className={`relative p-4 rounded-xl border-2 text-left transition-all group ${
                                                active 
                                                ? 'border-fab-royal bg-blue-50/50 shadow-sm' 
                                                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                                            }`}
                                        >
                                            {active && (
                                                <div className="absolute top-2 right-2 w-6 h-6 bg-fab-royal text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm animate-in zoom-in">
                                                    {getOrder(item.id as FlowNodeType)}
                                                </div>
                                            )}
                                            <div className={`font-bold mb-1 ${active ? 'text-fab-royal' : 'text-slate-700'}`}>{item.label}</div>
                                            <div className="text-[10px] text-slate-500 leading-tight">{item.desc}</div>
                                        </button>
                                    );
                                })}
                            </div>
                            
                            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-100 rounded-lg text-amber-800 text-xs">
                                <Info size={16} className="shrink-0" />
                                <p>Select at least <strong>2 components</strong>. The flow will be generated in the order of your selection.</p>
                            </div>
                        </div>

                        <div className="p-5 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                            <button 
                                onClick={onBack}
                                className="px-5 py-2.5 text-slate-500 font-bold text-sm hover:bg-white hover:shadow-sm rounded-xl transition-all"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleGenerateCustomFlow}
                                disabled={selectedComponents.length < 2}
                                className="px-6 py-2.5 bg-fab-royal text-white rounded-xl font-bold text-sm shadow-lg shadow-fab-royal/25 hover:bg-fab-blue hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
                            >
                                <Play size={16} fill="currentColor" />
                                Render Flow
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Canvas */}
            <div className="flex-1 h-full relative z-0">
                {isLoading && (
                    <div className="absolute inset-0 z-40 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in">
                        <Loader2 className="w-12 h-12 text-fab-royal animate-spin mb-4" />
                        <p className="text-lg font-bold text-slate-700">Generating Analysis Flow...</p>
                        <p className="text-xs text-slate-500 mt-1">Applying custom layout filters</p>
                    </div>
                )}
                
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    fitView
                    minZoom={0.1}
                    maxZoom={1.5}
                    attributionPosition="bottom-right"
                >
                    <Background color="#cbd5e1" gap={30} size={1} />
                </ReactFlow>
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
