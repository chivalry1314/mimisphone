import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { 
  ChevronLeft, MoreHorizontal, Mic, Smile, Plus, User, 
  Copy, Forward, Star, Trash2, CheckSquare, MessageSquareQuote,
  Check, Search, Box, Mail, XCircle
} from 'lucide-react';
import { useStore } from '../../store';
import { WeChatChatViewProps } from './types';

export const WeChatChatView: React.FC<WeChatChatViewProps> = ({ characterId, onBack }) => {
  const { 
    wechatCharacters, 
    wechatSessions, 
    addWeChatMessage, 
    deleteWeChatMessages,
    createWeChatSession,
    wechatUserProfile,
    settings,
    worldBook
  } = useStore();
  
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const [menuState, setMenuState] = useState<{ messageId: string; x: number; y: number; text: string } | null>(null);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<string | 'multi' | null>(null);
  const [quotingMessage, setQuotingMessage] = useState<{ senderName: string; content: string } | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  const character = wechatCharacters.find(c => c.id === characterId);
  const session = wechatSessions.find(s => s.characterId === characterId);
  const messages = session?.messages || [];

  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 80, 
    overscan: 10,           
  });

  const scrollToBottom = () => {
    if (messages.length > 0 && !isSelectionMode) {
      setTimeout(() => {
        virtualizer.scrollToIndex(messages.length - 1, { align: 'end' });
      }, 50);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, isTyping, quotingMessage]);

  const handleMessageClick = (e: React.MouseEvent, messageId: string, text: string) => {
    e.stopPropagation();
    if (isSelectionMode) {
      toggleSelection(messageId);
      return;
    }

    if (navigator.vibrate) navigator.vibrate(50);
    const clientX = e.clientX;
    const clientY = e.clientY;
    const x = Math.min(Math.max(clientX - 100, 20), window.innerWidth - 220);
    const y = Math.max(clientY - 90, 100);
    
    setMenuState({ messageId, x, y, text });
  };

  const toggleSelection = (messageId: string) => {
    setSelectedMessageIds(prev => 
      prev.includes(messageId) 
        ? prev.filter(id => id !== messageId) 
        : [...prev, messageId]
    );
  };

  const exitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedMessageIds([]);
  };

  const executeDelete = () => {
    if (!session?.id) return;
    
    let idsToDelete: string[] = [];
    if (deleteTarget === 'multi') {
      idsToDelete = selectedMessageIds;
    } else if (deleteTarget) {
      idsToDelete = [deleteTarget];
    }

    if (idsToDelete.length > 0) {
      deleteWeChatMessages(session.id, idsToDelete);
    }

    setDeleteTarget(null);
    if (deleteTarget === 'multi') {
      exitSelectionMode();
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed"; 
      textArea.style.top = "-9999px";
      document.body.appendChild(textArea);
      textArea.select();
      try { document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(textArea);
    }
    setMenuState(null);
  };

  const handleSend = async () => {
    if (!inputValue.trim() || !character) return;
    if (!settings.apiKey) {
      alert('请先在应用全局设置中配置 API Key！');
      return;
    }

    let sessionId = session?.id;
    if (!sessionId) sessionId = createWeChatSession(character.id);

    const userText = inputValue.trim();
    const messageData: any = { role: 'user', content: userText };
    
    // 如果存在引用状态，附加上去
    if (quotingMessage) {
      messageData.quoteText = `${quotingMessage.senderName}: ${quotingMessage.content}`;
    }

    addWeChatMessage(sessionId, messageData);
    setInputValue('');
    setQuotingMessage(null); // 发送完毕后清除引用状态
    scrollToBottom();

    setIsTyping(true);

    try {
      let systemPrompt = `你扮演${character.name}与我微信聊天。设定：${character.description}。开场白：${character.greeting}。`;
      if (character.worldBookId) {
        const wb = worldBook.find(w => w.id === character.worldBookId);
        if (wb) systemPrompt += `背景：${wb.content}\n`;
      }
      systemPrompt += `\n要求：微信聊天语气，简短、口语化。直接输出内容，不带前缀。`;

      const latestSession = useStore.getState().wechatSessions.find(s => s.id === sessionId);
      const chatHistory = latestSession?.messages || [];

      const apiMessages = [
        { role: 'system', content: systemPrompt },
        ...chatHistory.map(m => {
          let content = m.content;
          // 组装上下文时让大模型知道你引用了它的话
          if ((m as any).quoteText) {
            content = `[引用了: "${(m as any).quoteText}"]\n${content}`;
          }
          return {
            role: m.role === 'user' ? 'user' : 'assistant',
            content: content
          };
        })
      ];

      const response = await fetch(`${settings.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.apiKey}`
        },
        body: JSON.stringify({
          model: settings.model || 'gpt-3.5-turbo',
          messages: apiMessages,
          temperature: settings.temperature || 0.7,
        })
      });

      if (!response.ok) throw new Error(`API 失败 (${response.status})`);
      const data = await response.json();
      addWeChatMessage(sessionId, { role: 'character', content: data.choices[0].message.content });

    } catch (error) {
      addWeChatMessage(sessionId, { role: 'character', content: `[系统提示：AI连接失败]` });
    } finally {
      setIsTyping(false);
      scrollToBottom();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!character) return null;

  const MenuItem = ({ icon: Icon, label, onClick }: { icon: any, label: string, onClick: () => void }) => (
    <div onClick={onClick} className="flex flex-col items-center justify-center w-[52px] h-[56px] active:bg-[#383838] rounded-md cursor-pointer transition-colors">
      <Icon size={20} className="text-white mb-1.5" strokeWidth={1.5} />
      <span className="text-[11px] text-gray-200">{label}</span>
    </div>
  );

  const Avatar: React.FC<{ url?: string | null }> = ({ url }) => (
    <div className="w-10 h-10 rounded-lg bg-gray-200 overflow-hidden shrink-0 border border-gray-100 flex items-center justify-center text-gray-400 relative">
      {url ? (
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${url})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      ) : (
        <User size={24} />
      )}
    </div>
  );

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-[#EDEDED] flex flex-col z-50"
      >
        {isSelectionMode ? (
          <div className="bg-[#F7F7F7] px-4 pt-12 pb-2.5 flex items-center border-b border-gray-200 shrink-0">
            <button onClick={exitSelectionMode} className="text-gray-900 text-[16px] active:opacity-50">取消</button>
            <h1 className="flex-1 text-center text-[17px] font-medium text-gray-900">
              已选择 {selectedMessageIds.length} 条消息
            </h1>
            <button className="text-gray-900 active:opacity-50"><Search size={22} strokeWidth={1.5} /></button>
          </div>
        ) : (
          <div className="bg-[#F7F7F7] px-2 pt-12 pb-2.5 flex items-center border-b border-gray-200 shrink-0">
            <button onClick={onBack} className="text-gray-900 flex items-center active:opacity-50">
              <ChevronLeft size={30} strokeWidth={1.5} />
            </button>
            <h1 className="flex-1 text-center text-[17px] font-medium text-gray-900 truncate px-4">
              {isTyping ? '对方正在输入...' : character.name}
            </h1>
            <button className="text-gray-900 active:opacity-50 px-2"><MoreHorizontal size={26} strokeWidth={1.5} /></button>
          </div>
        )}

        <div className="flex-1 relative">
          <div 
            ref={scrollRef}
            style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, overflowY: 'auto', overflowX: 'hidden', WebkitOverflowScrolling: 'touch' }}
          >
            <div style={{ height: `${virtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
              {virtualizer.getVirtualItems().map((virtualItem) => {
                const message = messages[virtualItem.index];
                const isUser = message.role === 'user';
                const isSelected = selectedMessageIds.includes(message.id);
                const quoteText = (message as any).quoteText;
                
                return (
                  <div 
                    key={message.id} 
                    data-index={virtualItem.index}
                    ref={virtualizer.measureElement}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      transform: `translateY(${virtualItem.start}px)`,
                      padding: '16px 16px 8px 16px', 
                    }}
                    onClick={() => isSelectionMode && toggleSelection(message.id)}
                  >
                    <div className="flex items-start w-full">
                      {isSelectionMode && (
                        <div className="w-10 shrink-0 flex items-center justify-center pt-2.5 transition-all">
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                            isSelected ? 'bg-[#07C160] border-[#07C160]' : 'border-gray-400 bg-transparent'
                          }`}>
                            {isSelected && <Check size={14} className="text-white" strokeWidth={3} />}
                          </div>
                        </div>
                      )}

                      <div className={`flex-1 flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''} ${isSelectionMode ? 'pointer-events-none' : ''}`}>
                        <Avatar url={isUser ? wechatUserProfile?.avatar : character.avatar} />
                        
                        <div className={`relative max-w-[70%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                          {/* 主聊天气泡 */}
                          <div className={`relative flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                            <div className={`absolute top-3.5 w-0 h-0 border-[5px] border-transparent ${
                              isUser ? 'left-full border-l-[#95ec69]' : 'right-full border-r-white'
                            }`} />
                            
                            <div 
                              onClick={(e) => handleMessageClick(e, message.id, message.content)}
                              className={`px-3.5 py-2.5 rounded-lg cursor-pointer ${
                                menuState?.messageId === message.id ? 'brightness-90' : '' 
                              } ${
                                isUser ? 'bg-[#95ec69] text-gray-900 rounded-tr-none' : 'bg-white text-gray-900 rounded-tl-none'
                              }`}
                            >
                              <div style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }} className="text-[16px] leading-[1.4]">
                                {message.content}
                              </div>
                            </div>
                          </div>

                          {/* 核心修复：发送后的引用框，彻底解决高度挤压导致重叠的问题 */}
                          {quoteText && (
                            <div 
                              className="mt-1 bg-[#E5E5E5] rounded-[4px] px-2 py-1 max-w-[100%] overflow-hidden" 
                              style={{ alignSelf: isUser ? 'flex-end' : 'flex-start' }}
                            >
                              <div 
                                className="text-[12px] text-gray-500 break-words"
                                style={{ display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 3, overflow: 'hidden' }}
                              >
                                {quoteText}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* --- 底部操作栏 --- */}
        {isSelectionMode ? (
          <div className="bg-[#F7F7F7] border-t border-gray-200 px-6 py-2 flex items-center justify-between shrink-0 pb-safe">
            <button className="text-gray-800 active:opacity-50 p-2"><Forward size={24} strokeWidth={1.5} /></button>
            <button className="text-gray-800 active:opacity-50 p-2"><Box size={24} strokeWidth={1.5} /></button>
            <button 
              onClick={() => setDeleteTarget('multi')} 
              disabled={selectedMessageIds.length === 0}
              className={`p-2 transition-opacity ${selectedMessageIds.length > 0 ? 'text-gray-800 active:opacity-50' : 'text-gray-300'}`}
            >
              <Trash2 size={24} strokeWidth={1.5} />
            </button>
            <button className="text-gray-800 active:opacity-50 p-2"><Mail size={24} strokeWidth={1.5} /></button>
          </div>
        ) : (
          <div className="bg-[#F7F7F7] border-t border-gray-200 px-2 py-2 flex flex-col shrink-0 pb-safe">
            {/* 输入栏第一排：文本输入 */}
            <div className="flex items-end gap-2 w-full">
              <button className="text-gray-700 active:opacity-50 p-1 mb-0.5 shrink-0 w-[32px] flex items-center justify-center">
                <Mic size={28} strokeWidth={1.5} />
              </button>
              
              <div className="flex-1 bg-white rounded-md border border-gray-200 min-h-[40px] flex items-center px-2 py-1.5">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isTyping}
                  className="w-full text-[16px] text-gray-900 outline-none resize-none bg-transparent max-h-24 leading-snug disabled:bg-transparent"
                  rows={1}
                />
              </div>

              <button className="text-gray-700 active:opacity-50 p-1 mb-0.5 shrink-0 w-[32px] flex items-center justify-center">
                <Smile size={28} strokeWidth={1.5} />
              </button>
              
              <div className="shrink-0 mb-0.5 w-[56px] flex justify-end">
                <AnimatePresence mode="wait">
                  {inputValue.trim() ? (
                    <motion.button
                      key="send"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      onClick={handleSend}
                      disabled={isTyping}
                      className={`text-white text-[15px] font-medium w-full h-[38px] rounded-md ${isTyping ? 'bg-[#7CD799]' : 'bg-[#07C160] active:opacity-80'}`}
                    >
                      发送
                    </motion.button>
                  ) : (
                    <motion.button
                      key="plus"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="text-gray-700 active:opacity-50 p-1 w-[32px] flex items-center justify-center"
                    >
                      <Plus size={30} strokeWidth={1.5} />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* 输入栏第二排：引用预览 (复刻图1，使其独立于输入框并对齐) */}
            {quotingMessage && (
              <div className="flex gap-2 mt-2 w-full">
                {/* 占位符，匹配麦克风按钮宽度 */}
                <div className="w-[32px] shrink-0 pointer-events-none opacity-0" />
                
                <div className="flex-1 bg-[#EAEAEA] rounded-[4px] px-2 py-1.5 flex items-center justify-between overflow-hidden">
                  <span className="text-[13px] text-gray-500 truncate flex-1">
                    {quotingMessage.senderName}：{quotingMessage.content}
                  </span>
                  <button onClick={() => setQuotingMessage(null)} className="ml-2 text-gray-400 active:opacity-50 shrink-0">
                    <XCircle size={16} className="text-gray-400 fill-gray-200" />
                  </button>
                </div>
                
                {/* 占位符，匹配右侧笑脸和加号宽度 */}
                <div className="w-[32px] shrink-0 pointer-events-none opacity-0" />
                <div className="w-[56px] shrink-0 pointer-events-none opacity-0" />
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* --- 功能弹框菜单层 --- */}
      <AnimatePresence>
        {menuState && (
          <div className="fixed inset-0 z-[100]" onClick={() => setMenuState(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className="absolute bg-[#4C4C4C] rounded-lg shadow-xl px-2 py-1 flex flex-wrap max-w-[280px] gap-x-1 gap-y-1 justify-center"
              style={{ left: menuState.x, top: menuState.y }}
              onClick={(e) => e.stopPropagation()}
            >
              <MenuItem icon={Copy} label="复制" onClick={() => handleCopy(menuState.text)} />
              <MenuItem icon={Forward} label="转发" onClick={() => setMenuState(null)} />
              <MenuItem icon={Star} label="收藏" onClick={() => setMenuState(null)} />
              <MenuItem icon={Trash2} label="删除" onClick={() => {
                setDeleteTarget(menuState.messageId);
                setMenuState(null);
              }} />
              <MenuItem icon={CheckSquare} label="多选" onClick={() => {
                setIsSelectionMode(true);
                setSelectedMessageIds([menuState.messageId]);
                setMenuState(null);
              }} />
              <MenuItem icon={MessageSquareQuote} label="引用" onClick={() => {
                const targetMsg = messages.find(m => m.id === menuState.messageId);
                if (targetMsg) {
                  let sName = character.name;
                  if (targetMsg.role === 'user') {
                    sName = wechatUserProfile?.name || '我';
                  }
                  setQuotingMessage({ senderName: sName, content: menuState.text });
                }
                setMenuState(null);
              }} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- 删除确认弹窗 --- */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-[110] bg-black/40 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="bg-white w-[280px] rounded-[10px] overflow-hidden flex flex-col"
            >
              <div className="py-6 text-center text-[16px] text-gray-900 border-b border-gray-100 font-medium">
                确认删除？
              </div>
              <div className="flex items-center">
                <button onClick={() => setDeleteTarget(null)} className="flex-1 py-3.5 text-[16px] text-gray-900 active:bg-gray-100 border-r border-gray-100">
                  取消
                </button>
                <button onClick={executeDelete} className="flex-1 py-3.5 text-[16px] text-[#E64340] font-medium active:bg-gray-100">
                  删除
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};