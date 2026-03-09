// src/components/wechat/WeChatChatView.tsx
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useWeChatStore } from '../store';
import { useGlobalStore } from '../../../core/globalStore';
import { WeChatChatViewProps } from '../types';
import { WeChatMessage } from '../types';

// 导入拆分组件
import { WeChatChatHeader } from './WeChatChatHeader';
import { WeChatChatMessageItem } from './WeChatChatMessageItem';
import { WeChatChatInputBar } from './WeChatChatInputBar';
import { Modals } from './WeChatChatModals';

export const WeChatChatView: React.FC<WeChatChatViewProps> = ({ characterId, onBack }) => {
  const {
    wechatCharacters, wechatSessions, addWeChatMessage, deleteWeChatMessages,
    createWeChatSession, wechatUserProfile, withdrawWeChatBalance
  } = useWeChatStore();
  const { settings, worldBook } = useGlobalStore();
  
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMultiline, setIsMultiline] = useState(false);
  const [showFullScreenEditor, setShowFullScreenEditor] = useState(false);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [showTransferView, setShowTransferView] = useState(false);
  const [transferAmount, setTransferAmount] = useState('');

  const [menuState, setMenuState] = useState<{ messageId: string; x: number; y: number; text: string } | null>(null);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<string | 'multi' | null>(null);
  const [quotingMessage, setQuotingMessage] = useState<{ senderName: string; content: string } | null>(null);

  const [forwardTargetModal, setForwardTargetModal] = useState<{ messageIds: string[] } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
      setTimeout(() => { virtualizer.scrollToIndex(messages.length - 1, { align: 'end' }); }, 50);
    }
  };

  useEffect(() => { scrollToBottom(); }, [messages.length, isTyping, quotingMessage]);

  const adjustTextareaHeight = (element: HTMLTextAreaElement | null) => {
    if (!element) return;
    element.style.height = 'auto';
    const scrollHeight = element.scrollHeight;
    element.style.height = `${Math.min(scrollHeight, 120)}px`;
    setIsMultiline(scrollHeight > 36);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    adjustTextareaHeight(e.target);
    if (showPlusMenu) setShowPlusMenu(false);
  };

  const toggleSelection = (messageId: string) => {
    setSelectedMessageIds(prev => prev.includes(messageId) ? prev.filter(id => id !== messageId) : [...prev, messageId]);
  };

  const exitSelectionMode = () => { setIsSelectionMode(false); setSelectedMessageIds([]); };

  const handleMessageClick = (e: React.MouseEvent, msg: WeChatMessage) => {
    e.stopPropagation();
    if (isSelectionMode) { toggleSelection(msg.id); return; }
    if (navigator.vibrate) navigator.vibrate(50);
    const x = Math.min(Math.max(e.clientX - 100, 20), window.innerWidth - 220);
    const y = Math.max(e.clientY - 90, 100);
    setMenuState({ messageId: msg.id, x, y, text: msg.content });
  };

  const executeDelete = () => {
    if (!session?.id) return;
    const idsToDelete = deleteTarget === 'multi' ? selectedMessageIds : [deleteTarget!];
    if (idsToDelete.length > 0) deleteWeChatMessages(session.id, idsToDelete);
    setDeleteTarget(null);
    if (deleteTarget === 'multi') exitSelectionMode();
  };

  const handleCopy = async (text: string) => {
    try { await navigator.clipboard.writeText(text); } 
    catch (err) { /* 原 fallback 逻辑可放此，简略写 */ }
    setMenuState(null);
  };

  const executeForward = (targetCharacterId: string) => {
    if (!forwardTargetModal) return;
    let targetSessionId = wechatSessions.find(s => s.characterId === targetCharacterId)?.id;
    if (!targetSessionId) {
      targetSessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      useWeChatStore.setState((state) => ({ wechatSessions: [{ id: targetSessionId!, characterId: targetCharacterId, messages: [], lastUpdated: Date.now(), unreadCount: 0 }, ...state.wechatSessions] }));
    }
    const msgsToForward = messages.filter(m => forwardTargetModal.messageIds.includes(m.id)).sort((a, b) => a.timestamp - b.timestamp);
    msgsToForward.forEach(m => addWeChatMessage(targetSessionId!, { role: 'user', content: m.content, type: m.type, amount: m.amount }));
    setForwardTargetModal(null);
    if (isSelectionMode) exitSelectionMode();
    setToastMessage('已转发'); setTimeout(() => setToastMessage(null), 2000);
  };

  const buildApiMessages = (basePrompt: string, sessionId: string) => {
    const chatHistory = useWeChatStore.getState().wechatSessions.find(s => s.id === sessionId)?.messages || [];
    return [{ role: 'system', content: basePrompt }, ...chatHistory.map(m => {
      let content = m.content;
      if (m.type === 'transfer') content = `[系统记录：用户向你发起了转账 ¥${m.amount}]`;
      if (m.type === 'transfer_accepted') content = `[系统记录：你已接收转账 ¥${m.amount}]`;
      if ((m as any).quoteText) content = `[引用了: "${(m as any).quoteText}"]\n${content}`;
      return { role: m.role === 'user' ? 'user' : 'assistant', content };
    })];
  };

  const handleTransferSubmit = async () => {
    const amount = parseFloat(transferAmount);
    if (isNaN(amount) || amount <= 0 || !character) return;
    if (amount > (wechatUserProfile.balance || 0)) { alert('零钱余额不足！'); return; }

    let sessionId = session?.id || createWeChatSession(character.id);
    addWeChatMessage(sessionId, { role: 'user', content: `转账 ¥${amount.toFixed(2)}`, type: 'transfer', amount });
    setShowTransferView(false); setTransferAmount(''); scrollToBottom();

    if (!settings.apiKey) {
      setIsTyping(true);
      setTimeout(() => {
        withdrawWeChatBalance(amount);
        addWeChatMessage(sessionId!, { role: 'character', content: `已收款 ¥${amount.toFixed(2)}`, type: 'transfer_accepted', amount });
        setIsTyping(false); scrollToBottom();
      }, 2000); return;
    }

    setIsTyping(true);
    try {
      let systemPrompt = `你扮演${character.name}与我微信聊天。设定：${character.description}。开场白：${character.greeting}。\n`;
      if (character.worldBookId) systemPrompt += `背景：${worldBook.find(w => w.id === character.worldBookId)?.content}\n`;
      systemPrompt += `[系统紧急提示：用户刚刚向你发起了一笔转账，金额为 ¥${amount}。如果你选择接收这笔钱，请必须在回复中包含“【接收转账】”这四个字；如果不接收或想忽略，请正常回复其他内容即可。]`;

      const response = await fetch(`${settings.baseUrl}/chat/completions`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${settings.apiKey}` },
        body: JSON.stringify({ model: settings.model || 'gpt-3.5-turbo', messages: buildApiMessages(systemPrompt, sessionId), temperature: settings.temperature || 0.7 })
      });
      if (!response.ok) throw new Error(`API 失败`);
      const data = await response.json();
      let replyContent = data.choices[0].message.content;

      if (replyContent.includes('【接收转账】')) {
        withdrawWeChatBalance(amount);
        addWeChatMessage(sessionId, { role: 'character', content: `已收款 ¥${amount.toFixed(2)}`, type: 'transfer_accepted', amount });
        replyContent = replyContent.replace('【接收转账】', '').trim();
      }
      if (replyContent) addWeChatMessage(sessionId, { role: 'character', content: replyContent });
    } catch (e) { addWeChatMessage(sessionId, { role: 'character', content: `[系统提示：AI连接失败]` }); } 
    finally { setIsTyping(false); scrollToBottom(); }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || !character) return;
    if (!settings.apiKey) { alert('请先配置 API Key！'); return; }

    let sessionId = session?.id || createWeChatSession(character.id);
    const messageData: any = { role: 'user', content: inputValue.trim() };
    if (quotingMessage) messageData.quoteText = `${quotingMessage.senderName}: ${quotingMessage.content}`;

    addWeChatMessage(sessionId, messageData);
    setInputValue(''); setQuotingMessage(null); setShowFullScreenEditor(false); setIsMultiline(false); setShowPlusMenu(false);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    
    scrollToBottom(); setIsTyping(true);

    try {
      let systemPrompt = `你扮演${character.name}与我微信聊天。设定：${character.description}。开场白：${character.greeting}。`;
      if (character.worldBookId) systemPrompt += `背景：${worldBook.find(w => w.id === character.worldBookId)?.content}\n`;
      systemPrompt += `\n要求：微信聊天语气，简短、口语化。直接输出内容，不带前缀。`;

      const response = await fetch(`${settings.baseUrl}/chat/completions`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${settings.apiKey}` },
        body: JSON.stringify({ model: settings.model || 'gpt-3.5-turbo', messages: buildApiMessages(systemPrompt, sessionId), temperature: settings.temperature || 0.7 })
      });
      if (!response.ok) throw new Error(`API 失败`);
      addWeChatMessage(sessionId, { role: 'character', content: (await response.json()).choices[0].message.content });
    } catch (e) { addWeChatMessage(sessionId, { role: 'character', content: `[系统提示：AI连接失败]` }); } 
    finally { setIsTyping(false); scrollToBottom(); }
  };

  if (!character) return null;

  return (
    <>
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }} className="absolute inset-0 bg-[#EDEDED] flex flex-col z-50">
        
        {/* 顶部 Header */}
        <WeChatChatHeader isSelectionMode={isSelectionMode} selectedCount={selectedMessageIds.length} characterName={character.name} isTyping={isTyping} onBack={onBack} onExitSelection={exitSelectionMode} />

        {/* 虚拟列表内容区 */}
        <div className="flex-1 relative" onClick={() => showPlusMenu && setShowPlusMenu(false)}>
          <div ref={scrollRef} style={{ position: 'absolute', inset: 0, overflowY: 'auto', overflowX: 'hidden', WebkitOverflowScrolling: 'touch' }}>
            <div style={{ height: `${virtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
              {virtualizer.getVirtualItems().map((virtualItem) => {
                const message = messages[virtualItem.index];
                return (
                  <div key={message.id} data-index={virtualItem.index} ref={virtualizer.measureElement} style={{ position: 'absolute', top: 0, left: 0, width: '100%', transform: `translateY(${virtualItem.start}px)`, padding: '16px 16px 8px 16px' }}>
                    <WeChatChatMessageItem 
                      message={message} isUser={message.role === 'user'} 
                      userAvatar={wechatUserProfile?.avatar} characterAvatar={character.avatar} characterName={character.name}
                      isSelected={selectedMessageIds.includes(message.id)} isSelectionMode={isSelectionMode}
                      isMenuOpen={menuState?.messageId === message.id}
                      onMessageClick={handleMessageClick} onToggleSelection={toggleSelection}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 底部输入框组件 */}
        <WeChatChatInputBar 
          isSelectionMode={isSelectionMode} selectedCount={selectedMessageIds.length}
          inputValue={inputValue} setInputValue={setInputValue} isTyping={isTyping} isMultiline={isMultiline}
          textareaRef={textareaRef} showPlusMenu={showPlusMenu} setShowPlusMenu={setShowPlusMenu}
          quotingMessage={quotingMessage} setQuotingMessage={setQuotingMessage}
          onSend={handleSend} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          onInputChange={handleInputChange} onShowTransfer={() => setShowTransferView(true)} onShowFullScreenEditor={() => setShowFullScreenEditor(true)}
          onForwardMulti={() => setForwardTargetModal({ messageIds: selectedMessageIds })} onDeleteMulti={() => setDeleteTarget('multi')}
        />
      </motion.div>

      {/* 集成所有的 Modals 弹窗 */}
      <Modals.TransferView show={showTransferView} onClose={() => setShowTransferView(false)} onSubmit={handleTransferSubmit} amount={transferAmount} setAmount={setTransferAmount} character={character} />
      <Modals.FullScreenEditor show={showFullScreenEditor} onClose={() => setShowFullScreenEditor(false)} onSend={handleSend} inputValue={inputValue} setInputValue={setInputValue} isTyping={isTyping} adjustHeight={adjustTextareaHeight} textareaRef={textareaRef} />
      <Modals.ContextMenu menuState={menuState} closeMenu={() => setMenuState(null)} onCopy={() => handleCopy(menuState!.text)} onForward={() => { setForwardTargetModal({ messageIds: [menuState!.messageId] }); setMenuState(null); }} onDelete={() => { setDeleteTarget(menuState!.messageId); setMenuState(null); }} onSelect={() => { setIsSelectionMode(true); setSelectedMessageIds([menuState!.messageId]); setMenuState(null); }} onQuote={() => { const t = messages.find(m => m.id === menuState!.messageId); if(t) setQuotingMessage({ senderName: t.role==='user' ? (wechatUserProfile?.name||'我') : character.name, content: menuState!.text }); setMenuState(null); }} />
      <Modals.ForwardTargetModal show={!!forwardTargetModal} onClose={() => setForwardTargetModal(null)} characters={wechatCharacters} onSelectContact={executeForward} />
      <Modals.ConfirmDialog show={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={executeDelete} />
      <Modals.Toast message={toastMessage} />
    </>
  );
};