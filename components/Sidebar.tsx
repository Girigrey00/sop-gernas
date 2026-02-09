
import React, { useEffect, useState } from 'react';
import { 
  FileText, ShieldCheck, GitMerge, AlertOctagon, BookOpen, Clock, 
  User, LogOut, MessageSquare, FilePlus, ChevronLeft, ChevronRight,
  Menu
} from 'lucide-react';
import { View, ChatSession, Product } from '../types';
import { apiService } from '../services/apiService';
import { motion } from 'motion/react';

export interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
  onLogout: () => void;
  isCollapsed: boolean;
  onToggle: () => void;
  productContext: Product | null;
  onLoadSession: (session: ChatSession) => void;
}

export const Logo = ({ open }: { open: boolean }) => {
  return (
    <div className="flex items-center gap-3 py-1 overflow-hidden">
      <div className="w-10 h-10 bg-gradient-to-br from-fab-navy via-fab-royal to-fab-blue rounded-xl flex items-center justify-center text-white shadow-lg shadow-black/20 relative group shrink-0 overflow-hidden ring-1 ring-white/10">
           <div className="absolute top-0 right-0 w-6 h-6 bg-white/10 blur-md rounded-full transform translate-x-2 -translate-y-2"></div>
           <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 relative z-10">
               <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10H12v3h7.6C18.9 17.5 15.8 20 12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8c2.04 0 3.89.78 5.31 2.05l2.25-2.25C17.2 1.9 14.76 0 12 0z" />
           </svg>
      </div>
      {open && (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="flex flex-col whitespace-nowrap"
        >
            <span className="font-bold text-white text-lg tracking-wide leading-none">GERNAS</span>
            <span className="text-[10px] text-fab-sky/80 font-medium tracking-widest mt-1 uppercase">SOP Flow</span>
        </motion.div>
      )}
    </div>
  );
};

const Sidebar = ({ 
  currentView, 
  onNavigate, 
  onLogout, 
  isCollapsed, 
  onToggle, 
  productContext, 
  onLoadSession 
}: SidebarProps) => {
  const [historySessions, setHistorySessions] = useState<ChatSession[]>([]);
  const open = !isCollapsed;

  // Fetch full history for the sidebar
  useEffect(() => {
    const fetchHistory = async () => {
        try {
            const sessions = await apiService.getChatSessions();
            let filtered = sessions;
            
            if (productContext) {
                filtered = sessions.filter(s => s.product === productContext.product_name);
            }

            const sorted = filtered.sort((a, b) => new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime());
            setHistorySessions(sorted);
        } catch (e) {
            console.error("Sidebar history fetch error", e);
        }
    };
    fetchHistory();
  }, [currentView, productContext]);

  const navItems = [
    { id: 'HOME', label: 'Procedure', icon: <FileText size={20} /> },
    { id: 'PROCESS_LINEAGE', label: 'Policy Standards', icon: <ShieldCheck size={20} /> },
    { id: 'PROCESS_BUILDER', label: 'Process Builder', icon: <FilePlus size={20} /> },
    { id: 'PROCESS_ANALYSIS', label: 'Process Lineage', icon: <GitMerge size={20} /> },
    { id: 'IMPACT_ASSESSMENT', label: 'Impact Assessment', icon: <AlertOctagon size={20} /> },
  ];

  // Additional context items
  if (productContext) {
      navItems.push({ id: 'LIBRARY', label: 'Library', icon: <BookOpen size={20} /> });
      navItems.push({ id: 'HISTORY', label: 'History', icon: <Clock size={20} /> });
  }

  const handleNavigate = (id: string) => {
      onNavigate(id as View);
  };

  const isActive = (id: string) => {
      if (id === currentView) return true;
      if (id === 'HOME' && (currentView === 'CANVAS' || currentView === 'SOPS')) return true;
      if (id === 'PROCESS_ANALYSIS' && currentView === 'ANALYSIS_CANVAS') return true;
      if (id === 'PROCESS_LINEAGE' && currentView === 'LINEAGE_CHAT') return true;
      return false;
  };

  return (
    <div 
        className={`h-full bg-fab-navy border-r border-fab-royal/30 flex flex-col transition-all duration-300 ease-in-out relative ${
            open ? 'w-72' : 'w-20'
        }`}
    >
        {/* Toggle Button */}
        <button 
            onClick={onToggle}
            className="absolute -right-3 top-9 bg-fab-royal text-white p-1 rounded-full border border-fab-navy shadow-md z-50 hover:bg-fab-blue transition-colors hidden md:block"
        >
            {open ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>

        {/* Header */}
        <div className={`p-5 flex items-center ${open ? 'justify-start' : 'justify-center'}`}>
            <Logo open={open} />
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-fab-royal/50 to-transparent mx-4 mb-4"></div>

        {/* Nav Items */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 space-y-1 custom-scrollbar">
            {navItems.map((item) => (
                <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group relative ${
                        isActive(item.id) 
                        ? 'bg-fab-royal text-white shadow-lg shadow-fab-royal/20' 
                        : 'text-fab-sky/70 hover:bg-white/5 hover:text-white'
                    } ${!open ? 'justify-center' : ''}`}
                    title={!open ? item.label : ''}
                >
                    <div className={`${isActive(item.id) ? 'text-white' : 'text-fab-sky/80 group-hover:text-white'}`}>
                        {item.icon}
                    </div>
                    
                    {open && (
                        <span className="text-sm font-medium tracking-wide truncate">{item.label}</span>
                    )}
                    
                    {isActive(item.id) && !open && (
                        <div className="absolute right-1 w-1.5 h-1.5 rounded-full bg-fab-sky"></div>
                    )}
                </button>
            ))}

            {/* History Section (Only when open) */}
            {open && productContext && historySessions.length > 0 && (
                <div className="mt-8 animate-in fade-in slide-in-from-left-4 duration-500">
                    <p className="px-4 mb-2 text-[10px] font-bold text-fab-sky/40 uppercase tracking-widest flex items-center justify-between">
                        Recent Sessions
                        <span className="bg-fab-royal/30 text-white px-1.5 py-0.5 rounded text-[9px]">{historySessions.length}</span>
                    </p>
                    <div className="space-y-0.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar-dark">
                        {historySessions.map(session => (
                            <button
                                key={session._id}
                                onClick={() => onLoadSession(session)}
                                className="w-full text-left px-4 py-2 text-xs text-fab-sky/60 hover:text-white hover:bg-white/5 rounded-lg truncate transition-colors flex items-center gap-2 group"
                            >
                                <MessageSquare size={12} className="opacity-50 group-hover:opacity-100" />
                                <span className="truncate">{session.session_title || session.last_message?.question || "Untitled Session"}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-fab-royal/30 bg-black/10">
            <div className={`flex items-center gap-3 ${!open ? 'justify-center flex-col' : ''}`}>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-fab-royal to-fab-blue flex items-center justify-center text-white ring-2 ring-white/10 shadow-sm shrink-0">
                    <User size={16} />
                </div>
                {open && (
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">System Admin</p>
                        <p className="text-[10px] text-fab-sky/60 truncate">admin@gernas.ae</p>
                    </div>
                )}
                <button 
                    onClick={onLogout}
                    className={`text-rose-400 hover:text-rose-200 hover:bg-rose-500/20 p-2 rounded-lg transition-colors ${!open ? 'mt-2' : ''}`}
                    title="Sign Out"
                >
                    <LogOut size={18} />
                </button>
            </div>
        </div>
    </div>
  );
};

export default Sidebar;
