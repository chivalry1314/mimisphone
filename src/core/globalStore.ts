import type { ComponentType } from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';
import type { GlobalSettings, WorldInfoEntry } from './sdk/types';

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

// 从 SDK 重新导出类型，保持向后兼容
export type { GlobalSettings, WorldInfoEntry };

// ==================== Widget 系统类型定义 ====================

/**
 * Widget 静态注册配置模型
 * 用于规范开发者如何接入一个新的 Widget
 */
export interface WidgetConfig {
  /** 唯一标识符（如 `weather-widget`） */
  id: string;
  /** 显示名称 */
  name: string;
  /** 默认占据的网格宽度 */
  defaultWidth: number;
  /** 默认占据的网格高度 */
  defaultHeight: number;
  /** 默认占位图资源（URL 或本地静态路径） */
  defaultIcon: string;
  /** 实际渲染的 React 组件。支持 React.lazy 导入。若为空，则系统判定为"开发中"状态 */
  component?: ComponentType<any>;
}

/**
 * 桌面项目类型枚举
 */
export type DesktopItemType = 'app' | 'widget';

/**
 * 桌面实例状态模型
 * Zustand Store 中保存的当前桌面布局数据
 */
export interface DesktopItem {
  /** 桌面上的唯一实例 ID（允许同一个 Widget 在桌面添加多次） */
  instanceId: string;
  /** 关联的 App 或 Widget ID */
  componentId: string;
  /** 类型：应用或 Widget */
  type: DesktopItemType;
  /** 所在的屏幕页码（0, 1, 2...） */
  page: number;
  /** 在当前页的起始 X 坐标 */
  x: number;
  /** 在当前页的起始 Y 坐标 */
  y: number;
  /** 实际占据的宽度格子数 */
  w: number;
  /** 实际占据的高度格子数 */
  h: number;
  /** 预留的持久化配置对象（如天气的城市代码） */
  data?: Record<string, any>;
}

// 桌面布局配置
export interface DesktopLayoutConfig {
  rows: number;      // 每页行数
  cols: number;      // 每页列数
  items: DesktopItem[];  // 桌面项目 (App + Widget)
}

interface GlobalState {
  // 全局设置 - 所有应用共享
  settings: GlobalSettings;
  updateSettings: (settings: Partial<GlobalSettings>) => void;

  // 桌面布局配置
  desktopLayout: DesktopLayoutConfig;
  updateDesktopLayout: (layout: Partial<DesktopLayoutConfig>) => void;

  // 桌面项目（Widget）管理
  addDesktopItem: (item: Omit<DesktopItem, 'instanceId'>) => void;
  updateDesktopItem: (instanceId: string, item: Partial<DesktopItem>) => void;
  removeDesktopItem: (instanceId: string) => void;

  // 世界书 - worldbook 应用管理，其他应用可读
  worldBook: WorldInfoEntry[];
  setWorldBook: (entries: WorldInfoEntry[]) => void;
  addWorldEntry: (entry: Omit<WorldInfoEntry, 'id'>) => void;
  updateWorldEntry: (id: string, entry: Partial<WorldInfoEntry>) => void;
  deleteWorldEntry: (id: string) => void;
}

// 默认桌面布局配置
const defaultDesktopLayout: DesktopLayoutConfig = {
  rows: 6,
  cols: 4,
  items: [],
};

const defaultSettings: GlobalSettings = {
  apiKey: '',
  baseUrl: 'https://api.openai.com/v1',
  model: 'gpt-3.5-turbo',
  temperature: 0.7,
  maxTokens: 2000,
  // 壁纸默认设置
  wallpaper: null,
  wallpaperOpacity: 80,
  // 自定义图标
  customIcons: {},
  // 全局图标样式默认值
  iconSize: 60,
  iconRadius: 18,
  iconFrosted: 10,
  iconShadow: 8,
  showAppName: true,
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
      desktopLayout: defaultDesktopLayout,
      worldBook: [],

      updateSettings: (newSettings) =>
        set((state) => ({ settings: { ...state.settings, ...newSettings } })),

      updateDesktopLayout: (layout) =>
        set((state) => ({ desktopLayout: { ...state.desktopLayout, ...layout } })),

      addDesktopItem: (item) =>
        set((state) => ({
          desktopLayout: {
            ...state.desktopLayout,
            items: [...(state.desktopLayout.items || []), { ...item, instanceId: generateId() }]
          }
        })),

      updateDesktopItem: (instanceId, updatedItem) =>
        set((state) => ({
          desktopLayout: {
            ...state.desktopLayout,
            items: (state.desktopLayout.items || []).map((item) =>
              item.instanceId === instanceId ? { ...item, ...updatedItem } : item
            )
          }
        })),

      removeDesktopItem: (instanceId) =>
        set((state) => ({
          desktopLayout: {
            ...state.desktopLayout,
            items: (state.desktopLayout.items || []).filter((item) => item.instanceId !== instanceId)
          }
        })),

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
