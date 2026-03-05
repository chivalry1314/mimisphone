import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, ChevronLeft, User, Bot, Sparkles, Trash2, Plus, MessageSquare } from 'lucide-react';
import { useStore } from '../store';
import { Message } from '../types';

interface ChatAppProps {
  onClose: () => void;
}

export const ChatApp: React.FC<ChatAppProps> = ({ onClose }) => {
  const { settings, worldBook, sessions, currentSessionId, createSession, addMessage, setCurrentSession, deleteSession } = useStore();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentSession = sessions.find(s => s.id === currentSessionId);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentSession?.messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    let sessionId = currentSessionId;
    if (!sessionId) {
      sessionId = createSession(input.slice(0, 20) + '...');
    }

    const userMessage = input.trim();
    setInput('');
    addMessage(sessionId!, { role: 'user', content: userMessage });
    setIsTyping(true);

    try {
      // Find matching world book entries (Global or Character matching session title)
      const activeWorldEntries = worldBook.filter(entry => {
        if (entry.triggerMode === 'disabled') return false;
        
        // Global scope logic
        if (entry.scope === 'global') {
          if (entry.triggerMode === 'constant') return true;
          if (entry.triggerMode === 'keyword') {
            return entry.keywords.some(kw => userMessage.toLowerCase().includes(kw.toLowerCase()));
          }
        }

        // Character scope logic: Always on, but only if entry name matches session title
        if (entry.scope === 'character') {
          return entry.name === currentSession?.title;
        }

        return false;
      });

      const worldContext = activeWorldEntries.map(e => e.content).join('\n\n');
      
      const messages = [
        ...(worldContext ? [{ role: 'system', content: worldContext }] : []),
        ...(currentSession?.messages || []).map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: userMessage }
      ];

      const response = await fetch(`${settings.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.apiKey}`
        },
        body: JSON.stringify({
          model: settings.model,
          messages,
          temperature: settings.temperature,
          max_tokens: settings.maxTokens
        })
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      const assistantMessage = data.choices[0].message.content;
      addMessage(sessionId!, { role: 'assistant', content: assistantMessage });
    } catch (error) {
      console.error('Chat error:', error);
      addMessage(sessionId!, { role: 'assistant', content: '抱歉，连接 API 时出现错误。请检查设置中的 API 配置。' });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="absolute inset-0 z-50 bg-[#F2F2F7] flex flex-col text-gray-900"
    >
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 pt-12 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="text-[#007AFF]">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-[17px] font-semibold leading-tight">AI 聊天</h1>
            <p className="text-[11px] text-gray-500">{settings.model}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => createSession('新会话')}
            className="p-2 text-[#007AFF] hover:bg-blue-50 rounded-full transition-colors"
          >
            <Plus size={20} />
          </button>
          <button 
            onClick={() => currentSessionId && deleteSession(currentSessionId)}
            className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Session List (Desktop/Tablet style) */}
        <div className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider">历史会话</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {sessions.map(s => (
              <button 
                key={s.id}
                onClick={() => setCurrentSession(s.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-3 transition-colors ${
                  currentSessionId === s.id ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <MessageSquare size={18} className={currentSessionId === s.id ? 'text-blue-500' : 'text-gray-400'} />
                <span className="text-[14px] font-medium truncate">{s.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-gray-50 relative">
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-6 pb-24"
          >
            {currentSession?.messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100">
                  <Sparkles size={32} className="text-blue-500" />
                </div>
                <div className="text-center">
                  <p className="text-[17px] font-semibold text-gray-700">开始新对话</p>
                  <p className="text-[13px]">输入任何内容开始与 AI 交流</p>
                </div>
              </div>
            )}

            {currentSession?.messages.map((msg) => (
              <div 
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                    msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 border border-gray-100'
                  }`}>
                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className={`px-4 py-2.5 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-blue-500 text-white rounded-tr-none' 
                      : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex gap-3 items-center">
                  <div className="w-8 h-8 rounded-full bg-white text-gray-600 border border-gray-100 flex items-center justify-center shadow-sm">
                    <Bot size={16} />
                  </div>
                  <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm flex gap-1">
                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white/80 backdrop-blur-md border-t border-gray-200 absolute bottom-0 left-0 right-0">
            <div className="max-w-4xl mx-auto flex gap-3 items-end">
              <div className="flex-1 bg-gray-100 rounded-2xl border border-gray-200 p-2 flex items-end">
                <textarea 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="输入消息..."
                  className="flex-1 bg-transparent border-none outline-none px-2 py-1 text-[15px] text-gray-900 max-h-32 resize-none placeholder:text-gray-400"
                  rows={1}
                />
              </div>
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className={`p-3 rounded-full transition-all ${
                  input.trim() && !isTyping 
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' 
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
