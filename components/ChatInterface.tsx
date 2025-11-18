import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, PlayCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { INITIAL_PROMPTS } from '../constants';

interface ChatInterfaceProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  messages: Array<{ role: 'user' | 'assistant', content: string }>;
  onSuggestionClick: (prompt: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onSendMessage, isLoading, messages, onSuggestionClick }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 shadow-inner">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 bg-slate-50">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          AI Assistant
        </h3>
        <p className="text-xs text-slate-500">Powered by Gemini 2.5 Flash</p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.length === 0 && (
            <div className="mt-10 text-center">
                <p className="text-slate-400 text-sm mb-4">Select a template or ask to generate a flow</p>
                <div className="grid grid-cols-1 gap-2">
                    {INITIAL_PROMPTS.map((prompt, idx) => (
                        <button 
                            key={idx}
                            onClick={() => onSuggestionClick(prompt)}
                            className="text-left p-3 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-blue-400 hover:shadow-md transition-all text-sm text-slate-700 flex items-center justify-between group"
                        >
                            {prompt}
                            <PlayCircle size={16} className="text-slate-300 group-hover:text-blue-500" />
                        </button>
                    ))}
                </div>
            </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                <Loader2 className="animate-spin text-blue-500" size={16} />
                <span className="text-xs text-slate-500">Generating logic flow...</span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your process (e.g. 'Vehicle Loan Approval')..."
            className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 resize-none text-sm min-h-[50px] max-h-[100px]"
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 bottom-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
