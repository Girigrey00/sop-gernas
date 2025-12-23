import React from 'react';
import { Compass, LogOut, ChevronRight, BookOpen, ChevronLeft, User } from 'lucide-react';
import { View } from '../types';

interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
  onLogout: () => void;
  isCollapsed: boolean;
  onToggle: () => void;
  showLibrary: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, onLogout, isCollapsed, onToggle, showLibrary }) => {
  
  const navItems = [
    { id: 'HOME', label: 'CBG KNOWLEDGE HUB', icon: Compass },
    // Only show Library if a product context is selected
    ...(showLibrary ? [{ id: 'LIBRARY', label: 'Library', icon: BookOpen }] : []),
  ];

  return (
    <div className="h-full w-full bg-fab-navy text-fab-sky/70 flex flex-col shadow-2xl border-r border-fab-royal/50 relative">
      
      {/* Branding - Vertical Stack */}
      <div className={`p-6 flex flex-col items-center gap-3 border-b border-fab-royal/50 flex-shrink-0 transition-all duration-300`}>
        <div className="w-10 h-10 bg-gradient-to-br from-fab-navy via-fab-royal to-fab-blue rounded-xl flex items-center justify-center text-white shadow-lg shadow-black/20 relative group shrink-0 overflow-hidden ring-1 ring-white/10">
           {/* Inner Shine */}
           <div className="absolute top-0 right-0 w-6 h-6 bg-white/10 blur-md rounded-full transform translate-x-2 -translate-y-2"></div>
           {/* SVG Logo */}
           <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 relative z-10">
               <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10H12v3h7.6C18.9 17.5 15.8 20 12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8c2.04 0 3.89.78 5.31 2.05l2.25-2.25C17.2 1.9 14.76 0 12 0z" />
           </svg>
        </div>
        {!isCollapsed && (
            <div className="animate-in fade-in duration-300 text-center">
              <h1 className="text-white font-bold text-sm tracking-widest leading-none">GERNAS</h1>
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

      {/* Nav Items */}
      <div className="flex-1 px-3 py-6 space-y-2 overflow-y-auto overflow-x-hidden">
        {!isCollapsed && (
            <p className="px-3 mb-2 text-[10px] font-bold text-fab-sky/50 uppercase tracking-wider animate-in fade-in duration-300">Navigation</p>
        )}
        {navItems.map(item => {
            const Icon = item.icon;
            // Map CANVAS view to HOME (Hub) for sidebar highlighting if needed
            const isActive = currentView === item.id || (item.id === 'HOME' && (currentView === 'CANVAS' || currentView === 'SOPS'));
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
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                  <Icon size={isCollapsed ? 22 : 18} className={`${isActive ? 'text-white' : 'text-fab-sky/50 group-hover:text-fab-sky'} transition-colors`} />
                  {!isCollapsed && <span className="text-xs font-medium whitespace-nowrap">{item.label}</span>}
                </div>
                {!isCollapsed && isActive && <ChevronRight size={14} className="text-fab-sky" />}
                
                {/* Active Bar Indicator for Collapsed Mode */}
                {isCollapsed && isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-fab-sky rounded-r-full"></div>
                )}
              </button>
            );
        })}
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