
import React, { useEffect, useState } from 'react';
import { ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';
import ChatAssistant from '../components/ChatAssistant';
import { Product, SopResponse } from '../types';
import { apiService } from '../services/apiService';

interface ProcessLineagePageProps {
    product: Product;
    onBack: () => void;
}

// DUMMY DATA FOR POLICY STANDARDS
const DUMMY_POLICY_SOP: SopResponse = {
    startNode: { stepId: 'START', stepName: 'Effective Date', description: '01/01/2025', actor: 'Policy Owner', stepType: 'Start', nextStep: 'S1' },
    endNode: { stepId: 'END', stepName: 'Review Date', description: '31/12/2025', actor: 'Compliance', stepType: 'End', nextStep: null },
    processDefinition: { 
        title: "Group Information Security Policy", 
        version: "3.0", 
        classification: "Internal / Confidential", 
        documentLink: "#" 
    },
    processObjectives: [
        { description: "Define the information security framework." },
        { description: "Protect bank information assets from threats." }
    ],
    inherentRisks: [
        { riskId: "R-SEC-01", riskType: "Data Leakage", description: "Unauthorized transmission of sensitive data.", category: "Security" },
        { riskId: "R-SEC-02", riskType: "Unauth Access", description: "Access to systems without approval.", category: "Security" }
    ],
    processFlow: { 
        stages: [
            {
                stageId: "S1",
                stageName: "Policy Governance",
                description: "Governance structure.",
                steps: []
            }
        ]
    },
    metadata: { 
        index_name: "policy-index", 
        product_name: "Group Info Sec Policy",
        suggested_questions: [
            "What is the data classification policy?",
            "How do I report a security incident?",
            "What are the password requirements?",
            "Who approves access to critical systems?"
        ]
    }
};

const POLICY_WELCOME_MSG = `### Policy Standards Assistant
Welcome to the Policy Standards AI.

I can assist you with:
- **Policy Queries**: Ask about specific clauses or rules.
- **Compliance Checks**: Verify procedures against standards.
- **Risk Mapping**: Identify risks associated with policies.

*This session is using a simulated policy context for demonstration.*`;

const ProcessLineagePage: React.FC<ProcessLineagePageProps> = ({ product, onBack }) => {
    const [sopData, setSopData] = useState<SopResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate a brief loading state for UX, then load dummy data
        const timer = setTimeout(() => {
            setSopData(DUMMY_POLICY_SOP);
            setIsLoading(false);
        }, 800);
        return () => clearTimeout(timer);
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
                        <p className="text-sm font-medium text-slate-600">Initializing Policy Context...</p>
                    </div>
                ) : sopData ? (
                    <div className="h-full w-full">
                        <ChatAssistant 
                            sopData={sopData}
                            onClose={onBack}
                            productContext={product}
                            isMaximized={true} // Force maximized styling if supported
                            welcomeMessage={POLICY_WELCOME_MSG}
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
