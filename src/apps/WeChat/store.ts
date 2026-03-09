import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';
import { WeChatCharacter, WeChatSession, WeChatMoment, WeChatUserProfile, WeChatMessage } from './components/types';

// 兼容的 UUID 生成函数
const generateId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// 定义基于 IndexedDB 的存储引擎
const idbStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await get(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name);
  },
};

interface WeChatState {
  // 状态 - 使用与组件一致的命名
  wechatCharacters: WeChatCharacter[];
  wechatSessions: WeChatSession[];
  wechatCurrentSessionId: string | null;
  wechatMoments: WeChatMoment[];
  wechatUserProfile: WeChatUserProfile;

  // Actions - 使用与组件一致的命名
  addWeChatCharacter: (character: Omit<WeChatCharacter, 'id'>) => void;
  updateWeChatCharacter: (id: string, character: Partial<WeChatCharacter>) => void;
  deleteWeChatCharacter: (id: string) => void;
  createWeChatSession: (characterId: string) => string;
  addWeChatMessage: (sessionId: string, message: Omit<WeChatMessage, 'id' | 'timestamp'>) => void;
  setWeChatCurrentSession: (id: string | null) => void;
  addWeChatMoment: (moment: Omit<WeChatMoment, 'id' | 'timestamp' | 'likes' | 'comments'>) => void;
  updateWeChatUserProfile: (profile: Partial<WeChatUserProfile>) => void;
  deleteWeChatMessages: (sessionId: string, messageIds: string[]) => void;
  topUpWeChatBalance: (amount: number) => void;
  withdrawWeChatBalance: (amount: number) => void;
}

const defaultUserProfile: WeChatUserProfile = {
  id: 'user-1',
  name: '我',
  avatar: '',
  wechatId: 'wxid_default',
  description: '这个人很懒，什么都没写',
  region: '北京',
  backgroundImage: '',
  balance: 0,
};

const defaultCharacters: WeChatCharacter[] = [
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

export const useWeChatStore = create<WeChatState>()(
  persist(
    (set, get) => ({
      wechatCharacters: defaultCharacters,
      wechatSessions: [],
      wechatCurrentSessionId: null,
      wechatMoments: [],
      wechatUserProfile: defaultUserProfile,

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

      topUpWeChatBalance: (amount) =>
        set((state) => ({
          wechatUserProfile: {
            ...state.wechatUserProfile,
            balance: (state.wechatUserProfile.balance || 0) + amount
          }
        })),

      withdrawWeChatBalance: (amount) =>
        set((state) => ({
          wechatUserProfile: {
            ...state.wechatUserProfile,
            balance: Math.max(0, (state.wechatUserProfile.balance || 0) - amount)
          }
        })),
    }),
    {
      name: 'wechat-storage',
      storage: createJSONStorage(() => idbStorage),
    }
  )
);
