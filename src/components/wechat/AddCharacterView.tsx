import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Plus } from 'lucide-react';
import { useStore } from '../../store';
import { AddCharacterViewProps } from './types';

export const AddCharacterView: React.FC<AddCharacterViewProps> = ({ onBack }) => {
  const { addWeChatCharacter, worldBook } = useStore();
  const [avatar, setAvatar] = useState<string>('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedWorldBookId, setSelectedWorldBookId] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatar(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (name && selectedWorldBookId) {
      addWeChatCharacter({
        name,
        description,
        avatar,
        worldBookId: selectedWorldBookId,
        greeting: '',
        personality: '',
        background: '',
      });
      onBack();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-[#EDEDED] flex flex-col"
    >
      {/* Header */}
      <div className="bg-[#F7F7F7] px-3 pt-12 pb-3 flex items-center border-b border-gray-200">
        <button onClick={onBack} className="text-[#07C160] flex items-center gap-1">
          <ChevronLeft size={24} />
          <span className="text-[17px]">返回</span>
        </button>
        <h1 className="flex-1 text-center text-[17px] font-medium text-gray-900">新建角色</h1>
        <button onClick={handleSubmit} className="text-[#07C160] text-[17px]">完成</button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Avatar */}
        <div className="flex justify-center mb-6">
          <div
            onClick={handleAvatarClick}
            className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center cursor-pointer border-2 border-dashed border-gray-300"
          >
            {avatar ? (
              <img src={avatar} alt="Avatar" className="w-full h-full object-cover rounded-full" />
            ) : (
              <Plus size={32} className="text-gray-400" />
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
          />
        </div>

        {/* Name */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="昵称"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[15px] text-gray-900 outline-none focus:border-[#07C160] cursor-text"
          />
        </div>

        {/* Description */}
        <div className="mb-4">
          <textarea
            placeholder="描述"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[15px] text-gray-900 outline-none focus:border-[#07C160] cursor-text"
            rows={4}
          />
        </div>

        {/* World Book Select */}
        <div>
          <label className="block text-[14px] text-gray-500 mb-2">选择世界</label>
          <select
            value={selectedWorldBookId}
            onChange={(e) => setSelectedWorldBookId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[15px] text-gray-900 outline-none focus:border-[#07C160] cursor-pointer"
          >
            <option value="">请选择世界</option>
            {worldBook.map((world) => (
              <option key={world.id} value={world.id}>
                {world.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </motion.div>
  );
};
