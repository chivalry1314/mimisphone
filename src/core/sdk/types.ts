import React from 'react';

/**
 * App Manifest - 应用接入协议
 * 任何想要安装到虚拟手机上的应用都必须暴露符合此协议的配置对象
 */
export interface AppManifest {
  /** 应用的唯一标识符 */
  id: string;
  /** 应用显示名称 */
  name: string;
  /** 图标名称 (对应 lucide-react 图标) */
  icon: string;
  /** 图标背景颜色 */
  color?: string;
  /** 应用主入口组件 */
  component: React.ComponentType<AppProps>;
  /** 权限声明 (如果需要调用系统级API) */
  permissions?: SystemPermission[];
  /** 是否为系统应用 (系统应用不在桌面显示) */
  isSystem?: boolean;
  /** 应用版本 */
  version?: string;
  /** 应用描述 */
  description?: string;
  /** 远程模块地址 (用于模块联邦) */
  remoteEntry?: string;
}

/** 应用组件Props */
export interface AppProps {
  onClose: () => void;
  /** 系统传递给应用的上下文数据 */
  context?: AppContext;
}

/** 应用运行时的上下文信息 */
export interface AppContext {
  /** 当前打开的应用ID */
  activeAppId: string | null;
  /** 传递给应用的自定义数据 */
  params?: Record<string, any>;
}

/** 系统权限类型 */
export type SystemPermission =
  | 'battery'
  | 'vibration'
  | 'notification'
  | 'location'
  | 'camera'
  | 'microphone';

/** 电池信息 */
export interface BatteryInfo {
  level: number;
  charging: boolean;
  chargingTime?: number;
  dischargingTime?: number;
}

/** 通知选项 */
export interface NotificationOptions {
  title: string;
  body?: string;
  icon?: string;
  tag?: string;
}

/** 全局设置 */
export interface GlobalSettings {
  apiKey: string;
  baseUrl: string;
  model: string;
  temperature: number;
  maxTokens: number;
  // 壁纸设置
  wallpaper: string | null;
  wallpaperOpacity: number;
  // 自定义图标设置
  customIcons: Record<string, string>;
  // 全局图标样式
  iconSize: number;
  iconRadius: number;
  iconFrosted: number;
  iconShadow: number;
  showAppName: boolean;
}

/** 世界书条目 */
export interface WorldInfoEntry {
  id: string;
  name: string;
  keywords: string[];
  content: string;
  triggerMode: 'keyword' | 'constant' | 'disabled';
  insertionOrder: number;
  scope: 'global' | 'character';
}
