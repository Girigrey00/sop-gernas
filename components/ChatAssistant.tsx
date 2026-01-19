
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Loader2, X, BookOpen, Maximize2, Minimize2, 
  ChevronDown, ChevronUp, FileText, 
  ThumbsUp, ThumbsDown, Copy, Sparkles, Lightbulb, ChevronRight, ChevronLeft, Brain,
  AlertOctagon, BarChart3, ArrowRightCircle, Map, Layers,
  ShieldAlert, Info, AlertTriangle, Clock, Calendar, CheckCircle2, Circle, 
  ListTodo, Percent, TrendingUp, User, Braces, Terminal, LayoutDashboard, Zap, PieChart,
  TrendingDown, Paperclip, Phone, Mail, MapPin, Star, Tag, Lightbulb as Bulb, DollarSign,
  ArrowRightLeft, Timer, Check, MoveRight, UserCheck, FileCheck, Package, HelpCircle, Quote, Hash,
  ExternalLink
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
  welcomeMessage?: string;
}

interface CitationObject {
    text: string;
    presigned_url?: string;
    document_name?: string;
    page_number?: number | string;
    document_id?: string;
    match_confidence?: number;
    url?: string; // Fallback
    link?: string; // Fallback
    blob_url?: string; // Fallback
    source_url?: string; // Fallback
}

interface Message {
  id: string; // Used as question_id for feedback
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  citations?: Record<string, string | CitationObject>;
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
export const cleanQuestions = (raw: any[]): string[] => {
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
export const GIcon = ({ className }: { className?: string }) => (
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
                <div className="flex justify-between items-start gap-2">
                    <h4 className="text-sm font-bold text-slate-800 break-words leading-tight">{name}</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide shrink-0 ${
                        status.toLowerCase() === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                        'bg-slate-100 text-slate-500 border-slate-200'
                    }`}>
                        {status}
                    </span>
                </div>
                <p className="text-xs text-slate-500 font-mono mt-1 break-all">{id}</p>
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
                <span className="text-xs font-bold text-slate-700 flex-1 leading-normal break-words">{question}</span>
                {isOpen ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
            </button>
            {isOpen && (
                <div className="p-3 bg-white border-t border-slate-100">
                    <p className="text-xs text-slate-600 leading-relaxed break-words">{answer}</p>
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
            <p className="text-xs text-slate-700 italic leading-relaxed font-medium break-words">{text}</p>
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
            <p className="text-xs font-bold text-slate-700 break-words group-hover:text-blue-700">{filename}</p>
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
        <span className="break-words">{text}</span>
    </div>
);

const ContactWidget: React.FC<{ name: string, role: string, email?: string }> = ({ name, role, email }) => (
    <div className="flex items-center gap-3 p-3 my-2 bg-gradient-to-r from-slate-50 to-white border border-slate-200 rounded-xl shadow-sm w-full max-w-sm">
        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm border-2 border-white shadow-md shrink-0">
            {name.substring(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-800 break-words">{name}</p>
            <div className="flex items-center gap-2 text-xs text-slate-500 break-words">
                <UserCheck size={12} className="shrink-0" /> {role}
            </div>
        </div>
    </div>
);

const LocationWidget: React.FC<{ location: string }> = ({ location }) => (
    <div className="flex items-center gap-2 my-2 text-xs text-slate-600 font-medium bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 w-fit">
        <MapPin size={14} className="text-rose-500 shrink-0" />
        <span className="break-words">{location}</span>
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
                            <span className={`text-xs leading-relaxed break-words ${isChecked ? 'text-emerald-900 line-through decoration-emerald-300 decoration-2' : 'text-slate-700'}`}>
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
            <p className="text-xs font-bold text-indigo-900 uppercase tracking-wide break-words">{actor}</p>
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
             <span className="text-xs font-bold text-rose-900 break-words">{displayId}</span>
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
                 <p className="text-xs font-medium text-slate-800 break-words group-hover:text-blue-700 transition-colors">{stepDetails.stepName}</p>
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
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2 w-full line-clamp-2 leading-tight min-h-[2.5em] break-words">{safeName.replace(/[*_]/g, '')}</p>
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
export const CitationBlock = ({ citations, onCitationClick }: { citations: Record<string, string | CitationObject>, onCitationClick?: (doc: string, page?: string, url?: string) => void }) => {
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
                    let pageNumber = "";
                    let content = "";
                    let presignedUrl = "";

                    // Handle New Object Format or Legacy String Format
                    if (typeof value === 'object' && value !== null) {
                        content = value.text || "No content preview available.";
                        source = value.document_name || "Source Document";
                        // CHECK ALL POSSIBLE KEYS FOR URL
                        // presigned_url is the primary one sent by backend
                        presignedUrl = value.presigned_url || value.blob_url || value.url || value.link || value.source_url || "";
                        if (value.page_number) {
                            page = `Page ${value.page_number}`;
                            pageNumber = String(value.page_number);
                        }
                    } else {
                        // Legacy String Parsing
                        const valStr = String(value);
                        const firstColon = valStr.indexOf(':');
                        if (firstColon > -1 && firstColon < 100) {
                            const meta = valStr.substring(0, firstColon);
                            content = valStr.substring(firstColon + 1).trim();
                            const pageMatch = meta.match(/[-|(]\s*Page\s*(\d+)/i);
                            if (pageMatch) {
                                page = `Page ${pageMatch[1]}`;
                                pageNumber = pageMatch[1];
                                source = meta.replace(pageMatch[0], '').trim().replace(/[-|)]$/, '').trim();
                            } else {
                                source = meta.trim();
                            }
                        } else {
                            content = valStr;
                        }
                    }
                    
                    // Fallback source name from key if meta didn't give it cleanly
                    if (source === "Source Document" || source.length < 3) {
                        source = key.replace(/[\[\]]/g, '');
                    }

                    const isUrlValid = presignedUrl && presignedUrl.length > 10;

                    return (
                        <div 
                            key={key} 
                            className="flex gap-3 items-start group/card relative bg-white p-3 rounded-lg border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all text-left w-full hover:bg-blue-50/10"
                        >
                            <span className="shrink-0 flex h-5 w-5 items-center justify-center rounded bg-slate-50 border border-slate-200 text-[10px] font-bold text-slate-500 shadow-sm mt-0.5 group-hover/card:bg-blue-50 group-hover/card:text-blue-600 transition-colors">
                                {key.replace(/[\[\]]/g, '')}
                            </span>
                            <div className="min-w-0 flex-1 space-y-1.5">
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                        <FileText size={12} className="text-slate-400 shrink-0 group-hover/card:text-blue-500" />
                                        <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wide break-words whitespace-normal group-hover/card:text-blue-700 leading-tight" title={source}>{source}</p>
                                    </div>
                                    {page && <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-bold rounded border border-slate-200 group-hover/card:bg-white shrink-0">{page}</span>}
                                    
                                    {/* CLICKABLE LINK WITH ICON */}
                                    {isUrlValid && (
                                        <a 
                                            href={presignedUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-100 transition-colors ml-auto shrink-0 z-10 cursor-pointer hover:shadow-sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onCitationClick && onCitationClick(source, pageNumber, presignedUrl);
                                            }}
                                            title="Open Document in New Tab"
                                        >
                                            View <ExternalLink size={10} />
                                        </a>
                                    )}
                                </div>
                                <div className="text-xs text-slate-600 leading-relaxed pl-1 border-l-2 border-slate-100 group-hover/card:border-blue-200 transition-colors whitespace-normal break-words">"{content}"</div>
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

export const MessageRenderer = ({ content, role, isWelcome, sopData, onNavigateToStep, onSendManual }: { content: string, role: 'user' | 'assistant', isWelcome?: boolean, sopData: SopResponse, onNavigateToStep?: (id: string) => void, onSendManual?: (txt: string) => void }) => {
    const isUser = role === 'user';
    
    // Auto-unwrap JSON answers if API returns strictly raw JSON or markdown wrapped JSON
    let displayContent = content;
    if (!isUser) {
        let trimmed = content.trim();
        
        // 1. Remove markdown code blocks start/end (Streaming friendly)
        if (trimmed.startsWith('```')) {
            trimmed = trimmed.replace(/^```(?:json)?\s*/i, '');
        }
        // Remove trailing ``` only if it exists at the very end
        trimmed = trimmed.replace(/\s*```$/, '');

        // 2. Try parsing complete JSON first (Best case)
        let parsedJson = null;
        if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
            try {
                parsedJson = JSON.parse(trimmed);
            } catch (e) { /* ignore */ }
        } else if (trimmed.startsWith('{')) {
             // Maybe it ends with } but has trailing whitespace?
             // Or maybe valid JSON but logic above failed.
             try {
                parsedJson = JSON.parse(trimmed);
            } catch (e) { /* ignore */ }
        }

        if (parsedJson) {
            if (parsedJson.answer) displayContent = parsedJson.answer;
            else if (parsedJson.content) displayContent = parsedJson.content;
        } else {
            // 3. Handle Partial JSON (Streaming) OR Raw "answer": "..." strings that aren't strict JSON
            // We use a more aggressive check to strip the answer key prefix if present
            const answerPrefixRegex = /^"answer"\s*:\s*"/;
            if (answerPrefixRegex.test(trimmed)) {
                let textPart = trimmed.replace(answerPrefixRegex, '');
                
                // Find the closing quote, respecting escaped quotes
                let endQuoteIndex = -1;
                for (let i = 0; i < textPart.length; i++) {
                    if (textPart[i] === '"' && textPart[i-1] !== '\\') {
                        endQuoteIndex = i;
                        break;
                    }
                }
                
                if (endQuoteIndex !== -1) {
                    textPart = textPart.substring(0, endQuoteIndex);
                } else if (textPart.endsWith('"')) {
                    // Handle case where quote is at very end
                    textPart = textPart.substring(0, textPart.length - 1);
                }
                
                // Unescape common JSON escapes for display
                displayContent = textPart
                    .replace(/\\"/g, '"')
                    .replace(/\\n/g, '\n')
                    .replace(/\\\\/g, '\\')
                    .replace(/\\t/g, '\t');
            }
        }
    }

    const lines = displayContent.split('\n');
    const elements: React.ReactNode[] = [];
    
    let tableBuffer: string[] = [];
    let inTable = false;
    let listBuffer: string[] = [];
    
    let inCodeBlock = false;
    let codeBuffer: string[] = [];

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
                // Simple styled code block instead of heavy widget
                elements.push(
                    <div key={`code-${i}`} className="my-3 w-full bg-slate-900 rounded-lg p-4 overflow-x-auto">
                        <pre className="text-xs font-mono text-slate-200 whitespace-pre-wrap break-all">{code}</pre>
                    </div>
                );
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

            // 2. SLA Widget (**SLA**: Text) - Requires BOLD marker
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
                    const answer = nextLine.split(':')[1].trim();
                    elements.push(<FaqWidget key={`faq-${i}`} question={question} answer={answer} />);
                    return; 
                }
            }
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

            // Role Match - STRICTER REGEX to avoid matching normal text
            // Must start with **Role**: or **Role -**
            const roleMatch = trimmed.match(/^\*\*(Manager|Officer|Customer|System|Admin|User|Client|Staff|Role|Actor)\*\*[:\-]\s*(.*)/i);
            if (roleMatch && !roleMatch[1].toLowerCase().includes('step')) {
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

            // Risk Match - Requires R# format
            const riskMatch = trimmed.match(/^[-*]?\s*(?:\*\*)?(R\d+)(?:\*\*)?[\s:.-]+(.*)/i);
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
const ChatAssistant: React.FC<ChatAssistantProps> = ({ 
    sopData, 
    onClose, 
    productContext, 
    onToggleMaximize, 
    isMaximized, 
    initialSessionId, 
    onNavigateToStep, 
    welcomeMessage 
}) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState<string | undefined>(initialSessionId);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const streamQueue = useRef<string>('');
    const activeMessageId = useRef<string | null>(null);
    const streamInterval = useRef<any>(null);
    const isGenerationComplete = useRef<boolean>(false);

    // Initial Welcome Message
    useEffect(() => {
        if (!initialSessionId && messages.length === 0) {
            const welcome: Message = {
                id: 'welcome',
                role: 'assistant',
                content: welcomeMessage || `### Hello! \nI am your assistant for **${sopData?.processDefinition?.title || 'this process'}**. \n\nYou can ask me about steps, risks, controls, or specific policy details found in the documentation.`,
                timestamp: new Date(),
                isWelcome: true,
                suggestions: sopData?.metadata?.suggested_questions || FALLBACK_PROMPTS
            };
            setMessages([welcome]);
        }
    }, [initialSessionId, sopData, welcomeMessage]);

    // Load History if Session ID exists
    useEffect(() => {
        if (initialSessionId) {
            setSessionId(initialSessionId);
            const loadHistory = async () => {
                setIsLoading(true);
                try {
                    const sessionDetails = await apiService.getChatSessionDetails(initialSessionId);
                    if (sessionDetails && sessionDetails.messages) {
                        const history: Message[] = sessionDetails.messages.map(m => ([
                             {
                                id: m.question_id + '-q',
                                role: 'user',
                                content: m.question,
                                timestamp: new Date(m.timestamp)
                             },
                             {
                                id: m.question_id, // Use actual question ID for answer to allow feedback mapping
                                role: 'assistant',
                                content: m.answer,
                                citations: m.citations,
                                timestamp: new Date(m.timestamp)
                             }
                        ])).flat() as Message[]; // Flatten pairs
                        
                        setMessages(history);
                    }
                } catch (e) {
                    console.error("Failed to load history", e);
                } finally {
                    setIsLoading(false);
                }
            };
            loadHistory();
        }
    }, [initialSessionId]);

    // Streaming Consumer
    useEffect(() => {
        streamInterval.current = setInterval(() => {
            if (activeMessageId.current) {
                const hasData = streamQueue.current.length > 0;
                if (hasData) {
                    // Consume chunks
                    const chunk = streamQueue.current.substring(0, 5); 
                    streamQueue.current = streamQueue.current.substring(chunk.length);

                    setMessages(prev => prev.map(msg => 
                        msg.id === activeMessageId.current 
                        ? { ...msg, content: msg.content + chunk, isTyping: true } 
                        : msg
                    ));
                } else if (isGenerationComplete.current) {
                    setMessages(prev => prev.map(msg => 
                        msg.id === activeMessageId.current 
                        ? { ...msg, isTyping: false } 
                        : msg
                    ));
                    activeMessageId.current = null;
                    isGenerationComplete.current = false;
                    setIsLoading(false);
                }
            }
        }, 16);
        return () => clearInterval(streamInterval.current);
    }, []);

    // Auto Scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleSend = async (text?: string) => {
        const query = text || input;
        if (!query.trim() || isLoading) return;

        setInput('');
        setIsLoading(true);

        // Ensure session exists
        let currentSessId = sessionId;
        if (!currentSessId) {
            const newSessId = `sess-${Date.now()}`;
            setSessionId(newSessId);
            currentSessId = newSessId;
        }

        const userMsgId = Date.now().toString();
        const botMsgId = `bot-${Date.now()}`;

        // Optimistic Update
        setMessages(prev => [
            ...prev,
            { id: userMsgId, role: 'user', content: query, timestamp: new Date() },
            { id: botMsgId, role: 'assistant', content: '', timestamp: new Date(), isTyping: true }
        ]);

        activeMessageId.current = botMsgId;
        streamQueue.current = '';
        isGenerationComplete.current = false;

        try {
            await apiService.chatInference({
                question: query,
                session_id: currentSessId,
                product: productContext?.product_name || sopData?.processDefinition?.title,
                index_name: productContext?.index_name,
                question_id: botMsgId, // Pass bot ID so backend can log it or we can map feedback later
                onToken: (token) => {
                    streamQueue.current += token;
                },
                onComplete: (data) => {
                    isGenerationComplete.current = true;
                    if (data) {
                        setMessages(prev => prev.map(m => 
                            m.id === botMsgId 
                            ? { 
                                ...m, 
                                citations: data.citations, 
                                suggestions: data.related_questions 
                              } 
                            : m
                        ));
                    }
                },
                onError: (err) => {
                    streamQueue.current += `\n[System Error: ${err}]`;
                    isGenerationComplete.current = true;
                }
            });
        } catch (error) {
            console.error(error);
            isGenerationComplete.current = true;
            setIsLoading(false);
        }
    };

    const handleFeedback = async (messageId: string, type: 'thumbs_up' | 'thumbs_down') => {
        if (!sessionId) return;
        
        // Optimistic UI Update
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, feedback: type } : m));

        try {
            await apiService.submitFeedback({
                session_id: sessionId,
                question_id: messageId,
                feedback_type: type
            });
        } catch (e) {
            console.error("Feedback failed", e);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 relative">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 shrink-0">
                 <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-lg bg-fab-royal text-white flex items-center justify-center">
                         <Brain size={18} />
                     </div>
                     <div>
                         <h3 className="text-sm font-bold text-fab-navy">Knowledge Assistant</h3>
                         <p className="text-[10px] text-slate-500 font-medium">AI-Powered SOP Guidance</p>
                     </div>
                 </div>
                 <div className="flex items-center gap-1">
                     {onToggleMaximize && (
                         <button onClick={onToggleMaximize} className="p-2 text-slate-400 hover:text-fab-royal hover:bg-slate-100 rounded-lg transition-colors">
                             {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                         </button>
                     )}
                     <button onClick={onClose} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                         <X size={18} />
                     </button>
                 </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border shadow-sm ${
                            msg.role === 'user' ? 'bg-slate-800 text-white border-slate-700' : 'bg-white text-fab-royal border-slate-100'
                        }`}>
                            {msg.role === 'user' ? <User size={14} /> : <GIcon className="w-5 h-5" />}
                        </div>
                        
                        <div className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                            {/* Message Bubble */}
                            <div className={`px-4 py-3 rounded-2xl shadow-sm text-sm ${
                                msg.role === 'user' 
                                ? 'bg-fab-royal text-white rounded-tr-none' 
                                : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                            }`}>
                                <MessageRenderer 
                                    content={msg.content} 
                                    role={msg.role} 
                                    isWelcome={msg.isWelcome} 
                                    sopData={sopData} 
                                    onNavigateToStep={onNavigateToStep}
                                    onSendManual={(txt) => handleSend(txt)}
                                />
                            </div>

                            {/* Citations */}
                            {msg.role === 'assistant' && msg.citations && Object.keys(msg.citations).length > 0 && (
                                <CitationBlock citations={msg.citations} onCitationClick={(doc, page, url) => {
                                    if(url) window.open(url, '_blank');
                                }} />
                            )}
                            
                            {/* Suggestions Chips */}
                            {msg.role === 'assistant' && msg.suggestions && msg.suggestions.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2 animate-in fade-in delay-300">
                                    {cleanQuestions(msg.suggestions).map((s, i) => (
                                        <button 
                                            key={i}
                                            onClick={() => handleSend(s)}
                                            className="px-3 py-1.5 bg-white border border-fab-royal/20 text-fab-royal hover:bg-fab-royal hover:text-white rounded-full text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                                        >
                                            <Sparkles size={10} /> {s}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Footer: Time & Feedback */}
                            <div className="mt-1 flex items-center gap-3 px-1">
                                <span className="text-[10px] text-slate-400 font-medium">
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {msg.role === 'assistant' && !msg.isTyping && !msg.isWelcome && (
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => handleFeedback(msg.id, 'thumbs_up')}
                                            className={`p-1 rounded hover:bg-slate-100 transition-colors ${msg.feedback === 'thumbs_up' ? 'text-emerald-500' : 'text-slate-300 hover:text-emerald-500'}`}
                                        >
                                            <ThumbsUp size={12} />
                                        </button>
                                        <button 
                                            onClick={() => handleFeedback(msg.id, 'thumbs_down')}
                                            className={`p-1 rounded hover:bg-slate-100 transition-colors ${msg.feedback === 'thumbs_down' ? 'text-rose-500' : 'text-slate-300 hover:text-rose-500'}`}
                                        >
                                            <ThumbsDown size={12} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                
                {isLoading && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-fab-royal shadow-sm animate-pulse">
                             <GIcon className="w-5 h-5" />
                        </div>
                        <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                            <Loader2 size={16} className="animate-spin text-fab-royal" />
                            <span className="text-xs text-slate-500 font-medium">Analyzing request...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-200 shrink-0">
                <div className="relative flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-fab-royal/20 focus-within:border-fab-royal transition-all shadow-inner">
                    <textarea 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder="Ask about process steps, risks, or controls..."
                        className="w-full bg-transparent border-none focus:ring-0 text-sm p-2 max-h-32 min-h-[44px] resize-none text-slate-700 placeholder:text-slate-400"
                        rows={1}
                        style={{ height: 'auto', minHeight: '44px' }}
                    />
                    <button 
                        onClick={() => handleSend()}
                        disabled={!input.trim() || isLoading}
                        className="p-2.5 bg-fab-royal text-white rounded-xl hover:bg-fab-blue disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm mb-0.5"
                    >
                        {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    </button>
                </div>
                <div className="mt-2 flex justify-center">
                    <p className="text-[9px] text-slate-400 font-medium flex items-center gap-1">
                        <Info size={10} /> AI generated responses can be inaccurate. Verify important information.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ChatAssistant;
