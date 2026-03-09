import { create } from 'zustand';
import type { TemplateState, TemplateItem } from './types';

/**
 * 模板应用状态管理
 *
 * 说明：
 * - 使用 zustand 创建轻量级状态管理
 * - 状态文件建议放在应用根目录
 * - 如需持久化，可集成 indexdb 或 localStorage
 */
interface TemplateStore extends TemplateState {
  // Actions
  addItem: (item: Omit<TemplateItem, 'id'>) => void;
  removeItem: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useTemplateStore = create<TemplateStore>((set) => ({
  // 初始状态
  items: [
    { id: '1', title: '示例项 1', description: '这是一个示例描述' },
    { id: '2', title: '示例项 2', description: '这是另一个示例描述' },
  ],
  isLoading: false,
  error: null,

  // Actions
  addItem: (item) =>
    set((state) => ({
      items: [
        ...state.items,
        { ...item, id: `item-${Date.now()}` },
      ],
    })),

  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    })),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),
}));
