// src/components/wechat/WeChatChatMessageItem.tsx
import React from 'react';
import { Check, ArrowRightLeft, User } from 'lucide-react';
import { WeChatMessage } from '../../types';

// 通用头像组件
export const Avatar: React.FC<{ url?: string | null }> = ({ url }) => (
  <div className="w-10 h-10 rounded-lg bg-gray-200 overflow-hidden shrink-0 border border-gray-100 flex items-center justify-center text-gray-400 relative">
    {url ? (
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${url})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
    ) : (
      <User size={24} />
    )}
  </div>
);

interface WeChatChatMessageItemProps {
  message: WeChatMessage;
  isUser: boolean;
  userAvatar?: string | null;
  characterAvatar?: string | null;
  characterName: string;
  isSelected: boolean;
  isSelectionMode: boolean;
  isMenuOpen: boolean;
  onMessageClick: (e: React.MouseEvent, msg: WeChatMessage) => void;
  onToggleSelection: (messageId: string) => void;
}

export const WeChatChatMessageItem: React.FC<WeChatChatMessageItemProps> = ({
  message, isUser, userAvatar, characterAvatar, characterName,
  isSelected, isSelectionMode, isMenuOpen, onMessageClick, onToggleSelection
}) => {
  const isTransfer = message.type === 'transfer' || message.type === 'transfer_accepted';
  const quoteText = message.quoteText;

  return (
    <div className="flex items-start w-full" onClick={() => isSelectionMode && onToggleSelection(message.id)}>
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
        <Avatar url={isUser ? userAvatar : characterAvatar} />
        
        <div className={`relative max-w-[70%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`relative flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            {/* 气泡三角 */}
            <div className={`absolute top-3.5 w-0 h-0 border-[5px] border-transparent ${
              isUser 
                ? `left-full ${isTransfer ? 'border-l-[#F39B3A]' : 'border-l-[#95ec69]'}` 
                : `right-full ${isTransfer ? 'border-r-[#F39B3A]' : 'border-r-white'}`
            }`} />
            
            {/* 气泡本体 */}
            <div 
              onClick={(e) => onMessageClick(e, message)}
              className={`relative cursor-pointer ${isMenuOpen ? 'brightness-90' : ''} ${
                isUser ? 'rounded-lg rounded-tr-none' : 'rounded-lg rounded-tl-none'
              } ${
                isTransfer 
                  ? `bg-[#F39B3A] text-white overflow-hidden ${message.type === 'transfer_accepted' ? 'opacity-95' : ''}` 
                  : (isUser ? 'bg-[#95ec69] text-gray-900 px-3.5 py-2.5' : 'bg-white text-gray-900 px-3.5 py-2.5')
              }`}
            >
              {isTransfer ? (
                <div className="flex flex-col w-[200px] sm:w-[220px]">
                  <div className="flex items-center gap-3 p-3">
                    <div className="w-10 h-10 shrink-0 border-2 border-white/80 rounded-full flex items-center justify-center">
                      {message.type === 'transfer_accepted' ? <Check size={24} /> : <ArrowRightLeft size={20} />}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[17px] leading-tight font-medium">¥{message.amount?.toFixed(2)}</span>
                      <span className="text-[13px] opacity-90 mt-0.5">
                        {message.type === 'transfer' ? (isUser ? `转账给${characterName}` : `转账给你`) : '已收款'}
                      </span>
                    </div>
                  </div>
                  <div className="bg-white/20 px-3 py-1 text-[11px] text-white/90">微信转账</div>
                </div>
              ) : (
                <div style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }} className="text-[16px] leading-[1.4]">
                  {message.content}
                </div>
              )}
            </div>
          </div>

          {quoteText && (
            <div className="mt-1 bg-[#E5E5E5] rounded-[4px] px-2 py-1 max-w-[100%] overflow-hidden" style={{ alignSelf: isUser ? 'flex-end' : 'flex-start' }}>
              <div className="text-[12px] text-gray-500 break-words" style={{ display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 3, overflow: 'hidden' }}>
                {quoteText}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};