import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Loader2, X, BookOpen, Maximize2, Minimize2, 
  ChevronDown, ChevronUp, FileText, 
  ThumbsUp, ThumbsDown, Copy, Sparkles, Lightbulb, ChevronRight, ChevronLeft, Brain,
  AlertOctagon, BarChart3, ArrowRightCircle, Map, Layers,
  ShieldAlert, Info, AlertTriangle, Clock, Calendar, CheckCircle2, Circle, 
  ListTodo, Percent, TrendingUp, User, Braces, Terminal, LayoutDashboard, Zap, PieChart,
  TrendingDown, Paperclip, Phone, Mail, MapPin, Star, Tag, Lightbulb as Bulb, DollarSign,
  ArrowRightLeft, Timer, Check, MoveRight, UserCheck, FileCheck, Package, HelpCircle, Quote, Hash
} from 'lucide-react';
import { SopResponse, Product } from '../types';
import { apiService } from '../services/apiService';
import { WIDGET_DEMO_DATA } from '../constants';

interface ChatAssistantProps {
  sopData: SopResponse;
  onClose: () => void;
  productContext?: Product | null;
  onToggleMaximize?: () => void;
  isMaximized?: boolean;
  initialSessionId?: string;
  onNavigateToStep?: (stepId: string) => void;
}

interface Message {
  id: string; // Used as question_id for feedback
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  citations?: Record<string, string>;
  isTyping?: boolean;
  feedback?: 'thumbs_up' | 'thumbs_down' | null;
  isWelcome?: boolean; // Flag to identify the initial welcome message
  suggestions?: string[]; // Optional suggestions attached to a message
}

// Fallback only if API returns absolutely nothing
const FALLBACK_PROMPTS = [
    "Summarize the key points of this document.",
    "What are the main risks identified?",
    "List the operational steps involved."
];

// Helper to clean messy JSON/Markdown questions from API
const cleanQuestions = (raw: any[]): string[] => {
    if (!Array.isArray(raw)) return [];
    
    let candidates: string[] = [];
    const rawStrings = raw.filter(i => typeof i === 'string') as string[];

    // Strategy 1: The API often splits the markdown block into array elements
    const combined = rawStrings.join('\n');
    const jsonBlockMatch = combined.match(/```json\s*([\s\S]*?)\s*```/) || combined.match(/\[\s*".*"\s*\]/);
    
    if (jsonBlockMatch) {
        try {
            const inner = jsonBlockMatch[1] || jsonBlockMatch[0];
            const parsed = JSON.parse(inner);
            if (Array.isArray(parsed)) {
                parsed.forEach(p => {
                    if (typeof p === 'string' && p.length > 5) candidates.push(p);
                });
                if (candidates.length > 0) return candidates; 
            }
        } catch (e) { }
    }

    // Strategy 2: Iterate items individually
    rawStrings.forEach(item => {
        const cleanItem = item.trim();
        if (cleanItem.startsWith('[') && cleanItem.endsWith(']')) {
             try {
                const parsed = JSON.parse(cleanItem);
                if (Array.isArray(parsed)) {
                     parsed.forEach(p => typeof p === 'string' && candidates.push(p));
                }
             } catch (e) {}
        } else {
            if (!cleanItem.startsWith('```') && !cleanItem.startsWith('//') && cleanItem.length > 10) {
                const text = cleanItem.replace(/^"|"$/g, '').replace(/^'|'$/g, '').trim();
                candidates.push(text);
            }
        }
    });

    return Array.from(new Set(candidates));
}

// Branded G Logo Component
const GIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10H12v3h7.6C18.9 17.5 15.8 20 12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8c2.04 0 3.89.78 5.31 2.05l2.25-2.25C17.2 1.9 14.76 0 12 0z" />
  </svg>
);

// --- A2UI (Adaptive AI UI) Widgets ---

const ProductCardWidget: React.FC<{ name: string, id: string, status: string }> = ({ name, id, status }) => {
    return (
        <div className="flex items-start gap-4 p-4 my-3 bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all w-full animate-in slide-in-from-left-2">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
                <Package size={24} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                    <h4 className="text-sm font-bold text-slate-800 truncate pr-2">{name}</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide shrink-0 ${
                        status.toLowerCase() === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                        'bg-slate-100 text-slate-500 border-slate-200'
                    }`}>
                        {status}
                    </span>
                </div>
                <p className="text-xs text-slate-500 font-mono mt-1">ID: {id}</p>
            </div>
        </div>
    );
};

const FaqWidget: React.FC<{ question: string, answer: string }> = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="my-2 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm animate-in slide-in-from-bottom-2">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
            >
                <HelpCircle size={16} className="text-fab-royal shrink-0" />
                <span className="text-xs font-bold text-slate-700 flex-1">{question}</span>
                {isOpen ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
            </button>
            {isOpen && (
                <div className="p-3 bg-white border-t border-slate-100">
                    <p className="text-xs text-slate-600 leading-relaxed">{answer}</p>
                </div>
            )}
        </div>
    );
};

const TagCloudWidget: React.FC<{ tags: string[] }> = ({ tags }) => {
    return (
        <div className="my-3 flex flex-wrap gap-2 animate-in fade-in">
            {tags.map((tag, i) => (
                <span key={i} className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 border border-slate-200 hover:border-blue-200 rounded-full text-[10px] font-bold transition-all cursor-default flex items-center gap-1">
                    <Hash size={10} className="opacity-50" />
                    {tag}
                </span>
            ))}
        </div>
    );
};

const SnippetWidget: React.FC<{ text: string }> = ({ text }) => {
    return (
        <div className="my-3 flex gap-3 p-4 bg-amber-50/50 border-l-4 border-amber-400 rounded-r-lg animate-in slide-in-from-left-2">
            <Quote size={20} className="text-amber-400 shrink-0 fill-amber-100" />
            <p className="text-xs text-slate-700 italic leading-relaxed font-medium">{text}</p>
        </div>
    );
};

const TrendWidget: React.FC<{ data: { label: string, value: number }[], title?: string }> = ({ data, title }) => {
    // Simple SVG Sparkline
    const height = 60;
    const width = 300;
    const max = Math.max(...data.map(d => d.value), 1);
    const min = Math.min(...data.map(d => d.value), 0);
    const range = max - min;
    
    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((d.value - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="my-3 p-4 bg-white border border-slate-200 rounded-xl shadow-sm w-full max-w-full overflow-hidden animate-in slide-in-from-right-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <TrendingUp size={16} className="text-emerald-500" />
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{title || 'Trend Analysis'}</span>
                </div>
            </div>
            <div className="relative h-[60px] w-full">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
                    <polyline points={points} fill="none" stroke="#10b981" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                    {data.map((d, i) => {
                         const x = (i / (data.length - 1)) * width;
                         const y = height - ((d.value - min) / range) * height;
                         return (
                             <circle key={i} cx={x} cy={y} r="3" fill="#10b981" className="hover:r-4 transition-all" >
                                 <title>{d.label}: {d.value}</title>
                             </circle>
                         )
                    })}
                </svg>
            </div>
            <div className="flex justify-between mt-2 text-[9px] text-slate-400 font-mono">
                <span>{data[0]?.label}</span>
                <span>{data[data.length-1]?.label}</span>
            </div>
        </div>
    );
};

const StepperWidget: React.FC<{ steps: { label: string, status: 'done' | 'active' | 'pending' }[] }> = ({ steps }) => {
    return (
        <div className="my-3 w-full overflow-x-auto pb-2">
            <div className="flex items-center min-w-max">
                {steps.map((step, i) => (
                    <div key={i} className="flex items-center">
                        <div className={`flex flex-col items-center gap-1 relative z-10 px-2`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                                step.status === 'done' ? 'bg-emerald-500 border-emerald-500 text-white' :
                                step.status === 'active' ? 'bg-white border-blue-500 text-blue-500 animate-pulse' :
                                'bg-slate-50 border-slate-200 text-slate-300'
                            }`}>
                                {step.status === 'done' ? <Check size={14} strokeWidth={3} /> : <span className="text-xs font-bold">{i+1}</span>}
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-wide whitespace-nowrap ${
                                step.status === 'done' ? 'text-emerald-600' :
                                step.status === 'active' ? 'text-blue-600' :
                                'text-slate-400'
                            }`}>{step.label}</span>
                        </div>
                        {i < steps.length - 1 && (
                            <div className={`h-0.5 w-12 -mt-4 transition-colors ${
                                step.status === 'done' ? 'bg-emerald-500' : 'bg-slate-200'
                            }`}></div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

const FileWidget: React.FC<{ filename: string, type?: string }> = ({ filename, type = 'PDF' }) => (
    <div className="flex items-center gap-3 p-3 my-2 bg-slate-50 border border-slate-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-colors cursor-pointer group animate-in slide-in-from-left-2 w-full max-w-sm">
        <div className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
            <Paperclip size={18} className="text-slate-400 group-hover:text-blue-500" />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-700 truncate group-hover:text-blue-700">{filename}</p>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{type} Document</p>
        </div>
        <div className="p-2 bg-white rounded-full text-slate-300 group-hover:text-blue-500 shadow-sm opacity-0 group-hover:opacity-100 transition-all">
            <ArrowRightCircle size={16} />
        </div>
    </div>
);

const SLAWidget: React.FC<{ time: string, text: string }> = ({ time, text }) => (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full text-amber-700 text-xs font-bold my-1 shadow-sm animate-pulse">
        <Timer size={14} className="animate-spin-slow" />
        <span className="uppercase tracking-wide">{time}:</span>
        <span>{text}</span>
    </div>
);

const ContactWidget: React.FC<{ name: string, role: string, email?: string }> = ({ name, role, email }) => (
    <div className="flex items-center gap-3 p-3 my-2 bg-gradient-to-r from-slate-50 to-white border border-slate-200 rounded-xl shadow-sm w-full max-w-sm">
        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm border-2 border-white shadow-md">
            {name.substring(0, 2).toUpperCase()}
        </div>
        <div>
            <p className="text-sm font-bold text-slate-800">{name}</p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
                <UserCheck size={12} /> {role}
            </div>
        </div>
    </div>
);

const LocationWidget: React.FC<{ location: string }> = ({ location }) => (
    <div className="flex items-center gap-2 my-2 text-xs text-slate-600 font-medium bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 w-fit">
        <MapPin size={14} className="text-rose-500" />
        {location}
    </div>
);

const RatingWidget: React.FC<{ score: number, max?: number }> = ({ score, max = 5 }) => (
    <div className="flex items-center gap-1 my-2">
        {[...Array(max)].map((_, i) => (
            <Star key={i} size={14} className={i < score ? "fill-amber-400 text-amber-400" : "text-slate-200"} />
        ))}
        <span className="ml-2 text-xs font-bold text-slate-600">{score}/{max}</span>
    </div>
);

// --- Existing Widgets ---

const PieChartWidget: React.FC<{ data: { label: string, value: number }[], title?: string }> = ({ data, title }) => {
    const total = data.reduce((acc, cur) => acc + cur.value, 0);
    let currentAngle = 0;
    const colors = ['#003DA5', '#034AC5', '#0647B8', '#A6E1FA', '#3b82f6', '#60a5fa', '#93c5fd'];

    return (
        <div className="my-3 p-4 bg-white border border-slate-200 rounded-xl shadow-sm animate-in slide-in-from-left-2 duration-500 w-full max-w-full overflow-hidden flex flex-col sm:flex-row items-center gap-6">
            <div className="relative w-32 h-32 shrink-0 group">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                    {data.map((d, i) => {
                        const sliceAngle = (d.value / total) * 360;
                        const x1 = 50 + 50 * Math.cos(Math.PI * currentAngle / 180);
                        const y1 = 50 + 50 * Math.sin(Math.PI * currentAngle / 180);
                        const x2 = 50 + 50 * Math.cos(Math.PI * (currentAngle + sliceAngle) / 180);
                        const y2 = 50 + 50 * Math.sin(Math.PI * (currentAngle + sliceAngle) / 180);
                        const largeArcFlag = sliceAngle > 180 ? 1 : 0;
                        const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
                        const el = <path key={i} d={pathData} fill={colors[i % colors.length]} stroke="white" strokeWidth="2" className="hover:opacity-80 transition-opacity cursor-pointer" />;
                        currentAngle += sliceAngle;
                        return el;
                    })}
                    <circle cx="50" cy="50" r="20" fill="white" className="drop-shadow-sm" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400">
                    <PieChart size={16} />
                </div>
            </div>
            <div className="flex-1 w-full min-w-0">
                {title && <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 truncate">{title}</h4>}
                <div className="grid grid-cols-2 gap-2">
                    {data.map((d, i) => (
                        <div key={i} className="flex items-center gap-2 min-w-0">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: colors[i % colors.length] }}></span>
                            <span className="text-xs text-slate-600 truncate">{d.label}</span>
                            <span className="text-xs font-bold text-slate-800 ml-auto">{d.value}%</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const BarChartWidget: React.FC<{ data: { label: string, value: number, displayValue: string }[], title?: string }> = ({ data, title }) => {
    const max = Math.max(...data.map(d => d.value), 1); 
    return (
        <div className="my-3 p-4 bg-white border border-slate-200 rounded-xl shadow-sm animate-in slide-in-from-left-2 duration-500 w-full max-w-full overflow-hidden">
            {title && (
                <div className="flex items-center gap-2 mb-3">
                    <BarChart3 size={14} className="text-fab-royal" />
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">{title}</h4>
                </div>
            )}
            <div className="space-y-3">
                {data.map((d, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs group w-full">
                        <div className="w-20 md:w-24 shrink-0 text-slate-600 font-medium truncate text-right" title={d.label}>{d.label}</div>
                        <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden min-w-[50px]">
                            <div 
                                className="h-full bg-fab-royal rounded-full transition-all duration-1000 ease-out group-hover:bg-fab-blue relative overflow-hidden" 
                                style={{ width: `${(d.value / max) * 100}%` }}
                            >
                                <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:animate-[shimmer_1s_infinite]"></div>
                            </div>
                        </div>
                        <div className="w-12 shrink-0 text-slate-700 font-bold text-right">{d.displayValue}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

const KeyValueWidget: React.FC<{ items: { key: string, value: string }[] }> = ({ items }) => {
    return (
        <div className="my-3 grid grid-cols-1 sm:grid-cols-2 gap-2 w-full animate-in slide-in-from-left-2">
            {items.map((item, i) => (
                <div key={i} className="flex flex-col p-2.5 bg-slate-50 border border-slate-200 rounded-lg hover:border-blue-200 transition-colors overflow-hidden">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider truncate">{item.key}</span>
                    <span className="text-xs font-semibold text-slate-700 break-words">{item.value}</span>
                </div>
            ))}
        </div>
    );
};

const JsonViewerWidget: React.FC<{ data: string }> = ({ data }) => {
    let parsed = null;
    let error = false;
    try {
        parsed = JSON.parse(data);
    } catch {
        error = true;
    }

    return (
        <div className="my-3 w-full bg-[#1e1e1e] rounded-xl overflow-hidden shadow-md animate-in slide-in-from-bottom-2 border border-slate-700 group">
            <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-[#3e3e3e]">
                <div className="flex items-center gap-2">
                    <Braces size={14} className="text-yellow-400" />
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">JSON Data</span>
                </div>
                <div className="flex gap-1.5 opacity-50 group-hover:opacity-100 transition-opacity">
                   <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                   <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                   <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                </div>
            </div>
            <div className="p-4 overflow-x-auto custom-scrollbar bg-[#1e1e1e]">
                {error ? (
                    <pre className="text-xs font-mono text-red-300 whitespace-pre-wrap break-all">{data}</pre>
                ) : (
                    <pre className="text-xs font-mono text-blue-300 whitespace-pre-wrap leading-relaxed">{JSON.stringify(parsed, null, 2)}</pre>
                )}
            </div>
        </div>
    );
};


const GaugeWidget: React.FC<{ label: string, value: number, max?: number, displayValue?: string }> = ({ label, value, max = 100, displayValue }) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));
    const circumference = 2 * Math.PI * 16; 
    const offset = circumference - (percentage / 100) * circumference;
    
    let color = 'text-fab-royal';
    let bgColor = 'text-blue-100';
    if (percentage >= 80) { color = 'text-emerald-500'; bgColor = 'text-emerald-100'; }
    else if (percentage <= 40) { color = 'text-rose-500'; bgColor = 'text-rose-100'; }
    else { color = 'text-amber-500'; bgColor = 'text-amber-100'; }

    return (
        <div className="my-2 mr-2 p-3 bg-white border border-slate-200 rounded-xl shadow-sm inline-flex items-center gap-3 pr-5 animate-in zoom-in-95 duration-300 max-w-full hover:shadow-md transition-shadow group cursor-default">
             <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
                <svg className="transform -rotate-90 w-10 h-10">
                    <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="4" fill="transparent" className={bgColor} />
                    <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="4" fill="transparent" 
                        strokeDasharray={circumference} 
                        strokeDashoffset={offset} 
                        className={`${color} transition-all duration-1000 ease-out`} 
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-700">
                    {percentage >= 80 ? <CheckCircle2 size={12} className="text-emerald-600" /> : 
                     percentage <= 40 ? <AlertTriangle size={12} className="text-rose-600" /> : 
                     <span className="text-[9px]">{Math.round(percentage)}%</span>}
                </div>
             </div>
             <div className="min-w-0 flex-1">
                 <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wide truncate group-hover:text-slate-600 transition-colors">{label}</p>
                 <p className="text-sm font-bold text-slate-800 truncate">{displayValue || `${value}/${max}`}</p>
             </div>
        </div>
    )
}

const ChecklistWidget: React.FC<{ items: string[] }> = ({ items }) => {
    return (
        <div className="my-3 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm animate-in slide-in-from-bottom-2 w-full">
            <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 flex items-center gap-2">
                <ListTodo size={14} className="text-slate-500" />
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Requirements</span>
            </div>
            <div className="p-2">
                {items.map((item, i) => {
                    const isChecked = item.startsWith('[x]') || item.startsWith('[X]');
                    const text = item.replace(/^\[[xX ]\]/, '').trim();
                    return (
                        <div key={i} className={`flex items-start gap-3 p-2 rounded-lg ${isChecked ? 'bg-emerald-50/50' : 'hover:bg-slate-50'}`}>
                            <div className={`mt-0.5 shrink-0 ${isChecked ? 'text-emerald-600' : 'text-slate-300'}`}>
                                {isChecked ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                            </div>
                            <span className={`text-xs leading-relaxed ${isChecked ? 'text-emerald-900 line-through decoration-emerald-300 decoration-2' : 'text-slate-700'}`}>
                                {text}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    )
}

const RoleWidget: React.FC<{ actor: string, description: string }> = ({ actor, description }) => (
    <div className="flex items-start gap-3 p-3 my-2 bg-indigo-50/50 border border-indigo-100 rounded-xl shadow-sm w-full animate-in slide-in-from-left-2 hover:bg-indigo-50 transition-colors">
        <div className="mt-0.5 w-8 h-8 rounded-full bg-white border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
            <User size={16} />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-indigo-900 uppercase tracking-wide truncate">{actor}</p>
            <p className="text-xs text-indigo-700 leading-relaxed break-words">{description}</p>
        </div>
    </div>
);

const DecisionOptionWidget: React.FC<{ options: string[], onSelect?: (opt: string) => void }> = ({ options, onSelect }) => (
    <div className="grid grid-cols-1 gap-2 my-3 w-full">
        {options.map((opt, i) => (
            <button 
                key={i} 
                onClick={() => onSelect && onSelect(opt)}
                className="p-3 text-left text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:border-blue-400 hover:shadow-md transition-all flex items-center gap-3 group w-full cursor-pointer"
            >
                <span className="w-6 h-6 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500 group-hover:bg-blue-500 group-hover:text-white transition-colors shrink-0">{String.fromCharCode(65+i)}</span>
                <span className="flex-1 break-words">{opt}</span>
                <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-500 shrink-0" />
            </button>
        ))}
    </div>
);

const RiskWidget: React.FC<{ riskId: string, sopData: SopResponse, fallbackText: string }> = ({ riskId, sopData, fallbackText }) => {
  const risk = sopData.inherentRisks.find(r => r.riskId === riskId || r.riskId === riskId.replace(/[*_]/g, ''));
  const displayId = risk?.riskId || riskId.replace(/[*_]/g, '');
  const category = risk?.category || 'Operational Risk';
  const description = risk?.description || fallbackText || 'Details not available in current context.';

  return (
    <div className="flex gap-3 items-start p-3 bg-rose-50 border border-rose-100 rounded-xl my-2 shadow-sm hover:shadow-md transition-all cursor-default group animate-in slide-in-from-left-2 duration-300 w-full">
       <div className="mt-0.5 p-1.5 bg-white rounded-full text-rose-500 shadow-sm border border-rose-100 group-hover:scale-110 transition-transform shrink-0">
          <AlertOctagon size={16} />
       </div>
       <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1 gap-2">
             <span className="text-xs font-bold text-rose-900 truncate">{displayId}</span>
             <span className="text-[9px] uppercase bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded font-bold tracking-wider shrink-0">{category}</span>
          </div>
          <p className="text-xs text-rose-700 leading-relaxed break-words">{description.replace(/[*_]/g, '')}</p>
       </div>
    </div>
  )
}

const StepWidget: React.FC<{ stepId: string, sopData: SopResponse, onClick?: (id: string) => void }> = ({ stepId, sopData, onClick }) => {
    let stepDetails = null;
    if (sopData.processFlow && sopData.processFlow.stages) {
        for (const stage of sopData.processFlow.stages) {
            const found = stage.steps.find(s => s.stepId === stepId);
            if (found) {
                stepDetails = found;
                break;
            }
        }
    }
    
    if (!stepDetails) {
        return (
             <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold mx-0.5 bg-slate-100 text-slate-600 border border-slate-200 align-middle">
                <ArrowRightCircle size={10} />
                {stepId}
            </span>
        );
    }

    return (
        <button 
            onClick={() => onClick && onClick(stepId)}
            className="w-full my-2 p-3 bg-white border border-blue-100 rounded-lg shadow-sm flex items-center gap-3 hover:border-blue-400 hover:shadow-md hover:bg-blue-50/50 transition-all group cursor-pointer text-left"
            title="Click to view in Flow"
        >
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-md group-hover:bg-blue-600 group-hover:text-white transition-colors relative shrink-0">
                <Map size={16} />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-ping opacity-0 group-hover:opacity-100"></div>
            </div>
            <div className="flex-1 min-w-0">
                 <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 rounded border border-slate-200 truncate">{stepDetails.stepId}</span>
                    <span className="text-[9px] font-medium text-slate-400 uppercase tracking-wider truncate">{stepDetails.actor}</span>
                 </div>
                 <p className="text-xs font-medium text-slate-800 truncate group-hover:text-blue-700 transition-colors">{stepDetails.stepName}</p>
            </div>
            <div className="flex items-center gap-1 text-slate-300 group-hover:text-blue-500 transition-colors shrink-0">
                <span className="text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline">LOCATE</span>
                <ChevronRight size={14} />
            </div>
        </button>
    );
}

const PolicyWidget: React.FC<{ type: 'POLICY' | 'WARNING' | 'NOTE', text: string }> = ({ type, text }) => {
    let styles = {
        bg: 'bg-slate-50',
        border: 'border-slate-200',
        icon: Info,
        iconColor: 'text-slate-500',
        title: 'Note',
        titleColor: 'text-slate-700'
    };

    if (type === 'POLICY') {
        styles = {
            bg: 'bg-indigo-50',
            border: 'border-indigo-100',
            icon: ShieldAlert,
            iconColor: 'text-indigo-600',
            title: 'Policy Requirement',
            titleColor: 'text-indigo-900'
        };
    } else if (type === 'WARNING') {
        styles = {
            bg: 'bg-rose-50',
            border: 'border-rose-100',
            icon: AlertTriangle,
            iconColor: 'text-rose-600',
            title: 'Critical Warning',
            titleColor: 'text-rose-900'
        };
    }

    const Icon = styles.icon;

    return (
        <div className={`my-2 p-3 rounded-lg border flex gap-3 items-start ${styles.bg} ${styles.border} animate-in slide-in-from-left-2 w-full`}>
            <div className={`mt-0.5 shrink-0 ${styles.iconColor}`}>
                <Icon size={16} />
            </div>
            <div className="flex-1 min-w-0">
                <p className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${styles.titleColor}`}>{styles.title}</p>
                <p className="text-xs text-slate-700 leading-relaxed break-words">{text}</p>
            </div>
        </div>
    );
}

const TimelineWidget: React.FC<{ time: string, text: string }> = ({ time, text }) => {
    return (
        <div className="flex gap-3 relative pl-2 group animate-in slide-in-from-left-2">
             <div className="absolute left-[15px] top-6 bottom-[-8px] w-px bg-slate-200 group-last:hidden"></div>
             <div className="mt-1 relative z-10 shrink-0">
                 <div className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 shadow-sm text-[10px] font-bold">
                    <Clock size={12} />
                 </div>
             </div>
             <div className="pb-4 pt-1 flex-1 min-w-0">
                 <span className="inline-block px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold font-mono mb-1 border border-slate-200">
                    {time}
                 </span>
                 <p className="text-xs text-slate-700 leading-relaxed break-words">{text}</p>
             </div>
        </div>
    )
}

const MetricWidget: React.FC<{ row: string[], headers: string[] }> = ({ row, headers }) => {
   let name = "";
   let value = "";
   let target = "";

   headers.forEach((h, idx) => {
       const header = (h || "").toLowerCase().replace(/[*_]/g, ''); 
       const cellData = row[idx] || ""; 

       if (header.includes('value') || header.includes('current') || header.includes('actual')) value = cellData;
       else if (header.includes('target') || header.includes('goal') || header.includes('objective')) target = cellData;
       else if (header.includes('metric') || header.includes('measure') || header.includes('kpi') || header.includes('indicator') || header.includes('name')) name = cellData;
   });

   if (!name && row.length > 0) name = row[0] || "";
   if (!value && row.length > 1) value = row[row.length - 1] || "";
   if (!target && row.length > 2) target = row[row.length - 2] || "";

   const safeName = String(name || "");
   const safeValue = String(value || "");
   const safeTarget = String(target || "");

   return (
      <div className="p-4 bg-white border border-slate-200 rounded-xl text-center flex flex-col items-center justify-between min-w-[140px] max-w-[160px] shadow-sm h-full hover:border-fab-royal/30 transition-colors snap-center">
          <div className="p-2 bg-blue-50 text-fab-royal rounded-full mb-2">
              <BarChart3 size={16} />
          </div>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2 w-full line-clamp-2 leading-tight min-h-[2.5em]">{safeName.replace(/[*_]/g, '')}</p>
          <div className="text-2xl font-bold text-slate-800 mb-2 break-all">{safeValue.replace(/[*_]/g, '')}</div>
          {safeTarget && (
            <div className="text-[9px] text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-100 w-full truncate">
                Target: <span className="font-semibold">{safeTarget.replace(/[*_]/g, '')}</span>
            </div>
          )}
      </div>
   )
}

// --- Citation Block ---
const CitationBlock = ({ citations }: { citations: Record<string, string> }) => {
  const [isOpen, setIsOpen] = useState(false);
  const count = Object.keys(citations).length;
  if (count === 0) return null;

  return (
    <div className="mt-3 w-full">
      <div className={`transition-all duration-300 overflow-hidden ${isOpen ? 'bg-slate-50/80 rounded-xl border border-slate-200/60 shadow-sm' : ''}`}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors group ${!isOpen ? '-ml-2' : 'w-full mb-1 border-b border-slate-100'}`}
        >
            <div className={`p-1.5 rounded-md transition-colors ${isOpen ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'bg-transparent text-slate-400 group-hover:text-slate-600'}`}>
                <BookOpen size={14} />
            </div>
            <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-700">
               {count} Reference{count > 1 ? 's' : ''} Found
            </span>
            {isOpen && <div className="flex-1" />}
            {isOpen ? <ChevronUp size={14} className="text-slate-400 mr-2" /> : <ChevronDown size={14} className="text-slate-400 opacity-50 group-hover:opacity-100" />}
        </button>
        {isOpen && (
             <div className="p-3 pt-2 grid gap-3">
                {Object.entries(citations).map(([key, value]) => {
                    let source = "Source Document";
                    let page = "";
                    let content = value;
                    const firstColon = value.indexOf(':');
                    if (firstColon > -1 && firstColon < 100) {
                        const meta = value.substring(0, firstColon);
                        content = value.substring(firstColon + 1).trim();
                        const pageMatch = meta.match(/[-|(]\s*Page\s*(\d+)/i);
                        if (pageMatch) {
                            page = `Page ${pageMatch[1]}`;
                            source = meta.replace(pageMatch[0], '').trim().replace(/[-|)]$/, '').trim();
                        } else {
                            source = meta.trim();
                        }
                    }
                    return (
                        <div key={key} className="flex gap-3 items-start group/card relative bg-white p-3 rounded-lg border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all">
                            <span className="shrink-0 flex h-5 w-5 items-center justify-center rounded bg-slate-50 border border-slate-200 text-[10px] font-bold text-slate-500 shadow-sm mt-0.5 group-hover/card:bg-blue-50 group-hover:card:text-blue-600 transition-colors">
                                {key.replace(/[\[\]]/g, '')}
                            </span>
                            <div className="min-w-0 flex-1 space-y-1.5">
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        <FileText size={12} className="text-slate-400 shrink-0" />
                                        <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wide truncate max-w-[180px]" title={source}>{source}</p>
                                    </div>
                                    {page && <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-bold rounded border border-slate-200">{page}</span>}
                                </div>
                                <div className="text-xs text-slate-600 leading-relaxed pl-1 border-l-2 border-slate-100 group-hover/card:border-blue-200 transition-colors">"{content}"</div>
                            </div>
                        </div>
                    )
                })}
            </div>
        )}
      </div>
    </div>
  );
};

// --- Rich Text Formatter ---
const formatInlineText = (text: string, isUser: boolean, sopData?: SopResponse) => {
    // Handle Bold **text**
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index} className={`font-bold ${isUser ? 'text-white' : 'text-slate-900'}`}>{part.slice(2, -2)}</strong>;
        }
        // Handle Citations [1]
        const citationParts = part.split(/(\[\d+\])/g);
        return (
            <span key={index}>
                {citationParts.map((subPart, subIndex) => {
                    if (/^\[\d+\]$/.test(subPart)) {
                        return (
                            <sup 
                                key={subIndex} 
                                className={`text-[9px] font-bold px-1.5 py-0 rounded ml-0.5 cursor-help transition-transform hover:scale-110 inline-block ${isUser ? 'text-blue-200 bg-white/20' : 'text-fab-royal bg-blue-50 border border-blue-100'}`}
                            >{subPart.replace(/[\[\]]/g, '')}</sup>
                        );
                    }
                    
                    // Handle Inline Step References (e.g. S1-1) for User Messages (System uses widgets)
                    if (isUser && /\b[S]\d+-\d+\b/.test(subPart)) {
                        return (
                            <span key={subIndex} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold mx-0.5 bg-white/20">
                                <ArrowRightCircle size={10} />
                                {subPart}
                            </span>
                        )
                    }
                    return <span key={subIndex}>{subPart}</span>;
                })}
            </span>
        );
    });
};

const MessageRenderer = ({ content, role, isWelcome, sopData, onNavigateToStep, onSendManual }: { content: string, role: 'user' | 'assistant', isWelcome?: boolean, sopData: SopResponse, onNavigateToStep?: (id: string) => void, onSendManual?: (txt: string) => void }) => {
    const isUser = role === 'user';
    
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    
    let tableBuffer: string[] = [];
    let inTable = false;
    let listBuffer: string[] = [];
    
    let inCodeBlock = false;
    let codeBuffer: string[] = [];

    let inRawJson = false;
    let rawJsonBuffer: string[] = [];

    const processListBuffer = (items: string[], keyPrefix: string) => {
        if (items.length === 0) return null;

        // 1. Checklist
        const isChecklist = items.every(i => i.trim().match(/^[-*]\s*\[[ xX]\]/));
        if (isChecklist) {
            const cleanItems = items.map(i => i.replace(/^[-*]\s*/, ''));
            return <ChecklistWidget key={keyPrefix} items={cleanItems} />;
        }

        // 2. Decision Options
        const isOptions = items.every(i => i.trim().match(/^[-*]\s*((\*\*)?)Option\s*[\d|A-Z]((\*\*)?)/i));
        if (isOptions) {
            const cleanOptions = items.map(i => i.replace(/^[-*]\s*/, '').trim());
            return <DecisionOptionWidget key={keyPrefix} options={cleanOptions} onSelect={onSendManual} />;
        }

        // 3. Key-Value & Chart Data Detection
        // New: Check for Trend Data (Date: Value)
        const isTrend = items.length >= 3 && items.every(i => {
             const clean = i.replace(/^[-*]\s+/, '').trim();
             return clean.match(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Q\d|\d{4})[:\s]/i) && clean.match(/\d+$/);
        });

        // 4. Stepper Detection (Step X: Active/Done)
        const isStepper = items.every(i => {
             const clean = i.toLowerCase();
             return clean.includes('step') && (clean.includes('done') || clean.includes('active') || clean.includes('pending'));
        });

        if (isTrend) {
             const trendData = items.map(i => {
                 const parts = i.replace(/^[-*]\s+/, '').split(/[:\s]+/);
                 return { label: parts[0], value: parseInt(parts[parts.length-1]) || 0 };
             });
             return <TrendWidget key={keyPrefix} data={trendData} />;
        }

        if (isStepper) {
             const stepData = items.map(i => {
                 const clean = i.replace(/^[-*]\s+/, '');
                 let status: 'done' | 'active' | 'pending' = 'pending';
                 if (clean.toLowerCase().includes('done') || clean.toLowerCase().includes('complete')) status = 'done';
                 else if (clean.toLowerCase().includes('active') || clean.toLowerCase().includes('current')) status = 'active';
                 
                 return { label: clean.split(/[:(]/)[0].trim(), status };
             });
             return <StepperWidget key={keyPrefix} steps={stepData} />;
        }

        // Standard Key-Value / Chart
        const isKeyValue = items.every(i => {
             const clean = i.replace(/^[-*]\s+/, '').trim();
             return clean.includes(':') && clean.split(':').length === 2 && clean.length < 100;
        });

        if (items.length >= 2) {
            const chartData = [];
            let isChart = true;
            for (const item of items) {
                const clean = item.replace(/^[-*]\s+/, '').trim();
                const parts = clean.split(':');
                if (parts.length < 2) { isChart = false; break; }
                
                const label = parts[0].trim();
                const valStr = parts.slice(1).join(':').trim(); 
                const valMatch = valStr.match(/^[\D]*(\d+(\.\d+)?)[\D]*$/); 
                
                if (!valMatch) { isChart = false; break; }
                const value = parseFloat(valMatch[1]);
                chartData.push({ label, value, displayValue: valStr });
            }

            if (isChart && chartData.length > 0) {
                const sum = chartData.reduce((acc, c) => acc + c.value, 0);
                const isPercentage = chartData.every(d => d.displayValue.includes('%'));
                
                if (isPercentage && sum >= 95 && sum <= 105) {
                    return <PieChartWidget key={keyPrefix} data={chartData} />;
                } else {
                    return <BarChartWidget key={keyPrefix} data={chartData} />;
                }
            }
        }
        
        if (isKeyValue) {
             const kvData = items.map(i => {
                 const clean = i.replace(/^[-*]\s+/, '').trim();
                 const parts = clean.split(':');
                 return { key: parts[0].trim(), value: parts[1].trim() };
             });
             return <KeyValueWidget key={keyPrefix} items={kvData} />;
        }

        return items.map((item, i) => (
             <div key={`${keyPrefix}-${i}`} className="flex items-start gap-2 mb-1 pl-1">
                <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${isUser ? 'bg-white' : 'bg-fab-royal'}`}></span>
                <span className={`break-words ${isUser ? 'text-white' : 'text-slate-700'}`}>
                    {formatInlineText(item.replace(/^[-*]\s+/, ''), isUser, sopData)}
                </span>
            </div>
        ));
    };

    lines.forEach((line, i) => {
        const trimmed = line.trim();

        if (trimmed.startsWith('```')) {
            if (inCodeBlock) {
                inCodeBlock = false;
                const code = codeBuffer.join('\n');
                elements.push(<JsonViewerWidget key={`json-${i}`} data={code} />);
                codeBuffer = [];
            } else {
                inCodeBlock = true;
            }
            return;
        }

        if (inCodeBlock) {
            codeBuffer.push(line);
            return;
        }

        if (!isUser && trimmed.startsWith('{') && !inRawJson) {
            inRawJson = true;
            rawJsonBuffer.push(trimmed);
            return;
        }
        if (inRawJson) {
            rawJsonBuffer.push(trimmed);
            if (trimmed.endsWith('}') || (trimmed === '}' && rawJsonBuffer.length > 1)) {
                inRawJson = false;
                const jsonStr = rawJsonBuffer.join('\n');
                elements.push(<JsonViewerWidget key={`raw-json-${i}`} data={jsonStr} />);
                rawJsonBuffer = [];
            }
            return;
        }

        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            listBuffer.push(trimmed);
            if (i === lines.length - 1) {
                const result = processListBuffer(listBuffer, `list-${i}`);
                if (Array.isArray(result)) elements.push(...result);
                else if (result) elements.push(result);
            }
            return; 
        } else {
            if (listBuffer.length > 0) {
                const result = processListBuffer(listBuffer, `list-${i}`);
                if (Array.isArray(result)) elements.push(...result);
                else if (result) elements.push(result);
                listBuffer = [];
            }
        }
        
        if (trimmed.startsWith('|')) {
            inTable = true;
            tableBuffer.push(trimmed);
            const nextLine = lines[i+1];
            if (i === lines.length - 1 || (nextLine !== undefined && !nextLine.trim().startsWith('|'))) {
                const headers = tableBuffer[0].split('|').filter(c => c.trim()).map(c => c.trim());
                const rows = tableBuffer.slice(2).map(r => r.split('|').filter(c => c.trim()).map(c => c.trim()));
                const isMetricTable = headers.some(h => {
                    const clean = h.toLowerCase().replace(/[^a-z]/g, ''); 
                    return ['metric', 'measure', 'kpi', 'metrics', 'indicator'].some(k => clean.includes(k));
                });
                
                if (isMetricTable && !isUser) {
                    elements.push(
                        <div key={`metrics-${i}`} className="my-4 w-full">
                            <div className="flex gap-3 overflow-x-auto pb-2 snap-x px-1">
                                {rows.map((row, rIdx) => (
                                    <MetricWidget key={rIdx} row={row} headers={headers} />
                                ))}
                            </div>
                        </div>
                    );
                } else {
                    elements.push(
                        <div key={`tbl-${i}`} className="my-3 w-full overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
                            <table className="w-full text-left text-xs min-w-[300px]">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        {headers.map((h, hIdx) => (
                                            <th key={hIdx} className="p-2 font-bold text-slate-700 whitespace-nowrap">{formatInlineText(h, isUser)}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {rows.map((row, rIdx) => (
                                        <tr key={rIdx} className="hover:bg-slate-50/50">
                                            {row.map((cell, cIdx) => (
                                                <td key={cIdx} className="p-2 text-slate-600 min-w-[80px] break-words">{formatInlineText(cell, isUser)}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    );
                }
                tableBuffer = [];
                inTable = false;
            }
            return; 
        } 
        
        if (inTable) {
             if(trimmed.match(/^[|\s-:]+$/)) {
                 tableBuffer.push(trimmed); 
                 return;
             }
             inTable = false; 
        }

        if (!isUser) {
            // New Widgets Logic 
            
            // 1. File Widget ([File] Name)
            if (trimmed.match(/^\[(File|Doc|PDF)\]/i)) {
                const parts = trimmed.split(/\]/);
                if (parts.length > 1) {
                    elements.push(<FileWidget key={`file-${i}`} filename={parts[1].trim()} />);
                    return;
                }
            }

            // 2. SLA Widget (**SLA**: Text)
            if (trimmed.match(/^\*\*(SLA|Deadline|Time)\*\*:/i)) {
                const parts = trimmed.split(':');
                elements.push(<SLAWidget key={`sla-${i}`} time={parts[0].replace(/\*\*/g, '').trim()} text={parts.slice(1).join(':').trim()} />);
                return;
            }

            // 3. Contact/Owner Widget (**Owner**: Name | Role)
            if (trimmed.match(/^\*\*(Owner|Contact|Person)\*\*:/i)) {
                const content = trimmed.split(':')[1].trim();
                const [name, role, email] = content.split('|').map(s => s.trim());
                elements.push(<ContactWidget key={`contact-${i}`} name={name} role={role || 'Staff'} email={email} />);
                return;
            }

            // 4. Location Widget (**Location**: Text)
            if (trimmed.match(/^\*\*(Location|Place|Site)\*\*:/i)) {
                elements.push(<LocationWidget key={`loc-${i}`} location={trimmed.split(':')[1].trim()} />);
                return;
            }

            // 5. Rating Widget (**Rating**: 4/5)
            if (trimmed.match(/^\*\*(Rating|Score)\*\*:\s*\d+/i)) {
                const val = parseInt(trimmed.match(/\d+/)?.[0] || '0');
                elements.push(<RatingWidget key={`rating-${i}`} score={val} />);
                return;
            }

            // 6. Product Card Widget (**Product**: Name | ID | Status)
            if (trimmed.match(/^\*\*(Product|System)\*\*:/i)) {
                const content = trimmed.split(':')[1].trim();
                const [name, id, status] = content.split('|').map(s => s.trim());
                if (name && id) {
                    elements.push(<ProductCardWidget key={`prod-${i}`} name={name} id={id} status={status || 'Active'} />);
                    return;
                }
            }

            // 7. Snippet/Quote Widget (> text)
            if (trimmed.startsWith('> ')) {
                elements.push(<SnippetWidget key={`snip-${i}`} text={trimmed.substring(2)} />);
                return;
            }

            // 8. FAQ Widget (**Q**: ...)
            if (trimmed.match(/^\*\*(Q|Question)\*\*:/i)) {
                const question = trimmed.split(':')[1].trim();
                const nextLine = lines[i+1]?.trim();
                if (nextLine && nextLine.match(/^\*\*(A|Answer)\*\*:/i)) {
                    // Skip next line in main loop since we handle it here
                    // Ideally we'd advance the index, but React rendering maps line by line.
                    // Instead, we can render the widget here and the next iteration will see the 'A' line.
                    // We need to suppress the 'A' line from rendering separately.
                    // Simple hack: We won't suppress, we just render the FAQ widget which encapsulates Q & A.
                    // Actually, let's just assume trigger is the Q line, and we pull A from next line content.
                    const answer = nextLine.split(':')[1].trim();
                    elements.push(<FaqWidget key={`faq-${i}`} question={question} answer={answer} />);
                    // We can't skip `i` here easily in map. So we will let the 'A' line render as text or handle it?
                    // Better approach: If this line is Q, render widget. If next line is A, we need to hide it in next iteration.
                    // This simple parser doesn't support lookahead skipping. 
                    // Let's rely on standard Q/A formatting or just render Q here.
                    return; 
                }
            }
            // Hide Answer line if it was part of FAQ above (Hack for simple parser)
            if (trimmed.match(/^\*\*(A|Answer)\*\*:/i)) {
                return; 
            }

            // 9. Tag Cloud (**Tags**: t1, t2)
            if (trimmed.match(/^\*\*(Tags|Topics)\*\*:/i)) {
                const tags = trimmed.split(':')[1].split(',').map(t => t.trim());
                elements.push(<TagCloudWidget key={`tags-${i}`} tags={tags} />);
                return;
            }

            // Existing Logics...
            const scoreMatch = trimmed.match(/^\*?\*?(Score|Confidence|Probability|Match)\*?\*?\s*[:\-]\s*(.*)/i);
            if (scoreMatch) {
                const label = scoreMatch[1];
                const valStr = scoreMatch[2].trim();
                const valMatch = valStr.match(/(\d+(\.\d+)?)/);
                if (valMatch) {
                    let max = 100;
                    let val = parseFloat(valMatch[0]);
                    if (val <= 1 && (label.includes('Prob') || label.includes('Conf') || label.includes('Match'))) val = val * 100;
                    if (valStr.includes('/10') || (val <= 10 && !valStr.includes('%'))) max = 10;
                    elements.push(<GaugeWidget key={`gauge-${i}`} label={label} value={val} max={max} displayValue={valStr} />);
                    return;
                }
            }

            const roleMatch = trimmed.match(/^\*?\*?(.*(?:Manager|Officer|Customer|System|Admin|User|Client).*)\*?\*?\s*[:\-]\s*(.*)/i);
            if (roleMatch && !roleMatch[1].toLowerCase().includes('step') && !roleMatch[1].toLowerCase().includes('risk') && !roleMatch[1].toLowerCase().includes('sla') && !roleMatch[1].toLowerCase().includes('owner') && !roleMatch[1].toLowerCase().includes('product')) {
                 elements.push(<RoleWidget key={`role-${i}`} actor={roleMatch[1]} description={roleMatch[2]} />);
                 return;
            }

            const policyMatch = trimmed.match(/^[-*]?\s*\*\*(POLICY|WARNING|NOTE|CRITICAL|COMPLIANCE)(?:\s*Alert|\s*Check)?\*\*\s*[:\-]\s*(.*)/i);
            if (policyMatch) {
                const typeRaw = policyMatch[1].toUpperCase();
                let type: 'POLICY' | 'WARNING' | 'NOTE' = 'NOTE';
                if (['POLICY', 'COMPLIANCE'].includes(typeRaw)) type = 'POLICY';
                if (['WARNING', 'CRITICAL'].includes(typeRaw)) type = 'WARNING';
                elements.push(<PolicyWidget key={`pol-${i}`} type={type} text={policyMatch[2]} />);
                return;
            }

            const timeMatch = trimmed.match(/^[-*]?\s*\*\*((?:\d{1,2}:\d{2})(?:\s*[AP]M)?)\*\*\s*[:\-]\s*(.*)/i);
            if (timeMatch) {
                elements.push(<TimelineWidget key={`time-${i}`} time={timeMatch[1]} text={timeMatch[2]} />);
                return;
            }

            const riskMatch = trimmed.match(/^[-*]\s*(?:\*\*)?(R\d+)(?:\*\*)?[\s:.-]+(.*)/i);
            if (riskMatch) {
                elements.push(<RiskWidget key={`risk-${i}`} riskId={riskMatch[1]} sopData={sopData} fallbackText={riskMatch[2]} />);
                return;
            }

            const stepMatch = trimmed.match(/^[-*]?\s*(?:\*\*)?(?:Step\s*)?([S]\d+-\d+)(?:\*\*)?[:\s]+(.*)/i);
            if (stepMatch && trimmed.length < 200) {
                 elements.push(<StepWidget key={`step-${i}`} stepId={stepMatch[1]} sopData={sopData} onClick={onNavigateToStep} />);
                 if (stepMatch[2] && stepMatch[2].length > 3) {
                     elements.push(<p key={`step-desc-${i}`} className="text-xs text-slate-600 ml-4 mb-2">{formatInlineText(stepMatch[2], isUser)}</p>);
                 }
                 return;
            }
        }

        if (trimmed.startsWith('### ')) {
            elements.push(<h3 key={i} className={`font-bold mt-3 mb-2 leading-snug tracking-tight break-words ${isWelcome ? 'text-sm text-fab-navy' : 'text-lg'} ${isUser ? 'text-white' : (isWelcome ? 'text-fab-navy' : 'text-slate-800')}`}>{formatInlineText(trimmed.replace(/^###\s+/, ''), isUser)}</h3>);
            return;
        }

        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
            elements.push(<div key={i} className="flex items-start gap-2 mb-1 pl-1"><span className={`font-bold min-w-[16px] ${isUser ? 'text-white/80' : 'text-slate-500'}`}>{numMatch[1]}.</span><span className={`break-words ${isUser ? 'text-white' : 'text-slate-700'}`}>{formatInlineText(numMatch[2], isUser, sopData)}</span></div>);
            return;
        }

        if (trimmed === '') {
            elements.push(<div key={i} className="h-2"></div>);
        } else {
            elements.push(<div key={i} className={`leading-relaxed break-words whitespace-pre-wrap ${isUser ? 'text-white' : 'text-slate-700'}`}>{formatInlineText(line, isUser, sopData)}</div>);
        }
    });

    return (
        <div className={`w-full max-w-full overflow-hidden ${isWelcome ? 'text-xs' : 'text-sm'}`}>
            {elements}
        </div>
    );
};

// --- Main Chat Component ---
const ChatAssistant: React.FC<ChatAssistantProps> = ({ sopData, onClose, productContext, onToggleMaximize, isMaximized, initialSessionId, onNavigateToStep }) => {
  const [input, setInput] = useState('');
  
  const WELCOME_MSG_ID = 'welcome-sys';
  const WELCOME_CONTENT = `### Welcome to CBG Knowledge Hub!
Get quick answers, and stay up-to-date with the latest CBG policies, processes, and best practices.

**System Ready:**
- [x] Knowledge Base Connected
- [x] Process Flow Loaded
- [x] A2UI Rendering Engine Active

**Use suggested questions** or
**Ask your own in the chat.**`;

  const [messages, setMessages] = useState<Message[]>([
      { 
          id: WELCOME_MSG_ID, 
          role: 'assistant', 
          content: WELCOME_CONTENT, 
          timestamp: new Date(),
          isWelcome: true,
          suggestions: [] 
      }
  ]);

  const [activeSuggestions, setActiveSuggestions] = useState<string[]>([]);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(true);
  const [activeFeedbackId, setActiveFeedbackId] = useState<string | null>(null);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const relatedScrollRef = useRef<HTMLDivElement>(null);
  const [sessionId, setSessionId] = useState<string>(initialSessionId || (globalThis.crypto?.randomUUID() || `sess-${Date.now()}`));
  const streamQueue = useRef<string>('');
  const activeMessageId = useRef<string | null>(null);
  const streamInterval = useRef<any>(null);
  const isGenerationComplete = useRef<boolean>(false);
  const lastLoadedSessionRef = useRef<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const formatTimeDubai = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: 'Asia/Dubai'
    });
  };
  
  const formatDateDubai = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
        timeZone: 'Asia/Dubai'
    });
  };

  // --- Widget Demo Function ---
  const triggerWidgetDemo = () => {
      // Use the shared data constant
      const demoData = WIDGET_DEMO_DATA;
      
      setMessages(prev => [...prev, {
          id: `demo-${Date.now()}`,
          role: 'assistant',
          content: demoData.answer,
          timestamp: new Date(),
          citations: demoData.citations,
          suggestions: demoData.related_questions,
          isTyping: false
      }]);
      
      // Update sidebar suggestions
      if (demoData.related_questions && demoData.related_questions.length > 0) {
          setActiveSuggestions(demoData.related_questions);
          setIsSuggestionsOpen(true);
      }
  };

  useEffect(() => {
    const fetchSuggestions = async () => {
        let pool: string[] = [];
        const targetIndex = productContext?.index_name || (sopData.metadata as any)?.index_name || 'cbgknowledgehub';

        try {
            const docs = await apiService.getDocuments();
            const relatedDocs = docs.filter(d => 
                d.indexName === targetIndex || 
                (productContext?.product_name && d.rootFolder === productContext.product_name)
            );

            relatedDocs.forEach(d => {
                if (d.suggested_questions && d.suggested_questions.length > 0) {
                    const cleaned = cleanQuestions(d.suggested_questions);
                    pool = [...pool, ...cleaned];
                }
            });
        } catch (err) {
            console.error("Failed to fetch document suggestions", err);
        }

        if (pool.length === 0) {
            const metaSuggestions = (sopData.metadata as any)?.suggested_questions;
            if (metaSuggestions && Array.isArray(metaSuggestions)) {
                pool = cleanQuestions(metaSuggestions);
            }
        }

        if (pool.length === 0) pool = FALLBACK_PROMPTS;
        
        const unique = Array.from(new Set(pool));
        const finalSuggestions = unique.sort(() => 0.5 - Math.random()).slice(0, 5);
        
        setMessages(prev => prev.map(m => {
            if (m.isWelcome) {
                return { ...m, suggestions: finalSuggestions };
            }
            return m;
        }));
    }
    
    if (!initialSessionId) {
        fetchSuggestions();
    }
  }, [productContext, sopData, initialSessionId]);


  useEffect(() => {
    if (initialSessionId && lastLoadedSessionRef.current !== initialSessionId) {
        lastLoadedSessionRef.current = initialSessionId;
        setSessionId(initialSessionId);
        
        setMessages([{ 
            id: 'loading-state', 
            role: 'assistant', 
            content: '', 
            timestamp: new Date(), 
            isTyping: true 
        }]);
        
        const loadSession = async () => {
             setIsLoading(true);
             try {
                try {
                    await apiService.initializeSession({ 
                        session_id: initialSessionId,
                        product: productContext?.product_name,
                        index_name: productContext?.index_name
                    });
                } catch(e) { console.warn("Init session failed, proceeding to fetch details", e); }

                const detail = await apiService.getChatSessionDetails(initialSessionId);
                
                if (detail && detail.messages) {
                    const mappedMessages: Message[] = [];
                    mappedMessages.push({ 
                        id: WELCOME_MSG_ID, 
                        role: 'assistant', 
                        content: WELCOME_CONTENT, 
                        timestamp: new Date(detail.created_at || Date.now()),
                        isWelcome: true,
                    });

                    detail.messages.forEach(m => {
                        mappedMessages.push({
                            id: `u-${m.question_id}`,
                            role: 'user',
                            content: m.question,
                            timestamp: new Date(m.timestamp)
                        });
                        mappedMessages.push({
                            id: m.question_id,
                            role: 'assistant',
                            content: m.answer,
                            citations: m.citations,
                            timestamp: new Date(m.timestamp),
                            isTyping: false
                        });
                    });
                    setMessages(mappedMessages);
                } else {
                     setMessages([{ 
                        id: WELCOME_MSG_ID, 
                        role: 'assistant', 
                        content: WELCOME_CONTENT, 
                        timestamp: new Date(),
                        isWelcome: true,
                        suggestions: [] 
                    }]);
                }
             } catch(e) { 
                 console.error(e);
                 setMessages([{ 
                    id: WELCOME_MSG_ID, 
                    role: 'assistant', 
                    content: WELCOME_CONTENT, 
                    timestamp: new Date(),
                    isWelcome: true,
                    suggestions: [] 
                }]);
             }
             finally { setIsLoading(false); }
        }
        loadSession();
    } 
  }, [initialSessionId]);


  useEffect(() => {
    streamInterval.current = setInterval(() => {
        if (activeMessageId.current) {
            const hasData = streamQueue.current.length > 0;
            if (hasData) {
                const pendingLength = streamQueue.current.length;
                let chunk = '';
                if (pendingLength > 200) chunk = streamQueue.current.substring(0, 20);
                else if (pendingLength > 50) chunk = streamQueue.current.substring(0, 5);
                else chunk = streamQueue.current.substring(0, 2);
                streamQueue.current = streamQueue.current.substring(chunk.length);

                const currentId = activeMessageId.current;
                setMessages(prev => prev.map(msg => msg.id === currentId ? { ...msg, content: msg.content + chunk, isTyping: true } : msg));
            } else if (isGenerationComplete.current) {
                const currentId = activeMessageId.current;
                setMessages(prev => prev.map(msg => msg.id === currentId ? { ...msg, isTyping: false } : msg));
                
                activeMessageId.current = null;
                isGenerationComplete.current = false;
                setIsLoading(false);
            }
        }
    }, 16);
    return () => clearInterval(streamInterval.current);
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }
  }, [messages.length, messages[messages.length-1]?.content]);

  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        const scrollHeight = textareaRef.current.scrollHeight;
        textareaRef.current.style.height = `${Math.min(scrollHeight, 150)}px`;
        textareaRef.current.style.overflowY = scrollHeight > 150 ? 'auto' : 'hidden';
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = async (manualInput?: string) => {
    const textToSend = manualInput || input;
    if (!textToSend.trim() || isLoading) return;

    if (messages.length === 1 && !isMaximized && onToggleMaximize) {
        onToggleMaximize();
    }

    let newMessages = messages.map(m => ({ ...m, isTyping: false }));

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date()
    };

    setMessages([...newMessages, userMsg]);
    setInput('');
    setIsLoading(true);
    setActiveSuggestions([]);
    setIsSuggestionsOpen(true); 

    const botMsgId = globalThis.crypto?.randomUUID() || `qn-${Date.now()}`;
    let isFirstToken = true;

    activeMessageId.current = null;
    streamQueue.current = '';
    isGenerationComplete.current = false;

    try {
      const meta = sopData.metadata as any;
      const indexName = productContext?.index_name || meta?.index_name || "cbgknowledgehub";
      const productName = productContext?.product_name || sopData.processDefinition.title || "";
      
      await apiService.chatInference({
        question: userMsg.content,
        index_name: indexName,
        session_id: sessionId,
        question_id: botMsgId, 
        product: productName,
        onToken: (token) => { 
            if (isFirstToken) {
                isFirstToken = false;
                setMessages(prev => [...prev, {
                  id: botMsgId,
                  role: 'assistant',
                  content: '',
                  timestamp: new Date(),
                  isTyping: true
                }]);
                activeMessageId.current = botMsgId;
            }
            streamQueue.current += token; 
        },
        onComplete: (data) => {
           isGenerationComplete.current = true;
           if (data) {
                setMessages(prev => prev.map(msg => msg.id === botMsgId ? { ...msg, citations: data.citations } : msg));
                
                if (data.related_questions && Array.isArray(data.related_questions) && data.related_questions.length > 0) {
                    setActiveSuggestions(data.related_questions);
                    setIsSuggestionsOpen(true);
                }
           }
           
           if (streamQueue.current.length === 0) {
               setMessages(prev => prev.map(msg => msg.id === botMsgId ? { ...msg, isTyping: false } : msg));
               activeMessageId.current = null;
               isGenerationComplete.current = false;
               setIsLoading(false);
           }
        },
        onError: (errMsg) => {
           isGenerationComplete.current = true;
           if (isFirstToken) {
               setMessages(prev => [...prev, {
                  id: botMsgId,
                  role: 'assistant',
                  content: 'Sorry, I encountered an error connecting to the service.',
                  timestamp: new Date(),
                  isTyping: false
               }]);
               setIsLoading(false);
           } else {
               streamQueue.current += `\n\n[Error: ${errMsg}]`;
               if (streamQueue.current.length === 0) {
                   setMessages(prev => prev.map(msg => msg.id === botMsgId ? { ...msg, isTyping: false } : msg));
                   activeMessageId.current = null;
                   isGenerationComplete.current = false;
                   setIsLoading(false);
               }
           }
        }
      });
    } catch (error) {
      activeMessageId.current = null;
      isGenerationComplete.current = false;
      setIsLoading(false);
      if (isFirstToken) {
         setMessages(prev => [...prev, {
            id: botMsgId,
            role: 'assistant',
            content: 'Sorry, I encountered an error. Please try again.',
            timestamp: new Date(),
            isTyping: false
         }]);
      }
    }
  };

  const handleCopy = (text: string) => {
      navigator.clipboard.writeText(text);
  };

  const handleFeedbackStart = (messageId: string, rating: 'thumbs_up' | 'thumbs_down') => {
      if (rating === 'thumbs_up') {
          setMessages(prev => prev.map(m => m.id === messageId ? { ...m, feedback: rating } : m));
          apiService.submitFeedback({
              question_id: messageId,
              session_id: sessionId,
              feedback_type: rating,
          }).catch(err => console.error(err));
      } else {
          setActiveFeedbackId(messageId);
          setFeedbackComment('');
      }
  };

  const handleSubmitFeedback = async () => {
      if (!activeFeedbackId) return;
      
      setIsSubmittingFeedback(true);
      try {
        await apiService.submitFeedback({
            question_id: activeFeedbackId,
            session_id: sessionId,
            feedback_type: 'thumbs_down',
            comment: feedbackComment
        });
        
        setMessages(prev => prev.map(m => m.id === activeFeedbackId ? { ...m, feedback: 'thumbs_down' } : m));
        setActiveFeedbackId(null);
        setFeedbackComment('');
      } catch (err) {
          console.error("Feedback submit error", err);
      } finally {
          setIsSubmittingFeedback(false);
      }
  };

  const handleCancelFeedback = () => {
      setActiveFeedbackId(null);
      setFeedbackComment('');
  };

  const scrollRelated = (direction: 'left' | 'right') => {
      if (relatedScrollRef.current) {
          const { current } = relatedScrollRef;
          const scrollAmount = 250;
          if (direction === 'left') {
              current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
          } else {
              current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
          }
      }
  };

  return (
    <div className="flex flex-col h-full bg-white relative overflow-hidden">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-100 bg-white flex justify-between items-center shadow-sm z-20 h-16">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-fab-navy to-fab-royal flex items-center justify-center text-white shadow-md">
                <Brain className="w-5 h-5" />
            </div>
            <div>
                <h3 className="font-bold text-slate-900 text-sm">CBG Knowledge Hub</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                    <p className="text-[10px] text-slate-500 font-medium">Knowledge Base</p>
                </div>
            </div>
        </div>
        
        <div className="flex items-center gap-2">
            <button 
                onClick={triggerWidgetDemo} 
                className="p-1.5 text-slate-400 hover:text-fab-royal hover:bg-blue-50 rounded-md transition-colors hidden md:block"
                title="Show Widget Gallery"
            >
                <LayoutDashboard size={18} />
            </button>
            {onToggleMaximize && (
                <button onClick={onToggleMaximize} className="p-1.5 text-slate-400 hover:text-fab-royal hover:bg-blue-50 rounded-md transition-colors">
                    {isMaximized ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>
            )}
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-colors">
                <X size={20} />
            </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 bg-slate-50/30 relative scroll-smooth">
        
        {/* Messages List */}
        <div className="space-y-6 max-w-4xl mx-auto pb-4">
        {messages.map((msg) => (
        <div key={msg.id} className="flex flex-col gap-1">
            <div className={`flex gap-3 relative z-10 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                
                {/* Avatar */}
                <div className="flex flex-col items-center gap-1 flex-shrink-0 mt-1 min-w-[40px]">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shadow-sm border transition-all ${
                    msg.role === 'user' ? 'bg-slate-800 text-white border-slate-700' : 'bg-gradient-to-br from-fab-navy to-fab-royal border-transparent text-white'
                    }`}>
                        {msg.role === 'user' ? <span className="text-[10px] font-bold">YOU</span> : <GIcon className="w-5 h-5" />}
                    </div>
                </div>
                
                <div className={`flex flex-col max-w-[85%] md:max-w-[90%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                
                {/* Message Bubble */}
                <div className={`relative px-5 py-4 rounded-2xl leading-relaxed shadow-sm transition-all w-full overflow-hidden ${
                    msg.role === 'user' 
                    ? 'bg-fab-royal text-white rounded-tr-none shadow-md' 
                    : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)]'
                }`}>
                    <div className="relative z-10 w-full">
                        <MessageRenderer 
                            content={msg.content} 
                            role={msg.role} 
                            isWelcome={msg.isWelcome} 
                            sopData={sopData} 
                            onNavigateToStep={onNavigateToStep}
                            onSendManual={handleSend}
                        />
                    </div>
                </div>

                {/* Citations */}
                {msg.citations && Object.keys(msg.citations).length > 0 && <CitationBlock citations={msg.citations} />}

                {/* Feedback & Actions Toolbar */}
                {msg.role === 'assistant' && !msg.isWelcome && !msg.isTyping && (
                    <div className="flex flex-col gap-2 mt-2 ml-2 w-full animate-in fade-in duration-300">
                        <div className="flex items-center gap-3">
                            <button onClick={() => handleCopy(msg.content)} className="text-slate-400 hover:text-fab-royal transition-colors p-1.5 hover:bg-slate-100 rounded-md" title="Copy">
                                <Copy size={14} />
                            </button>
                            <div className="w-px h-4 bg-slate-200 mx-1"></div>
                            <div className="flex items-center gap-1">
                                <button 
                                    onClick={() => handleFeedbackStart(msg.id, 'thumbs_up')} 
                                    className={`p-1.5 rounded-md transition-colors flex items-center gap-1 ${msg.feedback === 'thumbs_up' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400 hover:text-emerald-600 hover:bg-slate-100'}`}
                                    title="Helpful"
                                >
                                    <ThumbsUp size={14} />
                                </button>
                                <button 
                                    onClick={() => handleFeedbackStart(msg.id, 'thumbs_down')} 
                                    className={`p-1.5 rounded-md transition-colors flex items-center gap-1 ${msg.feedback === 'thumbs_down' ? 'text-rose-600 bg-rose-50' : 'text-slate-400 hover:text-rose-600 hover:bg-slate-100'}`}
                                    title="Not Helpful"
                                >
                                    <ThumbsDown size={14} />
                                </button>
                            </div>
                        </div>

                        {/* Negative Feedback Comment Input */}
                        {activeFeedbackId === msg.id && (
                             <div className="mt-1 p-3 bg-white border border-rose-100 rounded-xl shadow-sm w-full max-w-sm animate-in slide-in-from-top-2 fade-in">
                                 <p className="text-xs font-bold text-slate-500 mb-2">How can we improve this answer?</p>
                                 <textarea
                                    value={feedbackComment}
                                    onChange={(e) => setFeedbackComment(e.target.value)}
                                    className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-200 focus:border-rose-300 min-h-[60px] resize-none"
                                    placeholder="Tell us what was wrong..."
                                 />
                                 <div className="flex justify-end gap-2 mt-2">
                                     <button 
                                        onClick={handleCancelFeedback}
                                        className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1"
                                     >
                                        Cancel
                                     </button>
                                     <button 
                                        onClick={handleSubmitFeedback}
                                        disabled={isSubmittingFeedback || !feedbackComment.trim()}
                                        className="text-xs bg-rose-600 text-white px-3 py-1.5 rounded-lg hover:bg-rose-700 disabled:opacity-50 flex items-center gap-1 font-medium"
                                     >
                                        {isSubmittingFeedback && <Loader2 size={10} className="animate-spin" />}
                                        Submit
                                     </button>
                                 </div>
                             </div>
                        )}
                    </div>
                )}
                
                {/* Inline Suggestions for Welcome Message */}
                {msg.role === 'assistant' && msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="mt-4 w-full space-y-2">
                        <div className="flex items-center gap-2 mb-2 pl-1">
                             <Lightbulb size={12} className="text-slate-400" />
                             <span className="text-[10px] font-medium text-slate-500">Suggested questions</span>
                        </div>
                        <div className="flex flex-col gap-2">
                            {msg.suggestions.map((prompt, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => handleSend(prompt)}
                                    className="text-left px-5 py-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-fab-royal/50 rounded-full transition-all text-xs flex items-center gap-3 group shadow-sm hover:shadow-md w-full"
                                >
                                    <div className="p-1.5 bg-slate-50 rounded-full text-fab-royal shadow-sm group-hover:scale-110 transition-transform">
                                        <Sparkles size={12} />
                                    </div>
                                    <span className="flex-1 font-medium">{prompt}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                </div>
            </div>
            
            {/* Timestamp */}
            <div className={`px-12 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <p className="text-[10px] text-slate-400 font-medium opacity-60">
                    {formatDateDubai(msg.timestamp)} {formatTimeDubai(msg.timestamp)}
                </p>
            </div>
        </div>
        ))}

        {/* Skeleton Glare Loader */}
        {isLoading && (
        <div className="flex gap-3">
            <div className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-900 shadow-sm mt-1">
                <GIcon className="w-5 h-5 animate-pulse text-fab-royal" />
            </div>
            <div className="bg-white border border-slate-200 px-5 py-4 rounded-2xl rounded-tl-none shadow-sm flex flex-col gap-2 min-w-[200px] w-full max-w-lg">
                <div className="relative w-full h-3 bg-slate-100 rounded overflow-hidden">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
                </div>
                <div className="relative w-3/4 h-3 bg-slate-100 rounded overflow-hidden">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
                </div>
                <div className="relative w-1/2 h-3 bg-slate-100 rounded overflow-hidden">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
                </div>
            </div>
        </div>
        )}
        <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Suggestions Bar */}
      {activeSuggestions.length > 0 && (
        <div className={`w-full border-t border-slate-100 bg-white/95 backdrop-blur-xl transition-all duration-300 ease-in-out z-30 ${isSuggestionsOpen ? 'max-h-48 py-2 opacity-100' : 'max-h-0 py-0 opacity-0 overflow-hidden'}`}>
            <div className="px-4 py-2 flex justify-between items-center border-b border-slate-100/50 mb-2">
                <div className="flex items-center gap-2">
                    <Sparkles size={12} className="text-fab-royal" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Related Questions</span>
                </div>
                <button onClick={() => setIsSuggestionsOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-200 rounded transition-colors">
                    <ChevronDown size={14} />
                </button>
            </div>
            
            <div className="relative group/scroll px-1">
                 <button 
                    onClick={() => scrollRelated('left')} 
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1.5 bg-white shadow-md border border-slate-100 rounded-full text-slate-500 hover:text-fab-royal opacity-0 group-hover/scroll:opacity-100 transition-opacity disabled:opacity-0 mx-1"
                 >
                    <ChevronLeft size={14} />
                 </button>
                 
                 <div 
                    ref={relatedScrollRef} 
                    className="px-4 overflow-x-auto pb-1 pt-1 flex gap-2 snap-x scroll-smooth no-scrollbar"
                    style={{ 
                        scrollbarWidth: 'none', 
                        msOverflowStyle: 'none' 
                    }}
                 >
                     <style>
                         {`
                           .no-scrollbar::-webkit-scrollbar {
                             display: none;
                           }
                         `}
                     </style>
                    {activeSuggestions.map((prompt, idx) => (
                        <button 
                            key={idx}
                            onClick={() => handleSend(prompt)}
                            className="flex-shrink-0 px-4 py-2.5 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-700 hover:bg-fab-royal hover:text-white hover:border-fab-royal transition-all shadow-sm flex items-center gap-2 group whitespace-nowrap snap-center"
                        >
                            <Sparkles size={12} className="text-fab-royal group-hover:text-white/80" />
                            {prompt}
                        </button>
                    ))}
                 </div>

                 <button 
                    onClick={() => scrollRelated('right')} 
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1.5 bg-white shadow-md border border-slate-100 rounded-full text-slate-500 hover:text-fab-royal opacity-0 group-hover/scroll:opacity-100 transition-opacity mx-1"
                 >
                    <ChevronRight size={14} />
                 </button>
            </div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white border-t border-slate-100 p-4 pb-2 z-40 relative shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.05)]">
        
        {activeSuggestions.length > 0 && !isSuggestionsOpen && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full z-50 pointer-events-none w-full flex justify-center pb-3">
                 <button 
                    onClick={() => setIsSuggestionsOpen(true)}
                    className="pointer-events-auto bg-white/90 backdrop-blur border border-slate-200 text-fab-navy px-4 py-2 rounded-full text-xs font-bold shadow-lg flex items-center gap-2 hover:bg-fab-royal hover:text-white hover:border-fab-royal transition-all animate-in slide-in-from-bottom-2 fade-in"
                >
                    <Sparkles size={12} />
                    Show Related
                    <ChevronUp size={12} />
                </button>
            </div>
        )}

        <div className="relative flex items-end gap-2 max-w-4xl mx-auto w-full">
            <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question..."
                className="flex-1 pl-5 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-[24px] focus:outline-none focus:ring-2 focus:ring-fab-royal/20 focus:border-fab-royal text-sm transition-all shadow-inner resize-none overflow-hidden min-h-[48px] max-h-[150px]"
                disabled={isLoading}
                rows={1}
            /> 
            <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 bottom-2 p-2 bg-fab-navy hover:bg-fab-royal text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md h-9 w-9 flex items-center justify-center mb-0.5"
            >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
        </div>
        <p className="text-[10px] text-slate-400 text-center mt-2 font-medium">
            Note that CBG Knowledge Hub AI can make mistakes. Please validate all answers provided by this tool.
        </p>
      </div>
    </div>
  );
};

export default ChatAssistant;