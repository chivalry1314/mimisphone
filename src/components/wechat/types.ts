import { WeChatMessage, WeChatCharacter, WeChatSession } from '../../types';

export type WeChatTab = 'chat' | 'contacts' | 'discover' | 'profile';

export type WeChatView = 'main' | 'chat' | 'addCharacter' | 'contactProfile' | 'editCharacter' | 'editMyProfile' | 'editMyName' | 'services' | 'wallet' | 'balance' | 'topUp' | 'withdraw';

export interface WeChatAppProps {
  onClose: () => void;
}

export interface WeChatTabBarProps {
  activeTab: WeChatTab;
  onTabChange: (tab: WeChatTab) => void;
}

export interface AddCharacterViewProps {
  onBack: () => void;
}

export interface WeChatChatsProps {
  onSelectChat: (characterId: string) => void;
}

export interface WeChatContactsProps {
  onSelectChat: (characterId: string) => void;
}

export interface WeChatChatViewProps {
  characterId: string;
  onBack: () => void;
}

export interface WeChatProfileProps {
  onClose: () => void;
  onEditProfile: () => void;
  onServicesClick: () => void;
}