// Settings store - 重新导出 globalStore 中的 settings
import { useGlobalStore } from '../../core/globalStore';

export const useSettingsStore = () => useGlobalStore();
