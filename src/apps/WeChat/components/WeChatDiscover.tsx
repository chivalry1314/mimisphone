import React from 'react';
import { ChevronRight, Aperture, Video, Scan, Smartphone, Eye, Search, MapPin, Package } from 'lucide-react';

export const WeChatDiscover: React.FC = () => {
  // 封装统一的列表项组件
  const RowItem = ({ icon: Icon, label, color, border = true, onClick }: any) => (
    <div onClick={onClick} className="flex items-center bg-white px-4 py-3.5 active:bg-gray-50 cursor-pointer">
      <Icon size={24} className={color} strokeWidth={1.5} />
      {/* 这里的负边距技巧是为了让下边划线不穿透左侧图标区域，完美复刻微信细节 */}
      <div className={`flex-1 flex items-center justify-between ml-4 ${border ? 'border-b border-gray-100' : ''} pb-3.5 -mb-3.5`}>
        <span className="text-[16px] text-gray-900">{label}</span>
        <div className="flex items-center gap-2">
          {/* 预留位置：如果以后要做未读小红点或者头像提示，可以加在这里 */}
          <ChevronRight size={20} className="text-gray-300" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="pb-8">
      {/* 朋友圈 */}
      <div className="mt-2 border-t border-b border-gray-200">
        <RowItem icon={Aperture} label="朋友圈" color="text-[#576B95]" border={false} />
      </div>

      {/* 视频号 */}
      <div className="mt-2 border-t border-b border-gray-200">
        <RowItem icon={Video} label="视频号" color="text-[#E78F26]" border={false} />
      </div>

      {/* 扫一扫、摇一摇 */}
      <div className="mt-2 border-t border-b border-gray-200">
        <RowItem icon={Scan} label="扫一扫" color="text-[#3B82F6]" />
        <RowItem icon={Smartphone} label="摇一摇" color="text-[#3B82F6]" border={false} />
      </div>

      {/* 看一看、搜一搜 */}
      <div className="mt-2 border-t border-b border-gray-200">
        <RowItem icon={Eye} label="看一看" color="text-[#F59E0B]" />
        <RowItem icon={Search} label="搜一搜" color="text-[#EF4444]" border={false} />
      </div>

      {/* 附近 */}
      <div className="mt-2 border-t border-b border-gray-200">
        <RowItem icon={MapPin} label="附近" color="text-[#3B82F6]" border={false} />
      </div>

      {/* 小程序 */}
      <div className="mt-2 mb-4 border-t border-b border-gray-200">
        <RowItem icon={Package} label="小程序" color="text-[#8B5CF6]" border={false} />
      </div>
    </div>
  );
};