import { useGlobalStore } from '../globalStore';
import type { GlobalSettings, WorldInfoEntry } from './types';

/**
 * 全局状态 Hooks
 * 允许应用访问系统级的全局状态
 */

/** 使用全局设置 */
export const useGlobalSettings = () => {
  const settings = useGlobalStore((state) => state.settings);
  const updateSettings = useGlobalStore((state) => state.updateSettings);
  return { settings, updateSettings };
};

/** 使用世界书数据 */
export const useWorldBook = () => {
  const worldBook = useGlobalStore((state) => state.worldBook);
  const setWorldBook = useGlobalStore((state) => state.setWorldBook);
  const addWorldEntry = useGlobalStore((state) => state.addWorldEntry);
  const updateWorldEntry = useGlobalStore((state) => state.updateWorldEntry);
  const deleteWorldEntry = useGlobalStore((state) => state.deleteWorldEntry);

  return {
    worldBook,
    setWorldBook,
    addWorldEntry,
    updateWorldEntry,
    deleteWorldEntry,
  };
};
