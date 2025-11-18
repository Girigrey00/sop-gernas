import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import CanvasPage from './pages/CanvasPage';
import { View, HistoryItem, SopResponse } from './types';
import { 
    ArrowUp, 
    Sparkles, 
    UserPlus, 
    ShieldAlert, 
    ShoppingCart, 
    Paperclip,
    Mic,
    FileText,
    Clock,
    ChevronRight,
    Hexagon,
    Lock,
    User,
    ArrowRight
} from 'lucide-react';

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
        <div className="h-screen w-screen bg-slate-900 flex items-center justify-center relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                 <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/20 blur-[120px] rounded-full"></div>
                 <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/10 blur-[120px] rounded-full"></div>
            </div>

            <div className="w-full max-w-md z-10 p-6">
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl relative">
                    
                    {/* Logo / Brand */}
                    <div className="flex flex-col items-center gap-4 mb-10">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-900/40 mb-2 ring-1 ring-white/10">
                            <Hexagon size={40} strokeWidth={2} className="fill-white/10" />
                        </div>
                        <div className="text-center">
                            <h1 className="text-3xl font-bold text-white tracking-tight">GERNAS</h1>
                            <p className="text-xs font-bold text-blue-400 uppercase tracking-[0.25em] mt-2">SOP FLOW</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-400 ml-1 uppercase tracking-wide">Admin ID</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User size={18} className="text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                                </div>
                                <input 
                                    type="text" 
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                                    placeholder="Enter admin ID"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-400 ml-1 uppercase tracking-wide">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock size={18} className="text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                                </div>
                                <input 
                                    type="password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                                    placeholder="Enter password"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-xs text-center font-medium">
                                {error}
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
                                    Authenticating...
                                </>
                            ) : (
                                <>Sign In <ArrowRight size={18} /></>
                            )}
                        </button>
                    </form>
                    
                    <div className="mt-8 text-center">
                        <p className="text-[10px] text-slate-500">Restricted Access. Authorized Personnel Only.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Home Page Component ---
const HomePage = ({ onStart }: { onStart: (prompt?: string) => void }) => {
    const [prompt, setPrompt] = useState('');

    const suggestions = [
        { icon: FileText, title: "Personal Income Loan", desc: "Digital Customer Onboarding SOP" },
        { icon: UserPlus, title: "Employee Onboarding", desc: "HR process for new hires" },
        { icon: ShieldAlert, title: "Incident Response", desc: "Cybersecurity breach protocol" },
        { icon: ShoppingCart, title: "Procurement Cycle", desc: "Purchase requisition to payment" }
    ];

    return (
        <div className="h-full flex flex-col bg-white relative overflow-hidden">
            
            {/* Background Gradient Blob */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-100/40 blur-[120px] rounded-full pointer-events-none opacity-50"></div>

            {/* Main Content Area - Centered */}
            <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full px-6 pb-10 z-10">
                
                {/* Hero / Greeting */}
                <div className="mb-10 flex flex-col items-center gap-6 text-center">
                     <div className="w-16 h-16 bg-white rounded-2xl shadow-lg shadow-blue-500/10 border border-slate-100 flex items-center justify-center text-blue-600 relative group">
                        <Sparkles size={32} className="group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-blue-400/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                     </div>
                     <h1 className="text-3xl md:text-4xl font-medium text-slate-800">
                        What process would you like to <span className="text-blue-600 font-semibold">visualize</span> today?
                     </h1>
                </div>

                {/* Input Container */}
                <div className="w-full max-w-3xl relative group mb-12">
                     <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400/30 to-indigo-400/30 rounded-[2rem] blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                     <div className="relative bg-white rounded-[1.8rem] shadow-[0_8px_40px_rgb(0,0,0,0.04)] border border-slate-200 p-3 flex flex-col gap-2 transition-all focus-within:shadow-[0_12px_50px_rgb(0,0,0,0.08)] focus-within:border-blue-400/50">
                        <textarea 
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={(e) => {
                                if(e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    if(prompt.trim()) onStart(prompt);
                                }
                            }}
                            placeholder="Describe your SOP (e.g. 'Create a vehicle insurance claim process with risk controls')..."
                            className="w-full min-h-[60px] max-h-[200px] p-3 bg-transparent border-none focus:ring-0 text-lg text-slate-800 placeholder:text-slate-400 resize-none font-light"
                            rows={1}
                        />
                        <div className="flex justify-between items-center px-2 pb-1">
                             <div className="flex gap-2">
                                <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors" title="Attach Context">
                                    <Paperclip size={20} />
                                </button>
                                <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors" title="Voice Input">
                                    <Mic size={20} />
                                </button>
                             </div>
                             <button 
                                onClick={() => onStart(prompt)}
                                disabled={!prompt.trim()}
                                className={`p-3 rounded-xl transition-all duration-300 flex items-center gap-2 ${
                                    prompt.trim() 
                                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20 scale-100' 
                                    : 'bg-slate-100 text-slate-300 cursor-not-allowed scale-95'
                                }`}
                             >
                                <ArrowUp size={20} strokeWidth={3} />
                             </button>
                        </div>
                     </div>
                </div>

                {/* Suggestions Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                    {suggestions.map((item, i) => (
                        <button 
                            key={i}
                            onClick={() => onStart(item.title)}
                            className="p-4 rounded-2xl border border-slate-200/60 bg-white/50 hover:bg-white hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all text-left group flex flex-col gap-3 backdrop-blur-sm"
                        >
                            <div className="p-2.5 bg-slate-100/80 w-fit rounded-xl text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                <item.icon size={20} />
                            </div>
                            <div>
                                <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 block mb-1">{item.title}</span>
                                <span className="text-xs text-slate-500 group-hover:text-slate-600 line-clamp-2 leading-relaxed">{item.desc}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 text-center z-10">
                 <p className="text-[11px] text-slate-400 font-medium">AI generated content can be inaccurate. Please review generated SOPs.</p>
            </div>
        </div>
    );
}

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
      <div className="px-8 py-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">History</h2>
        <p className="text-slate-500">View and manage your previously generated SOP flows.</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
          {history.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-16 text-center flex flex-col items-center gap-4 max-w-2xl mx-auto mt-10">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                    <Clock size={32} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-700 mb-1">No history yet</h3>
                    <p className="text-slate-500 text-sm">Generate a flow to see it appear here.</p>
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
                            <span className="text-[10px] font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-full">
                                {new Date(item.timestamp).toLocaleDateString()}
                            </span>
                        </div>

                        <h3 className="text-base font-bold text-slate-800 group-hover:text-blue-700 mb-2 line-clamp-2">
                            {item.title}
                        </h3>
                        <p className="text-xs text-slate-500 mb-4 line-clamp-3 flex-1">
                            {item.data.processDefinition.title} - {item.data.processDefinition.classification}
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
  };

  const renderContent = () => {
    switch (currentView) {
      case 'HOME':
        return <HomePage onStart={handleStart} />;
      case 'CANVAS':
        return (
            <CanvasPage 
                initialPrompt={initialPrompt} 
                initialData={selectedSop}
                onFlowGenerated={handleFlowGenerated}
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
      <Sidebar 
        currentView={currentView} 
        onNavigate={setCurrentView} 
        onLogout={handleLogout}
      />
      <main className="flex-1 h-full overflow-hidden relative bg-white">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;