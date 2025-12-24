
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Loader2, X, BookOpen, Maximize2, Minimize2, 
  ChevronDown, ChevronUp, FileText, 
  ThumbsUp, ThumbsDown, Copy
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
}

const DEFAULT_PROMPTS = [
    "What is the breakdown of 2024 revenue by geography?",
    "What is the total IT cost in APAC for the full year 2025?",
    "How is group's operating income performing in 2025 vs. last year?",
    "Analyze the monthly operating income trend in UAE."
];

// Helper to clean messy JSON/Markdown questions from API
const cleanQuestions = (raw: any[]): string[] => {
    if (!Array.isArray(raw)) return [];
    
    let candidates: string[] = [];
    // Filter only strings to be safe
    const rawStrings = raw.filter(i => typeof i === 'string') as string[];

    // Strategy 1: The API often splits the markdown block into array elements
    // e.g. ["```json", "[\"Q1\", \"Q2\"]", "```"]
    const combined = rawStrings.join('\n');
    
    // Attempt to find a JSON block in the combined string
    const jsonBlockMatch = combined.match(/```json\s*([\s\S]*?)\s*```/) || combined.match(/\[\s*".*"\s*\]/);
    
    if (jsonBlockMatch) {
        try {
            // Try to parse the extracted block
            const inner = jsonBlockMatch[1] || jsonBlockMatch[0];
            const parsed = JSON.parse(inner);
            if (Array.isArray(parsed)) {
                parsed.forEach(p => {
                    if (typeof p === 'string' && p.length > 5) candidates.push(p);
                });
                if (candidates.length > 0) return candidates; 
            }
        } catch (e) { 
            // refined parsing failed, fall through to individual item check
        }
    }

    // Strategy 2: Iterate items individually (Fall back)
    rawStrings.forEach(item => {
        const cleanItem = item.trim();
        // Check for JSON array string inside an element
        if (cleanItem.startsWith('[') && cleanItem.endsWith(']')) {
             try {
                const parsed = JSON.parse(cleanItem);
                if (Array.isArray(parsed)) {
                     parsed.forEach(p => typeof p === 'string' && candidates.push(p));
                }
             } catch (e) {}
        } else {
            // Assume it's a raw question string if it doesn't look like code syntax
            if (!cleanItem.startsWith('```') && !cleanItem.startsWith('//') && cleanItem.length > 10) {
                // Remove surrounding quotes if present due to bad extraction
                const text = cleanItem.replace(/^"|"$/g, '').replace(/^'|'$/g, '').trim();
                candidates.push(text);
            }
        }
    });

    // Deduplicate and return
    return Array.from(new Set(candidates));
}

// Branded G Logo Component
const GIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10H12v3h7.6C18.9 17.5 15.8 20 12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8c2.04 0 3.89.78 5.31 2.05l2.25-2.25C17.2 1.9 14.76 0 12 0z" />
  </svg>
);

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

// --- Rich Text Formatter (Markdown Lite) ---
const formatInlineText = (text: string, isUser: boolean) => {
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
                                className={`text-[9px] font-bold px-1.5 py-0 rounded ml-0.5 cursor-help transition-transform hover:scale-110 inline-block ${isUser ? 'text-blue-200 bg-white/20' : 'text-blue-600 bg-blue-50 border border-blue-100'}`}
                            >{subPart.replace(/[\[\]]/g, '')}</sup>
                        );
                    }
                    return <span key={subIndex}>{subPart}</span>;
                })}
            </span>
        );
    });
};

const MessageRenderer = ({ content, role }: { content: string, role: 'user' | 'assistant' }) => {
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
            if (i === lines.length - 1 || !lines[i+1].trim().startsWith('|')) {
                // Process accumulated table
                const headers = tableBuffer[0].split('|').filter(c => c.trim()).map(c => c.trim());
                const rows = tableBuffer.slice(2).map(r => r.split('|').filter(c => c.trim()).map(c => c.trim())); // Skip alignment row [1]
                
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
                tableBuffer = [];
                inTable = false;
            }
            return; // Skip standard processing
        } 
        
        if (inTable) {
             if(trimmed.match(/^[|\s-:]+$/)) {
                 tableBuffer.push(trimmed); 
                 return;
             }
             inTable = false; 
        }

        // --- Header Detection ---
        if (trimmed.startsWith('### ')) {
            elements.push(
                <h3 key={i} className={`text-base font-bold mt-4 mb-2 break-words ${isUser ? 'text-white' : 'text-slate-800'}`}>
                    {formatInlineText(trimmed.replace(/^###\s+/, ''), isUser)}
                </h3>
            );
            return;
        }

        // --- List Detection ---
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            elements.push(
                <div key={i} className="flex items-start gap-2 mb-1 pl-1">
                    <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${isUser ? 'bg-white' : 'bg-blue-500'}`}></span>
                    <span className={`break-words ${isUser ? 'text-white' : 'text-slate-700'}`}>
                        {formatInlineText(trimmed.substring(2), isUser)}
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
                        {formatInlineText(numMatch[2], isUser)}
                    </span>
                </div>
            );
            return;
        }

        // --- Standard Text ---
        if (trimmed === '') {
            elements.push(<div key={i} className="h-3"></div>);
        } else {
            elements.push(
                <div key={i} className={`leading-relaxed break-words whitespace-pre-wrap ${isUser ? 'text-white' : 'text-slate-700'}`}>
                    {formatInlineText(line, isUser)}
                </div>
            );
        }
    });

    return (
        <div className="text-sm w-full max-w-full overflow-hidden">
            {elements}
        </div>
    );
};

// --- Main Chat Component ---
const ChatAssistant: React.FC<ChatAssistantProps> = ({ sopData, onClose, productContext, onToggleMaximize, isMaximized, initialSessionId }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
      { id: 'sys', role: 'assistant', content: '', timestamp: new Date() }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>(DEFAULT_PROMPTS);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [sessionId, setSessionId] = useState<string>(initialSessionId || (globalThis.crypto?.randomUUID() || `sess-${Date.now()}`));

  const streamQueue = useRef<string>('');
  const activeMessageId = useRef<string | null>(null);
  const streamInterval = useRef<any>(null);
  const isGenerationComplete = useRef<boolean>(false);

  // --- Fetch Suggested Questions from Documents ---
  useEffect(() => {
    const fetchSuggestions = async () => {
        let pool: string[] = [];
        
        // The index name to search for
        const targetIndex = productContext?.index_name || (sopData.metadata as any)?.index_name || 'cbgknowledgehub';

        // 1. Fetch from documents API for broader context
        try {
            const docs = await apiService.getDocuments();
            // Filter docs relevant to this product/index
            const relatedDocs = docs.filter(d => d.indexName === targetIndex || d.rootFolder === productContext?.product_name);

            relatedDocs.forEach(d => {
                if (d.suggested_questions && d.suggested_questions.length > 0) {
                    const cleaned = cleanQuestions(d.suggested_questions);
                    pool = [...pool, ...cleaned];
                }
            });
        } catch (err) {
            console.error("Failed to fetch document suggestions", err);
        }

        // 2. Also check immediate SOP metadata if api failed or yielded nothing
        if (pool.length === 0) {
            const metaSuggestions = (sopData.metadata as any)?.suggested_questions;
            if (metaSuggestions && Array.isArray(metaSuggestions)) {
                pool = cleanQuestions(metaSuggestions);
            }
        }

        // 3. Fallback to defaults
        if (pool.length === 0) pool = DEFAULT_PROMPTS;
        
        // 4. Shuffle and slice (Pick 4 random)
        const shuffled = Array.from(new Set(pool)).sort(() => 0.5 - Math.random()).slice(0, 4);
        setSuggestedPrompts(shuffled);
    }
    
    fetchSuggestions();
  }, [productContext, sopData]);


  useEffect(() => {
    if (initialSessionId && initialSessionId !== sessionId) {
        setSessionId(initialSessionId);
        const loadSession = async () => {
             setIsLoading(true);
             try {
                const detail = await apiService.getChatSessionDetails(initialSessionId);
                if (detail && detail.messages) {
                    const mappedMessages: Message[] = [];
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
                }
             } catch(e) { console.error(e); }
             finally { setIsLoading(false); }
        }
        loadSession();
    } else if (!initialSessionId && !messages.find(m => m.id === 'sys')) {
         setSessionId(globalThis.crypto?.randomUUID());
         setMessages([{ id: 'sys', role: 'assistant', content: '', timestamp: new Date() }]);
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

                setMessages(prev => prev.map(msg => msg.id === activeMessageId.current ? { ...msg, content: msg.content + chunk, isTyping: true } : msg));
            } else if (isGenerationComplete.current) {
                setMessages(prev => prev.map(msg => msg.id === activeMessageId.current ? { ...msg, isTyping: false } : msg));
                activeMessageId.current = null;
                isGenerationComplete.current = false;
                setIsLoading(false);
            }
        }
    }, 16);
    return () => clearInterval(streamInterval.current);
  }, []);

  useEffect(() => {
    if (messages.length > 2) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (manualInput?: string) => {
    const textToSend = manualInput || input;
    if (!textToSend.trim() || isLoading) return;

    // Clear system message if it's the first interaction
    let newMessages = [...messages];
    if (messages.length === 1 && messages[0].id === 'sys') {
        newMessages = [];
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date()
    };

    setMessages([...newMessages, userMsg]);
    setInput('');
    setIsLoading(true);

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
        onComplete: (citations) => {
           isGenerationComplete.current = true;
           if (citations) {
                setMessages(prev => prev.map(msg => msg.id === botMsgId ? { ...msg, citations: citations } : msg));
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

  const handleFeedback = (messageId: string, rating: 'thumbs_up' | 'thumbs_down') => {
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, feedback: rating } : m));
      
      apiService.submitFeedback({
          question_id: messageId,
          session_id: sessionId,
          feedback_type: rating,
      }).then((res) => {
        console.log("Feedback submitted", res);
      }).catch(err => console.error(err));
  };

  const hasMessages = messages.length > 1;

  return (
    <div className="flex flex-col h-full bg-white relative overflow-hidden">
      
      {/* Header - Fixed Visibility */}
      <div className="p-4 border-b border-slate-100 bg-white flex justify-between items-center shadow-sm z-20 h-16">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-md">
                <GIcon className="w-5 h-5" />
            </div>
            <div>
                <h3 className="font-bold text-slate-900 text-sm">GERNAS</h3>
                <p className="text-[10px] text-slate-500 font-medium">Assistant</p>
            </div>
        </div>
        
        <div className="flex items-center gap-2">
            {onToggleMaximize && (
                <button onClick={onToggleMaximize} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
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
        
        {/* Welcome Screen - Always visible at top */}
        <div className="max-w-4xl mx-auto w-full mb-8 pt-4 px-2">
            <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 mb-2 tracking-tight">Welcome to GERNAS!</h1>
            <h2 className="text-3xl md:text-4xl font-semibold text-slate-400/80 mb-8 tracking-tight">How can I help you today?</h2>

            <p className="text-sm font-semibold text-slate-500 mb-2 pl-1 uppercase tracking-wide">Suggested questions</p>

            <div className="flex flex-col gap-1 w-full items-start">
                {suggestedPrompts.map((prompt, idx) => (
                    <button 
                        key={idx}
                        onClick={() => handleSend(prompt)}
                        className="text-left py-2 px-3 hover:bg-slate-100 transition-colors text-slate-600 hover:text-slate-900 text-[15px] font-normal italic w-fit max-w-full rounded"
                    >
                        {prompt}
                    </button>
                ))}
            </div>
        </div>

        {/* Messages List */}
        {hasMessages && (
           <div className="space-y-6 max-w-4xl mx-auto pb-4">
            {messages.filter(m => m.id !== 'sys').map((msg) => (
            <div key={msg.id} className={`flex gap-3 relative z-10 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                
                <div className="flex flex-col items-center gap-1 flex-shrink-0 mt-1 min-w-[40px]">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shadow-sm border transition-all ${
                    msg.role === 'user' ? 'bg-slate-800 text-white border-slate-700' : 'bg-white border-slate-200 text-slate-900'
                    }`}>
                        {msg.role === 'user' ? <span className="text-[10px] font-bold">YOU</span> : <GIcon className="w-5 h-5" />}
                    </div>
                </div>
                
                <div className={`flex flex-col max-w-[85%] md:max-w-[90%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                
                {/* Message Bubble */}
                <div className={`relative px-5 py-4 rounded-2xl text-sm leading-relaxed shadow-sm transition-all w-full overflow-hidden ${
                    msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none shadow-md' 
                    : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)]'
                }`}>
                    <div className="relative z-10 w-full">
                        <MessageRenderer content={msg.content} role={msg.role} />
                    </div>
                </div>

                {/* Citations */}
                {msg.citations && Object.keys(msg.citations).length > 0 && <CitationBlock citations={msg.citations} />}

                {/* Feedback & Actions Toolbar - ALWAYS VISIBLE for Assistant Messages that are NOT typing */}
                {msg.role === 'assistant' && !msg.isTyping && (
                    <div className="flex items-center gap-3 mt-2 ml-2">
                        <button onClick={() => handleCopy(msg.content)} className="text-slate-400 hover:text-blue-600 transition-colors p-1" title="Copy">
                            <Copy size={16} />
                        </button>
                        <div className="flex items-center gap-1">
                            <button 
                                onClick={() => handleFeedback(msg.id, 'thumbs_up')} 
                                className={`p-1 rounded transition-colors ${msg.feedback === 'thumbs_up' ? 'text-emerald-600' : 'text-slate-400 hover:text-emerald-600'}`}
                                title="Good Answer"
                            >
                                <ThumbsUp size={16} />
                            </button>
                            <button 
                                onClick={() => handleFeedback(msg.id, 'thumbs_down')} 
                                className={`p-1 rounded transition-colors ${msg.feedback === 'thumbs_down' ? 'text-rose-600' : 'text-slate-400 hover:text-rose-600'}`}
                                title="Bad Answer"
                            >
                                <ThumbsDown size={16} />
                            </button>
                        </div>
                    </div>
                )}
                </div>
            </div>
            ))}

            {/* Skeleton Glare Loader (3 Lines) */}
            {isLoading && messages[messages.length - 1].role === 'user' && (
            <div className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-900 shadow-sm mt-1">
                    <GIcon className="w-5 h-5 animate-pulse" />
                </div>
                <div className="bg-white border border-slate-200 px-5 py-4 rounded-2xl rounded-tl-none shadow-sm flex flex-col gap-2 min-w-[200px] w-full max-w-lg">
                    {/* Line 1 */}
                    <div className="relative w-full h-3 bg-slate-100 rounded overflow-hidden">
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
                    </div>
                    {/* Line 2 */}
                    <div className="relative w-3/4 h-3 bg-slate-100 rounded overflow-hidden">
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
                    </div>
                    {/* Line 3 */}
                    <div className="relative w-1/2 h-3 bg-slate-100 rounded overflow-hidden">
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
                    </div>
                </div>
            </div>
            )}
            <div ref={messagesEndRef} />
           </div>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-slate-100 p-4 pb-2 z-20">
        <div className="relative flex items-center gap-2 max-w-4xl mx-auto w-full">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask a question..."
                className="flex-1 pl-5 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all shadow-inner"
                disabled={isLoading}
            /> 
            <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-1.5 bottom-1.5 p-2 bg-slate-900 hover:bg-slate-800 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
        </div>
        <p className="text-[10px] text-slate-400 text-center mt-2 font-medium">
            Note that GERNAS can make mistakes. Please validate all answers provided by this tool.
        </p>
      </div>
    </div>
  );
};

export default ChatAssistant;
