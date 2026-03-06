import React from 'react';
import { Image, Camera, Compass, Star, Settings, ChevronRight } from 'lucide-react';
import { useStore } from '../../store';

export const WeChatDiscover: React.FC = () => {
  const { wechatMoments } = useStore();

  const menuItems = [
    { icon: Image, label: '朋友圈', badge: true },
    { icon: Camera, label: '扫一扫', badge: false },
    { icon: Compass, label: '摇一摇', badge: false },
    { icon: Star, label: '附近的人', badge: false },
    { icon: Settings, label: '游戏', badge: false },
  ];

  return (
    <div className="flex-1 bg-[#EDEDED] overflow-y-auto">
      {/* Moments Section */}
      <div className="bg-white mb-2">
        {menuItems.map((item, index) => (
          <div key={index} className="flex items-center px-4 py-4 border-b border-gray-100 active:bg-gray-50">
            <div className="w-8 h-8 flex items-center justify-center text-gray-700">
              <item.icon size={24} />
            </div>
            <span className="flex-1 text-[16px] font-medium text-gray-900 ml-3">{item.label}</span>
            <div className="flex items-center gap-2">
              {item.badge && (
                <span className="w-2 h-2 bg-red-500 rounded-full" />
              )}
              <ChevronRight size={20} className="text-gray-300" />
            </div>
          </div>
        ))}
      </div>

      {/* More Section */}
      <div className="bg-white">
        <div className="flex items-center px-4 py-4 border-b border-gray-100 active:bg-gray-50">
          <div className="w-8 h-8 flex items-center justify-center text-gray-700">
            <Settings size={24} />
          </div>
          <span className="flex-1 text-[16px] font-medium text-gray-900 ml-3">小程序</span>
          <ChevronRight size={20} className="text-gray-300" />
        </div>
      </div>
    </div>
  );
};
