import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Plus } from 'lucide-react';
import { 
  WeChatTabBar, 
  AddCharacterView, 
  WeChatChats, 
  WeChatContacts, 
  WeChatChatView, 
  WeChatDiscover, 
  WeChatProfile, 
  ContactProfileView,
  EditCharacterView,
  EditMyProfileView,
  EditMyNameView, // 引入更改名字页面
  WeChatTab, 
  WeChatView, 
  WeChatAppProps 
} from './wechat';

import { WeChatServicesView } from './wechat/WeChatServicesView';
import { WeChatWalletView } from './wechat/WeChatWalletView';
import { WeChatBalanceView } from './wechat/WeChatBalanceView';
import { WeChatTopUpView } from './wechat/WeChatTopUpView';
import { WeChatWithdrawView } from './wechat/WeChatWithdrawView';

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
    if (['chat', 'addCharacter', 'contactProfile', 'editMyProfile', 'services'].includes(currentView)) {
      setCurrentView('main');
    } else if (currentView === 'editCharacter') {
      setCurrentView('contactProfile');
    } else if (currentView === 'editMyName') {
      // 更改名字页面点击返回或保存后，回到个人信息页
      setCurrentView('editMyProfile');
    } else if (currentView === 'wallet') {
      setCurrentView('services');
    } else if (currentView === 'balance') {
      setCurrentView('wallet');
    } else if (currentView === 'topUp' || currentView === 'withdraw') {
      setCurrentView('balance');
    }
  };

  const handleSelectChat = (characterId: string) => {
    setSelectedCharacterId(characterId);
    setCurrentView('chat');
  };

  const handleSelectContact = (characterId: string) => {
    setSelectedCharacterId(characterId);
    setCurrentView('contactProfile');
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
            {activeTab !== 'profile' && (
              <div className="bg-[#F7F7F7] px-3 pt-12 pb-3 flex items-center border-b border-gray-200 shrink-0">
                <button onClick={onClose} className="text-[#07C160] flex items-center gap-1 active:opacity-50">
                  <ChevronLeft size={28} />
                  <span className="text-[17px]">返回</span>
                </button>
                <h1 className="flex-1 text-center text-[17px] font-medium text-gray-900">{getTabTitle()}</h1>
                {activeTab === 'contacts' && (
                  <button onClick={handleAddCharacter} className="text-[#07C160] p-1 active:opacity-50">
                    <Plus size={28} />
                  </button>
                )}
                {activeTab !== 'contacts' && <div className="w-8" />}
              </div>
            )}

            <div className="flex-1 min-h-0 overflow-hidden relative">
              {activeTab === 'chat' && (
                <div className="absolute inset-0">
                  <WeChatChats onSelectChat={handleSelectChat} />
                </div>
              )}
              {activeTab === 'contacts' && (
                <div className="absolute inset-0">
                  <WeChatContacts onSelectChat={handleSelectContact} />
                </div>
              )}
              {activeTab === 'discover' && (
                <div className="absolute inset-0 overflow-y-auto">
                  <WeChatDiscover />
                </div>
              )}
              {activeTab === 'profile' && (
                <div className="absolute inset-0 overflow-y-auto">
                  <WeChatProfile 
                    onClose={onClose} 
                    onEditProfile={() => setCurrentView('editMyProfile')} 
                    onServicesClick={() => setCurrentView('services')}
                  />
                </div>
              )}
            </div>

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

        {currentView === 'contactProfile' && selectedCharacterId && (
          <ContactProfileView 
            key="contact-profile"
            characterId={selectedCharacterId} 
            onBack={handleBack}
            onSendMessage={(id) => {
              setSelectedCharacterId(id);
              setCurrentView('chat');
            }}
            onEditProfile={(id) => {
              setSelectedCharacterId(id);
              setCurrentView('editCharacter');
            }}
          />
        )}

        {currentView === 'editCharacter' && selectedCharacterId && (
          <EditCharacterView key="edit-character" characterId={selectedCharacterId} onBack={handleBack} />
        )}

        {currentView === 'editMyProfile' && (
          <EditMyProfileView 
            key="edit-my-profile" 
            onBack={handleBack} 
            onEditName={() => setCurrentView('editMyName')} // 绑定跳转到修改名字页
          />
        )}

        {/* 渲染新的修改名字页 */}
        {currentView === 'editMyName' && (
          <EditMyNameView key="edit-my-name" onBack={handleBack} />
        )}
        {currentView === 'services' && (
          <WeChatServicesView key="services" onBack={handleBack} onWalletClick={() => setCurrentView('wallet')} />
        )}
        {currentView === 'wallet' && (
          <WeChatWalletView key="wallet" onBack={handleBack} onBalanceClick={() => setCurrentView('balance')} />
        )}
        {currentView === 'balance' && (
          <WeChatBalanceView 
            key="balance" 
            onBack={handleBack} 
            onTopUpClick={() => setCurrentView('topUp')}
            onWithdrawClick={() => setCurrentView('withdraw')} 
          />
        )}
        {currentView === 'topUp' && (
          <WeChatTopUpView key="topUp" onBack={handleBack} />
        )}
        {currentView === 'withdraw' && (
          <WeChatWithdrawView key="withdraw" onBack={handleBack} />
        )}
      </AnimatePresence>
    </motion.div>
  );
};