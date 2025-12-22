
import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, X, BookOpen, Quote, Maximize2, Minimize2, ChevronDown, ChevronUp, User, Sparkles } from 'lucide-react';
import { SopResponse, Product } from '../types';
import { apiService } from '../services/apiService';

interface ChatAssistantProps {
  sopData: SopResponse;
  onClose: () => void;
  productContext?: Product | null;
  onToggleMaximize?: () => void;
  isMaximized?: boolean;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  citations?: Record<string, string>;
  isTyping?: boolean;
}

// Branded G Logo Component
const GIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10H12v3h7.6C18.9 17.5 15.8 20 12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8c2.04 0 3.89.78 5.31 2.05l2.25-2.25C17.2 1.9 14.76 0 12 0z" />
  </svg>
);

// Internal Component for Collapsible Citations
const CitationBlock = ({ citations }: { citations: Record<string, string> }) => {
  const [isOpen, setIsOpen] = useState(true); // Default open to show sources immediately
  const count = Object.keys(citations).length;
  
  if (count === 0) return null;

  return (
    <div className="mt-4 w-full animate-in fade-in slide-in-from-top-2 duration-500">
      <div className={`bg-slate-50 border border-slate-200 rounded-xl overflow-hidden transition-all duration-300`}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-3 bg-slate-100/50 hover:bg-slate-100 transition-colors"
        >
            <div className="flex items-center gap-2">
                <div className="p-1 bg-blue-100 text-blue-600 rounded">
                    <BookOpen size={12} />
                </div>
                <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                   References & Sources ({count})
                </p>
            </div>
            {isOpen ? (
                <ChevronUp size={14} className="text-slate-400" />
            ) : (
                <ChevronDown size={14} className="text-slate-400" />
            )}
        </button>

        {isOpen && (
             <div className="p-3 grid gap-2.5 border-t border-slate-200/50">
                {Object.entries(citations).map(([key, value]) => (
                    <div key={key} className="group flex items-start gap-3 p-3 rounded-lg bg-white border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all">
                        <div className="w-5 h-5 rounded-md bg-slate-100 text-slate-500 flex items-center justify-center shrink-0 mt-0.5 font-mono text-[10px] font-bold group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                          {key.replace(/[\[\]]/g, '')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-600 leading-relaxed group-hover:text-slate-900 transition-colors">
                            {value}
                          </p>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

// Helper: Text Formatter (Bold + Citations)
const formatText = (text: string, isUser: boolean) => {
    // Basic split for bolding
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index} className={`font-bold ${isUser ? 'text-white' : 'text-slate-900'}`}>{part.slice(2, -2)}</strong>;
        }
        
        // Inside normal text, look for [n] patterns
        const citationParts = part.split(/(\[\d+\])/g);
        return (
            <span key={index}>
                {citationParts.map((subPart, subIndex) => {
                    if (/^\[\d+\]$/.test(subPart)) {
                        return (
                            <sup 
                                key={subIndex} 
                                className={`text-[10px] font-bold px-1 rounded ml-0.5 cursor-default ${
                                    isUser 
                                    ? 'text-blue-200 bg-white/20' 
                                    : 'text-blue-600 bg-blue-50'
                                }`}
                            >
                                {subPart}
                            </sup>
                        );
                    }
                    return <span key={subIndex}>{subPart}</span>;
                })}
            </span>
        );
    });
};

// Component to Render Tables, Lists, and Text
const MessageRenderer = ({ content, isTyping, role }: { content: string, isTyping?: boolean, role: 'user' | 'assistant' }) => {
    const isUser = role === 'user';
    const lines = content.split('\n');
    const blocks: Array<{ type: 'text' | 'table' | 'list', data: string[] }> = [];
    
    let currentTableRows: string[] = [];
    let currentListItems: string[] = [];
    
    lines.forEach((line) => {
        const trimmedLine = line.trim();

        // Check for Table
        if (trimmedLine.startsWith('|')) {
             if (currentListItems.length > 0) {
                blocks.push({ type: 'list', data: currentListItems });
                currentListItems = [];
            }
            currentTableRows.push(line);
        } 
        // Check for Lists (Bullets or Numbers)
        // Matches "- ", "* ", or "1. "
        else if (/^(\*|-|\d+\.)\s/.test(trimmedLine)) {
            if (currentTableRows.length > 0) {
                blocks.push({ type: 'table', data: currentTableRows });
                currentTableRows = [];
            }
            currentListItems.push(line);
        }
        // Check for Text
        else {
            if (currentTableRows.length > 0) {
                blocks.push({ type: 'table', data: currentTableRows });
                currentTableRows = [];
            }
            if (currentListItems.length > 0) {
                blocks.push({ type: 'list', data: currentListItems });
                currentListItems = [];
            }
            blocks.push({ type: 'text', data: [line] });
        }
    });
    
    // Flush remaining buffers
    if (currentTableRows.length > 0) blocks.push({ type: 'table', data: currentTableRows });
    if (currentListItems.length > 0) blocks.push({ type: 'list', data: currentListItems });

    return (
        <div className={`space-y-1 font-medium ${isUser ? 'text-white' : 'text-slate-700'}`}>
            {blocks.map((block, i) => {
                // --- RENDER TABLE ---
                if (block.type === 'table') {
                    const rows = block.data;
                    const headerRow = rows[0];
                    const separatorRow = rows.length > 1 && rows[1].includes('---') ? rows[1] : null;
                    const bodyRows = separatorRow ? rows.slice(2) : rows.slice(1);
                    
                    const safeParseRow = (r: string) => {
                        const cells = r.split('|');
                        if (cells.length > 0 && cells[0].trim() === '') cells.shift();
                        if (cells.length > 0 && cells[cells.length-1].trim() === '') cells.pop();
                        return cells;
                    };

                    const headers = safeParseRow(headerRow);
                    
                    return (
                        <div key={i} className="my-3 overflow-x-auto rounded-lg border border-slate-200 shadow-sm bg-white">
                            <table className="min-w-full divide-y divide-slate-200">
                                {separatorRow && (
                                    <thead className="bg-slate-50">
                                        <tr>
                                            {headers.map((h, hIdx) => (
                                                <th key={hIdx} className="px-3 py-2 text-left text-xs font-bold text-slate-600 uppercase tracking-wider border-r border-slate-100 last:border-0">
                                                    {formatText(h.trim(), false)}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                )}
                                <tbody className="bg-white divide-y divide-slate-100">
                                    {(separatorRow ? bodyRows : rows).map((row, rIdx) => {
                                        if (row.includes('---')) return null;
                                        const cells = safeParseRow(row);
                                        return (
                                            <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                                                {cells.map((c, cIdx) => (
                                                    <td key={cIdx} className="px-3 py-2 text-sm text-slate-700 whitespace-pre-wrap leading-snug border-r border-slate-100 last:border-0">
                                                        {formatText(c.trim(), false)}
                                                    </td>
                                                ))}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    );
                } 
                // --- RENDER LIST ---
                else if (block.type === 'list') {
                     return (
                        <div key={i} className="pl-2">
                            {block.data.map((item, idx) => {
                                // Detect list type
                                const isOrdered = /^\d+\./.test(item.trim());
                                const content = item.replace(/^(\*|-|\d+\.)\s/, '');
                                return (
                                    <div key={idx} className="flex items-start gap-2 mb-1">
                                        <span className={`mt-1.5 shrink-0 ${isUser ? 'text-blue-200' : 'text-blue-500'}`}>
                                            {isOrdered ? (
                                                <span className="text-xs font-bold">{item.match(/^\d+\./)?.[0]}</span>
                                            ) : (
                                                <div className="w-1.5 h-1.5 rounded-full bg-current" />
                                            )}
                                        </span>
                                        <span className="leading-relaxed">{formatText(content, isUser)}</span>
                                    </div>
                                )
                            })}
                        </div>
                     )
                }
                // --- RENDER TEXT ---
                else {
                    const text = block.data[0];
                    if (!text && !isTyping) return <div key={i} className="h-2"></div>;
                    return <div key={i} className="leading-relaxed whitespace-pre-wrap">{formatText(text, isUser)}</div>;
                }
            })}
             {isTyping && (
                <span className="inline-block w-2 h-4 bg-blue-500 ml-1 animate-pulse align-sub shadow-sm rounded-sm"></span>
            )}
        </div>
    );
};

const ChatAssistant: React.FC<ChatAssistantProps> = ({ sopData, onClose, productContext, onToggleMaximize, isMaximized }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I'm your SOP Assistant. I have analyzed the **${sopData.processDefinition.title}** process. Ask me anything about steps, risks, actors, or timelines!`,
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Session ID (Unique per instance of chat)
  const [sessionId] = useState(() => {
    return globalThis.crypto?.randomUUID() || `sess-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Initial placeholder for Bot Message
    const botMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: botMsgId,
      role: 'assistant',
      content: '', // Start empty
      timestamp: new Date(),
      isTyping: true
    }]);

    try {
      // Determine Index Name & Product Context
      const meta = sopData.metadata as any;
      const indexName = productContext?.index_name || meta?.index_name || meta?.target_index || "cbgknowledgehub";
      const productName = productContext?.product_name || meta?.productId || sopData.processDefinition.title || "";
      const questionId = globalThis.crypto?.randomUUID() || `qn-${Date.now()}`;

      console.log("ChatInference Streaming Context:", { indexName, productName, sessionId });

      // Call Streaming API
      await apiService.chatInference({
        question: userMsg.content,
        index_name: indexName,
        session_id: sessionId,
        question_id: questionId,
        product: productName,
        onToken: (token) => {
          setMessages(prev => prev.map(msg => 
            msg.id === botMsgId 
              ? { ...msg, content: msg.content + token, isTyping: true } 
              : msg
          ));
        },
        onComplete: (citations) => {
           setMessages(prev => prev.map(msg => 
             msg.id === botMsgId 
               ? { ...msg, isTyping: false, citations: citations } 
               : msg
           ));
           setIsLoading(false);
        },
        onError: (errMsg) => {
           setMessages(prev => prev.map(msg => 
             msg.id === botMsgId 
               ? { ...msg, isTyping: false, content: msg.content + `\n\n[Error: ${errMsg}]` } 
               : msg
           ));
           setIsLoading(false);
        }
      });

    } catch (error) {
      console.error("Chat error", error);
      // Remove the typing message and show error
      setMessages(prev => prev.filter(m => m.id !== botMsgId));
      
      const errorMsg: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting to the knowledge base right now. Please try again later.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 bg-white flex justify-between items-center shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <GIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">CBG KNOWLEDGE HUB AI</h3>
            <p className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Knowledge Base Active
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
            {onToggleMaximize && (
                <button 
                    onClick={onToggleMaximize} 
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    title={isMaximized ? "Minimize" : "Maximize"}
                >
                    {isMaximized ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>
            )}
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-colors">
                <X size={20} />
            </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            
            {/* Avatar Column */}
            <div className="flex flex-col items-center gap-1 flex-shrink-0 mt-1 min-w-[40px]">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shadow-sm border transition-all ${
                msg.role === 'user' 
                    ? 'bg-slate-800 text-white border-slate-700' 
                    : 'bg-white border-blue-100 text-blue-600'
                }`}>
                {msg.role === 'user' ? (
                    <User size={18} />
                ) : (
                    <GIcon className="w-5 h-5" />
                )}
                </div>
                <span className="text-[9px] font-bold text-slate-400 tracking-tight uppercase leading-none mt-0.5">
                    {msg.role === 'user' ? 'Admin' : 'Gernas'}
                </span>
            </div>
            
            <div className={`flex flex-col max-w-[90%] md:max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              
              {/* Message Bubble */}
              <div className={`px-4 py-3.5 rounded-2xl text-sm leading-relaxed shadow-sm transition-all ${
                msg.role === 'user' 
                  ? 'bg-slate-800 text-white rounded-tr-none' 
                  : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'
              }`}>
                <MessageRenderer 
                    content={msg.content} 
                    isTyping={msg.isTyping && msg.role === 'assistant'} 
                    role={msg.role} 
                />
              </div>

              {/* Citations Section - Collapsible */}
              {msg.citations && Object.keys(msg.citations).length > 0 && (
                  <CitationBlock citations={msg.citations} />
              )}

              <span className="text-[10px] text-slate-400 mt-1 px-1">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        
        {/* Loading Indicator (Initial connection only) */}
        {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
          <div className="flex gap-3">
             {/* Ghost Avatar */}
            <div className="flex flex-col items-center gap-1 flex-shrink-0 mt-1 min-w-[40px]">
                <div className="w-9 h-9 rounded-full bg-white border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                   <Sparkles size={16} className="animate-pulse" />
                </div>
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

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-100">
        <div className="relative flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about risks, actors, or next steps..."
            className="flex-1 pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all"
          /> 
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatAssistant;
