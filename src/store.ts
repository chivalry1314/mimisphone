import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WorldInfoEntry, Settings, ChatSession, Message, WeChatCharacter, WeChatSession, WeChatMoment, WeChatUserProfile, WeChatMessage } from './types';

// 兼容的 UUID 生成函数
const generateId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // 备用方案：生成兼容的 UUID 格式
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

interface AppState {
  settings: Settings;
  worldBook: WorldInfoEntry[];
  sessions: ChatSession[];
  currentSessionId: string | null;

  // WeChat State
  wechatCharacters: WeChatCharacter[];
  wechatSessions: WeChatSession[];
  wechatCurrentSessionId: string | null;
  wechatMoments: WeChatMoment[];
  wechatUserProfile: WeChatUserProfile;

  // Actions
  updateSettings: (settings: Partial<Settings>) => void;
  addWorldEntry: (entry: Omit<WorldInfoEntry, 'id'>) => void;
  updateWorldEntry: (id: string, entry: Partial<WorldInfoEntry>) => void;
  deleteWorldEntry: (id: string) => void;

  createSession: (title: string) => string;
  addMessage: (sessionId: string, message: Omit<Message, 'id' | 'timestamp'>) => void;
  setCurrentSession: (id: string | null) => void;
  deleteSession: (id: string) => void;

  // WeChat Actions
  addWeChatCharacter: (character: Omit<WeChatCharacter, 'id'>) => void;
  updateWeChatCharacter: (id: string, character: Partial<WeChatCharacter>) => void;
  deleteWeChatCharacter: (id: string) => void;
  createWeChatSession: (characterId: string) => string;
  addWeChatMessage: (sessionId: string, message: Omit<WeChatMessage, 'id' | 'timestamp'>) => void;
  setWeChatCurrentSession: (id: string | null) => void;
  addWeChatMoment: (moment: Omit<WeChatMoment, 'id' | 'timestamp' | 'likes' | 'comments'>) => void;
  updateWeChatUserProfile: (profile: Partial<WeChatUserProfile>) => void;
  deleteWeChatMessages: (sessionId: string, messageIds: string[]) => void;
}

const defaultSettings: Settings = {
  apiKey: '',
  baseUrl: 'https://api.openai.com/v1',
  model: 'gpt-3.5-turbo',
  temperature: 0.7,
  maxTokens: 2000,
};

const defaultWeChatUserProfile: WeChatUserProfile = {
  id: 'user-1',
  name: '我',
  avatar: '',
  wechatId: 'wxid_default',
  description: '这个人很懒，什么都没写',
  region: '北京',
  backgroundImage: '',
};

const defaultWeChatCharacters: WeChatCharacter[] = [
  {
    id: 'char-1',
    name: '可爱萌妹',
    avatar: '',
    description: '一个活泼可爱的女孩子',
    greeting: '你好呀！很高兴认识你！',
    personality: '活泼开朗，喜欢结交新朋友',
    background: '',
  },
  {
    id: 'char-2',
    name: '温柔大姐姐',
    avatar: '',
    description: '善解人意的温柔女性',
    greeting: '你好，有什么想聊的吗？',
    personality: '温柔体贴，善于倾听',
    background: '',
  },
];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      worldBook: [],
      sessions: [],
      currentSessionId: null,

      // WeChat State
      wechatCharacters: defaultWeChatCharacters,
      wechatSessions: [],
      wechatCurrentSessionId: null,
      wechatMoments: [],
      wechatUserProfile: defaultWeChatUserProfile,

      updateSettings: (newSettings) =>
        set((state) => ({ settings: { ...state.settings, ...newSettings } })),

      addWorldEntry: (entry) =>
        set((state) => ({
          worldBook: [...state.worldBook, { ...entry, id: generateId() }]
        })),

      updateWorldEntry: (id, updatedEntry) =>
        set((state) => ({
          worldBook: state.worldBook.map((e) => (e.id === id ? { ...e, ...updatedEntry } : e)),
        })),

      deleteWorldEntry: (id) =>
        set((state) => ({
          worldBook: state.worldBook.filter((e) => e.id !== id),
        })),

      createSession: (title) => {
        const id = generateId();
        set((state) => ({
          sessions: [
            { id, title, messages: [], lastUpdated: Date.now() },
            ...state.sessions,
          ],
          currentSessionId: id,
        }));
        return id;
      },

      addMessage: (sessionId, message) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  messages: [
                    ...s.messages,
                    { ...message, id: generateId(), timestamp: Date.now() },
                  ],
                  lastUpdated: Date.now(),
                }
              : s
          ),
        })),

      setCurrentSession: (id) => set({ currentSessionId: id }),

      deleteSession: (id) =>
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== id),
          currentSessionId: state.currentSessionId === id ? null : state.currentSessionId,
        })),

      // WeChat Actions
      addWeChatCharacter: (character) =>
        set((state) => ({
          wechatCharacters: [...state.wechatCharacters, { ...character, id: generateId() }]
        })),

      updateWeChatCharacter: (id, updatedCharacter) =>
        set((state) => ({
          wechatCharacters: state.wechatCharacters.map((c) =>
            c.id === id ? { ...c, ...updatedCharacter } : c
          ),
        })),

      deleteWeChatCharacter: (id) =>
        set((state) => ({
          wechatCharacters: state.wechatCharacters.filter((c) => c.id !== id),
        })),

      createWeChatSession: (characterId) => {
        const existingSession = get().wechatSessions.find(s => s.characterId === characterId);
        if (existingSession) {
          set({ wechatCurrentSessionId: existingSession.id });
          return existingSession.id;
        }

        const id = generateId();
        set((state) => ({
          wechatSessions: [
            { id, characterId, messages: [], lastUpdated: Date.now(), unreadCount: 0 },
            ...state.wechatSessions,
          ],
          wechatCurrentSessionId: id,
        }));
        return id;
      },

      addWeChatMessage: (sessionId, message) =>
        set((state) => ({
          wechatSessions: state.wechatSessions.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  messages: [
                    ...s.messages,
                    { ...message, id: generateId(), timestamp: Date.now() },
                  ],
                  lastUpdated: Date.now(),
                }
              : s
          ),
        })),

      setWeChatCurrentSession: (id) => {
        if (id) {
          set((state) => ({
            wechatCurrentSessionId: id,
            wechatSessions: state.wechatSessions.map((s) =>
              s.id === id ? { ...s, unreadCount: 0 } : s
            ),
          }));
        } else {
          set({ wechatCurrentSessionId: id });
        }
      },

      addWeChatMoment: (moment) =>
        set((state) => ({
          wechatMoments: [
            {
              ...moment,
              id: generateId(),
              timestamp: Date.now(),
              likes: [],
              comments: [],
            },
            ...state.wechatMoments,
          ],
        })),

      updateWeChatUserProfile: (profile) =>
        set((state) => ({
          wechatUserProfile: { ...state.wechatUserProfile, ...profile },
        })),
      deleteWeChatMessages: (sessionId, messageIds) => 
        set((state) => ({
          wechatSessions: state.wechatSessions.map(session =>
            session.id === sessionId
              ? { ...session, messages: session.messages.filter(m => !messageIds.includes(m.id)) }
              : session
          )
        })),
    }),
    {
      name: 'ai-chat-storage',
    }
  )
);
