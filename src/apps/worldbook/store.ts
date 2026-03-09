// WorldBook store - 使用全局 store 中的 worldBook
import { useGlobalStore } from '../../core/globalStore';

export const useWorldBookStore = () => useGlobalStore();
