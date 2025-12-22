
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2, X, BookOpen, Quote, Maximize2, Minimize2, ChevronDown, ChevronUp } from 'lucide-react';
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

// Internal Component for Collapsible Citations
const CitationBlock = ({ citations }: { citations: Record<string, string> }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-3 w-full animate-in fade-in slide-in-from-top-2 duration-500">
      <div className={`bg-blue-50/50 border border-blue-100 rounded-xl transition-all duration-300 ${isOpen ? 'p-3' : 'p-2'}`}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between group"
        >
            <div className="flex items-center gap-1.5">
                <BookOpen size={12} className="text-blue-500" />
                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">
                   Verified Sources ({Object.keys(citations).length})
                </p>
            </div>
            {isOpen ? (
                <ChevronUp size={14} className="text-blue-400 group-hover:text-blue-600" />
            ) : (
                <ChevronDown size={14} className="text-blue-400 group-hover:text-blue-600" />
            )}
        </button>

        {isOpen && (
             <div className="grid gap-2 mt-3 animate-in fade-in slide-in-from-top-1">
                {Object.entries(citations).map(([key, value]) => (
                    <div key={key} className="group flex items-start gap-3 bg-white p-2.5 rounded-lg border border-blue-100/50 shadow-sm hover:border-blue-200 hover:shadow-md transition-all">
                        <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 font-mono text-[10px] font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <Quote size={10} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1 mb-0.5">
                              <span className="text-[10px] font-bold text-slate-500 uppercase">{key}</span>
                              <div className="h-px bg-slate-200 flex-1"></div>
                          </div>
                          <p className="text-xs text-slate-700 leading-snug line-clamp-3 italic">"{value}"</p>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
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
              ? { ...msg, content: msg.content + token, isTyping: true } // Keep typing true while streaming
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

  // Helper to render bold text
  const renderMessageContent = (content: string) => {
    // Basic Markdown support for bolding
    const parts = content.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
        }
        return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 bg-white flex justify-between items-center shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Bot size={18} />
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
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
              msg.role === 'user' ? 'bg-slate-200 text-slate-600' : 'bg-white border border-blue-100 text-blue-600 shadow-sm'
            }`}>
              {msg.role === 'user' ? <User size={14} /> : <Sparkles size={14} />}
            </div>
            
            <div className={`flex flex-col max-w-[90%] md:max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              
              {/* Message Bubble */}
              <div className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                msg.role === 'user' 
                  ? 'bg-slate-800 text-white rounded-tr-none' 
                  : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'
              }`}>
                {renderMessageContent(msg.content)}
                {msg.isTyping && (
                   <span className="inline-block w-1.5 h-3.5 bg-blue-500 ml-1 animate-pulse align-middle"></span>
                )}
              </div>

              {/* Citations Section - Collapsible */}
              {msg.citations && Object.keys(msg.citations).length > 0 && !msg.isTyping && (
                  <CitationBlock citations={msg.citations} />
              )}

              <span className="text-[10px] text-slate-400 mt-1 px-1">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        
        {/* Loading Indicator (Only shown before first token arrives or if explicit loading state) */}
        {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-white border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm mt-1">
               <Loader2 size={14} className="animate-spin" />
            </div>
            <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
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
