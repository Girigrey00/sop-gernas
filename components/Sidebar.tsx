
import  { useEffect, useState } from 'react';
import {  LogOut, ChevronRight, BookOpen, ChevronLeft, User, Clock, MessageSquare, FileText, ShieldCheck, GitMerge, AlertOctagon, FilePlus } from 'lucide-react';
import { View, ChatSession, Product } from '../types';
import { apiService } from '../services/apiService';

export interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
  onLogout: () => void;
  isCollapsed: boolean;
  onToggle: () => void;
  productContext: Product | null;
  onLoadSession: (session: ChatSession) => void;
}

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

  // Fetch full history for the sidebar
  useEffect(() => {
    const fetchHistory = async () => {
        try {
            const sessions = await apiService.getChatSessions();
            let filtered = sessions;
            
            // Filter by product context if active
            if (productContext) {
                filtered = sessions.filter(s => s.product === productContext.product_name);
            }

            // Sort by last activity - SHOW ALL (no slice)
            const sorted = filtered.sort((a, b) => new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime());
            setHistorySessions(sorted);
        } catch (e) {
            console.error("Sidebar history fetch error", e);
        }
    };
    fetchHistory();
  }, [currentView, productContext]); // Refresh when view changes or product context changes

  const navItems = [
    { id: 'HOME', label: 'Procedure Discovery', icon: FileText },
    { id: 'PROCESS_LINEAGE', label: 'Policy Standards', icon: ShieldCheck },
    { id: 'PROCESS_BUILDER', label: 'Procedure Builder', icon: FilePlus },
    { id: 'PROCESS_ANALYSIS', label: 'Process Lineage', icon: GitMerge },
    { id: 'IMPACT_ASSESSMENT', label: 'Impact Assessment', icon: AlertOctagon, badge: 'Coming Soon' },
    // Only show Library/History if a product context is selected
    ...(productContext ? [
        { id: 'LIBRARY', label: 'Library', icon: BookOpen },
        { id: 'HISTORY', label: 'History', icon: Clock }
    ] : []),
  ];

  return (
    <div className="h-full w-full bg-fab-navy text-fab-sky/70 flex flex-col shadow-2xl border-r border-fab-royal/50 relative">
      
      {/* Branding Section - Updated for Side-by-Side Larger Text */}
      <div className={`flex items-center ${isCollapsed ? 'justify-center p-4' : 'px-6 py-6 gap-4'} border-b border-fab-royal/50 flex-shrink-0 transition-all duration-300`}>
        
        {/* Logo Icon - Interactive G */}
        <div className={`relative group cursor-pointer shrink-0 ${isCollapsed ? 'w-10 h-10' : 'w-12 h-12'}`}>
           {/* Glow Effect behind logo */}
           <div className="absolute inset-0 bg-fab-sky/10 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
           
           <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md transition-transform duration-500 group-hover:rotate-[360deg] ease-in-out">
              <defs>
                  <linearGradient id="sidebar-g-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FFFFFF" />
                      <stop offset="100%" stopColor="#A6E1FA" />
                  </linearGradient>
              </defs>
              {/* Outer Ring Segment */}
              <path d="M 50 10 A 40 40 0 0 1 90 50" fill="none" stroke="url(#sidebar-g-gradient)" strokeWidth="4" strokeLinecap="round" className="opacity-50" />
              
              {/* Main G Shape */}
              <path 
                d="M 60 45 L 50 45 L 50 55 L 75 55 A 25 25 0 1 1 50 25" 
                fill="none" 
                stroke="white" 
                strokeWidth="8" 
                strokeLinecap="round"
                className="group-hover:stroke-fab-sky transition-colors duration-300"
              />
              
              {/* Center Dot */}
              <circle cx="50" cy="50" r="6" fill="#003DA5" className="group-hover:fill-white transition-colors duration-300" />
           </svg>
        </div>

        {/* Text Branding (Visible only when expanded) */}
        {!isCollapsed && (
            <div className="flex flex-col animate-in fade-in slide-in-from-left-2 duration-300 min-w-0">
              <h1 className="text-white font-black text-2xl tracking-tight leading-none drop-shadow-sm font-sans truncate">
                GERNAS
              </h1>
              <div className="flex items-center gap-2 mt-1">
                  <div className="h-0.5 w-6 bg-gradient-to-r from-fab-sky to-transparent rounded-full opacity-60"></div>
                  <p className="text-[11px] text-fab-sky font-bold tracking-[0.2em] uppercase leading-none">IOP</p>
              </div>
            </div>
        )}
      </div>

       {/* Toggle Button (Desktop Only) */}
       <button
        onClick={onToggle}
        className="absolute top-32 -right-3 bg-fab-royal text-white p-1 rounded-full shadow-lg border border-fab-navy hover:bg-fab-blue transition-colors z-50 hidden lg:flex items-center justify-center"
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Nav Items & History Container */}
      <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* Main Navigation */}
          <div className="px-3 py-6 space-y-2 shrink-0">
            {!isCollapsed && (
                <p className="px-3 mb-2 text-[10px] font-bold text-fab-sky/50 tracking-wider">Navigation</p>
            )}
            {navItems.map(item => {
                const Icon = item.icon;
                // Map CANVAS/SOPS view to HOME for highlighting if no specific match
                let isActive = currentView === item.id;
                if (item.id === 'HOME' && (currentView === 'CANVAS' || currentView === 'SOPS')) isActive = true;
                if (item.id === 'PROCESS_ANALYSIS' && currentView === 'ANALYSIS_CANVAS') isActive = true;
                if (item.id === 'PROCESS_LINEAGE' && currentView === 'LINEAGE_CHAT') isActive = true;

                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id as View)}
                    title={isCollapsed ? item.label : ''}
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} p-2.5 rounded-xl transition-all group relative ${
                      isActive 
                        ? 'bg-fab-royal text-white shadow-lg shadow-black/20' 
                        : 'hover:bg-fab-royal/40 text-fab-sky/70 hover:text-white'
                    }`}
                  >
                    <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} relative`}>
                      <Icon size={isCollapsed ? 22 : 18} className={`${isActive ? 'text-white' : 'text-fab-sky/50 group-hover:text-fab-sky'} transition-colors`} />
                      {!isCollapsed && <span className="text-xs font-medium whitespace-nowrap">{item.label}</span>}
                    </div>
                    {!isCollapsed && item.badge && (
                       <span className="text-[9px] bg-fab-sky/20 text-fab-sky border border-fab-sky/20 px-1.5 py-0.5 rounded font-bold">{item.badge}</span>
                    )}
                    {!isCollapsed && !item.badge && isActive && <ChevronRight size={14} className="text-fab-sky" />}
                    
                    {/* Active Bar Indicator for Collapsed Mode */}
                    {isCollapsed && isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-fab-sky rounded-r-full"></div>
                    )}
                  </button>
                );
            })}
          </div>

          {/* Product History List (Scrollable Area) */}
          {!isCollapsed && productContext && historySessions.length > 0 && (
            <div className="flex-1 overflow-y-auto px-3 pb-4 border-t border-fab-royal/20 pt-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-fab-royal/40 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-fab-royal/80">
                <p className="px-3 mb-3 text-[10px] font-bold text-fab-sky/50 tracking-wider flex items-center justify-between">
                    Product History
                    <span className="bg-fab-royal/30 px-1.5 py-0.5 rounded text-white text-[9px]">{historySessions.length}</span>
                </p>
                <div className="space-y-1">
                    {historySessions.map(session => {
                        const title = session.session_title || session.last_message?.question || "New Session";
                        return (
                            <button
                                key={session._id}
                                onClick={() => onLoadSession(session)}
                                className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-fab-royal/30 text-fab-sky/80 hover:text-white transition-colors group flex items-start gap-2.5 relative"
                                title={title} // Tooltip for full title
                            >
                                <MessageSquare size={14} className="mt-0.5 opacity-60 group-hover:opacity-100 shrink-0 text-fab-sky" />
                                <div className="overflow-hidden w-full">
                                    <p className="text-[11px] font-medium truncate w-full leading-tight">{title}</p>
                                    <p className="text-[9px] opacity-50 truncate mt-0.5">{new Date(session.last_activity).toLocaleDateString()}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
          )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-fab-royal/50 bg-black/10 flex-shrink-0 space-y-3">
        
        {/* User Profile */}
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-2`}>
            <div className="w-8 h-8 rounded-full bg-fab-royal flex items-center justify-center text-white ring-2 ring-fab-navy">
                <User size={16} />
            </div>
            {!isCollapsed && (
                <div className="overflow-hidden">
                    <p className="text-xs font-bold text-white truncate">Admin User</p>
                    <p className="text-[10px] text-fab-sky/60 truncate">System Administrator</p>
                </div>
            )}
        </div>

        <button 
            onClick={onLogout}
            title={isCollapsed ? "Sign Out" : ""}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} p-2.5 rounded-lg text-rose-300 hover:bg-rose-950/30 hover:text-rose-200 transition-all group border border-transparent hover:border-rose-900/30`}
        >
            <LogOut size={isCollapsed ? 18 : 16} className="group-hover:-translate-x-0.5 transition-transform" />
            {!isCollapsed && <span className="text-xs font-medium whitespace-nowrap">Sign Out</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
