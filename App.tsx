
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import CanvasPage from './pages/CanvasPage';
import LibraryPage from './pages/LibraryPage';
import { View, HistoryItem, SopResponse, Product } from './types';
import { apiService } from './services/apiService';
import { 
    FileText, Clock, ChevronRight, Lock, User, ArrowRight, Search, ShieldAlert, 
    Briefcase, Menu, Plus, Loader2, RefreshCw, CreditCard, Landmark, ShieldCheck, Wallet, 
    Banknote, Coins, FileSpreadsheet, Zap,
    // New Icons for Variety
    PieChart, TrendingUp, Globe, Building2, Scale, FileSignature, Calculator, 
    Receipt, Gem, Key, Database, Smartphone, Award, Target, BarChart, Stamp, BadgeDollarSign, 
    Vault, ScrollText, Truck, ShoppingCart, Anchor, Gavel, FileCheck, Layers, Trash2
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
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden">
                 <div className="absolute top-[-30%] left-[-10%] w-[800px] h-[800px] bg-fab-royal/40 blur-[120px] rounded-full animate-pulse"></div>
                 <div className="absolute bottom-[-30%] right-[-10%] w-[800px] h-[800px] bg-fab-blue/30 blur-[120px] rounded-full animate-pulse delay-700"></div>
            </div>

            <div className="w-full max-w-md z-10 p-6">
                <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-2xl shadow-black/50 relative overflow-hidden">
                    
                    {/* Logo / Brand */}
                    <div className="flex flex-col items-center gap-4 mb-10 relative z-10">
                        <div className="w-24 h-24 bg-gradient-to-br from-fab-navy via-fab-royal to-fab-blue rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-black/40 mb-2 ring-1 ring-white/10 transform hover:scale-105 transition-all duration-500 relative overflow-hidden group">
                            {/* Inner Shine Effect */}
                            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 blur-xl rounded-full transform translate-x-4 -translate-y-4"></div>
                            <div className="absolute bottom-0 left-0 w-12 h-12 bg-fab-sky/20 blur-lg rounded-full transform -translate-x-2 translate-y-2"></div>
                            
                            {/* Stylized G */}
                            <span className="text-6xl font-black italic tracking-tighter pr-1 drop-shadow-lg relative z-10 font-sans">G</span>
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
const HomePage = ({ onStart, onSelectProduct }: { onStart: (data: any) => void, onSelectProduct: (product: Product, redirect: boolean) => void }) => {
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

    const fetchProducts = useCallback(async (isPolling = false) => {
        if (!isPolling) setIsLoading(true);
        try {
            const data = await apiService.getProducts();
            setProducts(data);

            // Poll logic: Continuously poll every 5s to check for status updates
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
        } catch (error) {
            alert("Failed to create product");
            console.error(error);
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteProduct = async (product: Product) => {
        if (!window.confirm(`Are you sure you want to delete product "${product.product_name}"? This will delete all associated documents and indexes.`)) return;
        
        try {
            await apiService.deleteProduct(product.product_name);
            await fetchProducts();
        } catch (error) {
            console.error("Failed to delete product", error);
            alert("Failed to delete product. Please try again.");
        }
    };

    const handleCardClick = async (product: Product) => {
        // Update context to show library link
        onSelectProduct(product, false);

        // Strict Logic:
        // 1. If flow_status === 'Completed' -> Open Canvas
        // 2. If flow_status is missing/null -> Redirect to Upload (Library)
        // 3. If flow_status is anything else (Processing, Failed) -> Show Alert/Wait

        if (product.flow_status === 'Completed') {
            setIsLoading(true);
            try {
                // Call API with product_name
                const flowData = await apiService.getProcessFlow(product.product_name);
                if (flowData) {
                    onStart(flowData);
                } else {
                    alert("Flow data returned is empty.");
                }
            } catch (error) {
                console.error("Flow fetch error:", error);
                alert("Failed to load the process flow.");
            } finally {
                setIsLoading(false);
            }
        } else if (!product.flow_status) {
            // Redirect to library upload if flow is missing
            onSelectProduct(product, true); // Force redirect
        } else {
            // Processing or other state
            alert(`Flow is currently: ${product.flow_status}. Please wait until completion.`);
        }
    };

    const filteredProducts = products
        .filter(item => {
            return item.product_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                   (item.description || '').toLowerCase().includes(searchQuery.toLowerCase());
        })
        // Sort Newest to Oldest based on created_at or fallback
        .sort((a, b) => {
             const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
             const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
             return dateB - dateA;
        });

    return (
        <div className="h-full flex flex-col bg-slate-50 relative">
            {/* Header & Controls */}
            <div className="px-8 pt-8 pb-6 flex flex-col gap-6 bg-white border-b border-slate-200">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-fab-navy mb-1">CBG KNOWLEDGE HUB</h2>
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

            {/* Grid Content */}
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
                            const isProcessing = item.flow_status && item.flow_status !== 'Completed';
                            const isEmpty = !item.flow_status;
                            const DynamicIcon = getProductIcon(item.product_name);

                            return (
                                <button 
                                    key={i}
                                    onClick={() => handleCardClick(item)}
                                    className="p-5 rounded-xl border border-slate-200 bg-white hover:border-fab-royal/50 hover:shadow-lg hover:shadow-fab-royal/5 transition-all text-left group flex flex-col h-full relative overflow-hidden"
                                >
                                     {/* Delete Button */}
                                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                         <div 
                                            onClick={(e) => {
                                                e.stopPropagation(); 
                                                handleDeleteProduct(item);
                                            }}
                                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors bg-white/50 backdrop-blur-sm"
                                            title="Delete Product"
                                         >
                                            <Trash2 size={16} />
                                         </div>
                                    </div>

                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2.5 rounded-xl transition-colors border bg-fab-royal/5 text-fab-royal border-fab-royal/10">
                                            {isProcessing ? <Loader2 size={24} className="animate-spin" /> : <DynamicIcon size={24} strokeWidth={1.5} />}
                                        </div>
                                        <div className="flex gap-1">
                                            <span className={`text-[9px] font-bold uppercase px-2 py-1 rounded-full border ${
                                                isCompleted ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                isProcessing ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                'bg-slate-50 text-slate-400 border-slate-100'
                                            }`}>
                                                {isCompleted ? 'Completed' : isProcessing ? 'Processing' : 'Draft'}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <h3 className="text-sm font-bold text-fab-navy group-hover:text-fab-royal mb-2">{item.product_name}</h3>
                                    <p className="text-xs text-slate-500 leading-relaxed mb-4 flex-1 line-clamp-3" title={item.description}>{item.description || 'No description available'}</p>

                                    <div className="flex items-center justify-between border-t border-slate-50 pt-3 mt-auto">
                                        <span className="text-[10px] font-medium text-slate-400 truncate max-w-[100px]">Docs: {item.document_count}</span>
                                        <div className="flex items-center gap-1 text-xs font-bold text-fab-royal opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                                            {isCompleted ? 'View Flow' : isEmpty ? 'Upload Docs' : 'Wait...'} <ArrowRight size={14} />
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Create Product Modal */}
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
        </div>
    );
};

// --- History Page Component ---
const HistoryPage = ({ 
    history, 
    onOpenItem 
}: { 
    history: HistoryItem[], 
    onOpenItem: (item: HistoryItem) => void 
}) => {
  return (
    <div className="h-full flex flex-col bg-slate-50">
      <div className="px-8 py-8 border-b border-slate-200 bg-white">
        <h2 className="text-2xl font-bold text-fab-navy mb-1">History</h2>
        <p className="text-slate-500 text-sm">View and manage your previously generated workflows.</p>
      </div>
      <div className="flex-1 overflow-y-auto px-8 py-8">
          {history.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-16 text-center flex flex-col items-center gap-4 max-w-xl mx-auto mt-10">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                    <Clock size={28} />
                </div>
                <div>
                    <h3 className="text-base font-bold text-slate-700 mb-1">No history yet</h3>
                    <p className="text-slate-500 text-sm">Generated flows will appear here automatically.</p>
                </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {history.map(item => (
                    <button
                        key={item.id}
                        onClick={() => onOpenItem(item)}
                        className="group bg-white p-5 rounded-2xl border border-slate-200 hover:border-fab-royal/50 hover:shadow-lg hover:shadow-fab-royal/5 transition-all text-left flex flex-col h-full relative overflow-hidden"
                    >
                         <div className="absolute top-0 left-0 w-1 h-full bg-fab-royal opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        
                        <div className="flex justify-between items-start mb-4 w-full">
                            <div className="p-2 bg-fab-sky/10 text-fab-royal rounded-lg group-hover:bg-fab-royal group-hover:text-white transition-colors">
                                <FileText size={20} />
                            </div>
                            <span className="text-[10px] font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-full border border-slate-100">
                                {new Date(item.timestamp).toLocaleDateString()}
                            </span>
                        </div>

                        <h3 className="text-sm font-bold text-fab-navy group-hover:text-fab-royal mb-1 line-clamp-1">
                            {item.title}
                        </h3>
                        <p className="text-xs text-slate-500 mb-4 line-clamp-2 flex-1">
                            {item.data.processDefinition.title}
                        </p>

                        <div className="flex items-center gap-1 text-xs font-bold text-fab-royal opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                            Open Flow <ChevronRight size={14} />
                        </div>
                    </button>
                ))}
            </div>
          )}
      </div>
    </div>
  );
};

// --- Main App Component ---
const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<View>('HOME');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true); // Default collapsed
  const [initialPrompt, setInitialPrompt] = useState<string>('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedSop, setSelectedSop] = useState<SopResponse | null>(null);
  
  // State to trigger upload modal automatically when entering library
  const [autoOpenUpload, setAutoOpenUpload] = useState(false);
  // NEW: State to pass selected product to library for context-aware upload and filtering
  const [selectedContextProduct, setSelectedContextProduct] = useState<Product | null>(null);

  // Authentication Logic
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
  };

  const handleStartWithData = (data: SopResponse) => {
      setSelectedSop(data);
      setInitialPrompt('');
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

  const handleFlowGenerated = (data: SopResponse, prompt: string) => {
      const exists = history.some(h => h.title === data.processDefinition.title);
      if (exists) return;

      const newItem: HistoryItem = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          title: prompt,
          prompt: prompt,
          data: data
      };
      setHistory(prev => [newItem, ...prev]);
  };

  const handleOpenHistoryItem = (item: HistoryItem) => {
      setSelectedSop(item.data);
      setInitialPrompt('');
      setCurrentView('CANVAS');
      setIsSidebarOpen(false);
  };

  const handleOpenSopFromLibrary = (data: SopResponse) => {
      setSelectedSop(data);
      setInitialPrompt('');
      setCurrentView('CANVAS');
      setIsSidebarOpen(false);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'HOME':
        return <HomePage onStart={handleStartWithData} onSelectProduct={handleProductSelect} />;
      case 'SOPS':
        return <HomePage onStart={handleStartWithData} onSelectProduct={handleProductSelect} />;
      case 'LIBRARY':
        return (
            <LibraryPage 
                initialUploadOpen={autoOpenUpload}
                onCloseInitialUpload={() => {
                    setAutoOpenUpload(false);
                    // Do not clear context here to keep library filtered
                }}
                preselectedProduct={selectedContextProduct}
            />
        );
      case 'CANVAS':
        return (
            <CanvasPage 
                initialPrompt={initialPrompt} 
                initialData={selectedSop}
                onFlowGenerated={handleFlowGenerated}
                onBack={() => setCurrentView('HOME')}
                productContext={selectedContextProduct}
            />
        );
      case 'HISTORY':
        return <HistoryPage history={history} onOpenItem={handleOpenHistoryItem} />;
      default:
        return <HomePage onStart={handleStartWithData} onSelectProduct={handleProductSelect} />;
    }
  };

  if (!isAuthenticated) {
      return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans text-slate-900">
      <div className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsSidebarOpen(false)}></div>
      
      {/* Sidebar Container with Dynamic Width */}
      <div className={`fixed inset-y-0 left-0 z-50 ${isCollapsed ? 'w-20' : 'w-64'} transform lg:relative lg:translate-x-0 transition-all duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <Sidebar 
            currentView={currentView === 'SOPS' ? 'HOME' : currentView} 
            onNavigate={(view) => { setCurrentView(view); setIsSidebarOpen(false); }} 
            onLogout={handleLogout}
            isCollapsed={isCollapsed}
            onToggle={() => setIsCollapsed(!isCollapsed)}
            showLibrary={!!selectedContextProduct}
          />
      </div>

      <main className="flex-1 h-full overflow-hidden relative bg-white flex flex-col transition-all duration-300">
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-200 bg-white z-30">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-fab-navy to-fab-blue rounded-lg flex items-center justify-center text-white">
                    <span className="font-black italic text-sm">G</span>
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
