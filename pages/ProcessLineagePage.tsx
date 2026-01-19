
import React, { useEffect, useState } from 'react';
import { ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';
import ChatAssistant from '../components/ChatAssistant';
import { Product, SopResponse } from '../types';
import { apiService } from '../services/apiService';

interface ProcessLineagePageProps {
    product: Product;
    onBack: () => void;
}

const ProcessLineagePage: React.FC<ProcessLineagePageProps> = ({ product, onBack }) => {
    const [sopData, setSopData] = useState<SopResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchContext = async () => {
            setIsLoading(true);
            try {
                // Try fetching real flow data for context
                const flowData = await apiService.getProcessFlow(product.product_name);
                setSopData(flowData);
            } catch (e) {
                console.warn("Could not fetch detailed flow for lineage chat, using fallback context.", e);
                // Fallback context if flow doesn't exist yet, essential for chat to work
                setSopData({
                    startNode: { stepId: 'START', stepName: 'Start', description: 'Start', actor: 'System', stepType: 'Start', nextStep: null },
                    endNode: { stepId: 'END', stepName: 'End', description: 'End', actor: 'System', stepType: 'End', nextStep: null },
                    processDefinition: { title: product.product_name, version: '1.0', classification: 'N/A', documentLink: '#' },
                    processObjectives: [],
                    inherentRisks: [],
                    processFlow: { stages: [] },
                    metadata: { index_name: product.index_name, product_name: product.product_name }
                } as any);
            } finally {
                setIsLoading(false);
            }
        };
        fetchContext();
    }, [product]);

    return (
        <div className="flex h-full w-full bg-slate-50 flex-col">
            {/* Header */}
            <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between shadow-sm z-10 shrink-0">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={onBack}
                        className="p-2 text-slate-500 hover:text-fab-royal hover:bg-slate-50 rounded-full transition-all border border-transparent hover:border-slate-200"
                        title="Back to Product List"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-lg font-bold text-fab-navy flex items-center gap-2">
                            <ShieldCheck size={20} className="text-fab-royal" />
                            Policy Standards
                        </h2>
                        <p className="text-xs text-slate-500 font-medium">AI-Powered Policy Assistant for <span className="font-bold text-slate-700">{product.product_name}</span></p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 relative overflow-hidden">
                {isLoading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm">
                        <Loader2 className="w-10 h-10 text-fab-royal animate-spin mb-3" />
                        <p className="text-sm font-medium text-slate-600">Initializing Context...</p>
                    </div>
                ) : sopData ? (
                    <div className="h-full w-full">
                        {/* We reuse ChatAssistant but in a full-page context. 
                            We pass onClose as onBack to handle the close button inside the chat header if used. */}
                        <ChatAssistant 
                            sopData={sopData}
                            onClose={onBack}
                            productContext={product}
                            isMaximized={true} // Force maximized styling if supported
                        />
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-slate-400">
                        <p>Failed to load context.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProcessLineagePage;
