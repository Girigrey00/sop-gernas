
import React, { useEffect, useState, useMemo } from 'react';
import ReactFlow, { 
    Background, 
    useNodesState, 
    useEdgesState, 
    ReactFlowProvider,
    useReactFlow
} from 'reactflow';
import { LayoutDashboard, ArrowLeft, Loader2, Info } from 'lucide-react';
import { SopResponse, Product } from '../types';
import { apiService } from '../services/apiService';
import { convertSopToAnalysisData } from '../utils/analysisUtils';

interface ProcessAnalysisPageProps {
    product: Product;
    onBack: () => void;
}

const ProcessAnalysisContent: React.FC<ProcessAnalysisPageProps> = ({ product, onBack }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [sopData, setSopData] = useState<SopResponse | null>(null);
    const { fitView } = useReactFlow();

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const data = await apiService.getProcessFlow(product.product_name);
                setSopData(data);
                const { nodes: newNodes, edges: newEdges } = convertSopToAnalysisData(data);
                setNodes(newNodes);
                setEdges(newEdges);
                
                setTimeout(() => {
                    fitView({ padding: 0.2 });
                }, 100);
            } catch (error) {
                console.error("Failed to load process data", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [product, fitView, setNodes, setEdges]);

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
                    <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-xl shadow-sm border border-slate-200">
                        <h2 className="text-sm font-bold text-fab-navy">{product.product_name}</h2>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wide">Risk & Control Analysis</p>
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="absolute bottom-6 left-6 z-30">
                <div className="bg-white/90 backdrop-blur border border-slate-200 shadow-lg rounded-xl p-3 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-100 pb-1 mb-1">
                        <Info size={12} /> Legend
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-blue-50 border border-blue-500"></div>
                        <span className="text-[10px] font-medium text-slate-600">L2 Process Step</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-slate-50 border border-dashed border-slate-400"></div>
                        <span className="text-[10px] font-medium text-slate-600">Data Inputs</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-rose-50 border border-rose-500 border-l-4"></div>
                        <span className="text-[10px] font-medium text-slate-600">Risks</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-emerald-50 border border-emerald-500 border-l-4"></div>
                        <span className="text-[10px] font-medium text-slate-600">Controls</span>
                    </div>
                </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 h-full relative z-0">
                {isLoading && (
                    <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
                        <Loader2 className="w-10 h-10 text-fab-royal animate-spin mb-2" />
                        <p className="text-sm font-bold text-slate-600">Analyzing Process Flow...</p>
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
