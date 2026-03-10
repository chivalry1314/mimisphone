import React, { type ComponentType } from 'react';
import type { WidgetConfig } from './globalStore';

/**
 * Widget 注册中心
 * 全局单例，用于管理所有 Widget 的静态配置
 */

// 私有注册表
const widgetRegistry: Map<string, WidgetConfig> = new Map();

/**
 * 注册一个 Widget
 * @param config Widget 配置
 */
export function registerWidget(config: WidgetConfig): void {
  if (widgetRegistry.has(config.id)) {
    console.warn(`[WidgetRegistry] Widget "${config.id}" is already registered. Overwriting...`);
  }
  widgetRegistry.set(config.id, config);
}

/**
 * 批量注册多个 Widget
 * @param configs Widget 配置数组
 */
export function registerWidgets(configs: WidgetConfig[]): void {
  configs.forEach(config => registerWidget(config));
}

/**
 * 获取所有已注册的 Widget 配置
 */
export function getAllWidgets(): WidgetConfig[] {
  return Array.from(widgetRegistry.values());
}

/**
 * 根据 ID 获取 Widget 配置
 * @param id Widget ID
 */
export function getWidgetById(id: string): WidgetConfig | undefined {
  return widgetRegistry.get(id);
}

/**
 * 检查 Widget 是否已注册
 * @param id Widget ID
 */
export function isWidgetRegistered(id: string): boolean {
  return widgetRegistry.has(id);
}

/**
 * 移除已注册的 Widget
 * @param id Widget ID
 */
export function unregisterWidget(id: string): boolean {
  return widgetRegistry.delete(id);
}

/**
 * 清空所有 Widget 注册
 */
export function clearWidgetRegistry(): void {
  widgetRegistry.clear();
}

/**
 * 创建懒加载组件的辅助函数
 * 用于在注册表中配置异步加载的 Widget
 */
export function createLazyWidget<P = any>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  config: Omit<WidgetConfig, 'component'>
): WidgetConfig {
  return {
    ...config,
    component: () => (
      <React.Suspense fallback={<div className="w-full h-full animate-pulse bg-slate-200 rounded-lg" />}>
        <LazyWidgetWrapper importFn={importFn} />
      </React.Suspense>
    ) as ComponentType<P>,
  };
}

// 懒加载包装器组件
interface LazyWidgetWrapperProps {
  importFn: () => Promise<{ default: ComponentType<any> }>;
}

const LazyWidgetWrapper: React.FC<LazyWidgetWrapperProps> = ({ importFn }) => {
  const [LazyComponent, setLazyComponent] = React.useState<ComponentType<any> | null>(null);

  React.useEffect(() => {
    importFn().then(module => {
      setLazyComponent(() => module.default);
    });
  }, [importFn]);

  if (!LazyComponent) {
    return <div className="w-full h-full animate-pulse bg-slate-200 rounded-lg" />;
  }

  return <LazyComponent />;
};

// 导出注册表实例（用于调试）
export { widgetRegistry };
