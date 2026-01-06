
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Loader2, X, BookOpen, Maximize2, Minimize2, 
  ChevronDown, ChevronUp, FileText, 
  ThumbsUp, ThumbsDown, Copy, Sparkles, Lightbulb, ChevronRight, ChevronLeft, Brain,
  AlertOctagon, BarChart3, ArrowRightCircle, Map, Layers
} from 'lucide-react';
import { SopResponse, Product } from '../types';
import { apiService } from '../services/apiService';

interface ChatAssistantProps {
  sopData: SopResponse;
  onClose: () => void;
  productContext?: Product | null;
  onToggleMaximize?: () => void;
  isMaximized?: boolean;
  initialSessionId?: string;
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

const RiskWidget = ({ riskId, sopData, fallbackText }: { riskId: string, sopData: SopResponse, fallbackText: string }) => {
  // Find full risk details if available
  const risk = sopData.inherentRisks.find(r => r.riskId === riskId || r.riskId === riskId.replace(/[*_]/g, ''));
  const displayId = risk?.riskId || riskId.replace(/[*_]/g, '');
  const category = risk?.category || 'Operational Risk';
  // Use structured description if available, otherwise use what the AI wrote in the bullet point
  const description = risk?.description || fallbackText || 'Details not available in current context.';

  return (
    <div className="flex gap-3 items-start p-3 bg-rose-50 border border-rose-100 rounded-xl my-2 shadow-sm hover:shadow-md transition-all cursor-default group animate-in slide-in-from-left-2 duration-300">
       <div className="mt-0.5 p-1.5 bg-white rounded-full text-rose-500 shadow-sm border border-rose-100 group-hover:scale-110 transition-transform">
          <AlertOctagon size={16} />
       </div>
       <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
             <span className="text-xs font-bold text-rose-900">{displayId}</span>
             <span className="text-[9px] uppercase bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded font-bold tracking-wider">{category}</span>
          </div>
          <p className="text-xs text-rose-700 leading-relaxed">{description.replace(/[*_]/g, '')}</p>
       </div>
    </div>
  )
}

const StepWidget = ({ stepId, sopData }: { stepId: string, sopData: SopResponse }) => {
    // Attempt to find step details
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
        // Fallback for simple ID rendering if logic not found
        return (
             <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold mx-0.5 bg-slate-100 text-slate-600 border border-slate-200">
                <ArrowRightCircle size={10} />
                {stepId}
            </span>
        );
    }

    return (
        <div className="my-2 p-3 bg-white border border-blue-100 rounded-lg shadow-sm flex items-center gap-3 hover:border-blue-300 transition-colors group cursor-default">
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-md group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Map size={16} />
            </div>
            <div className="flex-1 min-w-0">
                 <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 rounded">{stepDetails.stepId}</span>
                    <span className="text-[9px] font-medium text-slate-400 uppercase tracking-wider">{stepDetails.actor}</span>
                 </div>
                 <p className="text-xs font-medium text-slate-800 truncate">{stepDetails.stepName}</p>
            </div>
            <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-500" />
        </div>
    );
}

const MetricWidget = ({ row, headers }: { row: string[], headers: string[] }) => {
   // Try to map columns intelligently
   let name = "";
   let value = "";
   let target = "";

   headers.forEach((h, idx) => {
       const header = (h || "").toLowerCase().replace(/[*_]/g, ''); // clean formatting
       const cellData = row[idx] || ""; // Safe access

       if (header.includes('value') || header.includes('current') || header.includes('actual')) value = cellData;
       else if (header.includes('target') || header.includes('goal') || header.includes('objective')) target = cellData;
       else if (header.includes('metric') || header.includes('measure') || header.includes('kpi') || header.includes('indicator') || header.includes('name')) name = cellData;
   });

   // Fallback if mapping failed
   if (!name && row.length > 0) name = row[0] || "";
   if (!value && row.length > 1) value = row[row.length - 1] || "";
   if (!target && row.length > 2) target = row[row.length - 2] || "";

   // Ensure they are strings to avoid "replace of undefined" errors
   const safeName = String(name || "");
   const safeValue = String(value || "");
   const safeTarget = String(target || "");

   return (
      <div className="p-4 bg-white border border-slate-200 rounded-xl text-center flex flex-col items-center justify-between min-w-[140px] max-w-[160px] shadow-sm h-full hover:border-fab-royal/30 transition-colors snap-center">
          <div className="p-2 bg-blue-50 text-fab-royal rounded-full mb-2">
              <BarChart3 size={16} />
          </div>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2 w-full line-clamp-2 leading-tight min-h-[2.5em]">{safeName.replace(/[*_]/g, '')}</p>
          <div className="text-2xl font-bold text-slate-800 mb-2">{safeValue.replace(/[*_]/g, '')}</div>
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
                            <span className="shrink-0 flex h-5 w-5 items-center justify-center rounded bg-slate-50 border border-slate-200 text-[10px] font-bold text-slate-500 shadow-sm mt-0.5 group-hover/card:bg-blue-50 group-hover/card:text-blue-600 transition-colors">
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

const MessageRenderer = ({ content, role, isWelcome, sopData }: { content: string, role: 'user' | 'assistant', isWelcome?: boolean, sopData: SopResponse }) => {
    const isUser = role === 'user';
    
    // Split content by lines to detect structure (Tables, Lists)
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    
    let tableBuffer: string[] = [];
    let inTable = false;

    lines.forEach((line, i) => {
        const trimmed = line.trim();
        
        // --- Table Detection ---
        if (trimmed.startsWith('|')) {
            inTable = true;
            tableBuffer.push(trimmed);
            
            // If this is the last line or next line is not table, process table
            // Safe check for next line existence
            const nextLine = lines[i+1];
            if (i === lines.length - 1 || (nextLine !== undefined && !nextLine.trim().startsWith('|'))) {
                
                // Process accumulated table
                const headers = tableBuffer[0].split('|').filter(c => c.trim()).map(c => c.trim());
                // Skip alignment row (contains dashes like ---|---)
                const rows = tableBuffer.slice(2).map(r => r.split('|').filter(c => c.trim()).map(c => c.trim()));
                
                // AGUI: Check if this is a Metrics Table
                // Clean formatting characters from headers before checking logic
                const isMetricTable = headers.some(h => {
                    const clean = h.toLowerCase().replace(/[^a-z]/g, ''); // Remove non-alpha like *
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
                    // Standard Table
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
            return; // Skip standard processing
        } 
        
        if (inTable) {
             // Handle alignment row explicitly to avoid dropping it before table close
             if(trimmed.match(/^[|\s-:]+$/)) {
                 tableBuffer.push(trimmed); 
                 return;
             }
             // Fallback if formatting was broken
             inTable = false; 
        }

        // --- AGUI: Risk List Detection ---
        // Robust Regex: Handles "- **R1**: Desc", "- R1 - Desc", "* R1 Desc"
        // Captures Group 1: Risk ID (R1, R10, etc)
        // Captures Group 2: Description
        const riskMatch = trimmed.match(/^[-*]\s*(?:\*\*)?(R\d+)(?:\*\*)?[\s:.-]+(.*)/i);
        
        if (riskMatch && !isUser) {
            elements.push(
                <RiskWidget 
                    key={`risk-${i}`} 
                    riskId={riskMatch[1]} 
                    sopData={sopData} 
                    fallbackText={riskMatch[2]} 
                />
            );
            return;
        }

        // --- AGUI: Step Detection (Only if line is short enough to be a reference) ---
        // Robust regex for steps: Handles "- **S1-1**: Desc", "* S1-1 Desc"
        // Regex Logic: 
        // 1. Optional bullet (^[-*]?)
        // 2. Optional whitespace (\s*)
        // 3. Optional bold start ((?:\*\*)?)
        // 4. Optional prefix "Step" ((?:Step\s*)?)
        // 5. CAPTURE ID: S digit - digit ([S]\d+-\d+)
        // 6. Optional bold end ((?:\*\*)?)
        // 7. Separators ([:\s]+)
        // 8. CAPTURE Desc: (.*)
        const stepMatch = trimmed.match(/^[-*]?\s*(?:\*\*)?(?:Step\s*)?([S]\d+-\d+)(?:\*\*)?[:\s]+(.*)/i);
        
        // Only trigger widget if it matches and line is short
        if (stepMatch && !isUser && trimmed.length < 150) {
             elements.push(
                <StepWidget 
                    key={`step-${i}`}
                    stepId={stepMatch[1]}
                    sopData={sopData}
                />
             );
             // Optionally add the description text below if it exists and isn't just the ID
             if (stepMatch[2] && stepMatch[2].length > 3) {
                 elements.push(
                    <p key={`step-desc-${i}`} className="text-xs text-slate-600 ml-4 mb-2">{formatInlineText(stepMatch[2], isUser)}</p>
                 );
             }
             return;
        }

        // --- Header Detection ---
        if (trimmed.startsWith('### ')) {
            elements.push(
                <h3 key={i} className={`font-bold mt-3 mb-2 leading-snug tracking-tight break-words ${isWelcome ? 'text-sm text-fab-navy' : 'text-lg'} ${isUser ? 'text-white' : (isWelcome ? 'text-fab-navy' : 'text-slate-800')}`}>
                    {formatInlineText(trimmed.replace(/^###\s+/, ''), isUser)}
                </h3>
            );
            return;
        }

        // --- List Detection ---
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            elements.push(
                <div key={i} className="flex items-start gap-2 mb-1 pl-1">
                    <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${isUser ? 'bg-white' : 'bg-fab-royal'}`}></span>
                    <span className={`break-words ${isUser ? 'text-white' : 'text-slate-700'}`}>
                        {formatInlineText(trimmed.substring(2), isUser, sopData)}
                    </span>
                </div>
            );
            return;
        }

        // --- Numbered List Detection ---
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
            elements.push(
                <div key={i} className="flex items-start gap-2 mb-1 pl-1">
                    <span className={`font-bold min-w-[16px] ${isUser ? 'text-white/80' : 'text-slate-500'}`}>{numMatch[1]}.</span>
                    <span className={`break-words ${isUser ? 'text-white' : 'text-slate-700'}`}>
                        {formatInlineText(numMatch[2], isUser, sopData)}
                    </span>
                </div>
            );
            return;
        }

        // --- Standard Text ---
        if (trimmed === '') {
            elements.push(<div key={i} className="h-2"></div>);
        } else {
            elements.push(
                <div key={i} className={`leading-relaxed break-words whitespace-pre-wrap ${isUser ? 'text-white' : 'text-slate-700'}`}>
                    {formatInlineText(line, isUser, sopData)}
                </div>
            );
        }
    });

    return (
        <div className={`w-full max-w-full overflow-hidden ${isWelcome ? 'text-xs' : 'text-sm'}`}>
            {elements}
        </div>
    );
};

// --- Main Chat Component ---
const ChatAssistant: React.FC<ChatAssistantProps> = ({ sopData, onClose, productContext, onToggleMaximize, isMaximized, initialSessionId }) => {
  const [input, setInput] = useState('');
  
  // Initial Welcome Message
  const WELCOME_MSG_ID = 'welcome-sys';
  const WELCOME_CONTENT = `### Welcome to CBG Knowledge Hub!
Get quick answers, and stay up-to-date with the latest CBG policies, processes, and best practices.

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

  // Suggestions Bar State
  const [activeSuggestions, setActiveSuggestions] = useState<string[]>([]);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(true);
  
  // Feedback Logic State
  const [activeFeedbackId, setActiveFeedbackId] = useState<string | null>(null);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll ref for related questions
  const relatedScrollRef = useRef<HTMLDivElement>(null);

  const [sessionId, setSessionId] = useState<string>(initialSessionId || (globalThis.crypto?.randomUUID() || `sess-${Date.now()}`));

  const streamQueue = useRef<string>('');
  const activeMessageId = useRef<string | null>(null);
  const streamInterval = useRef<any>(null);
  const isGenerationComplete = useRef<boolean>(false);
  
  const lastLoadedSessionRef = useRef<string | null>(null);

  // --- Date Formatter (Dubai Timezone) ---
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

  // --- Fetch Suggested Questions from Documents ---
  useEffect(() => {
    const fetchSuggestions = async () => {
        let pool: string[] = [];
        const targetIndex = productContext?.index_name || (sopData.metadata as any)?.index_name || 'cbgknowledgehub';

        try {
            const docs = await apiService.getDocuments();
            // Strictly match documents related to this product or index
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
                // Initialize Session
                try {
                    await apiService.initializeSession({ 
                        session_id: initialSessionId,
                        product: productContext?.product_name,
                        index_name: productContext?.index_name
                    });
                } catch(e) { console.warn("Init session failed, proceeding to fetch details", e); }

                // Fetch History Details
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
                        <MessageRenderer content={msg.content} role={msg.role} isWelcome={msg.isWelcome} sopData={sopData} />
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

        <div className="relative flex items-center gap-2 max-w-4xl mx-auto w-full">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask a question..."
                className="flex-1 pl-5 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-fab-royal/20 focus:border-fab-royal text-sm transition-all shadow-inner"
                disabled={isLoading}
            /> 
            <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-1.5 bottom-1.5 p-2 bg-fab-navy hover:bg-fab-royal text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
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
