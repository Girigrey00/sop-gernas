
import React from 'react';
import { Compass, FileClock, LogOut, Hexagon, ChevronRight, BookOpen, ChevronLeft } from 'lucide-react';
import { View } from '../types';

interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
  onLogout: () => void;
  isCollapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, onLogout, isCollapsed, onToggle }) => {
  
  const navItems = [
    { id: 'HOME', label: 'CBG KNOWLEDGE HUB', icon: Compass },
    { id: 'LIBRARY', label: 'Library', icon: BookOpen },
    { id: 'HISTORY', label: 'History', icon: FileClock },
  ];

  return (
    <div className="h-full w-full bg-fab-navy text-fab-sky/70 flex flex-col shadow-2xl border-r border-fab-royal/50 relative">
      
      {/* Branding */}
      <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} border-b border-fab-royal/50 flex-shrink-0 transition-all duration-300`}>
        <div className="w-9 h-9 bg-gradient-to-tr from-fab-royal to-fab-light rounded-lg flex items-center justify-center text-white shadow-lg shadow-black/20 relative group shrink-0">
           <Hexagon size={18} className="fill-white/10 text-white" strokeWidth={2.5} />
           <span className="absolute inset-0 bg-white/20 blur-lg rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></span>
        </div>
        {!isCollapsed && (
            <div className="overflow-hidden whitespace-nowrap animate-in fade-in duration-300">
              <h1 className="text-white font-bold text-base tracking-tight leading-none">GERNAS</h1>
              <p className="text-[9px] text-fab-sky font-bold uppercase tracking-widest mt-1">SOP FLOW</p>
            </div>
        )}
      </div>

       {/* Toggle Button (Desktop Only) */}
       <button
        onClick={onToggle}
        className="absolute top-24 -right-3 bg-fab-royal text-white p-1 rounded-full shadow-lg border border-fab-navy hover:bg-fab-blue transition-colors z-50 hidden lg:flex items-center justify-center"
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
      <div className="p-4 border-t border-fab-royal/50 bg-black/10 flex-shrink-0">
        <button 
            onClick={onLogout}
            title={isCollapsed ? "Sign Out" : ""}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} p-2.5 rounded-lg text-rose-300 hover:bg-rose-950/30 hover:text-rose-200 transition-all group`}
        >
            <LogOut size={isCollapsed ? 20 : 16} className="group-hover:-translate-x-0.5 transition-transform" />
            {!isCollapsed && <span className="text-xs font-medium whitespace-nowrap">Sign Out</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
