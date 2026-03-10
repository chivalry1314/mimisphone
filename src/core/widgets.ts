import { registerWidgets } from './widgetRegistry';
import type { WidgetConfig } from './globalStore';

/**
 * 内置 Widget 配置
 * 这些是系统预置的 Widget，会在应用启动时自动注册
 */

// 示例：天气 Widget（4x2）- 开发中状态
const weatherWidget: WidgetConfig = {
  id: 'weather-widget',
  name: '天气',
  defaultWidth: 4,
  defaultHeight: 2,
  defaultIcon: '/icons/widgets/weather.svg',
  // component 未设置，表示"开发中"状态
};

// 示例：日历 Widget（2x2）- 开发中状态
const calendarWidget: WidgetConfig = {
  id: 'calendar-widget',
  name: '日历',
  defaultWidth: 2,
  defaultHeight: 2,
  defaultIcon: '/icons/widgets/calendar.svg',
};

// 示例：时钟 Widget（2x1）- 开发中状态
const clockWidget: WidgetConfig = {
  id: 'clock-widget',
  name: '时钟',
  defaultWidth: 2,
  defaultHeight: 1,
  defaultIcon: '/icons/widgets/clock.svg',
};

// 示例：音乐 Widget（2x2）- 开发中状态
const musicWidget: WidgetConfig = {
  id: 'music-widget',
  name: '音乐',
  defaultWidth: 2,
  defaultHeight: 2,
  defaultIcon: '/icons/widgets/music.svg',
};

// 示例：待办事项 Widget（2x3）- 开发中状态
const todoWidget: WidgetConfig = {
  id: 'todo-widget',
  name: '待办',
  defaultWidth: 2,
  defaultHeight: 3,
  defaultIcon: '/icons/widgets/todo.svg',
};

// 示例：健康 Widget（2x2）- 开发中状态
const healthWidget: WidgetConfig = {
  id: 'health-widget',
  name: '健康',
  defaultWidth: 2,
  defaultHeight: 2,
  defaultIcon: '/icons/widgets/health.svg',
};

// 示例：新闻 Widget（4x2）- 开发中状态
const newsWidget: WidgetConfig = {
  id: 'news-widget',
  name: '资讯',
  defaultWidth: 4,
  defaultHeight: 2,
  defaultIcon: '/icons/widgets/news.svg',
};

// 示例：计算器 Widget（1x1）- 开发中状态
const calculatorWidget: WidgetConfig = {
  id: 'calculator-widget',
  name: '计算器',
  defaultWidth: 1,
  defaultHeight: 1,
  defaultIcon: '/icons/widgets/calculator.svg',
};

/**
 * 所有内置 Widget 配置
 */
export const builtInWidgets: WidgetConfig[] = [
  weatherWidget,
  calendarWidget,
  clockWidget,
  musicWidget,
  todoWidget,
  healthWidget,
  newsWidget,
  calculatorWidget,
];

/**
 * 初始化所有内置 Widget
 * 在应用启动时调用
 */
export function initializeBuiltInWidgets(): void {
  registerWidgets(builtInWidgets);
  console.log('[WidgetSystem] 内置 Widget 注册完成', builtInWidgets.map(w => w.id));
}

// 导出各 Widget 配置供外部使用
export {
  weatherWidget,
  calendarWidget,
  clockWidget,
  musicWidget,
  todoWidget,
  healthWidget,
  newsWidget,
  calculatorWidget,
};
