// WeChat Types
export interface WeChatCharacter {
  id: string;
  name: string;
  avatar: string;
  description: string;
  greeting: string;
  personality: string;
  background: string;
  worldBookId?: string;
}

export interface WeChatMessage {
  id: string;
  role: 'user' | 'character';
  content: string;
  timestamp: number;
  quoteText?: string;
  type?: 'text' | 'transfer' | 'transfer_accepted';
  amount?: number;
}

export interface WeChatSession {
  id: string;
  characterId: string;
  messages: WeChatMessage[];
  lastUpdated: number;
  unreadCount: number;
}

export interface WeChatMoment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  images: string[];
  timestamp: number;
  likes: string[];
  comments: {
    id: string;
    authorName: string;
    content: string;
  }[];
}

export interface WeChatUserProfile {
  id: string;
  name: string;
  avatar: string;
  wechatId: string;
  description: string;
  region: string;
  backgroundImage: string;
  balance?: number;
}

// View Types
export type WeChatTab = 'chat' | 'contacts' | 'discover' | 'profile';

export type WeChatView = 'main' | 'chat' | 'addCharacter' | 'contactProfile' | 'editCharacter' | 'editMyProfile' | 'editMyName' | 'services' | 'wallet' | 'balance' | 'topUp' | 'withdraw';

// Props Types
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
