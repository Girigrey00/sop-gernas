
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
    Upload, FileText, Search, Edit3, Trash2, 
    Square, X, RefreshCw, FileStack, Plus, Loader2,
    Activity, GitMerge, Bot
} from 'lucide-react';
import { LibraryDocument, SopResponse, Product } from '../types';
import { apiService } from '../services/apiService';

interface LibraryPageProps {
    onOpenSop?: (data: SopResponse) => void;
    initialUploadOpen?: boolean;
    onCloseInitialUpload?: () => void;
    preselectedProduct?: Product | null;
}

const LibraryPage: React.FC<LibraryPageProps> = ({ 
    onOpenSop, 
    initialUploadOpen = false, 
    onCloseInitialUpload,
    preselectedProduct 
}) => {
    const [documents, setDocuments] = useState<LibraryDocument[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // Modal States
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    
    // Upload State
    const [sopFile, setSopFile] = useState<File | null>(null);
    const [llmFiles, setLlmFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    
    // Metadata State
    const [productName, setProductName] = useState('');
    const [category, setCategory] = useState('Policy');

    const sopInputRef = useRef<HTMLInputElement>(null);
    const llmInputRef = useRef<HTMLInputElement>(null);

    // Handle Initial Open Prop
    useEffect(() => {
        if (initialUploadOpen) {
            setIsUploadModalOpen(true);
        }
    }, [initialUploadOpen]);

    // Handle Preselected Product
    useEffect(() => {
        if (preselectedProduct) {
            setProductName(preselectedProduct.product_name);
        } else {
            if(!isUploadModalOpen) setProductName(''); // Only reset if modal closed
        }
    }, [preselectedProduct, isUploadModalOpen]);

    // Fetch documents function
    const fetchDocuments = useCallback(async (isPolling = false) => {
        if (!isPolling) setIsLoading(true);
        try {
            const docs = await apiService.getDocuments();
            setDocuments(docs);
        } catch (error) {
            console.error("Failed to fetch documents", error);
        } finally {
            if (!isPolling) setIsLoading(false);
        }
    }, []);

    // Initial Load
    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    // Automatic Polling System
    // Checks status every 3s if active, or 10s if idle to keep list updated
    useEffect(() => {
        // Determine if we have any active tasks requiring fast updates
        const hasActiveDocs = documents.some(d => 
            d.status === 'Processing' || d.status === 'Uploading' || d.status === 'Draft'
        );

        const intervalDelay = hasActiveDocs ? 3000 : 10000;

        const timer = setInterval(() => {
            fetchDocuments(true);
        }, intervalDelay);

        return () => clearInterval(timer);
    }, [documents, fetchDocuments]);

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
        if (!preselectedProduct) setProductName(''); // Reset unless passed
        setIsUploadModalOpen(false);
        if (onCloseInitialUpload) onCloseInitialUpload();
    };

    const handleEdit = (doc: LibraryDocument) => {
        // Dummy action as requested
        console.log("Edit action (Dummy) triggered for:", doc.documentName);
    };

    const handleUploadAll = async () => {
        if (!sopFile && llmFiles.length === 0) return;

        setIsUploading(true);
        try {
            // Priority: Preselected Product -> Input State -> Default
            const rootFolder = preselectedProduct ? preselectedProduct.product_name : (productName || "PIL");
            const targetIndex = preselectedProduct ? preselectedProduct.index_name : "cbgknowledgehub";

            // 1. Upload SOP File (for Flow Generation)
            if (sopFile) {
                const metadata = {
                    category: category,
                    Root_Folder: rootFolder, 
                    Linked_App: "cbgknowledgehub",
                    is_financial: "false", // Explicitly "false" string per requirement
                    target_index: targetIndex,
                    generate_flow: true, // Boolean
                    productId: productName, // Frontend tracking
                    sopName: sopFile.name.replace(/\.[^/.]+$/, "")
                };
                await apiService.uploadDocument(sopFile, metadata);
            }

            // 2. Upload LLM Files (for RAG/Chat)
            if (llmFiles.length > 0) {
                for (const file of llmFiles) {
                    const metadata = {
                        category: "KnowledgeBase",
                        Root_Folder: rootFolder,
                        Linked_App: "cbgknowledgehub",
                        is_financial: "false", // Explicitly "false" string per requirement
                        target_index: targetIndex,
                        generate_flow: false, // Boolean
                        description: 'Supporting Knowledge Base Document'
                    };
                    await apiService.uploadDocument(file, metadata);
                }
            }
            
            // Refresh list immediately - this will trigger the useEffect to see 'Processing' status and start fast polling
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
        // Dummy action as requested
        console.log("Delete action (Dummy) triggered for:", id);
    };

    // --- Render ---

    const filteredDocuments = documents.filter(doc => 
        doc.documentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.rootFolder && doc.rootFolder.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="h-full flex flex-col bg-slate-50 relative">
            
            {/* Header */}
            <div className="px-8 py-6 bg-white border-b border-slate-200 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-fab-navy mb-1">Document Library</h2>
                    <p className="text-slate-500 text-sm">Manage source documents, monitor uploads, and re-process files.</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => fetchDocuments()} 
                        className="p-2 text-slate-400 hover:text-fab-royal hover:bg-slate-50 rounded-lg transition-colors"
                        title="Refresh List"
                    >
                        <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
                    </button>
                    <button 
                        onClick={() => {
                             setProductName('PIL-CONV-001'); // Default if not editing
                             setIsUploadModalOpen(true);
                        }}
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
                        placeholder="Search by Document Name or Product (Root Folder)..." 
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
                                <th className="p-4">Product Name</th>
                                <th className="p-4">Category</th>
                                <th className="p-4">Document</th>
                                <th className="p-4 text-center">Pages</th>
                                <th className="p-4">Upload Info</th>
                                <th className="p-4 min-w-[240px]">Status & Progress</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredDocuments.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="p-10 text-center text-slate-400 text-sm">
                                        No documents found. Upload a file to get started.
                                    </td>
                                </tr>
                            ) : (
                                filteredDocuments.map((doc) => (
                                    <tr key={doc.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="p-4 text-center">
                                            <Square size={16} className="text-slate-300 mx-auto group-hover:text-slate-400 cursor-pointer" />
                                        </td>
                                        <td className="p-4">
                                            {/* Root Folder as Product Name */}
                                            <p className="text-sm font-bold text-fab-navy">{doc.rootFolder || 'Unassigned'}</p>
                                        </td>
                                        <td className="p-4">
                                            {/* Category Display */}
                                            <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full border ${
                                                doc.categoryDisplay === 'SOP FLOW' 
                                                ? 'bg-purple-50 text-purple-600 border-purple-100'
                                                : doc.categoryDisplay === 'Process Definition'
                                                ? 'bg-indigo-50 text-indigo-600 border-indigo-100'
                                                : 'bg-slate-100 text-slate-500 border-slate-200'
                                            }`}>
                                                {doc.categoryDisplay || 'General'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <FileText size={16} className="text-slate-400" />
                                                <span className="text-sm text-slate-700 truncate max-w-[180px]" title={doc.documentName}>
                                                    {doc.documentName}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center text-sm font-mono text-slate-600">
                                            {doc.totalPages || doc.pageCount || 0}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="text-xs text-slate-600 font-medium">{doc.uploadedBy}</span>
                                                <span className="text-[10px] text-slate-400">{doc.uploadedDate}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                             <div className="flex flex-col gap-2">
                                                {/* Status Badge */}
                                                <div className="flex items-center justify-between">
                                                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full border flex items-center gap-1 w-fit ${
                                                        doc.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                        (doc.status === 'Processing' || doc.status === 'Uploading') ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                        doc.status === 'Failed' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                                        'bg-slate-100 text-slate-500 border-slate-200'
                                                    }`}>
                                                        {(doc.status === 'Processing' || doc.status === 'Uploading') && <RefreshCw size={10} className="animate-spin" />}
                                                        {doc.status || 'Unknown'}
                                                    </span>
                                                    {(doc.status === 'Processing' || doc.status === 'Uploading') && (
                                                        <span className="text-[10px] font-mono text-blue-600 font-bold">{doc.progressPercentage}%</span>
                                                    )}
                                                </div>

                                                {/* Progress Bar (Only if active) */}
                                                {(doc.status === 'Processing' || doc.status === 'Uploading') && (
                                                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                                                        <div 
                                                            className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                                            style={{ width: `${doc.progressPercentage || 5}%` }}
                                                        ></div>
                                                    </div>
                                                )}

                                                {/* Latest Log Message - Continuous Updates */}
                                                <div className="h-5 overflow-hidden">
                                                    {doc.latestLog ? (
                                                        <p className="text-[10px] text-slate-500 italic truncate animate-pulse" title={doc.latestLog}>
                                                            <Activity size={10} className="inline mr-1 text-slate-400" />
                                                            {doc.latestLog}
                                                        </p>
                                                    ) : (
                                                        <span className="text-[10px] text-slate-300">-</span>
                                                    )}
                                                </div>
                                             </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => handleEdit(doc)}
                                                    className="p-1.5 text-slate-400 hover:text-fab-royal hover:bg-fab-royal/10 rounded transition-colors"
                                                    title="Re-Upload / Edit (Dummy)"
                                                >
                                                    <Edit3 size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(doc.id)}
                                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                                    title="Delete (Dummy)"
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
                                {productName ? `Edit / Update ${productName}` : 'Upload New Documents'}
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
                                            <label className="text-xs font-bold text-slate-500 uppercase">Product ID / Root Folder</label>
                                            <input 
                                                type="text" 
                                                value={productName}
                                                onChange={(e) => setProductName(e.target.value)}
                                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-sm focus:border-fab-royal/50 outline-none disabled:bg-slate-100 disabled:text-slate-500"
                                                disabled={!!preselectedProduct}
                                                placeholder="e.g. PIL-CONV-001"
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
                                        <p className="text-[10px] text-emerald-600 mt-1">* Recommended: Upload both SOP and KB files for best results.</p>
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
                                        {productName && documents.some(d => d.rootFolder === productName) ? 'Re-Process / Update' : 'Start Ingestion'}
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
