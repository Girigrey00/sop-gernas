
import React, { useState, useRef, useEffect } from 'react';
import { 
    Upload, FileText, Search, Eye, Trash2, 
    CheckSquare, Square, X, Save, RefreshCw, PlayCircle,
    Bot, GitMerge, FileStack, Plus, Loader2, AlertCircle
} from 'lucide-react';
import { LibraryDocument, SopResponse } from '../types';
import { apiService } from '../services/apiService';

interface LibraryPageProps {
    onOpenSop?: (data: SopResponse) => void;
    initialUploadOpen?: boolean;
    onCloseInitialUpload?: () => void;
}

const LibraryPage: React.FC<LibraryPageProps> = ({ onOpenSop, initialUploadOpen = false, onCloseInitialUpload }) => {
    const [documents, setDocuments] = useState<LibraryDocument[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(false);
    
    // Modal States
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    
    // Upload State
    const [sopFile, setSopFile] = useState<File | null>(null);
    const [llmFiles, setLlmFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    
    // Metadata State
    const [productId, setProductId] = useState('PIL-CONV-001'); // Default/Example
    const [category, setCategory] = useState('Policy');

    const sopInputRef = useRef<HTMLInputElement>(null);
    const llmInputRef = useRef<HTMLInputElement>(null);

    // Handle Initial Open Prop
    useEffect(() => {
        if (initialUploadOpen) {
            setIsUploadModalOpen(true);
        }
    }, [initialUploadOpen]);

    // Fetch documents on load
    const fetchDocuments = async () => {
        setIsLoading(true);
        try {
            const docs = await apiService.getDocuments();
            setDocuments(docs);
        } catch (error) {
            console.error("Failed to fetch documents", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    // --- Actions ---

    const handleSopFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) setSopFile(e.target.files[0]);
    };

    const handleLlmFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            // Convert FileList to Array and append to existing files
            const newFiles = Array.from(e.target.files);
            setLlmFiles(prev => [...prev, ...newFiles]);
        }
    };

    const removeSopFile = () => setSopFile(null);
    const removeLlmFile = (index: number) => {
        setLlmFiles(prev => prev.filter((_, i) => i !== index));
    };

    const resetForm = () => {
        setSopFile(null);
        setLlmFiles([]);
        setProductId('PIL-CONV-001');
        setIsUploadModalOpen(false);
        if (onCloseInitialUpload) onCloseInitialUpload();
    };

    const handleUploadAll = async () => {
        if (!sopFile && llmFiles.length === 0) return;

        setIsUploading(true);
        try {
            // 1. Upload SOP File (for Flow Generation)
            if (sopFile) {
                const metadata = {
                    category: category,
                    Root_Folder: "PIL", 
                    Linked_App: "cbgknowledgehub",
                    target_index: "cbgknowledgehub",
                    generate_flow: true,
                    // Pass specific ID if needed, or let backend handle
                    productId: productId, 
                    sopName: sopFile.name.replace(/\.[^/.]+$/, "")
                };
                await apiService.uploadDocument(sopFile, metadata);
            }

            // 2. Upload LLM Files (for RAG/Chat)
            if (llmFiles.length > 0) {
                for (const file of llmFiles) {
                    const metadata = {
                        category: "KnowledgeBase",
                        Root_Folder: "PIL",
                        Linked_App: "cbgknowledgehub",
                        target_index: "cbgknowledgehub",
                        generate_flow: false,
                        description: 'Supporting Knowledge Base Document'
                    };
                    await apiService.uploadDocument(file, metadata);
                }
            }
            
            // Refresh list
            await fetchDocuments();
            resetForm();
        } catch (error) {
            console.error("Upload failed", error);
            alert("Failed to upload documents. See console for details.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this document?')) {
            try {
                await apiService.deleteDocument(id);
                setDocuments(docs => docs.filter(d => d.id !== id));
            } catch (error) {
                console.error("Delete failed", error);
                alert("Failed to delete document.");
            }
        }
    };

    const handleVisualize = async (doc: LibraryDocument) => {
        // The productId is crucial for fetching the flow
        // Fallback to sopName if productId is missing in metadata
        const targetId = doc.metadata?.productId || doc.sopName;

        if (!targetId) {
            alert("Cannot visualize: Missing Product ID (SOP Name) in document metadata.");
            return;
        }

        if (onOpenSop) {
            setIsLoading(true);
            try {
                // Try to fetch flow
                const flowData = await apiService.getProcessFlow('ProcessHub', targetId);
                onOpenSop(flowData);
            } catch (e) {
                console.error("Error fetching flow", e);
                alert(`Could not load Process Flow for ID: ${targetId}. It might still be processing.`);
            } finally {
                setIsLoading(false);
            }
        }
    };

    // --- Render ---

    const filteredDocuments = documents.filter(doc => 
        doc.documentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.sopName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="h-full flex flex-col bg-slate-50 relative">
            
            {/* Header */}
            <div className="px-8 py-6 bg-white border-b border-slate-200 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-fab-navy mb-1">Document Library</h2>
                    <p className="text-slate-500 text-sm">Manage source documents and knowledge base assets.</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={fetchDocuments} 
                        className="p-2 text-slate-400 hover:text-fab-royal hover:bg-slate-50 rounded-lg transition-colors"
                        title="Refresh List"
                    >
                        <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
                    </button>
                    <button 
                        onClick={() => setIsUploadModalOpen(true)}
                        className="px-4 py-2 bg-fab-royal text-white rounded-lg text-sm font-bold shadow-lg shadow-fab-royal/20 hover:bg-fab-blue transition-all flex items-center gap-2"
                    >
                        <Upload size={16} />
                        Upload New
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="px-8 py-4 bg-slate-50 border-b border-slate-200/50">
                <div className="relative max-w-lg">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search documents by name or ID..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-fab-royal/30 text-sm"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto px-8 py-4">
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                                <th className="p-4 w-10 text-center">
                                    <Square size={16} className="text-slate-300 mx-auto" />
                                </th>
                                <th className="p-4">Document Name</th>
                                <th className="p-4">Category</th>
                                <th className="p-4">Upload Date</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredDocuments.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-10 text-center text-slate-400 text-sm">
                                        No documents found. Upload a file to get started.
                                    </td>
                                </tr>
                            ) : (
                                filteredDocuments.map((doc) => (
                                    <tr key={doc.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="p-4 text-center">
                                            {/* Selection Logic Placeholder */}
                                            <Square size={16} className="text-slate-300 mx-auto group-hover:text-slate-400 cursor-pointer" />
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                                    <FileText size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-700">{doc.documentName}</p>
                                                    <p className="text-xs text-slate-400">{doc.sopName || 'No Product ID'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase rounded-full border border-slate-200">
                                                {doc.metadata?.category || 'General'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-slate-500">
                                            {doc.uploadedDate}
                                        </td>
                                        <td className="p-4">
                                             <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full border flex items-center gap-1 w-fit ${
                                                doc.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                doc.status === 'Processing' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                doc.status === 'Failed' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                                'bg-slate-100 text-slate-500 border-slate-200'
                                             }`}>
                                                {doc.status === 'Processing' && <RefreshCw size={10} className="animate-spin" />}
                                                {doc.status || 'Unknown'}
                                             </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {doc.metadata?.generate_flow !== false && (
                                                    <button 
                                                        onClick={() => handleVisualize(doc)}
                                                        className="p-1.5 text-slate-400 hover:text-fab-royal hover:bg-fab-royal/10 rounded transition-colors"
                                                        title="Visualize Flow"
                                                    >
                                                        <GitMerge size={16} />
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => handleDelete(doc.id)}
                                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Upload Modal */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-lg text-fab-navy flex items-center gap-2">
                                <Upload size={20} className="text-fab-royal" />
                                Upload Documents
                            </h3>
                            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 overflow-y-auto space-y-8">
                            
                            {/* Section 1: SOP Flow Generation */}
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-fab-royal/10 text-fab-royal rounded-lg mt-1">
                                        <GitMerge size={20} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-800">SOP Source File (Process Flow)</h4>
                                        <p className="text-xs text-slate-500">Upload the main policy/procedure document to generate the workflow.</p>
                                    </div>
                                </div>
                                
                                <div className="pl-12 space-y-3">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-500 uppercase">Product ID / Name</label>
                                            <input 
                                                type="text" 
                                                value={productId}
                                                onChange={(e) => setProductId(e.target.value)}
                                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-sm focus:border-fab-royal/50 outline-none"
                                            />
                                        </div>
                                         <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-500 uppercase">Category</label>
                                            <select 
                                                value={category}
                                                onChange={(e) => setCategory(e.target.value)}
                                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-sm focus:border-fab-royal/50 outline-none"
                                            >
                                                <option value="Policy">Policy</option>
                                                <option value="Procedure">Procedure</option>
                                                <option value="Manual">Manual</option>
                                            </select>
                                        </div>
                                    </div>

                                    {!sopFile ? (
                                        <div 
                                            onClick={() => sopInputRef.current?.click()}
                                            className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-fab-royal/50 hover:bg-fab-royal/5 transition-all group"
                                        >
                                            <Upload size={24} className="text-slate-300 group-hover:text-fab-royal mb-2" />
                                            <p className="text-sm font-medium text-slate-600 group-hover:text-fab-royal">Click to upload SOP document</p>
                                            <p className="text-xs text-slate-400">Supported: DOCX, PDF</p>
                                            <input 
                                                type="file" 
                                                ref={sopInputRef}
                                                onChange={handleSopFileChange}
                                                accept=".pdf,.docx,.doc,.txt"
                                                className="hidden"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between p-3 bg-fab-royal/5 border border-fab-royal/20 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <FileText size={20} className="text-fab-royal" />
                                                <span className="text-sm font-medium text-fab-navy truncate max-w-[200px]">{sopFile.name}</span>
                                            </div>
                                            <button onClick={removeSopFile} className="text-slate-400 hover:text-rose-500">
                                                <X size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="border-t border-slate-100"></div>

                            {/* Section 2: Knowledge Base Files */}
                            <div className="space-y-4">
                                 <div className="flex items-start gap-3">
                                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg mt-1">
                                        <Bot size={20} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-800">Knowledge Base Files (RAG)</h4>
                                        <p className="text-xs text-slate-500">Additional documents for the AI Chatbot context.</p>
                                    </div>
                                </div>

                                <div className="pl-12">
                                     <div 
                                        onClick={() => llmInputRef.current?.click()}
                                        className="border border-slate-200 rounded-lg p-3 flex items-center gap-3 cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/50 transition-all mb-3"
                                    >
                                        <Plus size={18} className="text-emerald-500" />
                                        <span className="text-sm font-medium text-slate-600">Add Supporting Documents</span>
                                        <input 
                                            type="file" 
                                            ref={llmInputRef}
                                            onChange={handleLlmFileChange}
                                            accept=".pdf,.docx,.doc,.txt"
                                            multiple
                                            className="hidden"
                                        />
                                    </div>

                                    {llmFiles.length > 0 && (
                                        <div className="space-y-2 max-h-32 overflow-y-auto">
                                            {llmFiles.map((file, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-100 rounded text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <FileStack size={14} className="text-slate-400" />
                                                        <span className="text-slate-700 truncate max-w-[200px]">{file.name}</span>
                                                    </div>
                                                    <button onClick={() => removeLlmFile(idx)} className="text-slate-400 hover:text-rose-500">
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                            <button 
                                onClick={resetForm}
                                className="px-4 py-2 text-slate-600 font-bold text-sm hover:bg-slate-200 rounded-lg transition-colors"
                                disabled={isUploading}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleUploadAll}
                                disabled={isUploading || (!sopFile && llmFiles.length === 0)}
                                className="px-6 py-2 bg-fab-royal text-white rounded-lg font-bold text-sm shadow-lg shadow-fab-royal/20 hover:bg-fab-blue hover:scale-105 transition-all disabled:opacity-70 disabled:scale-100 flex items-center gap-2"
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Upload size={16} />
                                        Start Ingestion
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LibraryPage;
