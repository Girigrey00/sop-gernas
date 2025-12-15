
import React, { useState, useRef, useEffect } from 'react';
import { 
    Upload, FileText, Search, Filter, Eye, Edit2, Trash2, 
    CheckSquare, Square, X, Save, File, RefreshCw, PlayCircle
} from 'lucide-react';
import { LibraryDocument, SopResponse } from '../types';
import { apiService } from '../services/apiService';

interface LibraryPageProps {
    onOpenSop?: (data: SopResponse) => void;
}

const LibraryPage: React.FC<LibraryPageProps> = ({ onOpenSop }) => {
    const [documents, setDocuments] = useState<LibraryDocument[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(false);
    
    // Modal States
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [currentDoc, setCurrentDoc] = useState<LibraryDocument | null>(null);

    // Form States
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState<Partial<LibraryDocument> & { productId?: string }>({});
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    // Fetch documents on load
    const fetchDocuments = async () => {
        setIsLoading(true);
        try {
            const docs = await apiService.getDocuments();
            setDocuments(docs);
        } catch (error) {
            console.error("Failed to fetch documents", error);
            // Fallback to empty or show notification
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    // --- Actions ---

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleSaveNew = async () => {
        if (!selectedFile) return;

        setIsUploading(true);
        try {
            // Map form data to metadata expected by backend
            const metadata = {
                productId: formData.productId || formData.sopName || selectedFile.name,
                linkedApp: 'ProcessHub', // Defaulting for now
                description: formData.description,
                target_index: formData.indexName
            };

            await apiService.uploadDocument(selectedFile, metadata);
            
            // Refresh list
            await fetchDocuments();
            resetForm();
        } catch (error) {
            console.error("Upload failed", error);
            alert("Failed to upload document. Please check the backend connection.");
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
        // We need product_id and linked_app to fetch the flow
        // These should be stored in the document metadata or inferred
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
        setFormData({});
        setSelectedFile(null);
        setCurrentDoc(null);
        setIsUploadModalOpen(false);
        setIsViewModalOpen(false);
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

    // Filter Logic
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
                        <Upload size={18} /> Upload Document
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
                                <th className="p-4">Index</th>
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
                                    <td className="p-4 text-sm text-slate-600 font-mono">{doc.indexName || '-'}</td>
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
                    {filteredDocs.length === 0 && (
                        <div className="p-10 text-center text-slate-400">
                            {isLoading ? "Loading documents..." : "No documents found."}
                        </div>
                    )}
                </div>
            </div>

            {/* Upload Modal */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 z-50 bg-fab-navy/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-fab-navy">Upload New SOP</h3>
                            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Product ID / SOP Name (Required)</label>
                                <input 
                                    type="text" 
                                    value={formData.productId || ''}
                                    onChange={e => setFormData({...formData, productId: e.target.value, sopName: e.target.value})}
                                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-fab-royal/20 outline-none text-sm"
                                    placeholder="e.g. PIL-2025"
                                />
                                <p className="text-[10px] text-slate-400 mt-1">This ID is used to retrieve the generated flow.</p>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Index Name (Optional)</label>
                                <input 
                                    type="text" 
                                    value={formData.indexName || ''}
                                    onChange={e => setFormData({...formData, indexName: e.target.value})}
                                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-fab-royal/20 outline-none text-sm"
                                    placeholder="e.g. custom-index"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
                                <textarea 
                                    value={formData.description || ''}
                                    onChange={e => setFormData({...formData, description: e.target.value})}
                                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-fab-royal/20 outline-none text-sm h-20 resize-none"
                                    placeholder="Brief description..."
                                />
                            </div>

                            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <input 
                                    type="file" 
                                    hidden 
                                    ref={fileInputRef} 
                                    onChange={handleFileUpload} 
                                    accept=".pdf,.docx,.xlsx,.pptx"
                                />
                                <div className="w-10 h-10 bg-fab-sky/20 text-fab-royal rounded-full flex items-center justify-center mx-auto mb-2">
                                    <Upload size={20} />
                                </div>
                                <p className="text-sm font-medium text-fab-navy">
                                    {selectedFile ? selectedFile.name : "Click to browse files"}
                                </p>
                                <p className="text-xs text-slate-400 mt-1">
                                    {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : "Supports PDF, DOCX, XLSX, PPTX"}
                                </p>
                            </div>
                        </div>

                        <div className="p-6 pt-2 flex gap-3">
                            <button onClick={resetForm} disabled={isUploading} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50 transition-colors">
                                Cancel
                            </button>
                            <button 
                                onClick={handleSaveNew}
                                disabled={isUploading || !selectedFile}
                                className="flex-1 py-2.5 bg-fab-royal text-white rounded-lg font-medium hover:bg-fab-blue shadow-lg shadow-fab-royal/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                {isUploading ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />} 
                                {isUploading ? 'Uploading...' : 'Upload & Process'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

             {/* View Details Modal */}
             {isViewModalOpen && currentDoc && (
                <div className="fixed inset-0 z-50 bg-fab-navy/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-fab-navy text-white">
                            <h3 className="font-bold flex items-center gap-2"><FileText size={18} /> Document Details</h3>
                            <button onClick={resetForm} className="text-white/70 hover:text-white"><X size={20} /></button>
                        </div>
                        
                        <div className="p-8 grid grid-cols-2 gap-y-6 gap-x-8">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase">SOP Name / Product ID</label>
                                <p className="text-lg font-bold text-fab-navy">{currentDoc.sopName || currentDoc.metadata?.productId}</p>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase">Index Reference</label>
                                <p className="text-base font-mono text-slate-700">{currentDoc.indexName || 'N/A'}</p>
                            </div>
                            
                            <div className="col-span-2">
                                <label className="text-xs font-bold text-slate-400 uppercase">Description</label>
                                <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 mt-1">{currentDoc.description}</p>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase">Document File</label>
                                <div className="flex items-center gap-2 mt-1">
                                    <File size={16} className="text-fab-light" />
                                    <span className="text-sm font-medium text-slate-700">{currentDoc.documentName}</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase">Status</label>
                                <p className="text-sm font-bold text-slate-700">{currentDoc.status}</p>
                            </div>

                             <div>
                                <label className="text-xs font-bold text-slate-400 uppercase">Uploaded By</label>
                                <p className="text-sm text-slate-700">{currentDoc.uploadedBy}</p>
                            </div>
                             <div>
                                <label className="text-xs font-bold text-slate-400 uppercase">Upload Date</label>
                                <p className="text-sm text-slate-700">{currentDoc.uploadedDate}</p>
                            </div>

                            <div className="col-span-2 pt-4 border-t border-slate-100 flex justify-end gap-3">
                                <button onClick={resetForm} className="px-6 py-2 bg-fab-royal text-white rounded-lg font-bold hover:bg-fab-blue shadow-lg shadow-fab-royal/20">Close</button>
                            </div>
                        </div>
                    </div>
                </div>
             )}
        </div>
    );
};

export default LibraryPage;
