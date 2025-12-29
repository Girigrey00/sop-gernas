
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import CanvasPage from './pages/CanvasPage';
import LibraryPage from './pages/LibraryPage';
import { View, SopResponse, Product, ChatSession } from './types';
import { apiService } from './services/apiService';
import { 
    FileText, Clock, ChevronRight, Lock, User, ArrowRight, Search, ShieldAlert, 
    Briefcase, Menu, Plus, Loader2, CreditCard, Landmark, ShieldCheck, Wallet, 
    Banknote, Coins, FileSpreadsheet, Zap,
    PieChart, TrendingUp, Globe, Building2, Scale, FileSignature, Calculator, 
    Receipt, Gem, Key, Database, Smartphone, Award, Target, BarChart, Stamp, BadgeDollarSign, 
    Vault, ScrollText, Truck, ShoppingCart, Anchor, Gavel, FileCheck, Layers, Trash2,
    X, CheckCircle, AlertTriangle, MessageSquareText, Calendar, Hash, MessageCircle, Filter, ArrowLeft
} from 'lucide-react';

// --- Icon Helper ---
const PRODUCT_ICONS = [
    // Finance & Banking
    Briefcase, CreditCard, Landmark, ShieldCheck, Wallet, Banknote, Coins, 
    Receipt, Gem, BadgeDollarSign, Vault, Calculator,
    // Business & Enterprise
    Building2, PieChart, TrendingUp, Target, BarChart, Globe, ShoppingCart, Truck, 
    // Process & Compliance
    FileSpreadsheet, FileSignature, Scale, Gavel, Stamp, FileCheck, ScrollText, 
    // Tech & General
    Zap, Key, Database, Smartphone, Award, Layers, Anchor, FileText
];

const getProductIcon = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return PRODUCT_ICONS[Math.abs(hash) % PRODUCT_ICONS.length];
};

// --- Helper: Create Fallback SOP Data ---
// Used when real flow data cannot be fetched but we still need to open the Chat Interface
const createFallbackSop = (productName: string, indexName: string): SopResponse => ({
    startNode: { stepId: 'START', stepName: 'Start', description: 'Process Start', actor: 'System', stepType: 'Start', nextStep: null },
    endNode: { stepId: 'END', stepName: 'End', description: 'Process End', actor: 'System', stepType: 'End', nextStep: null },
    processDefinition: { title: productName, version: '1.0', classification: 'N/A', documentLink: '#' },
    processObjectives: [],
    inherentRisks: [],
    processFlow: { stages: [] }, // Empty stages will result in empty canvas, which is fine for chat-only view
    metricsAndMeasures: [],
    policiesAndStandards: [],
    qualityAssurance: [],
    metadata: { index_name: indexName, product_name: productName }
});

// --- Login Page Component ---
const LoginPage = ({ onLogin }: { onLogin: (u: string, p: string) => boolean }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        setTimeout(() => {
            const success = onLogin(username, password);
            if (!success) {
                setError('Invalid credentials');
                setIsLoading(false);
            }
        }, 800);
    };

    return (
        <div className="h-screen w-screen bg-fab-navy flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
                 <div className="absolute top-[-30%] left-[-10%] w-[800px] h-[800px] bg-fab-royal/40 blur-[120px] rounded-full animate-pulse"></div>
                 <div className="absolute bottom-[-30%] right-[-10%] w-[800px] h-[800px] bg-fab-blue/30 blur-[120px] rounded-full animate-pulse delay-700"></div>
            </div>

            <div className="w-full max-w-md z-10 p-6">
                <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-2xl shadow-black/50 relative overflow-hidden">
                    
                    <div className="flex flex-col items-center gap-4 mb-10 relative z-10">
                        <div className="w-24 h-24 bg-gradient-to-br from-fab-navy via-fab-royal to-fab-blue rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-black/40 mb-2 ring-1 ring-white/10 transform hover:scale-105 transition-all duration-500 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 blur-xl rounded-full transform translate-x-4 -translate-y-4"></div>
                            <div className="absolute bottom-0 left-0 w-12 h-12 bg-fab-sky/20 blur-lg rounded-full transform -translate-x-2 translate-y-2"></div>
                            
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-14 h-14 drop-shadow-md relative z-10">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10H12v3h7.6C18.9 17.5 15.8 20 12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8c2.04 0 3.89.78 5.31 2.05l2.25-2.25C17.2 1.9 14.76 0 12 0z" />
                            </svg>
                        </div>
                        <div className="text-center">
                            <h1 className="text-3xl font-bold text-white tracking-tight">GERNAS</h1>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-fab-sky/80 ml-1 uppercase tracking-wide">Admin Access</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User size={18} className="text-white/50 group-focus-within:text-fab-sky transition-colors" />
                                </div>
                                <input 
                                    type="text" 
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-fab-sky/50 focus:border-fab-sky/50 transition-all"
                                    placeholder="Username"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-fab-sky/80 ml-1 uppercase tracking-wide">Secure Key</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock size={18} className="text-white/50 group-focus-within:text-fab-sky transition-colors" />
                                </div>
                                <input 
                                    type="password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-fab-sky/50 focus:border-fab-sky/50 transition-all"
                                    placeholder="Password"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-300 text-xs text-center font-medium flex items-center justify-center gap-2">
                                <ShieldAlert size={14} /> {error}
                            </div>
                        )}

                        <button 
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3.5 bg-gradient-to-r from-fab-royal to-fab-light hover:from-fab-blue hover:to-fab-royal text-white rounded-xl font-semibold shadow-lg shadow-black/20 transition-all transform hover:scale-[1.02] disabled:opacity-70 disabled:scale-100 flex items-center justify-center gap-2 mt-4"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Verifying...
                                </>
                            ) : (
                                <>Authenticate <ArrowRight size={18} /></>
                            )}
                        </button>
                    </form>
                    
                    <div className="mt-8 text-center">
                        <p className="text-[10px] text-fab-sky/50">Restricted System • Authorized Personnel Only</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Home Page (CBG Knowledge Hub) ---
const HomePage = ({ onStart, onSelectProduct, onNotification }: { 
    onStart: (data: any) => void, 
    onSelectProduct: (product: Product, redirect: boolean) => void,
    onNotification: (msg: string, type: 'success' | 'error') => void
}) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // Polling Logic
    const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
    
    // Create Product State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newProductName, setNewProductName] = useState('');
    const [newProductDesc, setNewProductDesc] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    // Delete Confirmation State
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchProducts = useCallback(async (isPolling = false) => {
        if (!isPolling) setIsLoading(true);
        try {
            const data = await apiService.getProducts();
            setProducts(data);

            if (!pollingRef.current) {
               pollingRef.current = setInterval(() => fetchProducts(true), 5000);
            }
        } catch (error) {
            console.error("Failed to fetch products", error);
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
                pollingRef.current = null;
            }
        } finally {
            if (!isPolling) setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, [fetchProducts]);

    const handleCreateProduct = async () => {
        if(!newProductName) return;
        setIsCreating(true);
        try {
            await apiService.createProduct({
                product_name: newProductName,
                folder_name: newProductName.toLowerCase().replace(/\s+/g, '_') + '_folder',
                product_description: newProductDesc || 'No description'
            });
            await fetchProducts(); // Refresh list immediately
            setIsCreateOpen(false);
            setNewProductName('');
            setNewProductDesc('');
            onNotification(`Product '${newProductName}' created successfully`, 'success');
        } catch (error) {
            onNotification("Failed to create product", 'error');
            console.error(error);
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteClick = (product: Product) => {
        setProductToDelete(product);
    };

    const confirmDeleteProduct = async () => {
        if (!productToDelete) return;
        setIsDeleting(true);
        try {
            const response = await apiService.deleteProduct(productToDelete.product_name);
            onNotification(response.message || `Product '${productToDelete.product_name}' deleted`, 'success');
            await fetchProducts();
            setProductToDelete(null);
        } catch (error) {
            console.error("Failed to delete product", error);
            onNotification("Failed to delete product.", 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCardClick = async (product: Product, e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('.delete-btn')) return;

        onSelectProduct(product, false);

        if (product.flow_status === 'Completed') {
            setIsLoading(true);
            try {
                const flowData = await apiService.getProcessFlow(product.product_name);
                if (flowData) {
                    onStart(flowData);
                } else {
                    onNotification("Flow data returned is empty.", 'error');
                }
            } catch (error) {
                console.error("Flow fetch error:", error);
                onNotification("Failed to load the process flow.", 'error');
            } finally {
                setIsLoading(false);
            }
        } else if (!product.flow_status) {
            onSelectProduct(product, true); 
        } else {
            onNotification(`Flow is currently: ${product.flow_status}. Please wait.`, 'error');
        }
    };

    const filteredProducts = products
        .filter(item => {
            return item.product_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                   (item.description || '').toLowerCase().includes(searchQuery.toLowerCase());
        })
        .sort((a, b) => {
             const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
             const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
             return dateB - dateA;
        });

    return (
        <div className="h-full flex flex-col bg-slate-50 relative">
            <div className="px-8 pt-8 pb-6 flex flex-col gap-6 bg-white border-b border-slate-200">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-fab-navy mb-1">CBG Knowledge Hub</h2>
                        <p className="text-slate-500 text-sm">Select a product to view its workflow or upload new documents.</p>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button 
                            onClick={() => setIsCreateOpen(true)}
                            className="px-4 py-2 bg-fab-royal text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-fab-blue transition-colors"
                        >
                            <Plus size={16} /> New Product
                        </button>
                        <div className="relative w-full md:w-64">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Search products..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-fab-royal/50 text-sm"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-8">
                {isLoading ? (
                     <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                        <div className="w-10 h-10 border-4 border-fab-royal/20 border-t-fab-royal rounded-full animate-spin mb-4"></div>
                        <p>Loading Data...</p>
                     </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-20 text-slate-400">
                        <Briefcase size={48} className="mx-auto mb-4 opacity-20" />
                        <p>No products found. Create one to get started.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {filteredProducts.map((item, i) => {
                            const isCompleted = item.flow_status === 'Completed';
                            const isProcessing = item.flow_status && item.flow_status !== 'Completed' && item.flow_status !== 'Failed';
                            const isFailed = item.flow_status === 'Failed';
                            const isEmpty = !item.flow_status;
                            const DynamicIcon = getProductIcon(item.product_name);

                            // Log Data logic
                            const latestLog = item.flow_logs && item.flow_logs.length > 0 ? item.flow_logs[item.flow_logs.length - 1] : null;
                            const progress = item.flow_progress || 0;
                            const currentStep = item.flow_current_step || (latestLog ? latestLog.step : 'Processing');

                            return (
                                <button 
                                    key={i}
                                    onClick={(e) => handleCardClick(item, e)}
                                    className="p-5 rounded-xl border border-slate-200 bg-white hover:border-fab-royal/50 hover:shadow-lg hover:shadow-fab-royal/5 transition-all text-left group flex flex-col h-full relative overflow-hidden"
                                >
                                    <div className="absolute top-3 right-3 z-20 delete-btn">
                                         <div 
                                            onClick={(e) => {
                                                e.stopPropagation(); 
                                                handleDeleteClick(item);
                                            }}
                                            className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors bg-white/50 backdrop-blur-sm"
                                            title="Delete Product"
                                         >
                                            <Trash2 size={16} />
                                         </div>
                                    </div>

                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2.5 rounded-xl transition-colors border bg-fab-royal/5 text-fab-royal border-fab-royal/10">
                                            {isProcessing ? <Loader2 size={24} className="animate-spin" /> : <DynamicIcon size={24} strokeWidth={1.5} />}
                                        </div>
                                    </div>
                                    
                                    <h3 className="text-sm font-bold text-fab-navy group-hover:text-fab-royal mb-2 pr-6">{item.product_name}</h3>
                                    
                                    {/* Conditional Content: Description vs Processing Logs */}
                                    {isProcessing ? (
                                        <div className="mt-2 mb-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100 w-full">
                                            <div className="flex justify-between items-center mb-1.5">
                                                 <span className="text-[10px] font-bold text-fab-royal uppercase tracking-wider truncate max-w-[70%]">{currentStep}</span>
                                                 <span className="text-[10px] font-mono text-slate-500 font-bold">{progress}%</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mb-2">
                                                 <div className="h-full bg-fab-royal rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                                            </div>
                                            {latestLog && (
                                                 <div className="flex items-start gap-1.5">
                                                    <Loader2 size={10} className="animate-spin text-fab-royal mt-0.5 shrink-0" />
                                                    <p className="text-[10px] text-slate-500 leading-tight line-clamp-2 break-words" title={latestLog.message}>
                                                        {latestLog.message}
                                                    </p>
                                                 </div>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-slate-500 leading-relaxed mb-3 flex-1 line-clamp-3" title={item.description}>{item.description || 'No description available'}</p>
                                    )}

                                    {!isProcessing && (
                                        <div className="mb-4">
                                            <span className={`text-[9px] font-bold uppercase px-2 py-1 rounded-full border inline-flex items-center gap-1 ${
                                                isCompleted ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                isFailed ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                                'bg-slate-50 text-slate-400 border-slate-100'
                                            }`}>
                                                {isCompleted ? 'Ready' : isFailed ? 'Failed' : 'Draft'}
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between border-t border-slate-50 pt-3 mt-auto w-full">
                                        <span className="text-[10px] font-medium text-slate-400 truncate max-w-[100px]">Docs: {item.document_count}</span>
                                        <div className="flex items-center gap-1 text-xs font-bold text-fab-royal opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                                            {isCompleted ? 'View Flow' : isEmpty ? 'Upload Docs' : isFailed ? 'Retry' : 'Wait...'} <ArrowRight size={14} />
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {isCreateOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                        <h3 className="text-lg font-bold text-fab-navy mb-4">Create New Product</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Product Name</label>
                                <input 
                                    type="text" 
                                    value={newProductName}
                                    onChange={e => setNewProductName(e.target.value)}
                                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-fab-royal/20 outline-none"
                                    placeholder="e.g. Personal Loan"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Description</label>
                                <textarea 
                                    value={newProductDesc}
                                    onChange={e => setNewProductDesc(e.target.value)}
                                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-fab-royal/20 outline-none h-24 resize-none"
                                    placeholder="Brief description..."
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button 
                                onClick={() => setIsCreateOpen(false)}
                                className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg font-bold text-sm"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleCreateProduct}
                                disabled={isCreating || !newProductName}
                                className="px-4 py-2 bg-fab-royal text-white rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-fab-blue disabled:opacity-50"
                            >
                                {isCreating && <Loader2 size={14} className="animate-spin" />}
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {productToDelete && (
                <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 transform transition-all scale-100 opacity-100">
                         <div className="flex flex-col items-center text-center gap-4">
                             <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-2">
                                <AlertTriangle size={24} />
                             </div>
                             <div>
                                <h3 className="text-lg font-bold text-slate-800">Delete Product?</h3>
                                <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                                    Are you sure you want to delete <strong>{productToDelete.product_name}</strong>?
                                    <br/><span className="text-rose-600 font-medium text-xs">This action cannot be undone.</span>
                                </p>
                             </div>
                             <div className="flex gap-3 w-full mt-4">
                                <button 
                                    onClick={() => setProductToDelete(null)}
                                    disabled={isDeleting}
                                    className="flex-1 py-2.5 text-slate-600 font-bold text-sm bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={confirmDeleteProduct}
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

// --- Main App Component ---
const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<View>('HOME');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true); 
  const [initialPrompt, setInitialPrompt] = useState<string>('');
  const [selectedSop, setSelectedSop] = useState<SopResponse | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [autoOpenUpload, setAutoOpenUpload] = useState(false);
  const [selectedContextProduct, setSelectedContextProduct] = useState<Product | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>(undefined);
  
  // Polling State for Flow Generation
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const handleLogin = (u: string, p: string) => {
      if (u === 'admin' && p === 'admin') {
          setIsAuthenticated(true);
          return true;
      }
      return false;
  };

  const handleLogout = () => {
      setIsAuthenticated(false);
      setCurrentView('HOME');
      setInitialPrompt('');
      setSelectedSop(null);
      setSelectedContextProduct(null);
      setCurrentSessionId(undefined);
  };

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
      setNotification({ message, type });
      setTimeout(() => setNotification(null), 6000);
  };

  const handleStartWithData = (data: SopResponse) => {
      setSelectedSop(data);
      setInitialPrompt('');
      setCurrentSessionId(undefined); // Clear session ID for new flow
      setCurrentView('CANVAS');
      setIsSidebarOpen(false);
  };

  const handleProductSelect = (product: Product, redirect: boolean) => {
      setSelectedContextProduct(product);
      if (redirect) {
          setAutoOpenUpload(true);
          setCurrentView('LIBRARY');
      }
  };

  // UPDATED: Robust Session Opener
  const handleOpenSession = async (session: ChatSession) => {
      // 1. Determine product context (fallback if missing)
      const productName = session.product || "General Chat";
      const indexName = session.index_name || "cbgknowledgehub";

      // 2. Set context immediately (critical for ChatAssistant to load)
      setCurrentSessionId(session._id);
      setSelectedContextProduct({ 
          product_name: productName, 
          index_name: indexName,
          // minimal product info needed for context
          _id: session._id, id: session._id, has_index: 'Yes', has_flow: 'No', document_count: 0 
      }); 

      // 3. Try to fetch flow data (Bonus context)
      // Even if this fails, we proceed to open the Canvas so the Chat works.
      try {
          // Attempt to load flow if we have a product name
          if (productName && productName !== "General Chat") {
               const flowData = await apiService.getProcessFlow(productName);
               if (flowData && flowData.processFlow) {
                   setSelectedSop(flowData);
               } else {
                   // Flow structure missing/invalid -> Use Fallback
                   console.warn("Flow data incomplete, using fallback for chat view.");
                   setSelectedSop(createFallbackSop(productName, indexName));
               }
          } else {
               // No product linked -> Use Fallback
               setSelectedSop(createFallbackSop(productName, indexName));
          }
      } catch (e) {
          console.warn("Failed to load flow for this session. Opening in Chat-Only mode.", e);
          // 4. Fallback on Error: Create dummy SOP data so CanvasPage renders and ChatAssistant mounts
          setSelectedSop(createFallbackSop(productName, indexName));
      }

      // 5. Navigate
      setCurrentView('CANVAS');
      setIsSidebarOpen(false);
  };

  const handleFlowGenerated = (_data: SopResponse, _prompt: string) => {
      // Legacy handler, not really needed if using new Chat/History API mostly
      // But useful if generating flow from scratch via prompt
  };

  const renderContent = () => {
    switch (currentView) {
      case 'HOME':
        return <HomePage onStart={handleStartWithData} onSelectProduct={handleProductSelect} onNotification={showNotification} />;
      case 'SOPS':
        return <HomePage onStart={handleStartWithData} onSelectProduct={handleProductSelect} onNotification={showNotification} />;
      case 'LIBRARY':
        return (
            <LibraryPage 
                initialUploadOpen={autoOpenUpload}
                onCloseInitialUpload={() => {
                    setAutoOpenUpload(false);
                }}
                preselectedProduct={selectedContextProduct}
                onBack={async () => {
                    if (selectedContextProduct) {
                        setIsGlobalLoading(true);
                        setLoadingMessage("Checking flow status...");

                        const poll = async () => {
                            try {
                                const flowData = await apiService.getProcessFlow(selectedContextProduct.product_name);
                                handleStartWithData(flowData);
                                setIsGlobalLoading(false);
                            } catch (e: any) {
                                if (e.status === 'Processing') {
                                    setLoadingMessage("Flow is generating... This may take a moment.");
                                    // Keep polling recursively
                                    setTimeout(poll, 3000);
                                } else if (e.status === 'Failed') {
                                     showNotification("Flow generation failed.", 'error');
                                     setIsGlobalLoading(false);
                                     // Fallback to canvas with default/empty state if failed, or stay?
                                     // Based on typical flow, we go to canvas to show error state there if needed or just empty
                                     setCurrentView('CANVAS');
                                } else {
                                     console.error(e);
                                     showNotification("Sync error. Opening canvas.", 'error');
                                     setIsGlobalLoading(false);
                                     setCurrentView('CANVAS');
                                }
                            }
                        };
                        poll();
                    } else {
                        setCurrentView('HOME');
                        setSelectedContextProduct(null); 
                    }
                }}
                onNotification={showNotification}
                onViewFlow={async () => {
                     if (selectedContextProduct) {
                         if(selectedContextProduct.flow_status === 'Completed') {
                             try {
                                 const flowData = await apiService.getProcessFlow(selectedContextProduct.product_name);
                                 handleStartWithData(flowData);
                             } catch(e) {
                                 console.error(e);
                                 showNotification("Error loading flow. Please check console.", 'error');
                             }
                         } else {
                             showNotification(`Flow is ${selectedContextProduct.flow_status || 'not ready'}`, 'error');
                         }
                     }
                }}
            />
        );
      case 'CANVAS':
        return (
            <CanvasPage 
                initialPrompt={initialPrompt} 
                initialData={selectedSop}
                onFlowGenerated={handleFlowGenerated}
                onBack={() => {
                    // Back from Canvas (Hub Navigation) always goes Home and clears context
                    setCurrentView('HOME');
                    setSelectedContextProduct(null);
                    setCurrentSessionId(undefined);
                }}
                productContext={selectedContextProduct}
                initialSessionId={currentSessionId}
            />
        );
      // Removed HISTORY case as it is now sidebar only
      default:
        return <HomePage onStart={handleStartWithData} onSelectProduct={handleProductSelect} onNotification={showNotification} />;
    }
  };

  if (!isAuthenticated) {
      return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans text-slate-900 relative">
      
      {/* Global Loading Overlay for Polling */}
      {isGlobalLoading && (
        <div className="fixed inset-0 z-[100] bg-white/80 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-300">
            <div className="w-16 h-16 border-4 border-fab-royal/30 border-t-fab-royal rounded-full animate-spin mb-4 shadow-lg"></div>
            <h3 className="text-xl font-bold text-fab-navy mb-2">Processing Flow</h3>
            <p className="text-slate-500 font-medium animate-pulse">{loadingMessage}</p>
            <div className="mt-8 max-w-xs w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-fab-royal w-1/3 animate-[shimmer_2s_infinite]"></div>
            </div>
        </div>
      )}

      {/* Toast Notification Layer */}
      {notification && (
        <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-2xl text-white font-medium z-[100] flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300 ${notification.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'}`}>
            {notification.type === 'success' ? <CheckCircle size={20} /> : <ShieldAlert size={20} />}
            <span className="text-sm">{notification.message}</span>
            <button onClick={() => setNotification(null)} className="ml-2 opacity-80 hover:opacity-100 p-1 hover:bg-white/20 rounded"><X size={16}/></button>
        </div>
      )}

      <div className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsSidebarOpen(false)}></div>
      
      <div className={`fixed inset-y-0 left-0 z-50 ${isCollapsed ? 'w-20' : 'w-64'} transform lg:relative lg:translate-x-0 transition-all duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <Sidebar 
            currentView={currentView === 'SOPS' ? 'HOME' : currentView} 
            onNavigate={(view) => { 
                if (view === 'HISTORY') {
                    setIsCollapsed(false); // Expand sidebar when History is clicked
                    // Do not change current view, stay on previous page
                } else {
                    setCurrentView(view);
                    setIsSidebarOpen(false);
                }
            }} 
            onLogout={handleLogout}
            isCollapsed={isCollapsed}
            onToggle={() => setIsCollapsed(!isCollapsed)}
            productContext={selectedContextProduct}
            onLoadSession={handleOpenSession}
          />
      </div>

      <main className="flex-1 h-full overflow-hidden relative bg-white flex flex-col transition-all duration-300">
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-200 bg-white z-30">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-fab-navy to-fab-blue rounded-lg flex items-center justify-center text-white">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                       <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10H12v3h7.6C18.9 17.5 15.8 20 12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8c2.04 0 3.89.78 5.31 2.05l2.25-2.25C17.2 1.9 14.76 0 12 0z" />
                    </svg>
                </div>
                <span className="font-bold text-fab-navy">GERNAS</span>
            </div>
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
                <Menu size={24} />
            </button>
        </div>
        
        <div className="flex-1 overflow-hidden relative">
            {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
