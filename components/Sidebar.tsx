
import React from 'react';
import { Compass, FileClock, LogOut, Hexagon, ChevronRight, BookOpen } from 'lucide-react';
import { View } from '../types';

interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, onLogout }) => {
  
  const navItems = [
    { id: 'HOME', label: 'CBG KNOWLEDGE HUB', icon: Compass },
    { id: 'LIBRARY', label: 'Library', icon: BookOpen },
    { id: 'HISTORY', label: 'History', icon: FileClock },
  ];

  return (
    <div className="h-full w-full bg-[#0b1120] text-slate-400 flex flex-col shadow-2xl border-r border-slate-800/50">
      {/* Branding */}
      <div className="p-6 flex items-center gap-3 border-b border-slate-800/50 flex-shrink-0">
        <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-900/50 relative group">
           <Hexagon size={18} className="fill-white/10 text-white" strokeWidth={2.5} />
           <span className="absolute inset-0 bg-blue-500/20 blur-lg rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></span>
        </div>
        <div>
          <h1 className="text-slate-100 font-bold text-base tracking-tight leading-none">GERNAS</h1>
          <p className="text-[9px] text-blue-400 font-bold uppercase tracking-widest mt-1">SOP FLOW</p>
        </div>
      </div>

      {/* Nav Items */}
      <div className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        <p className="px-3 mb-2 text-[10px] font-bold text-slate-600 uppercase tracking-wider">Navigation</p>
        {navItems.map(item => {
            const Icon = item.icon;
            // Map CANVAS view to HOME (Hub) for sidebar highlighting if needed, or keep strict
            const isActive = currentView === item.id || (item.id === 'HOME' && (currentView === 'CANVAS' || currentView === 'SOPS'));
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id as View)}
                className={`w-full flex items-center justify-between p-2.5 px-3 rounded-lg transition-all group ${
                  isActive 
                    ? 'bg-blue-600/90 text-white shadow-lg shadow-blue-900/20' 
                    : 'hover:bg-slate-800/50 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'} />
                  <span className="text-xs font-medium">{item.label}</span>
                </div>
                {isActive && <ChevronRight size={14} className="text-blue-300" />}
              </button>
            );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800/50 bg-slate-900/30 flex-shrink-0">
        <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 p-2.5 rounded-lg text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 transition-all group"
        >
            <LogOut size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-xs font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;