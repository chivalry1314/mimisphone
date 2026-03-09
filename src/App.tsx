import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { StatusBar } from './components/StatusBar';
import { HomeDock } from './components/HomeDock';
import { AppIcon } from './components/AppIcon';
import { Widget } from './components/Widget';
import { LockScreen } from './components/LockScreen';
import { WeatherWidget } from './components/WeatherWidget';
import { BatteryWidget } from './components/BatteryWidget';
import { CalendarWidget } from './components/CalendarWidget';
import { desktopApps, getAppComponent } from './core/registry';
import { Search, Flower2 } from 'lucide-react';

export default function App() {
  const [isLocked, setIsLocked] = useState(false);
  const [activeAppId, setActiveAppId] = useState<string | null>(null);

  // 获取当前激活的应用组件
  const ActiveAppComponent = activeAppId ? getAppComponent(activeAppId) : null;

  return (
    <div className="relative w-full h-screen bg-[#8fb6c7] overflow-hidden flex flex-col">
      <AnimatePresence>
        {isLocked && <LockScreen onUnlock={() => setIsLocked(false)} />}
      </AnimatePresence>

      {/* 动态渲染激活的应用 */}
      <AnimatePresence>
        {activeAppId && ActiveAppComponent && (
          <ActiveAppComponent onClose={() => setActiveAppId(null)} />
        )}
      </AnimatePresence>

      {/* Wallpaper - Water Ripple Theme */}
      <div className="absolute inset-0 z-0 bg-[#8fb6c7]">
        <img
          src="https://images.unsplash.com/photo-1500375592092-40eb2168fd21?q=80&w=2000&auto=format&fit=crop"
          alt="Water Wallpaper"
          className="w-full h-full object-cover brightness-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-blue-400/10 backdrop-blur-[1px]" />
      </div>

      {/* Status Bar */}
      <StatusBar dark={!!activeAppId} />

      {/* Main Content Area */}
      <main className="flex-1 z-10 overflow-y-auto pt-4 pb-32 px-6 flex flex-col gap-8">

        {/* Top Weather Widget */}
        <Widget size="medium" title="天气">
          <WeatherWidget />
        </Widget>

        {/* Middle Row Widgets */}
        <div className="flex gap-4">
          <Widget size="small" title="电池">
            <BatteryWidget />
          </Widget>
          <Widget size="small" title="日历">
            <CalendarWidget />
          </Widget>
        </div>

        {/* App Grid - 动态渲染已注册的应用 */}
        <div className="grid grid-cols-4 gap-y-8 mt-2">
          {/* 静态系统占位图标 */}
          <AppIcon name="App Store" icon="AppWindow" label="App Store" />
          <AppIcon name="Tools" isFolder label="工具" />

          {/* 动态渲染已注册的应用图标 */}
          {desktopApps.map(app => (
            <AppIcon
              key={app.id}
              name={app.name}
              icon={app.icon as any}
              color={app.color}
              label={app.name}
              onClick={() => setActiveAppId(app.id)}
            />
          ))}

          {/* 更多静态占位图标 */}
          <AppIcon name="Maps" icon="MapPin" label="地图" />
          <AppIcon name="Clock" isClock label="时钟" />
        </div>

        {/* Search Bar */}
        <div className="flex justify-center mt-2">
          <div className="bg-white/20 backdrop-blur-md h-8 rounded-full flex items-center px-4 gap-2 border border-white/20 shadow-sm">
            <Search size={14} className="text-white/80" />
            <span className="text-white/90 text-[13px] font-medium">搜索</span>
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
