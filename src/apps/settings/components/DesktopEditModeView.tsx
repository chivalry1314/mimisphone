import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useGlobalStore, DesktopItem } from '../../../core/globalStore';
import { localApps } from '../../../core/registry';
import { getAllWidgets } from '../../../core/widgetRegistry';
import { Plus, LayoutGrid } from 'lucide-react';

// ==================== 类型定义 ====================

export interface DesktopEditModeViewProps {
  rows: number;
  cols: number;
  onSave?: () => void;
}

// 编辑模式类型
type EditMode = 'icon' | 'widget';

// ==================== 动画配置 ====================

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 10 },
  show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

// ==================== 主组件 ====================

/**
 * 桌面编辑模式页面
 * 提供所见即所得的桌面组件与图标的拖拽、排列预览功能
 */
export const DesktopEditModeView: React.FC<DesktopEditModeViewProps> = ({ rows, cols, onSave }) => {
  const { desktopLayout, addDesktopItem, updateDesktopItem, removeDesktopItem } = useGlobalStore();

  // 状态管理
  const [activePage, setActivePage] = useState<number>(0);
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<DesktopItem | null>(null);
  const [editMode, setEditMode] = useState<EditMode>('icon');
  const [showWidgetPicker, setShowWidgetPicker] = useState<boolean>(false);

  // 获取已注册的非系统应用
  const apps = localApps.filter((app: any) => !app.isSystem);

  // 获取所有已注册的 Widget
  const availableWidgets = getAllWidgets();

  // 桌面项目列表 (兼容旧数据)
  const items = desktopLayout.items || [];

  // 当前页的 App (type: 'app')
  const currentPageApps = items.filter(item => item.type === 'app' && item.page === activePage);

  // 当前页的 Widget (type: 'widget')
  const currentPageWidgets = items.filter(item => item.type === 'widget' && item.page === activePage);

  // 追踪是否已经初始化过
  const isInitialized = React.useRef(false);

  // 初始化桌面布局（如果为空）
  useEffect(() => {
    // 如果已经初始化过，不再重复初始化
    if (isInitialized.current) {
      return;
    }

    // 如果没有项目，初始化
    if (items.length === 0 && apps.length > 0) {
      // 默认按顺序排列应用图标
      const newItems: Omit<DesktopItem, 'instanceId'>[] = apps.slice(0, rows * cols).map((app: any, index: number) => ({
        componentId: app.id,
        type: 'app' as const,
        page: Math.floor(index / (rows * cols)),
        x: (index % (rows * cols)) % cols,
        y: Math.floor((index % (rows * cols)) / cols),
        w: 1,
        h: 1,
      }));
      // 逐个添加项目
      newItems.forEach(item => {
        addDesktopItem(item);
      });
    }

    // 确保 settings 应用存在
    if (items.length > 0) {
      const hasSettings = items.some(item => item.componentId === 'settings' && item.type === 'app');
      if (!hasSettings) {
        // 找到第一个空位置添加 settings
        let added = false;
        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            const isOccupied = items.some(item => item.x === col && item.y === row);
            if (!isOccupied) {
              addDesktopItem({
                componentId: 'settings',
                type: 'app',
                page: 0,
                x: col,
                y: row,
                w: 1,
                h: 1,
              });
              added = true;
              break;
            }
          }
          if (added) break;
        }
      }
    }

    // 标记为已初始化
    isInitialized.current = true;
  }, [apps, rows, cols, items, addDesktopItem, updateDesktopItem]);

  // 处理项目位置更新
  const handleUpdateItemPosition = (instanceId: string, x: number, y: number) => {
    updateDesktopItem(instanceId, { page: activePage, x, y });
    setHasChanges(true);
    setSelectedItem(prev => prev ? { ...prev, page: activePage, x, y } : null);
  };

  // 保存布局
  const handleSave = () => {
    setHasChanges(false);
    onSave?.();
  };

  // 添加 Widget 到桌面
  const handleAddWidget = (widgetId: string) => {
    const widgetConfig = availableWidgets.find(w => w.id === widgetId);
    if (!widgetConfig) return;

    // 查找第一个空位置
    let foundPosition = false;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // 检查该位置是否已被占用
        const isOccupied = currentPageApps.some(a => a.x === col && a.y === row) ||
          currentPageWidgets.some(w => w.x === col && w.y === row);
        if (!isOccupied) {
          addDesktopItem({
            componentId: widgetId,
            type: 'widget',
            page: activePage,
            x: col,
            y: row,
            w: widgetConfig.defaultWidth,
            h: widgetConfig.defaultHeight,
          });
          foundPosition = true;
          break;
        }
      }
      if (foundPosition) break;
    }

    if (!foundPosition) {
      // 如果没有空位置，默认添加到第一个位置
      addDesktopItem({
        componentId: widgetId,
        type: 'widget',
        page: activePage,
        x: 0,
        y: 0,
        w: widgetConfig.defaultWidth,
        h: widgetConfig.defaultHeight,
      });
    }

    setShowWidgetPicker(false);
    setHasChanges(true);
  };

  // 系统内置应用 ID，不能被删除
  const SYSTEM_APP_IDS = ['settings'];

  // 删除项目
  const handleRemoveItem = (instanceId: string) => {
    const item = items.find(i => i.instanceId === instanceId);
    // 如果是系统内置应用，不能删除
    if (item && item.type === 'app' && SYSTEM_APP_IDS.includes(item.componentId)) {
      return;
    }
    removeDesktopItem(instanceId);
    setSelectedItem(null);
    setHasChanges(true);
  };

  // 检查是否为系统内置应用
  const isSystemApp = (componentId: string) => SYSTEM_APP_IDS.includes(componentId);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="flex-1 overflow-y-auto bg-slate-50 font-sans"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        {/* 主体区域 (手机预览框) */}
        <div className="flex flex-col items-center pt-4 pb-2 px-4">

          <motion.div
            className="relative w-full max-w-[340px] aspect-[9/19.5] bg-slate-100 rounded-[3rem] border-[6px] border-slate-800 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {/* 刘海屏/灵动岛装饰 */}
            <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-10 pointer-events-none">
              <div className="w-24 h-5 bg-slate-800 rounded-b-2xl" />
            </div>

            {/* 网格内容区 (支持滚动) */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide pt-10 pb-8 px-4">
              <div
                className="grid gap-x-2 gap-y-3"
                style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
              >
                {/* 生成网格 */}
                {Array.from({ length: rows * cols }).map((_, index) => {
                  const row = Math.floor(index / cols);
                  const col = index % cols;

                  // 查找该位置的 App
                  const appItem = currentPageApps.find(a => a.x === col && a.y === row);
                  const app = appItem ? apps.find((a: any) => a.id === appItem.componentId) : null;

                  // 查找该位置的 Widget
                  const widgetItem = currentPageWidgets.find(w =>
                    w.x <= col && col < w.x + w.w && w.y <= row && row < w.y + w.h
                  );

                  return (
                    <motion.div
                      key={`${row}-${col}`}
                      variants={itemVariants}
                      className={`aspect-square rounded-xl border-2 flex items-center justify-center cursor-pointer transition-all ${
                        selectedItem?.instanceId === appItem?.instanceId || selectedItem?.instanceId === widgetItem?.instanceId
                          ? 'border-sky-500 bg-sky-50'
                          : 'border-slate-200 border-dashed hover:border-slate-300'
                      }`}
                      onClick={() => {
                        if (appItem) {
                          setSelectedItem(appItem);
                        } else if (widgetItem) {
                          setSelectedItem(widgetItem);
                        }
                      }}
                    >
                      {app ? (
                        <div className="flex flex-col items-center">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: app.color || '#f1f5f9' }}
                          >
                            <span className="text-sm font-medium">{app.name.charAt(0)}</span>
                          </div>
                          <span className="text-[8px] text-slate-500 mt-1 truncate max-w-full">{app.name}</span>
                        </div>
                      ) : widgetItem ? (
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                            <span className="text-xs font-medium text-amber-600">
                              {availableWidgets.find(w => w.id === widgetItem.componentId)?.name.charAt(0)}
                            </span>
                          </div>
                          <span className="text-[8px] text-slate-500 mt-1 truncate max-w-full">
                            {availableWidgets.find(w => w.id === widgetItem.componentId)?.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-300">{row + 1},{col + 1}</span>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>

        </div>

        {/* 底部控制面板 */}
        <footer className="shrink-0 pb-6 pt-3 px-4 bg-white border-t border-slate-100 z-20">
          {/* 编辑模式切换 */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <button
              onClick={() => setEditMode('icon')}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                editMode === 'icon'
                  ? 'bg-sky-500 text-white'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              <LayoutGrid className="inline w-3 h-3 mr-1" />
              图标
            </button>
            <button
              onClick={() => setEditMode('widget')}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                editMode === 'widget'
                  ? 'bg-sky-500 text-white'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              <LayoutGrid className="inline w-3 h-3 mr-1" />
              小组件
            </button>
          </div>

          {/* 选中项目设置 - 图标模式 */}
          {editMode === 'icon' && selectedItem && selectedItem.type === 'app' ? (
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1">
                <label className="text-[10px] text-slate-400 uppercase tracking-wide">行</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[1-9]*"
                  defaultValue={selectedItem.y + 1}
                  onBlur={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    const num = parseInt(val, 10);
                    if (isNaN(num) || num < 1) return;
                    const row = Math.min(Math.max(num, 1), rows) - 1;
                    handleUpdateItemPosition(selectedItem.instanceId, selectedItem.x, row);
                  }}
                  className="w-full h-9 bg-slate-100 rounded-lg text-center text-sm font-medium text-slate-700"
                />
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-slate-400 uppercase tracking-wide">列</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[1-9]*"
                  defaultValue={selectedItem.x + 1}
                  onBlur={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    const num = parseInt(val, 10);
                    if (isNaN(num) || num < 1) return;
                    const col = Math.min(Math.max(num, 1), cols) - 1;
                    handleUpdateItemPosition(selectedItem.instanceId, col, selectedItem.y);
                  }}
                  className="w-full h-9 bg-slate-100 rounded-lg text-center text-sm font-medium text-slate-700"
                />
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="h-9 px-3 bg-slate-100 text-slate-500 rounded-lg text-xs"
              >
                取消
              </button>
              <button
                onClick={() => handleRemoveItem(selectedItem.instanceId)}
                disabled={selectedItem.type === 'app' && isSystemApp(selectedItem.componentId)}
                className={`h-9 px-3 rounded-lg text-xs ${
                  selectedItem.type === 'app' && isSystemApp(selectedItem.componentId)
                    ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                    : 'bg-red-100 text-red-500'
                }`}
              >
                {selectedItem.type === 'app' && isSystemApp(selectedItem.componentId) ? '不可删除' : '删除'}
              </button>
            </div>
          ) : editMode === 'icon' ? (
            <div className="text-center text-xs text-slate-400 mb-3">点击网格中的图标设置位置</div>
          ) : null}

          {/* 选中项目设置 - Widget 模式 */}
          {editMode === 'widget' && selectedItem && selectedItem.type === 'widget' ? (
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1">
                <label className="text-[10px] text-slate-400 uppercase tracking-wide">行</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[1-9]*"
                  defaultValue={selectedItem.y + 1}
                  onBlur={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    const num = parseInt(val, 10);
                    if (isNaN(num) || num < 1) return;
                    const row = Math.min(Math.max(num, 1), rows) - 1;
                    handleUpdateItemPosition(selectedItem.instanceId, selectedItem.x, row);
                  }}
                  className="w-full h-9 bg-slate-100 rounded-lg text-center text-sm font-medium text-slate-700"
                />
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-slate-400 uppercase tracking-wide">列</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[1-9]*"
                  defaultValue={selectedItem.x + 1}
                  onBlur={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    const num = parseInt(val, 10);
                    if (isNaN(num) || num < 1) return;
                    const col = Math.min(Math.max(num, 1), cols) - 1;
                    handleUpdateItemPosition(selectedItem.instanceId, col, selectedItem.y);
                  }}
                  className="w-full h-9 bg-slate-100 rounded-lg text-center text-sm font-medium text-slate-700"
                />
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="h-9 px-3 bg-slate-100 text-slate-500 rounded-lg text-xs"
              >
                取消
              </button>
              <button
                onClick={() => handleRemoveItem(selectedItem.instanceId)}
                className="h-9 px-3 bg-red-100 text-red-500 rounded-lg text-xs"
              >
                删除
              </button>
            </div>
          ) : editMode === 'widget' && showWidgetPicker ? (
            <div className="mb-3">
              <div className="text-xs text-slate-400 mb-2">选择要添加的小组件：</div>
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                {availableWidgets.map(widget => (
                  <button
                    key={widget.id}
                    onClick={() => handleAddWidget(widget.id)}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg text-xs hover:bg-slate-200 transition-colors"
                  >
                    <div className="w-6 h-6 rounded bg-slate-200 flex items-center justify-center">
                      <span className="text-[10px]">{widget.name.charAt(0)}</span>
                    </div>
                    <span>{widget.name}</span>
                    <span className="text-[10px] text-slate-400">({widget.defaultWidth}x{widget.defaultHeight})</span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowWidgetPicker(false)}
                className="mt-2 w-full py-2 bg-slate-100 text-slate-500 rounded-lg text-xs"
              >
                取消
              </button>
            </div>
          ) : null}

          {/* 页面控制和操作按钮 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActivePage(Math.max(0, activePage - 1))}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500"
              >
                ←
              </button>
              <span className="text-sm text-slate-600">第 {activePage + 1} 页</span>
              <button
                onClick={() => setActivePage(activePage + 1)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500"
              >
                →
              </button>
            </div>

            <div className="flex items-center gap-2">
              {editMode === 'widget' && (
                <button
                  onClick={() => setShowWidgetPicker(true)}
                  className="px-3 py-2 bg-sky-500 text-white rounded-xl text-xs font-medium"
                >
                  <Plus className="inline w-3 h-3 mr-1" />
                  添加
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={!hasChanges}
                className={`px-4 py-2 rounded-xl text-xs font-medium ${
                  hasChanges
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                }`}
              >
                保存
              </button>
            </div>
          </div>
        </footer>
      </motion.div>
    </AnimatePresence>
  );
};

export default DesktopEditModeView;
