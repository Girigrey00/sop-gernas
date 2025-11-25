import React, { useState, useRef } from 'react';
import { 
    Upload, FileText, Search, Filter, Eye, Edit2, Trash2, 
    MoreVertical, CheckSquare, Square, X, Save, AlertCircle, File
} from 'lucide-react';
import { LibraryDocument } from '../types';

// Mock Initial Data
const INITIAL_DOCS: LibraryDocument[] = [
    { id: '1', sopName: 'Personal Loan SOP', documentName: 'PIL_Policy_v2.pdf', description: 'Updated credit policy for PIL', pageCount: 45, uploadedBy: 'Admin', uploadedDate: '2025-10-14', indexName: 'PIL-001', status: 'Active', version: '2.0' },
    { id: '2', sopName: 'Auto Loan Procedure', documentName: 'Auto_Ops_Manual.docx', description: 'Operations manual for vehicle finance', pageCount: 120, uploadedBy: 'John Doe', uploadedDate: '2025-09-20', indexName: 'AL-OPS-02', status: 'Draft', version: '1.1' },
    { id: '3', sopName: 'KYC Standards', documentName: 'Global_KYC_2025.pdf', description: 'Global compliance standards', pageCount: 12, uploadedBy: 'Compliance Team', uploadedDate: '2025-10-01', indexName: 'CMP-KYC', status: 'Active', version: '3.5' },
];

const LibraryPage = () => {
    const [documents, setDocuments] = useState<LibraryDocument[]>(INITIAL_DOCS);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    
    // Modal States
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentDoc, setCurrentDoc] = useState<LibraryDocument | null>(null);

    // Form States
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState<Partial<LibraryDocument>>({});
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // --- Actions ---

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleSaveNew = () => {
        if (!formData.sopName || !selectedFile) return; // Simple validation

        const newDoc: LibraryDocument = {
            id: Date.now().toString(),
            sopName: formData.sopName || '',
            documentName: selectedFile.name,
            description: formData.description || '',
            pageCount: Math.floor(Math.random() * 50) + 1, // Mock logic
            uploadedBy: 'Current User',
            uploadedDate: new Date().toISOString().split('T')[0],
            indexName: formData.indexName || `IDX-${Date.now()}`,
            status: 'Active',
            version: '1.0'
        };

        setDocuments([newDoc, ...documents]);
        resetForm();
    };

    const handleUpdate = () => {
        if (!currentDoc) return;
        
        const updatedDocs = documents.map(doc => {
            if (doc.id === currentDoc.id) {
                return {
                    ...doc,
                    sopName: formData.sopName || doc.sopName,
                    description: formData.description || doc.description,
                    indexName: formData.indexName || doc.indexName,
                    status: (formData.status as any) || doc.status,
                    // If a new file was selected, update details and bump version
                    ...(selectedFile ? {
                        documentName: selectedFile.name,
                        uploadedDate: new Date().toISOString().split('T')[0],
                        version: (parseFloat(doc.version) + 0.1).toFixed(1)
                    } : {})
                };
            }
            return doc;
        });

        setDocuments(updatedDocs);
        resetForm();
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this document?')) {
            setDocuments(documents.filter(d => d.id !== id));
        }
    };

    const openEdit = (doc: LibraryDocument) => {
        setCurrentDoc(doc);
        setFormData({
            sopName: doc.sopName,
            description: doc.description,
            indexName: doc.indexName,
            status: doc.status
        });
        setIsEditModalOpen(true);
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
        setIsEditModalOpen(false);
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
        d.sopName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        d.indexName.toLowerCase().includes(searchTerm.toLowerCase())
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
                    <button className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 bg-white hover:bg-slate-50 flex items-center gap-2 text-sm font-medium">
                        <Filter size={16} /> Filter
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
                                <th className="p-4">SOP Name</th>
                                <th className="p-4">Document Name</th>
                                <th className="p-4">Index Name</th>
                                <th className="p-4">Ver</th>
                                <th className="p-4">Uploaded By</th>
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
                                        <div className="font-semibold text-fab-navy text-sm">{doc.sopName}</div>
                                        <div className="text-xs text-slate-400 truncate max-w-[200px]">{doc.description}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <FileText size={14} className="text-fab-light" />
                                            {doc.documentName}
                                        </div>
                                        <div className="text-[10px] text-slate-400 pl-6">{doc.pageCount} pages</div>
                                    </td>
                                    <td className="p-4 text-sm text-slate-600 font-mono">{doc.indexName}</td>
                                    <td className="p-4 text-sm text-slate-600">{doc.version}</td>
                                    <td className="p-4 text-sm text-slate-600">{doc.uploadedBy}</td>
                                    <td className="p-4 text-sm text-slate-600">{doc.uploadedDate}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                                            doc.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                            doc.status === 'Draft' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                                            'bg-slate-100 text-slate-500 border-slate-200'
                                        }`}>
                                            {doc.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openView(doc)} className="p-1.5 text-slate-400 hover:text-fab-royal hover:bg-fab-sky/20 rounded-lg transition-colors" title="View Details">
                                                <Eye size={16} />
                                            </button>
                                            <button onClick={() => openEdit(doc)} className="p-1.5 text-slate-400 hover:text-fab-royal hover:bg-fab-sky/20 rounded-lg transition-colors" title="Edit">
                                                <Edit2 size={16} />
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
                            <p>No documents found.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Upload / Edit Modal */}
            {(isUploadModalOpen || isEditModalOpen) && (
                <div className="fixed inset-0 z-50 bg-fab-navy/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-fab-navy">{isEditModalOpen ? 'Update Document' : 'Upload New SOP'}</h3>
                            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">SOP Name</label>
                                <input 
                                    type="text" 
                                    value={formData.sopName || ''}
                                    onChange={e => setFormData({...formData, sopName: e.target.value})}
                                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-fab-royal/20 outline-none text-sm"
                                    placeholder="e.g. Credit Policy 2025"
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Index Name</label>
                                    <input 
                                        type="text" 
                                        value={formData.indexName || ''}
                                        onChange={e => setFormData({...formData, indexName: e.target.value})}
                                        className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-fab-royal/20 outline-none text-sm"
                                        placeholder="e.g. CP-001"
                                    />
                                </div>
                                {isEditModalOpen && (
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
                                        <select 
                                            value={formData.status || 'Active'}
                                            onChange={e => setFormData({...formData, status: e.target.value as any})}
                                            className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-fab-royal/20 outline-none text-sm bg-white"
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Draft">Draft</option>
                                            <option value="Archived">Archived</option>
                                        </select>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
                                <textarea 
                                    value={formData.description || ''}
                                    onChange={e => setFormData({...formData, description: e.target.value})}
                                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-fab-royal/20 outline-none text-sm h-20 resize-none"
                                    placeholder="Brief description of the document..."
                                />
                            </div>

                            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <input 
                                    type="file" 
                                    hidden 
                                    ref={fileInputRef} 
                                    onChange={handleFileUpload} 
                                    accept=".pdf,.docx,.doc,.txt"
                                />
                                <div className="w-10 h-10 bg-fab-sky/20 text-fab-royal rounded-full flex items-center justify-center mx-auto mb-2">
                                    <Upload size={20} />
                                </div>
                                <p className="text-sm font-medium text-fab-navy">
                                    {selectedFile ? selectedFile.name : (isEditModalOpen ? "Upload new version (Optional)" : "Click to browse files")}
                                </p>
                                <p className="text-xs text-slate-400 mt-1">
                                    {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : "Supports PDF, DOCX"}
                                </p>
                            </div>
                        </div>

                        <div className="p-6 pt-2 flex gap-3">
                            <button onClick={resetForm} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50 transition-colors">
                                Cancel
                            </button>
                            <button 
                                onClick={isEditModalOpen ? handleUpdate : handleSaveNew}
                                className="flex-1 py-2.5 bg-fab-royal text-white rounded-lg font-medium hover:bg-fab-blue shadow-lg shadow-fab-royal/20 transition-all flex items-center justify-center gap-2"
                            >
                                <Save size={18} /> {isEditModalOpen ? 'Update' : 'Save'}
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
                                <label className="text-xs font-bold text-slate-400 uppercase">SOP Name</label>
                                <p className="text-lg font-bold text-fab-navy">{currentDoc.sopName}</p>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase">Index Reference</label>
                                <p className="text-base font-mono text-slate-700">{currentDoc.indexName}</p>
                            </div>
                            
                            <div className="col-span-2">
                                <label className="text-xs font-bold text-slate-400 uppercase">Description</label>
                                <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 mt-1">{currentDoc.description}</p>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase">Document File</label>
                                <div className="flex items-center gap-2 mt-1">
                                    <File size={16} className="text-fab-light" />
                                    <span className="text-sm font-medium text-slate-700 underline cursor-pointer">{currentDoc.documentName}</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase">Version</label>
                                <p className="text-sm font-bold text-slate-700">v{currentDoc.version}</p>
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
                                <button onClick={() => { setIsViewModalOpen(false); openEdit(currentDoc); }} className="px-4 py-2 text-fab-royal font-bold hover:bg-fab-sky/10 rounded-lg transition-colors">Edit Details</button>
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
