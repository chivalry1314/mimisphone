import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';

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

// 全局设置类型
export interface GlobalSettings {
  apiKey: string;
  baseUrl: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

// 世界书条目类型
export interface WorldInfoEntry {
  id: string;
  name: string;
  keywords: string[];
  content: string;
  triggerMode: 'keyword' | 'constant' | 'disabled';
  insertionOrder: number;
  scope: 'global' | 'character';
}

interface GlobalState {
  // 全局设置 - 所有应用共享
  settings: GlobalSettings;
  updateSettings: (settings: Partial<GlobalSettings>) => void;

  // 世界书 - worldbook 应用管理，其他应用可读
  worldBook: WorldInfoEntry[];
  setWorldBook: (entries: WorldInfoEntry[]) => void;
  addWorldEntry: (entry: Omit<WorldInfoEntry, 'id'>) => void;
  updateWorldEntry: (id: string, entry: Partial<WorldInfoEntry>) => void;
  deleteWorldEntry: (id: string) => void;
}

const defaultSettings: GlobalSettings = {
  apiKey: '',
  baseUrl: 'https://api.openai.com/v1',
  model: 'gpt-3.5-turbo',
  temperature: 0.7,
  maxTokens: 2000,
};

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

export const useGlobalStore = create<GlobalState>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      worldBook: [],

      updateSettings: (newSettings) =>
        set((state) => ({ settings: { ...state.settings, ...newSettings } })),

      setWorldBook: (entries) => set({ worldBook: entries }),

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
    }),
    {
      name: 'global-storage',
      storage: createJSONStorage(() => idbStorage),
    }
  )
);
