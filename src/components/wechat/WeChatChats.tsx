import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { User, ChevronRight } from 'lucide-react';
import { useStore } from '../../store';
import { WeChatChatsProps } from './types';

export const WeChatChats: React.FC<WeChatChatsProps> = ({ onSelectChat }) => {
  const { wechatCharacters, wechatSessions } = useStore();
  const parentRef = useRef<HTMLDivElement>(null);

  const formatTime = (timestamp: number) => {
    const now = new Date();
    const messageDate = new Date(timestamp);
    const diffTime = Math.abs(now.getTime() - messageDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return '昨天';
    } else if (diffDays < 1) {
      return messageDate.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays < 7) {
      const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
      return `周${weekdays[messageDate.getDay()]}`;
    } else {
      return messageDate.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
    }
  };

  const getLastMessageInfo = (characterId: string) => {
    const session = wechatSessions.find(s => s.characterId === characterId);
    if (session && session.messages.length > 0) {
      const lastMessage = session.messages[session.messages.length - 1];
      return {
        text: lastMessage.content,
        time: lastMessage.timestamp
      };
    }
    return {
      text: '暂无消息',
      time: Date.now()
    };
  };

  const virtualizer = useVirtualizer({
    count: wechatCharacters.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72, // 微信聊天列表项高度通常在 72px 左右
    overscan: 10,
  });

  return (
    // 1. 外层：100%宽高 relative 占据父组件留下的空间
    <div style={{ width: '100%', height: '100%', position: 'relative', backgroundColor: '#EDEDED' }}>
      
      {/* 2. 滚动层：用 absolute 钉死在容器内部，强制激活滚动并加上移动端特有支持 */}
      <div 
        ref={parentRef} 
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-y'
        }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const character = wechatCharacters[virtualItem.index];
            const lastMessageInfo = getLastMessageInfo(character.id);
            return (
              <div
                key={character.id}
                data-index={virtualItem.index}
                ref={virtualizer.measureElement}
                onClick={() => onSelectChat(character.id)}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualItem.start}px)`,
                }}
                className="flex items-center px-4 py-3 bg-white border-b border-gray-100 active:bg-gray-50 cursor-pointer"
              >
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 overflow-hidden shrink-0">
                  {character.avatar ? (
                    <img src={character.avatar} alt={character.name} className="w-full h-full object-cover" />
                  ) : (
                    <User size={24} />
                  )}
                </div>
                <div className="flex-1 ml-3 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[16px] font-medium text-gray-900 truncate">{character.name}</span>
                    <span className="text-[12px] text-gray-400 shrink-0 ml-2">{formatTime(lastMessageInfo.time)}</span>
                  </div>
                  <p className="text-[14px] text-gray-500 truncate">
                    {lastMessageInfo.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};