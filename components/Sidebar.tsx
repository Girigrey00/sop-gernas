import React from 'react';
import { Home, Workflow, History, LogOut, Hexagon, ChevronRight } from 'lucide-react';
import { View } from '../types';

interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, onLogout }) => {
  
  const navItems = [
    { id: 'HOME', label: 'Home', icon: Home },
    { id: 'CANVAS', label: 'Canvas', icon: Workflow },
    { id: 'HISTORY', label: 'History', icon: History },
  ];

  return (
    <div className="w-72 h-screen bg-[#0f172a] text-slate-400 flex flex-col shadow-2xl border-r border-slate-800 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-64 bg-blue-500/10 blur-3xl rounded-full pointer-events-none -translate-y-1/2"></div>

      {/* Header */}
      <div className="p-6 flex items-center gap-4 z-10">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 ring-1 ring-white/10">
            <Hexagon size={22} strokeWidth={2.5} className="fill-white/10" />
        </div>
        <div>
            <h1 className="text-xl font-bold text-white tracking-tight leading-none">GERNAS</h1>
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] mt-1">SOP FLOW</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2 py-6 z-10">
        <p className="px-4 text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-3">Main Menu</p>
        {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
                <button
                    key={item.id}
                    onClick={() => onNavigate(item.id as View)}
                    className={`w-full group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 border ${
                        isActive 
                        ? 'bg-gradient-to-r from-blue-600/20 to-indigo-600/10 border-blue-500/30 text-white shadow-sm' 
                        : 'bg-transparent border-transparent hover:bg-slate-800/50 hover:text-slate-200'
                    }`}
                >
                    <div className="flex items-center gap-3">
                        <Icon size={18} className={`${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                        <span className="font-medium text-sm">{item.label}</span>
                    </div>
                    {isActive && <ChevronRight size={14} className="text-blue-500" />}
                </button>
            )
        })}
      </nav>

      {/* Footer / User Profile */}
      <div className="p-4 z-10">
         <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-4 hover:border-slate-700 transition-colors">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 border border-slate-500/30 flex items-center justify-center text-xs font-bold text-white shadow-inner">
                    AD
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-200 truncate">Admin User</p>
                    <p className="text-xs text-slate-500 truncate">System Administrator</p>
                </div>
            </div>
            <button 
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-slate-800/80 hover:bg-rose-950/30 text-slate-400 hover:text-rose-400 transition-all text-xs font-bold border border-slate-700 hover:border-rose-900/30 uppercase tracking-wide"
            >
                <LogOut size={14} /> Sign Out
            </button>
         </div>
      </div>
    </div>
  );
};

export default Sidebar;