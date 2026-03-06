import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Send, Smile, Image, Camera, MoreHorizontal } from 'lucide-react';
import { useStore } from '../../store';
import { WeChatChatViewProps } from './types';

export const WeChatChatView: React.FC<WeChatChatViewProps> = ({ characterId, onBack }) => {
  const { wechatCharacters, wechatSessions, addWeChatMessage, createWeChatSession } = useStore();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const character = wechatCharacters.find(c => c.id === characterId);
  const session = wechatSessions.find(s => s.characterId === characterId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [session]);

  const handleSend = () => {
    if (inputValue.trim() && character) {
      let sessionId = session?.id;
      if (!sessionId) {
        sessionId = createWeChatSession(character.id);
      }
      const newMessage = {
        role: 'user' as const,
        content: inputValue.trim(),
      };
      addWeChatMessage(sessionId, newMessage);
      setInputValue('');
      scrollToBottom();
    }
  };

  if (!character) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-[#EDEDED] flex flex-col"
    >
      {/* Header */}
      <div className="bg-[#F7F7F7] px-3 pt-12 pb-3 flex items-center border-b border-gray-200">
        <button onClick={onBack} className="text-[#07C160] flex items-center gap-1">
          <ChevronLeft size={24} />
          <span className="text-[17px]">{character.name}</span>
        </button>
        <div className="flex-1 flex justify-end items-center gap-3">
          <button className="text-gray-500">
            <Image size={24} />
          </button>
          <button className="text-gray-500">
            <MoreHorizontal size={24} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Welcome Message */}
        <div className="flex justify-center">
          <span className="text-[12px] text-gray-400 bg-gray-200 px-2 py-1 rounded-full">
            开始聊天吧
          </span>
        </div>

        {/* Existing Messages */}
        {session?.messages?.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-lg ${message.role === 'user' ? 'bg-[#07C160] text-white' : 'bg-white text-gray-900'}`}
            >
              {message.content}
            </div>
          </div>
        )) || null}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-[#F7F7F7] border-t border-gray-200 p-3">
        <div className="flex items-center gap-2">
          <button className="text-gray-500 p-1">
            <Smile size={24} />
          </button>
          <div className="flex-1 bg-white rounded-full px-4 py-2 flex items-center">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="输入消息..."
              className="w-full bg-transparent border-none outline-none text-[15px] text-gray-900 max-h-24 resize-none placeholder:text-gray-400 cursor-text"
              rows={1}
            />
          </div>
          <button
            onClick={handleSend}
            className="text-[#07C160] p-1"
            disabled={!inputValue.trim()}
          >
            <Send size={24} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
