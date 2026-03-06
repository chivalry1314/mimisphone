import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Plus } from 'lucide-react';
import { WeChatTabBar, AddCharacterView, WeChatChats, WeChatContacts, WeChatChatView, WeChatDiscover, WeChatProfile, WeChatTab, WeChatView, WeChatAppProps } from './wechat';

export const WeChatApp: React.FC<WeChatAppProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<WeChatTab>('chat');
  const [currentView, setCurrentView] = useState<WeChatView>('main');
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);

  const getTabTitle = () => {
    switch (activeTab) {
      case 'chat': return '微信';
      case 'contacts': return '通讯录';
      case 'discover': return '发现';
      case 'profile': return '我';
      default: return '微信';
    }
  };

  const handleBack = () => {
    if (currentView === 'chat') {
      setCurrentView('main');
      setSelectedCharacterId(null);
    } else if (currentView === 'addCharacter') {
      setCurrentView('main');
    }
  };

  const handleSelectChat = (characterId: string) => {
    setSelectedCharacterId(characterId);
    setCurrentView('chat');
  };

  const handleAddCharacter = () => {
    setCurrentView('addCharacter');
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="absolute inset-0 z-50 bg-[#EDEDED] flex flex-col"
    >
      <AnimatePresence mode="wait">
        {currentView === 'main' && (
          <motion.div
            key="main-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col min-h-0"
          >
            {/* Header with Back Button */}
            <div className="bg-[#F7F7F7] px-3 pt-12 pb-3 flex items-center border-b border-gray-200 shrink-0">
              <button onClick={onClose} className="text-[#07C160] flex items-center gap-1">
                <ChevronLeft size={24} />
                <span className="text-[17px]">返回</span>
              </button>
              <h1 className="flex-1 text-center text-[17px] font-medium text-gray-900">{getTabTitle()}</h1>
              {activeTab === 'contacts' && (
                <button onClick={handleAddCharacter} className="text-[#07C160] p-1">
                  <Plus size={26} />
                </button>
              )}
              {activeTab !== 'contacts' && <div className="w-6" />}
            </div>

            {/* Tab Content */}
            <div className="flex-1 min-h-0 overflow-hidden relative">
              {activeTab === 'chat' && (
                <div className="absolute inset-0">
                  <WeChatChats onSelectChat={handleSelectChat} />
                </div>
              )}
              {activeTab === 'contacts' && (
                <div className="absolute inset-0">
                  <WeChatContacts onSelectChat={handleSelectChat} />
                </div>
              )}
              {activeTab === 'discover' && (
                <div className="absolute inset-0 overflow-y-auto">
                  <WeChatDiscover />
                </div>
              )}
              {activeTab === 'profile' && (
                <div className="absolute inset-0 overflow-y-auto">
                  <WeChatProfile onClose={onClose} />
                </div>
              )}
            </div>

            {/* Tab Bar */}
            <div className="h-14 shrink-0">
              <WeChatTabBar activeTab={activeTab} onTabChange={setActiveTab} />
            </div>
          </motion.div>
        )}

        {currentView === 'chat' && selectedCharacterId && (
          <WeChatChatView key="chat-view" characterId={selectedCharacterId} onBack={handleBack} />
        )}

        {currentView === 'addCharacter' && (
          <AddCharacterView key="add-character" onBack={handleBack} />
        )}
      </AnimatePresence>
    </motion.div>
  );
};
