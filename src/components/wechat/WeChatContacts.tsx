import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Users, Tag, ChevronRight, User, MessageSquare } from 'lucide-react';
import pinyin from 'pinyin';
import { useStore } from '../../store';
import { WeChatContactsProps } from './types';

interface ListItem {
  id: string;
  type: 'fixed-section' | 'letter-header' | 'contact' | 'additional';
  data?: any;
  letter?: string;
}

export const WeChatContacts: React.FC<WeChatContactsProps> = ({ onSelectChat }) => {
  const { wechatCharacters } = useStore();
  const parentRef = useRef<HTMLDivElement>(null);

  const getPinyinInitial = (name: string): string => {
    if (!name) return '#';
    const firstChar = name.charAt(0);
    if (/[\u4e00-\u9fa5]/.test(firstChar)) {
      const pinyinArray = pinyin(firstChar, { style: pinyin.STYLE_FIRST_LETTER, heteronym: false });
      return pinyinArray[0][0].toUpperCase();
    }
    return firstChar.toUpperCase();
  };

  const fixedSections = [
    { id: 'new-friends', label: '新的朋友', icon: Users, color: 'bg-orange-500' },
    { id: 'groups', label: '群聊', icon: Users, color: 'bg-green-500' },
    { id: 'tags', label: '标签', icon: Tag, color: 'bg-blue-500' },
  ];

  const groupedCharacters = wechatCharacters.reduce((acc, character) => {
    const initial = getPinyinInitial(character.name);
    if (!acc[initial]) {
      acc[initial] = [];
    }
    acc[initial].push(character);
    return acc;
  }, {} as Record<string, typeof wechatCharacters>);

  const alphabeticalKeys = Object.keys(groupedCharacters).sort((a, b) => {
    if (a === '#') return 1;
    if (b === '#') return -1;
    return a.localeCompare(b);
  });

  // 构建扁平化的列表数据
  const listItems: ListItem[] = [];

  // 添加固定section
  fixedSections.forEach(section => {
    listItems.push({ id: section.id, type: 'fixed-section', data: section });
  });

  // 添加字母分组
  alphabeticalKeys.forEach(letter => {
    listItems.push({ id: `header-${letter}`, type: 'letter-header', letter });
    groupedCharacters[letter].forEach(character => {
      listItems.push({ id: character.id, type: 'contact', data: character });
    });
  });

  // 添加额外的固定联系人
  listItems.push({ id: 'file-helper', type: 'additional', data: { id: 'file-helper', name: '文件传输助手', icon: '📎', iconBg: 'bg-green-100', iconColor: 'text-green-500' } });
  listItems.push({ id: 'wechat-team', type: 'additional', data: { id: 'wechat-team', name: '微信团队', icon: MessageSquare, iconBg: 'bg-green-500', iconColor: 'text-white', isLucide: true } });

  const virtualizer = useVirtualizer({
    count: listItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 64,
    overscan: 10,
  });

  const handleContactClick = (characterId: string) => {
    onSelectChat(characterId);
  };

  const renderItem = (item: ListItem) => {
    if (!item) return null;

    if (item.type === 'fixed-section') {
      return (
        <div className="flex items-center px-4 py-3 gap-4 border-b border-gray-100 active:bg-gray-50 transition-colors">
          <div className={`w-12 h-12 ${item.data.color} rounded-xl flex items-center justify-center text-white shadow-sm`}>
            {item.data.icon === Tag ? (
              <Tag size={22} />
            ) : (
              <Users size={22} />
            )}
          </div>
          <span className="flex-1 text-[16px] font-medium text-gray-900">{item.data.label}</span>
          <ChevronRight size={20} className="text-gray-300" />
        </div>
      );
    }

    if (item.type === 'letter-header') {
      return (
        <div className="px-4 py-2 bg-gray-100">
          <span className="text-[13px] font-semibold text-gray-500">{item.letter}</span>
        </div>
      );
    }

    if (item.type === 'contact') {
      const character = item.data;
      return (
        <div
          onClick={() => handleContactClick(character.id)}
          className="flex items-center px-4 py-3 gap-4 border-b border-gray-100 active:bg-gray-50 cursor-pointer transition-colors"
        >
          <div className="w-14 h-14 bg-gray-200 rounded-xl flex items-center justify-center text-gray-400 overflow-hidden shadow-sm">
            {character.avatar ? (
              <img src={character.avatar} alt={character.name} className="w-full h-full object-cover" />
            ) : (
              <User size={28} />
            )}
          </div>
          <span className="flex-1 text-[16px] font-medium text-gray-900">{character.name}</span>
          <ChevronRight size={20} className="text-gray-300" />
        </div>
      );
    }

    if (item.type === 'additional') {
      const { name, icon, iconBg, iconColor, isLucide } = item.data;
      return (
        <div className="flex items-center px-4 py-3 gap-4 border-b border-gray-100 active:bg-gray-50 transition-colors">
          <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center ${iconColor} shadow-sm`}>
            {isLucide ? (
              React.createElement(icon, { size: 22 })
            ) : (
              <span className="text-[18px]">{icon}</span>
            )}
          </div>
          <span className="flex-1 text-[16px] font-medium text-gray-900">{name}</span>
          <ChevronRight size={20} className="text-gray-300" />
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex-1 min-h-0 bg-white relative">
      {/* Virtual List */}
      <div 
        ref={parentRef} 
        className="h-full overflow-y-auto overflow-x-hidden touch-pan-y"
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const item = listItems[virtualItem.index];
            const itemStyle: React.CSSProperties = {
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualItem.start}px)`,
            };
            return (
              <div
                key={virtualItem.key}
                data-index={virtualItem.index}
                ref={virtualizer.measureElement}
                style={itemStyle}
              >
                {renderItem(item)}
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Alphabet Index */}
      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 flex flex-col items-center gap-1 px-1">
        {Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)).map((letter) => (
          <span
            key={letter}
            className="text-[12px] text-gray-500 hover:text-[#07C160] cursor-pointer px-1"
          >
            {letter}
          </span>
        ))}
        <span className="text-[12px] text-gray-500 hover:text-[#07C160] cursor-pointer px-1">#</span>
      </div>
    </div>
  );
};
