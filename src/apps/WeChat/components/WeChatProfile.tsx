import React from 'react';
import { ChevronRight, Camera, QrCode, User as UserIcon, Wallet, Star, Image as ImageIcon, Video, Package, Smile, Settings, ChevronLeft } from 'lucide-react';
import { useWeChatStore } from '../store';
import { WeChatProfileProps } from '../types';

export const WeChatProfile: React.FC<WeChatProfileProps> = ({ onClose, onEditProfile, onServicesClick }) => {
  const { wechatUserProfile } = useWeChatStore();

  const Row = ({ icon: Icon, label, color, border = true, onClick }: any) => (
    <div onClick={onClick} className="flex items-center bg-white px-4 py-3.5 active:bg-gray-50 cursor-pointer">
      <Icon size={24} className={color} strokeWidth={1.5} />
      <div className={`flex-1 flex items-center justify-between ml-4 ${border ? 'border-b border-gray-100' : ''} pb-3.5 -mb-3.5`}>
        <span className="text-[16px] text-gray-900">{label}</span>
        <ChevronRight size={20} className="text-gray-300" />
      </div>
    </div>
  );

  return (
    <div className="absolute inset-0 bg-[#EDEDED] flex flex-col z-10 overflow-y-auto">
      {/* 顶部工具栏 (白色背景) */}
      <div className="bg-white flex justify-between items-center px-2 pt-12 pb-2 shrink-0">
        <button onClick={onClose} className="text-gray-900 flex items-center active:opacity-50">
          <ChevronLeft size={30} strokeWidth={1.5} />
          <span className="text-[17px]">返回</span>
        </button>
        <button className="text-gray-900 active:opacity-50 px-2">
          <Camera size={26} strokeWidth={1.5} />
        </button>
      </div>

      {/* 个人资料大卡片 */}
      <div 
        onClick={onEditProfile}
        className="bg-white px-5 pb-8 pt-2 flex items-center gap-4 cursor-pointer active:bg-gray-50"
      >
        <div className="w-16 h-16 bg-gray-200 rounded-[14px] overflow-hidden shrink-0 flex items-center justify-center text-gray-400">
          {wechatUserProfile.avatar ? (
            <img src={wechatUserProfile.avatar} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <UserIcon size={36} />
          )}
        </div>
        <div className="flex-1 pt-1">
          <h1 className="text-[22px] font-semibold text-gray-900 mb-1 leading-none">{wechatUserProfile.name}</h1>
          <div className="flex items-center justify-between mt-2">
            <span className="text-[15px] text-gray-500">微信号：{wechatUserProfile.wechatId}</span>
            <div className="flex items-center gap-2 text-gray-400">
              <QrCode size={16} />
              <ChevronRight size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* 服务 */}
      <div className="mt-2 border-t border-b border-gray-100">
        <Row icon={Wallet} label="服务" color="text-[#27A372]" border={false} onClick={onServicesClick} />
      </div>

      {/* 收藏、朋友圈等 */}
      <div className="mt-2 border-t border-b border-gray-100">
        <Row icon={Star} label="收藏" color="text-[#F1B136]" />
        <Row icon={ImageIcon} label="朋友圈" color="text-[#576B95]" />
        <Row icon={Video} label="视频号" color="text-[#E78F26]" />
        <Row icon={Package} label="卡包" color="text-[#6484A9]" />
        <Row icon={Smile} label="表情" color="text-[#F1B136]" border={false} />
      </div>

      {/* 设置 */}
      <div className="mt-2 mb-8 border-t border-b border-gray-100">
        <Row icon={Settings} label="设置" color="text-[#4E83C5]" border={false} />
      </div>
    </div>
  );
};