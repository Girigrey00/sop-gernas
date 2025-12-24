
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Loader2, X, BookOpen, Maximize2, Minimize2, 
  ChevronDown, ChevronUp, User, Sparkles, FileText, 
  ThumbsUp, ThumbsDown, Copy, Clock, History 
} from 'lucide-react';
import { SopResponse, Product, ChatSession } from '../types';
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
    "What are the main risks in this process?",
    "Explain the approval workflow steps.",
    "Who are the key actors involved?",
    "What are the control measures?",
    "Show me the compliance requirements.",
    "Are there any manual steps?"
];

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
    <div className="mt-3 w-full animate-in fade-in slide-in-from-top-1 duration-500">
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

// --- Text Formatter ---
const formatText = (text: string, isUser: boolean) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index} className={`font-bold ${isUser ? 'text-white' : 'text-slate-900'}`}>{part.slice(2, -2)}</strong>;
        }
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

const MessageRenderer = ({ content, isTyping, role }: { content: string, isTyping?: boolean, role: 'user' | 'assistant' }) => {
    const isUser = role === 'user';
    return (
        <div className={`space-y-2 font-medium leading-relaxed whitespace-pre-wrap ${isUser ? 'text-white' : 'text-slate-700'}`}>
            {formatText(content, isUser)}
            {!content && !isTyping && <div className="h-3"></div>}
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
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // History State
  const [showHistory, setShowHistory] = useState(false);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  // Initialize with passed session ID or create new if not present
  const [sessionId, setSessionId] = useState<string>(initialSessionId || (globalThis.crypto?.randomUUID() || `sess-${Date.now()}`));

  const streamQueue = useRef<string>('');
  const activeMessageId = useRef<string | null>(null);
  const streamInterval = useRef<any>(null);
  const isGenerationComplete = useRef<boolean>(false);

  // If initialSessionId changes, update state and load
  useEffect(() => {
    if (initialSessionId && initialSessionId !== sessionId) {
        setSessionId(initialSessionId);
        // Logic to load specific session details will be handled by the useEffect below if we add a loader
        // or we can reuse handleHistoryClick logic here
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
         // Reset if no session provided (new chat)
         setSessionId(globalThis.crypto?.randomUUID());
         setMessages([{ id: 'sys', role: 'assistant', content: '', timestamp: new Date() }]);
    }
  }, [initialSessionId]);

  // Load History List
  useEffect(() => {
    const loadHistory = async () => {
        const sessions = await apiService.getChatSessions();
        sessions.sort((a, b) => new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime());
        setChatSessions(sessions);
    };
    loadHistory();
  }, [productContext, sessionId]); // Reload list when session changes (e.g. new message added)

  // Load and Shuffle Suggestions
  useEffect(() => {
    let pool = [...DEFAULT_PROMPTS];
    const unique = Array.from(new Set(pool));
    const shuffled = unique.sort(() => 0.5 - Math.random());
    setSuggestedPrompts(shuffled.slice(0, 4)); 
  }, [productContext]);

  // Streaming Loop
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

    if (messages.length === 1 && messages[0].id === 'sys') {
        setMessages([]); 
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => {
        const clean = prev.filter(m => m.id !== 'sys');
        return [...clean, userMsg];
    });
    setInput('');
    setIsLoading(true);

    const botMsgId = globalThis.crypto?.randomUUID() || `qn-${Date.now()}`;
    setMessages(prev => [...prev, {
      id: botMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isTyping: true
    }]);

    activeMessageId.current = botMsgId;
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
        onToken: (token) => { streamQueue.current += token; },
        onComplete: (citations) => {
           isGenerationComplete.current = true;
           if (citations) {
                setMessages(prev => prev.map(msg => msg.id === botMsgId ? { ...msg, citations: citations } : msg));
           }
        },
        onError: (errMsg) => {
           isGenerationComplete.current = true;
           streamQueue.current += `\n\n[Error: ${errMsg}]`;
        }
      });
    } catch (error) {
      activeMessageId.current = null;
      isGenerationComplete.current = false;
      setIsLoading(false);
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
          feedback_type: rating
      }).catch(err => console.error(err));
  };

  const handleHistoryClick = async (session: ChatSession) => {
      setIsLoading(true);
      try {
          const detail = await apiService.getChatSessionDetails(session._id);
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
              setSessionId(session._id);
              setShowHistory(false);
          }
      } catch (e) {
          console.error("Failed to load session", e);
      } finally {
          setIsLoading(false);
      }
  };

  const hasMessages = messages.length > 1;

  return (
    <div className="flex flex-col h-full bg-white relative overflow-hidden">
      
      {/* Header */}
      <div className={`p-4 border-b border-slate-100 bg-white flex justify-between items-center shadow-sm z-20 transition-all ${hasMessages ? 'h-16' : 'h-16 bg-transparent border-none shadow-none'}`}>
        <div className="flex items-center gap-3">
          {hasMessages ? (
             <>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                    <GIcon className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-900 text-sm">CBG KNOWLEDGE HUB</h3>
                    <p className="text-[10px] text-slate-500 font-medium">AI Assistant Active</p>
                </div>
             </>
          ) : (
             <div className="w-8 h-8"></div> // Spacer
          )}
        </div>
        
        <div className="flex items-center gap-2">
            <button 
                onClick={() => setShowHistory(!showHistory)}
                className={`p-1.5 rounded-md transition-colors ${showHistory ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'}`}
                title="Chat History"
            >
                <History size={18} />
            </button>
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

      {/* History Slide-over Sidebar */}
      <div className={`absolute top-16 right-0 bottom-0 w-64 bg-slate-50 border-l border-slate-200 z-30 transform transition-transform duration-300 ${showHistory ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="p-4 border-b border-slate-200 bg-white">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <Clock size={12} /> Recent Sessions
                </h4>
            </div>
            <div className="overflow-y-auto h-full p-2 space-y-2">
                {chatSessions.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">No history available</p>
                ) : (
                    chatSessions.map(session => (
                        <button 
                            key={session._id} 
                            onClick={() => handleHistoryClick(session)}
                            className={`w-full text-left p-3 rounded-lg border hover:shadow-sm transition-all group ${
                                session._id === sessionId 
                                ? 'bg-blue-50 border-blue-200' 
                                : 'bg-white border-slate-200 hover:border-blue-300'
                            }`}
                        >
                            <p className={`text-xs font-bold truncate ${session._id === sessionId ? 'text-blue-700' : 'text-slate-700 group-hover:text-blue-600'}`}>
                                {session.last_message?.question || session.product || 'Untitled Session'}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1 truncate">{session.last_message?.answer || 'No messages'}</p>
                            <p className="text-[9px] text-slate-300 mt-2">{new Date(session.last_activity).toLocaleDateString()}</p>
                        </button>
                    ))
                )}
            </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/30 relative">
        
        {/* Welcome Screen (Only if no messages) */}
        {!hasMessages && (
             <div className="absolute inset-0 flex flex-col items-center justify-center p-8 z-0 animate-in fade-in duration-500">
                <div className="mb-6 w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/30">
                    <GIcon className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2 text-center">Welcome to CBG Knowledge Hub!</h1>
                <p className="text-slate-500 mb-10 text-center">How can I help you today?</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                    {suggestedPrompts.map((prompt, idx) => (
                        <button 
                            key={idx}
                            onClick={() => handleSend(prompt)}
                            className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-blue-200 hover:scale-[1.02] transition-all text-left group"
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <Sparkles size={14} className="text-slate-300 group-hover:text-blue-500" />
                                <span className="text-xs font-bold text-slate-400 group-hover:text-blue-600 uppercase tracking-wider">Suggestion</span>
                            </div>
                            <p className="text-sm text-slate-700 font-medium">{prompt}</p>
                        </button>
                    ))}
                </div>
             </div>
        )}

        {/* Messages List */}
        {hasMessages && messages.filter(m => m.id !== 'sys').map((msg) => (
          <div key={msg.id} className={`flex gap-3 relative z-10 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            
            <div className="flex flex-col items-center gap-1 flex-shrink-0 mt-1 min-w-[40px]">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shadow-sm border transition-all ${
                msg.role === 'user' ? 'bg-slate-800 text-white border-slate-700' : 'bg-white border-blue-100 text-blue-600'
                }`}>
                    {msg.role === 'user' ? <User size={18} /> : <GIcon className="w-5 h-5" />}
                </div>
            </div>
            
            <div className={`flex flex-col max-w-[90%] md:max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              
              {/* Message Bubble with Glare Effect for Assistant */}
              <div className={`relative px-5 py-4 rounded-2xl text-sm leading-relaxed shadow-sm transition-all overflow-hidden ${
                msg.role === 'user' 
                  ? 'bg-slate-800 text-white rounded-tr-none shadow-md' 
                  : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)]'
              }`}>
                {msg.role === 'assistant' && (
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white via-transparent to-slate-50/50 opacity-80"></div>
                )}
                
                <div className="relative z-10">
                    <MessageRenderer content={msg.content} isTyping={msg.isTyping && msg.role === 'assistant'} role={msg.role} />
                </div>
              </div>

              {/* Citations */}
              {msg.citations && Object.keys(msg.citations).length > 0 && <CitationBlock citations={msg.citations} />}

              {/* Feedback & Actions Toolbar */}
              {msg.role === 'assistant' && !msg.isTyping && (
                  <div className="flex items-center gap-2 mt-2 ml-1 animate-in fade-in duration-500">
                      <button onClick={() => handleCopy(msg.content)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors" title="Copy">
                          <Copy size={14} />
                      </button>
                      <div className="h-3 w-px bg-slate-200 mx-1"></div>
                      <button 
                        onClick={() => handleFeedback(msg.id, 'thumbs_up')} 
                        className={`p-1.5 rounded transition-colors ${msg.feedback === 'thumbs_up' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'}`}
                      >
                          <ThumbsUp size={14} />
                      </button>
                      <button 
                        onClick={() => handleFeedback(msg.id, 'thumbs_down')} 
                        className={`p-1.5 rounded transition-colors ${msg.feedback === 'thumbs_down' ? 'text-rose-600 bg-rose-50' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'}`}
                      >
                          <ThumbsDown size={14} />
                      </button>
                      <span className="text-[10px] text-slate-300 ml-auto">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Loading Ghost */}
        {isLoading && messages[messages.length - 1].role === 'user' && (
           <div className="flex gap-3">
             <div className="w-9 h-9 rounded-full bg-white border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm mt-1">
                 <Sparkles size={16} className="animate-pulse" />
             </div>
             <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center">
               <div className="flex gap-1.5">
                 <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                 <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                 <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
               </div>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-slate-100 p-4 pb-2 z-20">
        <div className="relative flex items-center gap-2">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask a question..."
                className="flex-1 pl-4 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all shadow-inner"
                disabled={isLoading}
            /> 
            <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-1.5 bottom-1.5 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-500/20"
            >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
        </div>
        <p className="text-[10px] text-slate-400 text-center mt-2 font-medium">
            Note that the CBG Knowledge Hub can make mistakes. Please double check important information.
        </p>
      </div>
    </div>
  );
};

export default ChatAssistant;
