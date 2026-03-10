import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { StatusBar } from './components/StatusBar';
import { HomeDock } from './components/HomeDock';
import { AppIcon } from './components/AppIcon';
import { Widget } from './components/Widget';
import { LockScreen } from './components/LockScreen';
import { desktopApps, getAppComponent } from './core/registry';
import { getWidgetById } from './core/widgetRegistry';
import { Search } from 'lucide-react';
import { useGlobalStore, DesktopItem } from './core/globalStore';
import { WidgetPlaceholder } from './apps/settings/components/WidgetPlaceholder';

// 默认壁纸
const DEFAULT_WALLPAPER = "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?q=80&w=2000&auto=format&fit=crop";

export default function App() {
  const [isLocked, setIsLocked] = useState(false);
  const [activeAppId, setActiveAppId] = useState<string | null>(null);
  const { settings, desktopLayout, updateDesktopItem } = useGlobalStore();

  // 初始化桌面布局
  const { cols = 4, rows = 6, items = [] } = desktopLayout;

  // 追踪上一次行列数的 ref
  const prevGrid = React.useRef({ rows, cols });

  // 监听桌面布局变化，只处理行列数更新时的重排
  useEffect(() => {
    const currentGrid = { rows, cols };
    const gridChanged = prevGrid.current.rows !== currentGrid.rows || prevGrid.current.cols !== currentGrid.cols;

    if (!gridChanged) {
      prevGrid.current = currentGrid;
      return;
    }

    const existingApps = items.filter(item => item.type === 'app');

    if (existingApps.length === 0) {
      prevGrid.current = currentGrid;
      return;
    }

    // 行列数变化了，重新排列所有 app 到新网格（按照索引顺序）
    existingApps.forEach((app: DesktopItem, index: number) => {
      const newX = index % cols;
      const newY = Math.floor(index / cols);
      if (app.x !== newX || app.y !== newY) {
        updateDesktopItem(app.instanceId, { x: newX, y: newY });
      }
    });

    // 更新 ref
    prevGrid.current = currentGrid;
  }, [rows, cols, items, updateDesktopItem]);

  // 获取当前激活的应用组件
  const ActiveAppComponent = activeAppId ? getAppComponent(activeAppId) : null;

  // 壁纸 URL：优先使用用户设置的壁纸，否则使用默认壁纸
  const wallpaperUrl = settings.wallpaper || DEFAULT_WALLPAPER;

  // 当前页的桌面项目
  const currentPageItems = items.filter(item => item.page === 0);

  // 分离 App 和 Widget
  const appItems = currentPageItems.filter(item => item.type === 'app');
  const widgetItems = currentPageItems.filter(item => item.type === 'widget');

  // 创建位置映射，用于按 x,y 坐标定位项目
  const appPositionMap = new Map<string, typeof appItems[0]>();
  appItems.forEach(item => {
    appPositionMap.set(`${item.x},${item.y}`, item);
  });

  const widgetPositionMap = new Map<string, typeof widgetItems[0]>();
  widgetItems.forEach(item => {
    widgetPositionMap.set(`${item.x},${item.y}`, item);
  });

  // 检查某个位置是否被 widget 占据（用于判断 widget 占用范围）
  const isOccupiedByWidget = (x: number, y: number) => {
    return widgetItems.some(w => x >= w.x && x < w.x + w.w && y >= w.y && y < w.y + w.h);
  };

  return (
    <div className="relative w-full h-screen bg-white overflow-hidden flex flex-col">
      <AnimatePresence>
        {isLocked && <LockScreen onUnlock={() => setIsLocked(false)} />}
      </AnimatePresence>

      {/* 动态渲染激活的应用 */}
      <AnimatePresence>
        {activeAppId && ActiveAppComponent && (
          <ActiveAppComponent onClose={() => setActiveAppId(null)} />
        )}
      </AnimatePresence>

      {/* 壁纸 */}
      <div className="absolute inset-0 z-0 bg-white">
        <img
          src={wallpaperUrl}
          alt="Wallpaper"
          className="w-full h-full object-cover"
          style={{ opacity: (settings.wallpaperOpacity || 80) / 100 }}
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-blue-400/10 backdrop-blur-[1px]" />
      </div>

      {/* Status Bar */}
      <StatusBar dark={true} />

      {/* Main Content Area */}
      <main className="flex-1 z-10 overflow-y-auto pt-4 pb-32 px-6">
        {/* 统一桌面网格 - Widget 和 App 在同一个 grid 中渲染 */}
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridAutoRows: 'minmax(60px, auto)' }}>
          {/* 遍历所有可能的网格位置 */}
          {(() => {
            const cells = [];
            for (let row = 0; row < rows; row++) {
              for (let col = 0; col < cols; col++) {
                const key = `${col},${row}`;
                const widgetItem = widgetPositionMap.get(key);
                const appItem = appPositionMap.get(key);

                // 检查是否是 widget 的起始位置
                const isWidgetStart = widgetItem && widgetItem.x === col && widgetItem.y === row;
                // 检查是否是 widget 内部的某个位置（非起始位置）
                const isInsideWidget = widgetItem && !isWidgetStart && isOccupiedByWidget(col, row);

                if (isWidgetStart && widgetItem) {
                  // 渲染 Widget - 使用明确的 grid 位置
                  const widgetConfig = getWidgetById(widgetItem.componentId);
                  const w = widgetItem.w || widgetConfig?.defaultWidth || 2;
                  const h = widgetItem.h || widgetConfig?.defaultHeight || 2;
                  const gridColumnStart = widgetItem.x + 1;
                  const gridColumnEnd = gridColumnStart + w;
                  const gridRowStart = widgetItem.y + 1;
                  const gridRowEnd = gridRowStart + h;

                  cells.push(
                    <div
                      key={widgetItem.instanceId}
                      style={{
                        gridColumn: `${gridColumnStart} / ${gridColumnEnd}`,
                        gridRow: `${gridRowStart} / ${gridRowEnd}`,
                      }}
                      className="rounded-2xl overflow-hidden"
                    >
                      {widgetConfig?.component ? (
                        <Widget
                          size={widgetItem.w && widgetItem.h ? `${widgetItem.w}x${widgetItem.h}` as any : 'medium'}
                          title={widgetConfig.name}
                        >
                          {React.createElement(widgetConfig.component, { ...widgetItem.data })}
                        </Widget>
                      ) : (
                        <WidgetPlaceholder
                          name={widgetConfig?.name || 'Widget'}
                          defaultIcon={widgetConfig?.defaultIcon || ''}
                          width={w}
                          height={h}
                        />
                      )}
                    </div>
                  );
                } else if (isInsideWidget) {
                  // Widget 内部位置，不渲染
                  continue;
                } else if (appItem) {
                  // 渲染 App 图标 - 设置 grid 位置
                  const app = desktopApps.find(a => a.id === appItem.componentId);
                  if (app) {
                    const customIcon = settings.customIcons?.[app.id];
                    // 计算 App 的 grid 位置
                    const gridColumnStart = appItem.x + 1;
                    const gridRowStart = appItem.y + 1;
                    cells.push(
                      <div
                        key={appItem.instanceId}
                        style={{
                          gridColumn: `${gridColumnStart}`,
                          gridRow: `${gridRowStart}`,
                        }}
                      >
                        <AppIcon
                          icon={app.icon as any}
                          label={settings.showAppName ? app.name : undefined}
                          customIcon={customIcon ? <img src={customIcon} alt={app.name} className="w-full h-full object-cover" /> : undefined}
                          onClick={() => setActiveAppId(app.id)}
                          size={settings.iconSize}
                          radius={settings.iconRadius}
                          frosted={settings.iconFrosted}
                          shadow={settings.iconShadow}
                        />
                      </div>
                    );
                  }
                }
                // 空白位置不渲染任何内容
              }
            }
            return cells;
          })()}
        </div>

        {/* Search Bar */}
        <div className="flex justify-center mt-2">
          <div className="bg-black/10 backdrop-blur-md h-8 rounded-full flex items-center px-4 gap-2 border border-black/10 shadow-sm">
            <Search size={14} className="text-black/80" />
            <span className="text-black/90 text-[13px] font-medium">搜索</span>
          </div>
        </div>

      </main>

      {/* Home Dock - Only show when no app is active */}
      {!activeAppId && <HomeDock />}

      {/* Home Indicator - Only show when no app is active */}
      {!activeAppId && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-white/30 rounded-full z-50" />
      )}
    </div>
  );
}
