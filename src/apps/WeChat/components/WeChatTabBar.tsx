import React from 'react';
import { MessageCircle, Users, Compass, User } from 'lucide-react';
import { WeChatTabBarProps } from '../types';

export const WeChatTabBar: React.FC<WeChatTabBarProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { key: 'chat', icon: MessageCircle, label: '微信' },
    { key: 'contacts', icon: Users, label: '通讯录' },
    { key: 'discover', icon: Compass, label: '发现' },
    { key: 'profile', icon: User, label: '我' },
  ] as const;

  return (
    // fixed positioning ensures the tab bar stays visible at the bottom
    // regardless of other content flow – it won't be pushed up by page elements
    <div className="fixed bottom-0 left-0 right-0 bg-[#F7F7F7] border-t border-gray-200 px-4 py-2 flex justify-around items-center safe-area-bottom z-50">
      {tabs.map(({ key, icon: Icon, label }) => (
        <button
          key={key}
          onClick={() => onTabChange(key)}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-colors ${
            activeTab === key ? 'text-[#07C160]' : 'text-gray-500'
          }`}
        >
          <Icon size={22} />
          <span className="text-[10px]">{label}</span>
        </button>
      ))}
    </div>
  );
};
