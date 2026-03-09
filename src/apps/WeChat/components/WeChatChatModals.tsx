// src/components/wechat/WeChatChatModals.tsx
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Copy, Forward, Star, Trash2, CheckSquare, MessageSquareQuote, X, Check } from 'lucide-react';
import { Avatar } from './WeChatChatMessageItem';

// --- 长按菜单项组件 ---
const MenuItem = ({ icon: Icon, label, onClick }: { icon: any, label: string, onClick: () => void }) => (
  <div onClick={onClick} className="flex flex-col items-center justify-center w-[52px] h-[56px] active:bg-[#383838] rounded-md cursor-pointer transition-colors">
    <Icon size={20} className="text-white mb-1.5" strokeWidth={1.5} />
    <span className="text-[11px] text-gray-200">{label}</span>
  </div>
);

// --- 各种 Modal Props 接口 ---
export const Modals = {
  // 1. 转账弹窗
  TransferView: ({ show, onClose, onSubmit, amount, setAmount, character }: any) => (
    <AnimatePresence>
      {show && (
        <motion.div initial={{ opacity: 0, y: '100%' }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed inset-0 z-[120] bg-[#EDEDED] flex flex-col">
          <div className="flex items-center justify-between px-4 pt-12 pb-3 bg-[#EDEDED] shrink-0">
            <button onClick={onClose} className="text-gray-900 active:opacity-50 px-1"><X size={26} strokeWidth={1.5} /></button>
            <div className="flex-1"></div>
          </div>
          <div className="flex-1 p-4 flex flex-col items-center pt-8">
            <Avatar url={character.avatar} />
            <span className="text-[16px] text-gray-900 mt-2">微转账给 {character.name}</span>
            <span className="text-[14px] text-gray-500 mt-1">微信号: {character.id}</span>
            <div className="w-full bg-white rounded-xl p-6 shadow-sm mt-8">
              <h2 className="text-[15px] text-gray-900 mb-6">转账金额</h2>
              <div className="flex items-end border-b border-gray-200 pb-2 mb-8">
                <span className="text-[36px] font-semibold mr-2 leading-none text-gray-900">¥</span>
                <input type="number" className="flex-1 text-[44px] font-semibold outline-none bg-transparent w-full leading-none h-[50px] text-gray-900" value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus />
              </div>
              <button onClick={onSubmit} disabled={!amount || parseFloat(amount) <= 0} className="w-full bg-[#07C160] disabled:bg-[#A9E8C3] text-white rounded py-3 text-[17px] font-medium active:bg-[#06ad56] transition-colors">转账</button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  ),

  // 2. 全屏编辑器
  FullScreenEditor: ({ show, onClose, onSend, inputValue, setInputValue, isTyping, adjustHeight, textareaRef }: any) => (
    <AnimatePresence>
      {show && (
        <motion.div initial={{ opacity: 0, y: '100%' }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed inset-0 z-[120] bg-[#F7F7F7] flex flex-col">
          <div className="flex items-center justify-between px-4 pt-12 pb-3 bg-[#F7F7F7] border-b border-gray-200">
            <button onClick={onClose} className="text-[16px] text-gray-900 active:opacity-50 px-1">取消</button>
            <div className="text-[17px] font-medium text-gray-900">编辑文字</div>
            <button onClick={onSend} disabled={!inputValue.trim() || isTyping} className={`px-4 py-1.5 rounded-[4px] text-[15px] font-medium transition-colors ${!inputValue.trim() || isTyping ? 'bg-gray-200 text-gray-400' : 'bg-[#07C160] text-white active:bg-[#06ad56]'}`}>发送</button>
          </div>
          <div className="flex-1 p-4 bg-white">
            <textarea value={inputValue} onChange={(e) => { setInputValue(e.target.value); adjustHeight(textareaRef.current); }} autoFocus className="w-full h-full text-[17px] text-gray-900 outline-none resize-none leading-relaxed bg-transparent" placeholder="请输入消息..." />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  ),

  // 3. 长按气泡菜单
  ContextMenu: ({ menuState, closeMenu, onCopy, onForward, onDelete, onSelect, onQuote }: any) => (
    <AnimatePresence>
      {menuState && (
        <div className="fixed inset-0 z-[100]" onClick={closeMenu}>
          <motion.div initial={{ opacity: 0, scale: 0.8, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.15 }} className="absolute bg-[#4C4C4C] rounded-lg shadow-xl px-2 py-1 flex flex-wrap max-w-[280px] gap-x-1 gap-y-1 justify-center" style={{ left: menuState.x, top: menuState.y }} onClick={(e) => e.stopPropagation()}>
            <MenuItem icon={Copy} label="复制" onClick={onCopy} />
            <MenuItem icon={Forward} label="转发" onClick={onForward} />
            <MenuItem icon={Star} label="收藏" onClick={closeMenu} />
            <MenuItem icon={Trash2} label="删除" onClick={onDelete} />
            <MenuItem icon={CheckSquare} label="多选" onClick={onSelect} />
            <MenuItem icon={MessageSquareQuote} label="引用" onClick={onQuote} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  ),

  // 4. 转发联系人选择列表
  ForwardTargetModal: ({ show, onClose, characters, onSelectContact }: any) => (
    <AnimatePresence>
      {show && (
        <motion.div initial={{ opacity: 0, y: '100%' }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed inset-0 z-[120] bg-white flex flex-col">
          <div className="bg-[#F7F7F7] px-4 pt-12 pb-2.5 flex items-center border-b border-gray-200 shrink-0">
            <button onClick={onClose} className="text-gray-900 flex items-center active:opacity-50"><X size={28} strokeWidth={1.5} /></button>
            <h1 className="flex-1 text-center text-[17px] font-medium text-gray-900 pr-7">选择一个聊天</h1>
          </div>
          <div className="flex-1 overflow-y-auto">
            {characters.map((char: any) => (
              <div key={char.id} onClick={() => onSelectContact(char.id)} className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 active:bg-gray-50 cursor-pointer">
                <Avatar url={char.avatar} /><span className="text-[17px] text-gray-900">{char.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  ),

  // 5. 删除确认弹窗
  ConfirmDialog: ({ show, onClose, onConfirm }: any) => (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[110] bg-black/40 flex items-center justify-center">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.15 }} className="bg-white w-[280px] rounded-[10px] overflow-hidden flex flex-col">
            <div className="py-6 text-center text-[16px] text-gray-900 border-b border-gray-100 font-medium">确认删除？</div>
            <div className="flex items-center">
              <button onClick={onClose} className="flex-1 py-3.5 text-[16px] text-gray-900 active:bg-gray-100 border-r border-gray-100">取消</button>
              <button onClick={onConfirm} className="flex-1 py-3.5 text-[16px] text-[#E64340] font-medium active:bg-gray-100">删除</button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  ),

  // 6. 全局 Toast
  Toast: ({ message }: { message: string | null }) => (
    <AnimatePresence>
      {message && (
        <motion.div initial={{ opacity: 0, y: 20, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: 20, x: '-50%' }} transition={{ duration: 0.2 }} className="fixed bottom-[120px] left-1/2 z-[200] bg-black/70 text-white px-5 py-2.5 rounded-[8px] text-[15px] whitespace-nowrap shadow-md flex items-center gap-2">
          <Check size={18} strokeWidth={2.5} />{message}
        </motion.div>
      )}
    </AnimatePresence>
  )
};