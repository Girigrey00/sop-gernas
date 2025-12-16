
import React, { useState, useRef, useEffect } from 'react';
import { 
    Upload, FileText, Search, Eye, Trash2, 
    CheckSquare, Square, X, Save, RefreshCw, PlayCircle,
    Bot, GitMerge, FileStack
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
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [currentDoc, setCurrentDoc] = useState<LibraryDocument | null>(null);

    // Upload State
    const [sopFile, setSopFile] = useState<File | null>(null);
    const [llmFiles, setLlmFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    const sopInputRef = useRef<HTMLInputElement>(null);
    const llmInputRef = useRef<HTMLInputElement>(null);

    // UUID for PIL CONVENTIONAL
    const PIL_CONV_ID = "ccaf1e1e-1fb4-4403-aad3-a70019dfb1ee";

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

    const handleUploadAll = async () => {
        if (!sopFile && llmFiles.length === 0) return;

        setIsUploading(true);
        try {
            // 1. Upload SOP File (for Flow Generation)
            if (sopFile) {
                const metadata = {
                    productId: PIL_CONV_ID, // Use specific UUID
                    sopName: 'PIL CONVENTIONAL',
                    linkedApp: 'ProcessHub',
                    category: 'SOP',
                    description: 'Primary SOP Document for Flow Generation',
                    generate_flow: true // Triggers backend flow extraction
                };
                await apiService.uploadDocument(sopFile, metadata);
            }

            // 2. Upload LLM Files (for RAG/Chat)
            if (llmFiles.length > 0) {
                for (const file of llmFiles) {
                    const metadata = {
                        productId: PIL_CONV_ID, // Link to same UUID
                        linkedApp: 'ProcessHub',
                        category: 'KnowledgeBase',
                        description: 'Supporting Knowledge Base Document',
                        generate_flow: false
                    };
                    await apiService.uploadDocument(file, metadata);
                }
            }
            
            // Refresh list
            await fetchDocuments();
            resetForm();
        } catch (error) {
            console.error("Upload failed", error);
            alert("Failed to upload documents. Please check the backend connection.");
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
        const productId = doc.metadata?.productId || doc.sopName;
        const linkedApp = doc.metadata?.linkedApp || 'ProcessHub';

        if (!productId) {
            alert("Cannot visualize: Missing Product ID in document metadata.");
            return;
        }

        try {
            const sopData = await apiService.getProcessFlow(linkedApp, productId);
            if (sopData && onOpenSop) {
                onOpenSop(sopData);
            }
        } catch (error) {
            console.error("Failed to fetch flow", error);
            alert("Could not retrieve process flow. It might not be generated yet.");
        }
    };

    const openView = (doc: LibraryDocument) => {
        setCurrentDoc(doc);
        setIsViewModalOpen(true);
    };

    const resetForm = () => {
        setSopFile(null);
        setLlmFiles([]);
        setCurrentDoc(null);
        setIsUploadModalOpen(false);
        setIsViewModalOpen(false);
        if (onCloseInitialUpload) onCloseInitialUpload();
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === documents.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(documents.map(d => d.id)));
        }
    };

    const toggleSelectOne = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const filteredDocs = documents.filter(d => 
        (d.sopName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
        (d.indexName || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="h-full flex flex-col bg-slate-50">
            {/* Header */}
            <div className="px-8 py-6 bg-white border-b border-slate-200">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-fab-navy">SOP Library</h2>
                        <p className="text-slate-500 text-sm mt-1">Manage and organize organizational procedures and documents.</p>
                    </div>
                    <button 
                        onClick={() => setIsUploadModalOpen(true)}
                        className="bg-fab-royal hover:bg-fab-blue text-white px-5 py-2.5 rounded-lg shadow-lg shadow-fab-royal/20 flex items-center gap-2 text-sm font-semibold transition-all"
                    >
                        <Upload size={18} /> Upload Documents
                    </button>
                </div>

                {/* Filters */}
                <div className="flex gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search by Name or Index..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-fab-sky/50 text-sm"
                        />
                    </div>
                    <button 
                        onClick={fetchDocuments}
                        className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 bg-white hover:bg-slate-50 flex items-center gap-2 text-sm font-medium"
                        title="Refresh List"
                    >
                        <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} /> Refresh
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto px-8 py-6">
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                <th className="p-4 w-10">
                                    <button onClick={toggleSelectAll} className="text-slate-400 hover:text-fab-royal">
                                        {selectedIds.size === documents.length && documents.length > 0 ? <CheckSquare size={18} /> : <Square size={18} />}
                                    </button>
                                </th>
                                <th className="p-4 w-12">S.No</th>
                                <th className="p-4">SOP Name / Product ID</th>
                                <th className="p-4">File Name</th>
                                <th className="p-4">Category</th>
                                <th className="p-4">Date</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredDocs.map((doc, index) => (
                                <tr key={doc.id} className="hover:bg-fab-sky/10 transition-colors group">
                                    <td className="p-4">
                                        <button onClick={() => toggleSelectOne(doc.id)} className={`transition-colors ${selectedIds.has(doc.id) ? 'text-fab-royal' : 'text-slate-300'}`}>
                                            {selectedIds.has(doc.id) ? <CheckSquare size={18} /> : <Square size={18} />}
                                        </button>
                                    </td>
                                    <td className="p-4 text-sm text-slate-500">{index + 1}</td>
                                    <td className="p-4">
                                        <div className="font-semibold text-fab-navy text-sm">{doc.sopName || doc.metadata?.productId}</div>
                                        <div className="text-xs text-slate-400 truncate max-w-[200px]">{doc.description}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <FileText size={14} className="text-fab-light" />
                                            {doc.documentName}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`text-xs px-2 py-1 rounded font-medium border ${
                                            doc.metadata?.category === 'SOP' 
                                            ? 'bg-purple-50 text-purple-600 border-purple-100' 
                                            : 'bg-teal-50 text-teal-600 border-teal-100'
                                        }`}>
                                            {doc.metadata?.category || 'General'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-slate-600">{doc.uploadedDate}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                                            doc.status === 'Completed' || doc.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                            doc.status === 'Processing' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                                            doc.status === 'Failed' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                            'bg-slate-100 text-slate-500 border-slate-200'
                                        }`}>
                                            {doc.status || 'Unknown'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {(doc.status === 'Completed' || doc.status === 'Active') && (
                                                <button onClick={() => handleVisualize(doc)} className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors" title="Visualize Process Flow">
                                                    <PlayCircle size={16} />
                                                </button>
                                            )}
                                            <button onClick={() => openView(doc)} className="p-1.5 text-slate-400 hover:text-fab-royal hover:bg-fab-sky/20 rounded-lg transition-colors" title="View Details">
                                                <Eye size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(doc.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Simplified Upload Modal */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 z-50 bg-fab-navy/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 flex-shrink-0">
                            <h3 className="font-bold text-fab-navy">Upload Documents for PIL CONVENTIONAL</h3>
                            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                {/* SOP Flow Upload */}
                                <div 
                                    className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 h-40 group ${sopFile ? 'border-fab-royal bg-fab-sky/5' : 'border-slate-200 hover:border-fab-royal hover:bg-slate-50'}`}
                                    onClick={() => sopInputRef.current?.click()}
                                >
                                    <input type="file" hidden ref={sopInputRef} onChange={handleSopFileChange} accept=".pdf,.docx" />
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${sopFile ? 'bg-fab-royal text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-fab-royal/10 group-hover:text-fab-royal'}`}>
                                        <GitMerge size={24} />
                                    </div>
                                    <h4 className="font-bold text-slate-700 text-sm">SOP Flow Chart</h4>
                                    <p className="text-[10px] text-slate-500 px-2 leading-tight">
                                        Main procedure document for visualization
                                    </p>
                                </div>

                                {/* LLM Knowledge Base Upload */}
                                <div 
                                    className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 h-40 group ${llmFiles.length > 0 ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-200 hover:border-emerald-500 hover:bg-slate-50'}`}
                                    onClick={() => llmInputRef.current?.click()}
                                >
                                    <input type="file" hidden ref={llmInputRef} onChange={handleLlmFileChange} accept=".pdf,.docx,.txt" multiple />
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${llmFiles.length > 0 ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-600'}`}>
                                        <Bot size={24} />
                                    </div>
                                    <h4 className="font-bold text-slate-700 text-sm">Knowledge Base</h4>
                                    <p className="text-[10px] text-slate-500 px-2 leading-tight">
                                        Policies, manuals & guidelines (Multi-upload)
                                    </p>
                                </div>
                            </div>

                            {/* Selected Documents List */}
                            {(sopFile || llmFiles.length > 0) && (
                                <div className="mb-6 bg-slate-50 rounded-xl border border-slate-200 p-4">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Selected Documents</h4>
                                        <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                                            Total: {(sopFile ? 1 : 0) + llmFiles.length}
                                        </span>
                                    </div>
                                    
                                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                                        {/* SOP File */}
                                        {sopFile && (
                                            <div className="flex items-center justify-between p-2.5 bg-white border border-fab-royal/20 rounded-lg shadow-sm">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-1.5 bg-fab-sky/20 rounded text-fab-royal">
                                                        <GitMerge size={16} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-fab-navy truncate max-w-[200px]">{sopFile.name}</p>
                                                        <span className="text-[10px] text-fab-royal bg-fab-sky/20 px-1.5 py-0.5 rounded">SOP Source</span>
                                                    </div>
                                                </div>
                                                <button onClick={removeSopFile} className="text-slate-400 hover:text-rose-500 p-1.5 hover:bg-rose-50 rounded-md transition-colors">
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        )}

                                        {/* LLM Files */}
                                        {llmFiles.map((file, index) => (
                                            <div key={`${file.name}-${index}`} className="flex items-center justify-between p-2.5 bg-white border border-emerald-100 rounded-lg shadow-sm">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-1.5 bg-emerald-100 rounded text-emerald-600">
                                                        <FileStack size={16} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-800 truncate max-w-[200px]">{file.name}</p>
                                                        <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">Knowledge Base</span>
                                                    </div>
                                                </div>
                                                <button onClick={() => removeLlmFile(index)} className="text-slate-400 hover:text-rose-500 p-1.5 hover:bg-rose-50 rounded-md transition-colors">
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                             <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start gap-2 mb-2">
                                <div className="mt-0.5 text-blue-500"><PlayCircle size={16} /></div>
                                <p className="text-xs text-blue-700 leading-relaxed">
                                    All documents will be linked to <strong>PIL CONVENTIONAL (ID: {PIL_CONV_ID.substring(0, 8)}...)</strong>. The SOP file will be analyzed to generate the process flow visualization.
                                </p>
                             </div>
                        </div>

                        <div className="px-6 pb-6 pt-2 flex gap-3 flex-shrink-0">
                            <button onClick={resetForm} disabled={isUploading} className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors">
                                Cancel
                            </button>
                            <button 
                                onClick={handleUploadAll}
                                disabled={isUploading || (!sopFile && llmFiles.length === 0)}
                                className="flex-[2] py-3 bg-fab-royal text-white rounded-xl font-medium hover:bg-fab-blue shadow-lg shadow-fab-royal/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:grayscale"
                            >
                                {isUploading ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />} 
                                {isUploading ? 'Processing...' : 'Upload & Process'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Details Modal */}
            {isViewModalOpen && currentDoc && (
                <div className="fixed inset-0 z-50 bg-fab-navy/50 backdrop-blur-sm flex items-center justify-center p-4">
                     <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-fab-navy text-white">
                            <h3 className="font-bold">Document Details</h3>
                            <button onClick={resetForm} className="text-white/70 hover:text-white"><X size={20} /></button>
                        </div>
                        <div className="p-6">
                            <pre className="text-xs bg-slate-50 p-4 rounded-lg overflow-auto max-h-60 custom-scrollbar">
                                {JSON.stringify(currentDoc, null, 2)}
                            </pre>
                             <div className="mt-4 flex justify-end">
                                <button onClick={resetForm} className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300">Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LibraryPage;
