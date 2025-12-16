
import React from 'react';
import { Compass, FileClock, LogOut, Hexagon, ChevronRight, BookOpen, GitMerge } from 'lucide-react';
import { View } from '../types';

interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, onLogout }) => {
  
  const navItems = [
    { id: 'HOME', label: 'Home', icon: Compass },
    { id: 'CANVAS', label: 'Canvas', icon: GitMerge },
    { id: 'HISTORY', label: 'History', icon: FileClock },
    { id: 'LIBRARY', label: 'Library', icon: BookOpen },
  ];

  return (
    <div className="h-full w-full bg-fab-navy text-fab-sky/70 flex flex-col shadow-2xl border-r border-fab-royal/50">
      {/* Branding */}
      <div className="p-6 flex items-center gap-3 border-b border-fab-royal/50 flex-shrink-0">
        <div className="w-9 h-9 bg-gradient-to-tr from-fab-royal to-fab-light rounded-lg flex items-center justify-center text-white shadow-lg shadow-black/20 relative group">
           <Hexagon size={18} className="fill-white/10 text-white" strokeWidth={2.5} />
           <span className="absolute inset-0 bg-white/20 blur-lg rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></span>
        </div>
        <div>
          <h1 className="text-white font-bold text-base tracking-tight leading-none">GERNAS</h1>
          <p className="text-[9px] text-fab-sky font-bold uppercase tracking-widest mt-1">SOP FLOW</p>
        </div>
      </div>

      {/* Nav Items */}
      <div className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        <p className="px-3 mb-2 text-[10px] font-bold text-fab-sky/50 uppercase tracking-wider">Navigation</p>
        {navItems.map(item => {
            const Icon = item.icon;
            // Highlight logic
            const isActive = currentView === item.id || (item.id === 'HOME' && currentView === 'SOPS');
            
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id as View)}
                className={`w-full flex items-center justify-between p-2.5 px-3 rounded-lg transition-all group ${
                  isActive 
                    ? 'bg-fab-royal text-white shadow-lg shadow-black/20' 
                    : 'hover:bg-fab-royal/40 text-fab-sky/70 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={isActive ? 'text-white' : 'text-fab-sky/50 group-hover:text-fab-sky'} />
                  <span className="text-xs font-medium">{item.label}</span>
                </div>
                {isActive && <ChevronRight size={14} className="text-fab-sky" />}
              </button>
            );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-fab-royal/50 bg-black/10 flex-shrink-0">
        <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 p-2.5 rounded-lg text-rose-300 hover:bg-rose-950/30 hover:text-rose-200 transition-all group"
        >
            <LogOut size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-xs font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
