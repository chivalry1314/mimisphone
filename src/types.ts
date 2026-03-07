export type WorldEntryTriggerMode = 'keyword' | 'constant' | 'disabled';

export interface WorldInfoEntry {
  id: string;
  name: string;
  keywords: string[];
  content: string;
  triggerMode: WorldEntryTriggerMode;
  insertionOrder: number;
  scope: 'global' | 'character';
}

export interface Settings {
  apiKey: string;
  baseUrl: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  lastUpdated: number;
}

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
}
