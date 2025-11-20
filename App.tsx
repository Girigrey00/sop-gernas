
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import CanvasPage from './pages/CanvasPage';
import { View, HistoryItem, SopResponse } from './types';
import { 
    FileText,
    Clock,
    ChevronRight,
    Hexagon,
    Lock,
    User,
    ArrowRight,
    Search,
    ShieldAlert, 
    CreditCard,
    Landmark,
    Car,
    Home,
    Banknote,
    Wallet,
    Briefcase,
    Building2,
    Coins,
    Gem,
    Percent,
    BadgeDollarSign,
    Menu,
    BookOpen
} from 'lucide-react';

// --- Constants ---
// Specific Banking Product List with Unique Icons
const ALL_SOP_TEMPLATES = [
    { icon: Banknote, title: "PERSONAL INCOME LOAN", desc: "Standard personal loan onboarding process", category: "Loans" },
    { icon: Briefcase, title: "PIL CONVENTIONAL", desc: "Conventional personal income loan flow", category: "Loans" },
    { icon: Gem, title: "PIL ISLAMIC", desc: "Sharia-compliant personal finance flow", category: "Islamic" },
    { icon: Car, title: "AUTO LOAN", desc: "Vehicle financing and approval process", category: "Auto" },
    { icon: Coins, title: "AUTO FINANCE ISLAMIC", desc: "Islamic vehicle financing (Murabaha)", category: "Islamic" },
    { icon: Wallet, title: "CASA CONVENTIONAL", desc: "Current & Savings Account opening", category: "Accounts" },
    { icon: Building2, title: "CASA ISLAMIC", desc: "Islamic Current & Savings Account", category: "Islamic" },
    { icon: Home, title: "HOME LOAN", desc: "Mortgage application and disbursal", category: "Mortgages" },
    { icon: Landmark, title: "IJARA ISLAMIC", desc: "Islamic home finance (Ijara) process", category: "Islamic" },
    { icon: CreditCard, title: "FAB CREDIT CARD", desc: "FAB credit card issuance journey", category: "Cards" },
    { icon: Percent, title: "ISLAMIC CREDIT CARD", desc: "Sharia-compliant credit card processing", category: "Islamic" },
    { icon: BadgeDollarSign, title: "DUBAI FIRST CREDIT CARD", desc: "Dubai First card application flow", category: "Cards" },
];

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

        // Simulate network delay for effect
        setTimeout(() => {
            const success = onLogin(username, password);
            if (!success) {
                setError('Invalid credentials');
                setIsLoading(false);
            }
        }, 800);
    };

    return (
        <div className="h-screen w-screen bg-slate-950 flex items-center justify-center relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden">
                 <div className="absolute top-[-30%] left-[-10%] w-[800px] h-[800px] bg-blue-600/20 blur-[120px] rounded-full animate-pulse"></div>
                 <div className="absolute bottom-[-30%] right-[-10%] w-[800px] h-[800px] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse delay-700"></div>
                 <div className="absolute top-[40%] left-[40%] w-[300px] h-[300px] bg-purple-500/10 blur-[80px] rounded-full"></div>
            </div>

            <div className="w-full max-w-md z-10 p-6">
                <div className="bg-slate-900/60 backdrop-blur-2xl border border-slate-800 rounded-3xl p-8 shadow-2xl shadow-black/50 relative overflow-hidden">
                    
                    {/* Logo / Brand */}
                    <div className="flex flex-col items-center gap-4 mb-10 relative z-10">
                        <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-blue-900/50 mb-2 ring-1 ring-white/20 transform hover:scale-105 transition-transform duration-500">
                            <Hexagon size={40} strokeWidth={2} className="fill-white/10" />
                        </div>
                        <div className="text-center">
                            <h1 className="text-3xl font-bold text-white tracking-tight">GERNAS</h1>
                            <div className="flex items-center gap-2 justify-center mt-2">
                                <span className="h-px w-4 bg-blue-500/50"></span>
                                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.25em]">SOP FLOW</p>
                                <span className="h-px w-4 bg-blue-500/50"></span>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-400 ml-1 uppercase tracking-wide">Admin Access</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User size={18} className="text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                                </div>
                                <input 
                                    type="text" 
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-950/50 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                                    placeholder="Username"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-400 ml-1 uppercase tracking-wide">Secure Key</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock size={18} className="text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                                </div>
                                <input 
                                    type="password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-950/50 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                                    placeholder="Password"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-xs text-center font-medium flex items-center justify-center gap-2">
                                <ShieldAlert size={14} /> {error}
                            </div>
                        )}

                        <button 
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-900/20 transition-all transform hover:scale-[1.02] disabled:opacity-70 disabled:scale-100 flex items-center justify-center gap-2 mt-4"
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
                        <p className="text-[10px] text-slate-600">Restricted System • Authorized Personnel Only</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Library Dummy Page ---
const LibraryPage = () => {
    return (
        <div className="h-full flex flex-col items-center justify-center bg-slate-50/50 p-8">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-6">
                <BookOpen size={40} />
            </div>
            <h2 className="text-2xl font-bold text-slate-700 mb-2">SOP Library</h2>
            <p className="text-slate-500 text-sm max-w-md text-center">
                This module is currently under development. It will contain a comprehensive archive of all organizational standard operating procedures.
            </p>
        </div>
    );
};

// --- Home Page (CBG Knowledge Hub) ---
const HomePage = ({ onStart }: { onStart: (prompt: string) => void }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');

    const categories = ['All', ...Array.from(new Set(ALL_SOP_TEMPLATES.map(t => t.category)))];

    const filteredSops = ALL_SOP_TEMPLATES.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.desc.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="h-full flex flex-col bg-slate-50/50">
            {/* Header & Controls */}
            <div className="px-8 pt-8 pb-6 flex flex-col gap-6 bg-white border-b border-slate-200">
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-1">CBG KNOWLEDGE HUB</h2>
                        <p className="text-slate-500 text-sm">Select a product to generate its workflow or search the repository.</p>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        {/* Search Bar */}
                        <div className="relative w-full md:w-64">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Search products..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Category Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {categories.map(cat => (
                        <button 
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                                activeCategory === cat 
                                ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid Content */}
            <div className="flex-1 overflow-y-auto px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {filteredSops.map((item, i) => (
                        <button 
                            key={i}
                            onClick={() => onStart(item.title)}
                            className="p-5 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/5 transition-all text-left group flex flex-col h-full relative overflow-hidden"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2.5 bg-slate-50 group-hover:bg-blue-50 text-slate-400 group-hover:text-blue-600 rounded-xl transition-colors border border-slate-100">
                                    <item.icon size={24} strokeWidth={1.5} />
                                </div>
                                <span className="text-[9px] font-bold uppercase text-slate-400 bg-slate-50 px-2 py-1 rounded-full border border-slate-100 group-hover:border-blue-100 group-hover:text-blue-400 transition-colors">
                                    {item.category}
                                </span>
                            </div>
                            
                            <h3 className="text-sm font-bold text-slate-800 group-hover:text-blue-700 mb-2">{item.title}</h3>
                            <p className="text-xs text-slate-500 leading-relaxed mb-4 flex-1">{item.desc}</p>

                            <div className="flex items-center justify-between border-t border-slate-50 pt-3 mt-auto">
                                <span className="text-[10px] font-medium text-slate-400">v2025.1</span>
                                <div className="flex items-center gap-1 text-xs font-bold text-blue-600 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                                    Open <ArrowRight size={14} />
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
                
                {filteredSops.length === 0 && (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                            <Search size={24} />
                        </div>
                        <p className="text-slate-500 font-medium">No products found matching your search.</p>
                        <button 
                            onClick={() => {setSearchQuery(''); setActiveCategory('All');}}
                            className="text-blue-600 text-sm font-bold mt-2 hover:underline"
                        >
                            Clear filters
                        </button>
                    </div>
                )}
            </div>
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
    <div className="h-full flex flex-col bg-slate-50/50">
      {/* Header */}
      <div className="px-8 py-8 border-b border-slate-200 bg-white">
        <h2 className="text-2xl font-bold text-slate-900 mb-1">History</h2>
        <p className="text-slate-500 text-sm">View and manage your previously generated workflows.</p>
      </div>

      {/* Content */}
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
                        className="group bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/5 transition-all text-left flex flex-col h-full relative overflow-hidden"
                    >
                         <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        
                        <div className="flex justify-between items-start mb-4 w-full">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <FileText size={20} />
                            </div>
                            <span className="text-[10px] font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-full border border-slate-100">
                                {new Date(item.timestamp).toLocaleDateString()}
                            </span>
                        </div>

                        <h3 className="text-sm font-bold text-slate-800 group-hover:text-blue-700 mb-1 line-clamp-1">
                            {item.title}
                        </h3>
                        <p className="text-xs text-slate-500 mb-4 line-clamp-2 flex-1">
                            {item.data.processDefinition.title}
                        </p>

                        <div className="flex items-center gap-1 text-xs font-bold text-blue-600 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
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
  const [initialPrompt, setInitialPrompt] = useState<string>('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedSop, setSelectedSop] = useState<SopResponse | null>(null);

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
  };

  const handleStart = (prompt?: string) => {
      if (prompt) {
          setInitialPrompt(prompt);
          setSelectedSop(null); // Clear any selected history
          setCurrentView('CANVAS');
          setIsSidebarOpen(false);
      }
  };

  const handleFlowGenerated = (data: SopResponse, prompt: string) => {
      // Avoid duplicates by title for this simple example
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
      setInitialPrompt(''); // Clear prompt so it uses data
      setCurrentView('CANVAS');
      setIsSidebarOpen(false);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'HOME':
        // Home is now the CBG Knowledge Hub
        return (
            <HomePage 
                onStart={handleStart} 
            />
        );
      case 'SOPS':
        // Fallback if SOPS view is triggered, just show Home
        return (
             <HomePage 
                onStart={handleStart} 
            />
        );
      case 'LIBRARY':
        return <LibraryPage />;
      case 'CANVAS':
        return (
            <CanvasPage 
                initialPrompt={initialPrompt} 
                initialData={selectedSop}
                onFlowGenerated={handleFlowGenerated}
                onBack={() => setCurrentView('HOME')}
            />
        );
      case 'HISTORY':
        return <HistoryPage history={history} onOpenItem={handleOpenHistoryItem} />;
      default:
        return <HomePage onStart={handleStart} />;
    }
  };

  if (!isAuthenticated) {
      return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans text-slate-900">
       {/* Mobile Sidebar Toggle */}
      <div className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsSidebarOpen(false)}></div>
      
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform lg:relative lg:translate-x-0 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <Sidebar 
            currentView={currentView === 'SOPS' ? 'HOME' : currentView} 
            onNavigate={(view) => { setCurrentView(view); setIsSidebarOpen(false); }} 
            onLogout={handleLogout}
          />
      </div>

      <main className="flex-1 h-full overflow-hidden relative bg-white flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-200 bg-white z-30">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                    <Hexagon size={18} />
                </div>
                <span className="font-bold text-slate-900">GERNAS</span>
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