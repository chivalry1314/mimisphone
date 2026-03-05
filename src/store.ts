import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WorldInfoEntry, Settings, ChatSession, Message } from './types';

interface AppState {
  settings: Settings;
  worldBook: WorldInfoEntry[];
  sessions: ChatSession[];
  currentSessionId: string | null;
  
  // Actions
  updateSettings: (settings: Partial<Settings>) => void;
  addWorldEntry: (entry: Omit<WorldInfoEntry, 'id'>) => void;
  updateWorldEntry: (id: string, entry: Partial<WorldInfoEntry>) => void;
  deleteWorldEntry: (id: string) => void;
  
  createSession: (title: string) => string;
  addMessage: (sessionId: string, message: Omit<Message, 'id' | 'timestamp'>) => void;
  setCurrentSession: (id: string | null) => void;
  deleteSession: (id: string) => void;
}

const defaultSettings: Settings = {
  apiKey: '',
  baseUrl: 'https://api.openai.com/v1',
  model: 'gpt-3.5-turbo',
  temperature: 0.7,
  maxTokens: 2000,
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      worldBook: [],
      sessions: [],
      currentSessionId: null,

      updateSettings: (newSettings) => 
        set((state) => ({ settings: { ...state.settings, ...newSettings } })),

      addWorldEntry: (entry) => 
        set((state) => ({ 
          worldBook: [...state.worldBook, { ...entry, id: crypto.randomUUID() }] 
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
        const id = crypto.randomUUID();
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
                    { ...message, id: crypto.randomUUID(), timestamp: Date.now() },
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
    }),
    {
      name: 'ai-chat-storage',
    }
  )
);
