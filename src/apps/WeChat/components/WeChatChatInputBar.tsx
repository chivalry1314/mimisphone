// src/components/wechat/WeChatChatInputBar.tsx
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Smile, Plus, Forward, Box, Trash2, Mail, Maximize, XCircle, ArrowRightLeft } from 'lucide-react';

interface WeChatChatInputBarProps {
  isSelectionMode: boolean;
  selectedCount: number;
  inputValue: string;
  setInputValue: (val: string) => void;
  isTyping: boolean;
  isMultiline: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  showPlusMenu: boolean;
  setShowPlusMenu: (show: boolean) => void;
  quotingMessage: { senderName: string; content: string } | null;
  setQuotingMessage: (val: null) => void;
  onSend: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onShowTransfer: () => void;
  onShowFullScreenEditor: () => void;
  onForwardMulti: () => void;
  onDeleteMulti: () => void;
}

export const WeChatChatInputBar: React.FC<WeChatChatInputBarProps> = ({
  isSelectionMode, selectedCount, inputValue, setInputValue, isTyping, isMultiline,
  textareaRef, showPlusMenu, setShowPlusMenu, quotingMessage, setQuotingMessage,
  onSend, onKeyDown, onInputChange, onShowTransfer, onShowFullScreenEditor,
  onForwardMulti, onDeleteMulti
}) => {
  if (isSelectionMode) {
    return (
      <div className="bg-[#F7F7F7] border-t border-gray-200 px-6 py-2 flex items-center justify-between shrink-0 pb-safe">
        <button onClick={onForwardMulti} disabled={selectedCount === 0} className={`p-2 transition-opacity ${selectedCount > 0 ? 'text-gray-800 active:opacity-50' : 'text-gray-300'}`}><Forward size={24} strokeWidth={1.5} /></button>
        <button className="text-gray-800 active:opacity-50 p-2"><Box size={24} strokeWidth={1.5} /></button>
        <button onClick={onDeleteMulti} disabled={selectedCount === 0} className={`p-2 transition-opacity ${selectedCount > 0 ? 'text-gray-800 active:opacity-50' : 'text-gray-300'}`}><Trash2 size={24} strokeWidth={1.5} /></button>
        <button className="text-gray-800 active:opacity-50 p-2"><Mail size={24} strokeWidth={1.5} /></button>
      </div>
    );
  }

  return (
    <div className="bg-[#F7F7F7] border-t border-gray-200 flex flex-col shrink-0 pb-safe">
      <div className="px-2 py-2 flex flex-col">
        <div className="flex items-end gap-2 w-full">
          <div className="flex flex-col justify-end shrink-0 mb-0.5">
            <AnimatePresence>
              {isMultiline && (
                <motion.button initial={{ opacity: 0, scale: 0.5, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.5, y: 10 }} transition={{ duration: 0.15 }}
                  onClick={onShowFullScreenEditor}
                  className="text-gray-500 hover:text-gray-700 active:opacity-50 p-1 w-[32px] flex items-center justify-center mb-1"
                >
                  <Maximize size={22} strokeWidth={1.5} />
                </motion.button>
              )}
            </AnimatePresence>
            <button className="text-gray-700 active:opacity-50 p-1 w-[32px] flex items-center justify-center"><Mic size={28} strokeWidth={1.5} /></button>
          </div>
          
          <div className="flex-1 bg-white rounded-md border border-gray-200 min-h-[40px] flex px-2 py-1.5 box-border">
            <textarea
              ref={textareaRef} value={inputValue} onChange={onInputChange} onKeyDown={onKeyDown} disabled={isTyping}
              style={{ minHeight: '24px' }} className="w-full text-[16px] text-gray-900 outline-none resize-none bg-transparent overflow-y-auto leading-snug disabled:bg-transparent" rows={1}
            />
          </div>

          <button className="text-gray-700 active:opacity-50 p-1 mb-0.5 shrink-0 w-[32px] flex items-center justify-center"><Smile size={28} strokeWidth={1.5} /></button>
          
          <div className="shrink-0 mb-0.5 w-[56px] flex justify-end">
            <AnimatePresence mode="wait">
              {inputValue.trim() ? (
                <motion.button key="send" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} transition={{ duration: 0.15 }} onClick={onSend} disabled={isTyping} className={`text-white text-[15px] font-medium w-full h-[38px] rounded-md ${isTyping ? 'bg-[#7CD799]' : 'bg-[#07C160] active:opacity-80'}`}>发送</motion.button>
              ) : (
                <motion.button key="plus" onClick={() => setShowPlusMenu(!showPlusMenu)} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} transition={{ duration: 0.15 }} className="text-gray-700 active:opacity-50 p-1 w-[32px] flex items-center justify-center"><Plus size={30} strokeWidth={1.5} /></motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {quotingMessage && (
          <div className="flex gap-2 mt-2 w-full">
            <div className="w-[32px] shrink-0 pointer-events-none opacity-0" />
            <div className="flex-1 bg-[#EAEAEA] rounded-[4px] px-2 py-1.5 flex items-center justify-between overflow-hidden">
              <span className="text-[13px] text-gray-500 truncate flex-1">{quotingMessage.senderName}：{quotingMessage.content}</span>
              <button onClick={() => setQuotingMessage(null)} className="ml-2 text-gray-400 active:opacity-50 shrink-0"><XCircle size={16} className="text-gray-400 fill-gray-200" /></button>
            </div>
            <div className="w-[32px] shrink-0 pointer-events-none opacity-0" />
            <div className="w-[56px] shrink-0 pointer-events-none opacity-0" />
          </div>
        )}
      </div>

      <AnimatePresence>
        {showPlusMenu && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-[#F7F7F7] border-t border-gray-200 overflow-hidden shrink-0">
            <div className="grid grid-cols-4 gap-y-6 gap-x-4 p-6 pb-8">
              <div className="flex flex-col items-center gap-2">
                <div onClick={() => { setShowPlusMenu(false); onShowTransfer(); }} className="w-[60px] h-[60px] bg-white rounded-2xl flex items-center justify-center text-gray-700 active:bg-gray-100 cursor-pointer shadow-sm">
                  <ArrowRightLeft size={28} strokeWidth={1.5} />
                </div>
                <span className="text-[12px] text-gray-500">转账</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};