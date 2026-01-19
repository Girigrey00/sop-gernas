
import React, { useEffect, useState } from 'react';
import { ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';
import PolicyChat from '../components/PolicyChat';
import { Product, SopResponse } from '../types';

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
        <div className="flex h-full w-full bg-slate-50 flex-col relative">
            
            {/* Absolute Back Button for Cleaner Full-Screen Look */}
            <div className="absolute top-4 left-4 z-20">
                <button 
                    onClick={onBack}
                    className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-500 hover:text-fab-royal px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all text-sm font-bold"
                >
                    <ArrowLeft size={16} />
                    Back
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 relative overflow-hidden">
                {isLoading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white">
                        <Loader2 className="w-12 h-12 text-fab-royal animate-spin mb-4" />
                        <p className="text-lg font-medium text-slate-600">Loading Policy Context...</p>
                    </div>
                ) : sopData ? (
                    <PolicyChat 
                        sopData={sopData}
                        productContext={product}
                    />
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
