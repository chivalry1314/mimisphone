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
import { Search, Mic, Clock, Flower2 } from 'lucide-react';

export default function App() {
  const [isLocked, setIsLocked] = useState(false);

  return (
    <div className="relative w-full h-screen bg-[#8fb6c7] overflow-hidden flex flex-col">
      <AnimatePresence>
        {isLocked && <LockScreen onUnlock={() => setIsLocked(false)} />}
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
        
        {/* Floating Flowers - Using Lucide Icons instead of images for reliability */}
        <div className="absolute top-20 left-20 opacity-60 animate-float">
          <Flower2 size={40} className="text-white" />
        </div>
        <div className="absolute top-1/2 right-10 opacity-40 animate-float" style={{ animationDelay: '1s' }}>
          <Flower2 size={32} className="text-white" />
        </div>
        <div className="absolute bottom-60 left-1/4 opacity-50 animate-float" style={{ animationDelay: '2s' }}>
          <Flower2 size={48} className="text-white" />
        </div>
      </div>

      {/* Status Bar */}
      <StatusBar />

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

        {/* App Grid */}
        <div className="grid grid-cols-4 gap-y-8 mt-2">
          <AppIcon name="App Store" icon="AppWindow" label="App Store" />
          <AppIcon name="Weather" icon="Cloud" label="天气" />
          <AppIcon name="Tools" isFolder label="工具" />
          <AppIcon name="Notes" icon="StickyNote" label="备忘录" />
          
          <AppIcon name="Maps" icon="MapPin" label="地图" />
          <AppIcon name="Settings" icon="Settings" label="设置" />
          <AppIcon name="Photos" icon="Image" label="照片" />
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

      {/* Home Dock */}
      <HomeDock />

      {/* Home Indicator */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-white/30 rounded-full z-50" />
    </div>
  );
}
