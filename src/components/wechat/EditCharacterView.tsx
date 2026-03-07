import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Image as ImageIcon, Check } from 'lucide-react';
import { useStore } from '../../store';

interface EditCharacterViewProps {
  characterId: string;
  onBack: () => void;
}

export const EditCharacterView: React.FC<EditCharacterViewProps> = ({ characterId, onBack }) => {
  const { wechatCharacters, updateWeChatCharacter, worldBook } = useStore();
  const character = wechatCharacters.find(c => c.id === characterId);

  const [avatar, setAvatar] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [greeting, setGreeting] = useState('');
  
  const [tempSelectedWorldBookId, setTempSelectedWorldBookId] = useState('');
  const [tempSelectedWorldBookName, setTempSelectedWorldBookName] = useState('');
  
  const [viewMode, setViewMode] = useState<'form' | 'selectWorldBook'>('form');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 初始化数据
  useEffect(() => {
    if (character) {
      setAvatar(character.avatar || '');
      setName(character.name || '');
      setDescription(character.description || '');
      setGreeting(character.greeting || '');
      
      if (character.worldBookId) {
        setTempSelectedWorldBookId(character.worldBookId);
        const wb = worldBook.find(w => w.id === character.worldBookId);
        if (wb) setTempSelectedWorldBookName(wb.name);
      }
    }
  }, [character, worldBook]);

  if (!character) return null;

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 256;
          const MAX_HEIGHT = 256;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height *= MAX_WIDTH / width));
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width *= MAX_HEIGHT / height));
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            setAvatar(canvas.toDataURL('image/jpeg', 0.8));
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const isFormValid = name.trim().length > 0;

  const handleSubmit = () => {
    if (isFormValid) {
      updateWeChatCharacter(characterId, {
        name: name.trim(),
        description,
        avatar,
        worldBookId: tempSelectedWorldBookId || undefined,
        greeting,
      });
      onBack();
    }
  };

  const handleWorldBookSelect = (worldId: string, worldName: string) => {
    setTempSelectedWorldBookId(worldId);
    setTempSelectedWorldBookName(worldName);
    setViewMode('form');
  };

  return (
    <AnimatePresence mode="wait">
      {viewMode === 'form' && (
        <motion.div
          key="form"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.15 }}
          className="absolute inset-0 bg-[#EDEDED] flex flex-col z-[60]"
        >
          {/* Header */}
          <div className="bg-[#F7F7F7] px-4 pt-12 pb-3 flex items-center border-b border-gray-200 shrink-0">
            <button onClick={onBack} className="text-[#07C160] flex items-center -ml-1 active:opacity-50">
              <ChevronLeft size={28} />
              <span className="text-[17px]">取消</span>
            </button>
            <h1 className="flex-1 text-center text-[17px] font-semibold text-gray-900">朋友资料</h1>
            <button 
              onClick={handleSubmit} 
              disabled={!isFormValid}
              className={`text-[17px] font-medium transition-colors ${isFormValid ? 'text-[#07C160] active:opacity-50' : 'text-gray-300'}`}
            >
              保存
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto pt-4 pb-10">
            <div className="flex flex-col items-center mb-6 px-4">
              <div
                onClick={handleAvatarClick}
                className="w-20 h-20 bg-white rounded-xl flex items-center justify-center cursor-pointer overflow-hidden border border-gray-100 active:bg-gray-50"
              >
                {avatar ? (
                  <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon size={36} className="text-gray-300" />
                )}
              </div>
              <span className="text-[13px] text-gray-500 mt-2">设置头像</span>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            </div>

            <div className="bg-white border-t border-b border-gray-200 mb-6">
              <div className="flex items-center px-4 py-3 border-b border-gray-100">
                <label className="text-[16px] text-gray-900 w-24 shrink-0">昵称</label>
                <input
                  type="text"
                  placeholder="必填，如：李华"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1 text-[16px] text-gray-900 outline-none placeholder:text-gray-300"
                />
              </div>
              
              <div onClick={() => setViewMode('selectWorldBook')} className="flex items-center px-4 py-3 active:bg-gray-50 cursor-pointer">
                <label className="text-[16px] text-gray-900 w-24 shrink-0">角色世界书</label>
                <span className={`flex-1 text-[16px] truncate ${tempSelectedWorldBookName ? 'text-gray-900' : 'text-gray-300'}`}>
                  {tempSelectedWorldBookName || '未选择'}
                </span>
                <ChevronLeft size={20} className="text-gray-300 transform rotate-180 shrink-0 ml-1" />
              </div>
            </div>

            <div className="bg-white border-t border-b border-gray-200">
              <div className="p-4 border-b border-gray-100">
                <label className="block text-[16px] text-gray-900 mb-2">描述</label>
                <textarea
                  placeholder="介绍一下这个角色，如性格、背景..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-[16px] text-gray-900 outline-none placeholder:text-gray-300 resize-none"
                  rows={4}
                />
              </div>
              <div className="p-4">
                <label className="block text-[16px] text-gray-900 mb-2">开场白</label>
                <textarea
                  placeholder="角色在对话开始时会说的话..."
                  value={greeting}
                  onChange={(e) => setGreeting(e.target.value)}
                  className="w-full text-[16px] text-gray-900 outline-none placeholder:text-gray-300 resize-none"
                  rows={3}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {viewMode === 'selectWorldBook' && (
        <motion.div
          key="selectWorldBook"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.15 }}
          className="absolute inset-0 bg-[#EDEDED] flex flex-col z-[70]"
        >
          <div className="bg-[#F7F7F7] px-4 pt-12 pb-3 flex items-center border-b border-gray-200 shrink-0">
            <button onClick={() => setViewMode('form')} className="text-[#07C160] flex items-center -ml-1 active:opacity-50">
              <ChevronLeft size={28} />
              <span className="text-[17px]">返回</span>
            </button>
            <h1 className="flex-1 text-center text-[17px] font-semibold text-gray-900 pr-12">选择角色世界书</h1>
          </div>
          <div className="flex-1 overflow-y-auto py-3">
            <div className="bg-white border-t border-b border-gray-200">
              <div onClick={() => handleWorldBookSelect('', '')} className="flex items-center px-4 py-3 active:bg-gray-50 cursor-pointer border-b border-gray-100">
                <span className="flex-1 text-[16px] text-gray-900">不使用世界书</span>
                {!tempSelectedWorldBookId && <Check size={20} className="text-[#07C160] shrink-0 ml-2" />}
              </div>
              {worldBook.map((world, index) => (
                <div key={world.id} onClick={() => handleWorldBookSelect(world.id, world.name)} className={`flex items-center px-4 py-3 active:bg-gray-50 cursor-pointer ${index !== worldBook.length - 1 ? 'border-b border-gray-100' : ''}`}>
                  <span className="flex-1 text-[16px] text-gray-900 truncate">{world.name}</span>
                  {world.id === tempSelectedWorldBookId && <Check size={20} className="text-[#07C160] shrink-0 ml-2" />}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};