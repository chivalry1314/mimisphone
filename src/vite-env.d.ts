/**
 * Vite 路径别名类型声明
 */
/// <reference types="vite/client" />

declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

// 定义 @mimisOS/sdk 路径别名
declare module '@mimisOS/sdk' {
  import type { AppManifest, AppContext, AppProps, SystemPermission, BatteryInfo, NotificationOptions, GlobalSettings, WorldInfoEntry } from '../core/sdk/types';

  export {
    SystemAPI,
    systemApi,
    useGlobalSettings,
    useWorldBook,
    AppManifest,
    AppContext,
    AppProps,
    SystemPermission,
    BatteryInfo,
    NotificationOptions,
    GlobalSettings,
    WorldInfoEntry,
  };

  // 重新导出类型
  export type {
    AppManifest,
    AppContext,
    AppProps,
    SystemPermission,
    BatteryInfo,
    NotificationOptions,
    GlobalSettings,
    WorldInfoEntry,
  };
}
