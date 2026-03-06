import React from 'react';
import { User, Settings, HelpCircle, Info, Heart, ChevronRight } from 'lucide-react';
import { useStore } from '../../store';
import { WeChatProfileProps } from './types';

export const WeChatProfile: React.FC<WeChatProfileProps> = ({ onClose }) => {
  const { wechatUserProfile } = useStore();

  const menuItems = [
    { icon: Settings, label: '设置', badge: false },
    { icon: HelpCircle, label: '帮助与反馈', badge: false },
    { icon: Info, label: '关于微信', badge: false },
  ];

  return (
    <div className="flex-1 bg-[#EDEDED] overflow-y-auto">
      {/* Profile Header */}
      <div className="bg-[#07C160] p-4">
        <div className="flex items-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-gray-400 overflow-hidden">
            {wechatUserProfile.avatar ? (
              <img src={wechatUserProfile.avatar} alt={wechatUserProfile.name} className="w-full h-full object-cover" />
            ) : (
              <User size={32} />
            )}
          </div>
          <div className="ml-4 text-white">
            <h2 className="text-[18px] font-medium">{wechatUserProfile.name || '未登录'}</h2>
            <p className="text-[14px] opacity-80 mt-1">点击头像可设置个人信息</p>
          </div>
        </div>
      </div>

      {/* Menu Section */}
      <div className="bg-white mb-2 mt-4">
        <div className="flex items-center px-4 py-4 border-b border-gray-100 active:bg-gray-50">
          <div className="w-8 h-8 flex items-center justify-center text-gray-700">
            <Heart size={24} />
          </div>
          <span className="flex-1 text-[16px] font-medium text-gray-900 ml-3">收藏</span>
          <ChevronRight size={20} className="text-gray-300" />
        </div>
      </div>

      {/* More Menu Items */}
      <div className="bg-white">
        {menuItems.map((item, index) => (
          <div key={index} className="flex items-center px-4 py-4 border-b border-gray-100 active:bg-gray-50">
            <div className="w-8 h-8 flex items-center justify-center text-gray-700">
              <item.icon size={24} />
            </div>
            <span className="flex-1 text-[16px] font-medium text-gray-900 ml-3">{item.label}</span>
            <ChevronRight size={20} className="text-gray-300" />
          </div>
        ))}
      </div>
    </div>
  );
};
