
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
    Upload, FileText, Search, Edit3, Trash2, 
    Square, X, FileStack, Plus, Loader2,
    GitMerge, Bot, Calendar, User, RefreshCw, ArrowLeft, Activity,
    AlertTriangle 
} from 'lucide-react';
import { LibraryDocument, SopResponse, Product } from '../types';
import { apiService } from '../services/apiService';

interface LibraryPageProps {
    onOpenSop?: (data: SopResponse) => void;
    initialUploadOpen?: boolean;
    onCloseInitialUpload?: () => void;
    preselectedProduct?: Product | null;
    onBack?: () => void;
    onViewFlow?: () => void;
    onNotification?: (msg: string, type: 'success' | 'error') => void;
}

const LibraryPage: React.FC<LibraryPageProps> = ({ 
    initialUploadOpen = false, 
    onCloseInitialUpload,
    preselectedProduct,
    onBack,
    onViewFlow,
    onNotification
}) => {
    const [documents, setDocuments] = useState<LibraryDocument[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal States
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    
    // Upload State
    const [sopFile, setSopFile] = useState<File | null>(null);
    const [llmFiles, setLlmFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    
    // Delete Confirmation State
    const [docToDelete, setDocToDelete] = useState<LibraryDocument | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    
    // Metadata State
    const [productName, setProductName] = useState('');

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
    const fetchDocuments = useCallback(async () => {
        try {
            const docs = await apiService.getDocuments();
            setDocuments(docs);
        } catch (error) {
            console.error("Failed to fetch documents", error);
        }
    }, []);

    // Initial Load
    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    // Automatic Polling System
    useEffect(() => {
        const hasActiveDocs = documents.some(d => 
            d.status === 'Processing' || d.status === 'Uploading' || d.status === 'Draft'
        );
        const intervalDelay = hasActiveDocs ? 3000 : 10000;
        const timer = setInterval(() => {
            fetchDocuments();
        }, intervalDelay);
        return () => clearInterval(timer);
    }, [documents, fetchDocuments]);

    // --- Actions ---
    const handleSopFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) setSopFile(e.target.files[0]);
    };

    const handleLlmFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
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
        if (!preselectedProduct) setProductName('');
        setIsUploadModalOpen(false);
        if (onCloseInitialUpload) onCloseInitialUpload();
    };

    const handleEdit = (doc: LibraryDocument) => {
        console.log("Edit action (Dummy) triggered for:", doc.documentName);
    };

    const handleUploadAll = async () => {
        if (!sopFile && llmFiles.length === 0) return;
        setIsUploading(true);
        try {
            const rootFolder = preselectedProduct ? preselectedProduct.product_name : (productName || "PIL");
            const targetIndex = preselectedProduct ? preselectedProduct.index_name : "cbgknowledgehub";

            if (sopFile) {
                const metadata = {
                    category: "Policy", // Default category hidden from UI
                    Root_Folder: rootFolder, 
                    Linked_App: "cbgknowledgehub",
                    is_financial: "false",
                    target_index: targetIndex,
                    generate_flow: true,
                    productId: productName,
                    sopName: sopFile.name.replace(/\.[^/.]+$/, "")
                };
                await apiService.uploadDocument(sopFile, metadata);
            }

            if (llmFiles.length > 0) {
                for (const file of llmFiles) {
                    const metadata = {
                        category: "KnowledgeBase",
                        Root_Folder: rootFolder,
                        Linked_App: "cbgknowledgehub",
                        is_financial: "false",
                        target_index: targetIndex,
                        generate_flow: false,
                        description: 'Supporting Knowledge Base Document'
                    };
                    await apiService.uploadDocument(file, metadata);
                }
            }
            await fetchDocuments();
            if (onNotification) onNotification("Documents uploaded successfully", 'success');
            resetForm();
        } catch (error) {
            console.error("Upload failed", error);
            if (onNotification) onNotification("Failed to upload documents.", 'error');
            else alert("Failed to upload documents. See console for details.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteClick = (doc: LibraryDocument) => {
        setDocToDelete(doc);
    };

    const confirmDeleteDoc = async () => {
        if (!docToDelete) return;
        setIsDeleting(true);
        try {
            // Use metadata index_name or fallback to default
            const indexName = docToDelete.indexName || docToDelete.metadata?.index_name || 'cbgknowledgehub';
            const response = await apiService.deleteDocument(docToDelete.id, indexName);
            
            if (onNotification) {
                onNotification(response.message || `Document '${docToDelete.documentName}' deleted`, 'success');
            }
            await fetchDocuments();
            setDocToDelete(null);
        } catch(e) {
            console.error(e);
            if (onNotification) onNotification("Failed to delete document", 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    // --- Render ---

    const filteredDocuments = documents.filter(doc => {
        // Search Filter
        const matchesSearch = doc.documentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              (doc.rootFolder && doc.rootFolder.toLowerCase().includes(searchTerm.toLowerCase()));
        
        // Product Context Filter
        // If a product is selected, ensure the document belongs to it (by rootFolder or sopName match)
        const matchesProduct = preselectedProduct 
            ? doc.rootFolder === preselectedProduct.product_name || doc.sopName === preselectedProduct.product_name
            : true;

        return matchesSearch && matchesProduct;
    });

    // Determine Upload Validation Mode (Initial vs Update)
    const hasExistingDocs = documents.some(d => d.rootFolder === productName);
    // If no existing docs for this product, strictly require both. Otherwise allow updates (partial upload).
    const isStrictUpload = !hasExistingDocs; 
    const isUploadDisabled = isUploading || (isStrictUpload ? (!sopFile || llmFiles.length === 0) : (!sopFile && llmFiles.length === 0));

    return (
        <div className="h-full flex flex-col bg-slate-50 relative overflow-hidden">
            
            {/* Header (Matched with CBG Knowledge Hub Style) */}
            <div className="px-8 pt-8 pb-6 flex flex-col gap-6 bg-white border-b border-slate-200">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div className="flex flex-col gap-4 w-full">
                        {/* Top Bar with Back Button & Actions */}
                        <div className="flex items-center justify-between w-full">
                             {/* Back Button (Canvas Style) */}
                            {onBack && (
                                <button 
                                    onClick={onBack}
                                    className="bg-white text-slate-600 hover:bg-slate-100 shadow-md border border-slate-200 rounded-full p-2.5 px-4 flex items-center gap-2 text-xs font-bold transition-all"
                                    title="Back to Hub"
                                >
                                    <ArrowLeft size={16} />
                                    <span>Back to Hub</span>
                                </button>
                            )}

                             {/* Action Buttons */}
                            <div className="flex gap-2">
                                {/* View Flow Button */}
                                {preselectedProduct && onViewFlow && (
                                    <button
                                        onClick={onViewFlow}
                                        className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-200 rounded-full text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
                                        title="Go to Process Flow"
                                    >
                                        <Activity size={16} />
                                        View Flow
                                    </button>
                                )}
                                
                                <button 
                                    onClick={() => {
                                        if(!preselectedProduct) setProductName('PIL-CONV-001');
                                        setIsUploadModalOpen(true);
                                    }}
                                    className="px-4 py-2.5 bg-fab-royal text-white rounded-full text-xs font-bold shadow-lg shadow-fab-royal/20 hover:bg-fab-blue transition-all flex items-center gap-2"
                                >
                                    <Upload size={16} />
                                    Upload Docs
                                </button>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-fab-navy mb-1">Document Library</h2>
                            <p className="text-slate-500 text-sm">
                                {preselectedProduct 
                                    ? `Managing documents for: ${preselectedProduct.product_name}` 
                                    : 'Manage documents and monitor ingestion status.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search Bar Strip */}
            <div className="px-8 py-3 bg-slate-50 border-b border-slate-200/50 shrink-0">
                <div className="relative max-w-md">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search by Document Name..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-fab-royal/30 text-xs shadow-sm"
                    />
                </div>
            </div>

            {/* Compact Table */}
            <div className="flex-1 overflow-auto px-8 py-6">
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden min-w-[900px]">
                    <table className="w-full text-left border-collapse table-fixed">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">
                                <th className="p-3 w-10 text-center"><Square size={12} className="mx-auto" /></th>
                                <th className="p-3 w-40">Product / Category</th>
                                <th className="p-3">Document Name</th>
                                <th className="p-3 w-32">Uploaded By</th>
                                <th className="p-3 w-32">Date</th>
                                <th className="p-3 w-48">Status & Progress</th>
                                <th className="p-3 w-20 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredDocuments.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-slate-400 text-sm">
                                        No documents found{preselectedProduct ? ` for ${preselectedProduct.product_name}` : ''}.
                                    </td>
                                </tr>
                            ) : (
                                filteredDocuments.map((doc) => (
                                    <tr key={doc.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="p-3 text-center">
                                            <Square size={12} className="text-slate-300 mx-auto group-hover:text-slate-400 cursor-pointer" />
                                        </td>
                                        <td className="p-3">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-xs font-bold text-fab-navy truncate" title={doc.rootFolder}>{doc.rootFolder || 'Unassigned'}</span>
                                                <span className={`px-1.5 py-0.5 text-[9px] font-bold uppercase rounded-md border w-fit ${
                                                    doc.categoryDisplay === 'Process Definition' 
                                                    ? 'bg-purple-50 text-purple-600 border-purple-100'
                                                    : doc.categoryDisplay === 'Policy Documents'
                                                    ? 'bg-indigo-50 text-indigo-600 border-indigo-100'
                                                    : 'bg-slate-100 text-slate-500 border-slate-200'
                                                }`}>
                                                    {doc.categoryDisplay || 'General'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <FileText size={14} className="text-slate-400 shrink-0" />
                                                    <span className="text-xs text-slate-700 truncate font-medium" title={doc.documentName}>
                                                        {doc.documentName}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] text-slate-400 flex items-center gap-1 pl-6">
                                                    Pages: {doc.totalPages || doc.pageCount || 0}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <User size={12} className="text-slate-400" />
                                                <span className="text-[11px] truncate">{doc.uploadedBy}</span>
                                            </div>
                                        </td>
                                        <td className="p-3">
                                             <div className="flex items-center gap-2 text-slate-600">
                                                <Calendar size={12} className="text-slate-400" />
                                                <span className="text-[11px]">{doc.uploadedDate.split(' ')[0]}</span>
                                            </div>
                                        </td>
                                        <td className="p-3">
                                             <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center justify-between">
                                                    <span className={`flex items-center gap-1 text-[10px] font-bold uppercase ${
                                                        doc.status === 'Completed' ? 'text-emerald-600' :
                                                        (doc.status === 'Processing' || doc.status === 'Uploading') ? 'text-blue-600' :
                                                        doc.status === 'Failed' ? 'text-rose-600' : 'text-slate-500'
                                                    }`}>
                                                        {(doc.status === 'Processing' || doc.status === 'Uploading') && <RefreshCw size={10} className="animate-spin" />}
                                                        {doc.status || 'Unknown'}
                                                    </span>
                                                    <span className="text-[9px] font-mono text-slate-500 font-bold">
                                                        {doc.progressPercentage !== undefined ? doc.progressPercentage : 0}%
                                                    </span>
                                                </div>

                                                <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                                                    <div 
                                                        className={`h-full rounded-full transition-all duration-500 ${
                                                             doc.status === 'Completed' ? 'bg-emerald-500' :
                                                             doc.status === 'Failed' ? 'bg-rose-500' :
                                                             'bg-blue-500'
                                                        }`}
                                                        style={{ width: `${doc.progressPercentage || (doc.status === 'Completed' ? 100 : 5)}%` }}
                                                    ></div>
                                                </div>
                                                
                                                {doc.latestLog && (doc.status === 'Processing' || doc.status === 'Uploading') && (
                                                     <p className="text-[9px] text-slate-400 italic truncate" title={doc.latestLog}>
                                                        {doc.latestLog}
                                                    </p>
                                                )}
                                             </div>
                                        </td>
                                        <td className="p-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button 
                                                    onClick={() => handleEdit(doc)}
                                                    className="p-1.5 text-slate-400 hover:text-fab-royal hover:bg-fab-royal/10 rounded transition-colors"
                                                >
                                                    <Edit3 size={14} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteClick(doc)}
                                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                                >
                                                    <Trash2 size={14} />
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
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-lg text-fab-navy flex items-center gap-2">
                                <Upload size={20} className="text-fab-royal" />
                                {productName ? `Edit / Update ${productName}` : 'Upload New Documents'}
                            </h3>
                            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-8">
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-fab-royal/10 text-fab-royal rounded-lg mt-1"><GitMerge size={20} /></div>
                                    <div><h4 className="text-sm font-bold text-slate-800">Process Definition</h4><p className="text-xs text-slate-500">Upload the main policy/procedure document.</p></div>
                                </div>
                                <div className="pl-12 space-y-3">
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase">Product ID</label><input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-sm outline-none" disabled={!!preselectedProduct} placeholder="e.g. PIL-CONV-001" /></div>
                                    </div>
                                    {!sopFile ? (<div onClick={() => sopInputRef.current?.click()} className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-fab-royal/50 hover:bg-fab-royal/5 transition-all group"><Upload size={24} className="text-slate-300 group-hover:text-fab-royal mb-2" /><p className="text-sm font-medium text-slate-600 group-hover:text-fab-royal">Click to upload Process Definition</p><input type="file" ref={sopInputRef} onChange={handleSopFileChange} accept=".pdf,.docx,.doc,.txt" className="hidden" /></div>) : (<div className="flex items-center justify-between p-3 bg-fab-royal/5 border border-fab-royal/20 rounded-lg"><div className="flex items-center gap-3"><FileText size={20} className="text-fab-royal" /><span className="text-sm font-medium text-fab-navy truncate max-w-[200px]">{sopFile.name}</span></div><button onClick={removeSopFile} className="text-slate-400 hover:text-rose-500"><X size={16} /></button></div>)}
                                </div>
                            </div>
                            <div className="border-t border-slate-100"></div>
                            <div className="space-y-4">
                                 <div className="flex items-start gap-3"><div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg mt-1"><Bot size={20} /></div><div><h4 className="text-sm font-bold text-slate-800">Policy Documents</h4><p className="text-xs text-slate-500">Additional context for AI Chatbot.</p></div></div>
                                <div className="pl-12">
                                     <div onClick={() => llmInputRef.current?.click()} className="border border-slate-200 rounded-lg p-3 flex items-center gap-3 cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/50 transition-all mb-3"><Plus size={18} className="text-emerald-500" /><span className="text-sm font-medium text-slate-600">Add Supporting Documents</span><input type="file" ref={llmInputRef} onChange={handleLlmFileChange} accept=".pdf,.docx,.doc,.txt" multiple className="hidden" /></div>
                                    {llmFiles.length > 0 && (<div className="space-y-2 max-h-32 overflow-y-auto">{llmFiles.map((file, idx) => (<div key={idx} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-100 rounded text-sm"><div className="flex items-center gap-2"><FileStack size={14} className="text-slate-400" /><span className="text-slate-700 truncate max-w-[200px]">{file.name}</span></div><button onClick={() => removeLlmFile(idx)} className="text-slate-400 hover:text-rose-500"><X size={14} /></button></div>))}</div>)}
                                </div>
                            </div>
                        </div>
                        <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                            <button onClick={resetForm} className="px-4 py-2 text-slate-600 font-bold text-sm hover:bg-slate-200 rounded-lg transition-colors" disabled={isUploading}>Cancel</button>
                            <button onClick={handleUploadAll} disabled={isUploadDisabled} className="px-6 py-2 bg-fab-royal text-white rounded-lg font-bold text-sm shadow-lg shadow-fab-royal/20 hover:bg-fab-blue hover:scale-105 transition-all disabled:opacity-70 disabled:scale-100 flex items-center gap-2">{isUploading ? (<><Loader2 size={16} className="animate-spin" />Processing...</>) : (<><Upload size={16} />{productName && documents.some(d => d.rootFolder === productName) ? 'Re-Process' : 'Start Ingestion'}</>)}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Document Confirmation Modal */}
            {docToDelete && (
                <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 transform transition-all scale-100 opacity-100">
                         <div className="flex flex-col items-center text-center gap-4">
                             <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-2">
                                <AlertTriangle size={24} />
                             </div>
                             <div>
                                <h3 className="text-lg font-bold text-slate-800">Delete Document?</h3>
                                <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                                    Are you sure you want to delete <strong>{docToDelete.documentName}</strong>?
                                    <br/><span className="text-rose-600 font-medium text-xs">This action cannot be undone.</span>
                                </p>
                             </div>
                             <div className="flex gap-3 w-full mt-4">
                                <button 
                                    onClick={() => setDocToDelete(null)}
                                    disabled={isDeleting}
                                    className="flex-1 py-2.5 text-slate-600 font-bold text-sm bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={confirmDeleteDoc}
                                    disabled={isDeleting}
                                    className="flex-1 py-2.5 text-white font-bold text-sm bg-rose-600 hover:bg-rose-700 rounded-lg shadow-lg shadow-rose-200 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                                >
                                    {isDeleting && <Loader2 size={14} className="animate-spin" />}
                                    Delete
                                </button>
                             </div>
                         </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LibraryPage;
