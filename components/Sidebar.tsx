
import React, { useEffect, useState } from 'react';
import { 
  FileText, ShieldCheck, GitMerge, AlertOctagon, BookOpen, Clock, 
  User, LogOut, MessageSquare 
} from 'lucide-react';
import { View, ChatSession, Product } from '../types';
import { apiService } from '../services/apiService';
import { Sidebar as AcetSidebar, SidebarBody, SidebarLink } from '@/components/ui/sidebar';
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
    <div className="flex items-center gap-3 py-1">
      <div className="w-9 h-9 bg-gradient-to-br from-fab-navy via-fab-royal to-fab-blue rounded-xl flex items-center justify-center text-white shadow-lg shadow-black/20 relative group shrink-0 overflow-hidden ring-1 ring-white/10">
           <div className="absolute top-0 right-0 w-6 h-6 bg-white/10 blur-md rounded-full transform translate-x-2 -translate-y-2"></div>
           <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 relative z-10">
               <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10H12v3h7.6C18.9 17.5 15.8 20 12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8c2.04 0 3.89.78 5.31 2.05l2.25-2.25C17.2 1.9 14.76 0 12 0z" />
           </svg>
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: open ? 1 : 0 }}
        className="flex flex-col overflow-hidden whitespace-nowrap"
      >
        <span className="font-bold text-white text-sm tracking-wide leading-none">GERNAS</span>
        <span className="text-[10px] text-fab-sky/60 font-medium tracking-wide mt-0.5">ISOP</span>
      </motion.div>
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
  // Map props to internal open state (inverted logic: collapsed=true means open=false)
  const open = !isCollapsed;
  const setOpen = (value: boolean | ((prevState: boolean) => boolean)) => {
      const newState = typeof value === 'function' ? value(open) : value;
      if (newState !== open) onToggle();
  };

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
    { id: 'HOME', label: 'Procedure', icon: <FileText className="h-5 w-5 flex-shrink-0" /> },
    { id: 'PROCESS_LINEAGE', label: 'Policy Standards', icon: <ShieldCheck className="h-5 w-5 flex-shrink-0" /> },
    { id: 'PROCESS_ANALYSIS', label: 'Process Lineage', icon: <GitMerge className="h-5 w-5 flex-shrink-0" /> },
    { id: 'IMPACT_ASSESSMENT', label: 'Impact Assessment', icon: <AlertOctagon className="h-5 w-5 flex-shrink-0" /> },
  ];

  // Additional context items
  if (productContext) {
      navItems.push({ id: 'LIBRARY', label: 'Library', icon: <BookOpen className="h-5 w-5 flex-shrink-0" /> });
      navItems.push({ id: 'HISTORY', label: 'History', icon: <Clock className="h-5 w-5 flex-shrink-0" /> });
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
    <div className="h-full bg-fab-navy border-r border-fab-royal/50 flex flex-col md:flex-row w-full flex-1 overflow-hidden">
        <AcetSidebar open={open} setOpen={setOpen}>
            <SidebarBody className="justify-between gap-10 bg-fab-navy border-r border-fab-royal/30">
                <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                    <Logo open={open} />
                    
                    <div className="mt-8 flex flex-col gap-2">
                        {open && <p className="px-2 mb-1 text-[10px] font-bold text-fab-sky/50 tracking-wider uppercase">Navigation</p>}
                        {navItems.map((item, idx) => (
                            <SidebarLink 
                                key={idx} 
                                link={{
                                    label: item.label,
                                    href: "#",
                                    icon: item.icon,
                                    onClick: () => handleNavigate(item.id)
                                }}
                                active={isActive(item.id)}
                            />
                        ))}
                    </div>

                    {/* Product History Section */}
                    {open && productContext && historySessions.length > 0 && (
                        <div className="mt-8 flex flex-col gap-2 animate-in fade-in duration-500">
                            <p className="px-2 mb-1 text-[10px] font-bold text-fab-sky/50 tracking-wider flex items-center justify-between uppercase">
                                Recent History
                                <span className="bg-fab-royal/30 px-1.5 py-0.5 rounded text-white text-[9px]">{historySessions.length}</span>
                            </p>
                            <div className="flex flex-col gap-1 max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
                                {historySessions.map(session => (
                                    <SidebarLink
                                        key={session._id}
                                        link={{
                                            label: session.session_title || session.last_message?.question || "Session",
                                            href: "#",
                                            icon: <MessageSquare className="h-4 w-4 flex-shrink-0 text-fab-sky/60" />,
                                            onClick: () => onLoadSession(session)
                                        }}
                                        className="py-1.5 text-xs opacity-90"
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="border-t border-fab-royal/30 pt-4">
                    <SidebarLink
                        link={{
                            label: "System Admin",
                            href: "#",
                            icon: (
                                <div className="h-7 w-7 rounded-full bg-fab-royal flex items-center justify-center text-white ring-2 ring-fab-navy/50 shrink-0">
                                    <User size={14} />
                                </div>
                            ),
                        }}
                    />
                    <SidebarLink
                        link={{
                            label: "Sign Out",
                            href: "#",
                            icon: <LogOut className="h-5 w-5 text-rose-400 shrink-0" />,
                            onClick: onLogout
                        }}
                        className="text-rose-300 hover:text-rose-100 hover:bg-rose-900/20 mt-1"
                    />
                </div>
            </SidebarBody>
        </AcetSidebar>
    </div>
  );
};

export default Sidebar;
