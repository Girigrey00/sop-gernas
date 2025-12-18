
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2, X, BookOpen, ExternalLink, Quote } from 'lucide-react';
import { SopResponse } from '../types';
import { apiService } from '../services/apiService';

interface ChatAssistantProps {
  sopData: SopResponse;
  onClose: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  citations?: Record<string, string>;
  isTyping?: boolean; // New property to control effect
}

const ChatAssistant: React.FC<ChatAssistantProps> = ({ sopData, onClose }) => {
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

    try {
      // Determine Index Name
      const meta = sopData.metadata as any;
      const indexName = meta?.index_name || meta?.target_index || "cbgknowledgehub";
      const productName = meta?.productId || sopData.processDefinition.title || "";
      const questionId = globalThis.crypto?.randomUUID() || `qn-${Date.now()}`;

      // Call Inference API
      const response = await apiService.chatInference({
        question: userMsg.content,
        index_name: indexName,
        session_id: sessionId,
        question_id: questionId,
        product: productName
      });
      
      // Standardize Response
      let fullAnswerText = "";
      let citations: Record<string, string> | undefined = undefined;

      if (typeof response === 'string') {
          fullAnswerText = response;
      } else if (response && typeof response === 'object') {
          fullAnswerText = response.answer || response.response || response.result || response.text || JSON.stringify(response);
          citations = response.citations;
      } else {
          fullAnswerText = "I received an empty response.";
      }

      // Start Typewriter Effect
      const botMsgId = (Date.now() + 1).toString();
      
      // Add empty message initially
      setMessages(prev => [...prev, {
        id: botMsgId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        citations: citations,
        isTyping: true
      }]);

      let currentText = '';
      const words = fullAnswerText.split(' '); // Split by word for smoother flow than char
      let i = 0;

      // Typewriter Interval
      const typeInterval = setInterval(() => {
         if (i < words.length) {
             currentText += (i === 0 ? '' : ' ') + words[i];
             setMessages(prev => prev.map(msg => 
                 msg.id === botMsgId ? { ...msg, content: currentText } : msg
             ));
             i++;
             scrollToBottom();
         } else {
             clearInterval(typeInterval);
             setMessages(prev => prev.map(msg => 
                 msg.id === botMsgId ? { ...msg, isTyping: false } : msg
             ));
         }
      }, 50); // Speed: 50ms per word roughly matches fast reading

    } catch (error) {
      console.error("Chat error", error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting to the knowledge base right now. Please try again later.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to render bold text
  const renderMessageContent = (content: string) => {
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
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
          <X size={20} />
        </button>
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

              {/* Citations Section - Attractive Card UI */}
              {msg.citations && Object.keys(msg.citations).length > 0 && !msg.isTyping && (
                  <div className="mt-3 w-full animate-in fade-in slide-in-from-top-2 duration-500">
                      <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 shadow-sm">
                          <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                             <BookOpen size={12} /> Verified Sources
                          </p>
                          <div className="grid gap-2">
                              {Object.entries(msg.citations).map(([key, value]) => (
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
                      </div>
                  </div>
              )}

              <span className="text-[10px] text-slate-400 mt-1 px-1">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        
        {isLoading && (
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
