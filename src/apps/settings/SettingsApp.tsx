import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Globe, Cpu, Key, Shield, Info, Bell, Moon, RefreshCw, Eye, EyeOff, Sparkles } from 'lucide-react';
import { useSettingsStore } from './store';
import { useGlobalStore } from '../../core/globalStore';
import { BeautifyView, ThemeManageView, IconManageView, WidgetManageView, WidgetEditorView, DesktopLayoutView, DesktopEditModeView } from './components';

type ViewType = 'main' | 'api' | 'beautify' | 'themeManage' | 'iconManage' | 'widgetManage' | 'widgetEditor' | 'layout' | 'editMode';

interface SettingsAppProps {
  onClose: () => void;
}

export const SettingsApp: React.FC<SettingsAppProps> = ({ onClose }) => {
  const { settings, updateSettings } = useSettingsStore();
  const { desktopLayout } = useGlobalStore();
  const [currentView, setCurrentView] = useState<ViewType>('main');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  const fetchModels = async () => {
    if (!settings.baseUrl || !settings.apiKey) return;
    setIsLoadingModels(true);
    try {
      const response = await fetch(`${settings.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${settings.apiKey}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (data && Array.isArray(data.data)) {
          const models = data.data.map((m: any) => m.id).sort();
          setAvailableModels(models);
        }
      }
    } catch (error) {
      console.error('Failed to fetch models:', error);
    } finally {
      setIsLoadingModels(false);
    }
  };

  useEffect(() => {
    if (currentView === 'api' && settings.baseUrl && settings.apiKey) {
      fetchModels();
    }
  }, [currentView, settings.baseUrl, settings.apiKey]);

  const renderMainView = () => (
    <div className="flex-1 overflow-y-auto pb-20">
      <div className="px-4 pt-4 pb-2">
        <h2 className="text-[13px] text-gray-500 uppercase tracking-wider px-4 mb-2">通用</h2>
        <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
          <button
            onClick={() => setCurrentView('api')}
            className="w-full flex items-center px-4 py-3 gap-3 hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-100"
          >
            <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center text-white">
              <Key size={18} />
            </div>
            <span className="flex-1 text-left text-[16px]">API 设置</span>
            <ChevronRight size={20} className="text-gray-300" />
          </button>

          <button
            onClick={() => setCurrentView('beautify')}
            className="w-full flex items-center px-4 py-3 gap-3 hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-100"
          >
            <div className="w-7 h-7 bg-gradient-to-br from-pink-400 to-purple-500 rounded-lg flex items-center justify-center text-white">
              <Sparkles size={18} />
            </div>
            <span className="flex-1 text-left text-[16px]">UI 美化</span>
            <ChevronRight size={20} className="text-gray-300" />
          </button>

          <div className="w-full flex items-center px-4 py-3 gap-3 opacity-50 cursor-not-allowed border-b border-gray-100">
            <div className="w-7 h-7 bg-gray-500 rounded-lg flex items-center justify-center text-white">
              <Bell size={18} />
            </div>
            <span className="flex-1 text-left text-[16px]">通知</span>
            <ChevronRight size={20} className="text-gray-300" />
          </div> 

          <div className="w-full flex items-center px-4 py-3 gap-3 opacity-50 cursor-not-allowed">
            <div className="w-7 h-7 bg-indigo-500 rounded-lg flex items-center justify-center text-white">
              <Moon size={18} />
            </div>
            <span className="flex-1 text-left text-[16px]">外观与深色模式</span>
            <ChevronRight size={20} className="text-gray-300" />
          </div>
        </div>
      </div>

      <div className="px-4 py-2">
        <h2 className="text-[13px] text-gray-500 uppercase tracking-wider px-4 mb-2">隐私与安全</h2>
        <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
          <div className="w-full flex items-center px-4 py-3 gap-3 opacity-50 cursor-not-allowed border-b border-gray-100">
            <div className="w-7 h-7 bg-green-500 rounded-lg flex items-center justify-center text-white">
              <Shield size={18} />
            </div>
            <span className="flex-1 text-left text-[16px]">隐私</span>
            <ChevronRight size={20} className="text-gray-300" />
          </div>
          <div className="w-full flex items-center px-4 py-3 gap-3 opacity-50 cursor-not-allowed">
            <div className="w-7 h-7 bg-blue-400 rounded-lg flex items-center justify-center text-white">
              <Info size={18} />
            </div>
            <span className="flex-1 text-left text-[16px]">关于</span>
            <ChevronRight size={20} className="text-gray-300" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderApiView = () => (
    <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-20">
      <section className="space-y-2">
        <h2 className="px-4 text-[13px] text-gray-500 uppercase tracking-wider">API 配置</h2>
        <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
          <div className="flex items-center px-4 py-3 gap-3 border-b border-gray-100">
            <Globe size={20} className="text-blue-500" />
            <div className="flex-1">
              <p className="text-[15px]">API 地址</p>
              <input
                type="text"
                value={settings.baseUrl}
                onChange={(e) => updateSettings({ baseUrl: e.target.value })}
                className="w-full text-[14px] text-gray-700 bg-transparent outline-none mt-1 placeholder:text-gray-400"
                placeholder="https://api.openai.com/v1"
              />
            </div>
          </div>
          <div className="flex items-center px-4 py-3 gap-3 border-b border-gray-100">
            <Key size={20} className="text-orange-500" />
            <div className="flex-1">
              <p className="text-[15px]">API 密钥</p>
              <div className="flex items-center gap-2">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={settings.apiKey}
                  onChange={(e) => updateSettings({ apiKey: e.target.value })}
                  className="flex-1 text-[14px] text-gray-700 bg-transparent outline-none mt-1 placeholder:text-gray-400"
                  placeholder="sk-..."
                />
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>
          <div className="flex items-center px-4 py-3 gap-3">
            <Cpu size={20} className="text-purple-500" />
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <p className="text-[15px]">模型名称</p>
                {isLoadingModels && <RefreshCw size={14} className="text-blue-500 animate-spin" />}
              </div>
              <div className="relative mt-1">
                {availableModels.length > 0 ? (
                  <select
                    value={settings.model}
                    onChange={(e) => updateSettings({ model: e.target.value })}
                    className="w-full text-[14px] text-gray-700 bg-transparent outline-none appearance-none cursor-pointer"
                  >
                    {!availableModels.includes(settings.model) && (
                      <option value={settings.model}>{settings.model} (当前)</option>
                    )}
                    {availableModels.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={settings.model}
                    onChange={(e) => updateSettings({ model: e.target.value })}
                    className="w-full text-[14px] text-gray-700 bg-transparent outline-none placeholder:text-gray-400"
                    placeholder="请输入或等待加载..."
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="px-4 text-[13px] text-gray-500 uppercase tracking-wider">生成设置</h2>
        <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
          <div className="px-4 py-3 space-y-2 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <p className="text-[15px]">Temperature (温度)</p>
              <span className="text-[14px] text-blue-500 font-medium">{settings.temperature}</span>
            </div>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={settings.temperature}
              onChange={(e) => updateSettings({ temperature: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
          <div className="px-4 py-3 space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-[15px]">Max Tokens (最大长度)</p>
              <span className="text-[14px] text-blue-500 font-medium">{settings.maxTokens}</span>
            </div>
            <input
              type="range"
              min="100"
              max="8000"
              step="100"
              value={settings.maxTokens}
              onChange={(e) => updateSettings({ maxTokens: parseInt(e.target.value) })}
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        </div>
      </section>
    </div>
  );

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute inset-0 z-50 bg-[#F2F2F7] flex flex-col text-gray-900"
    >
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 pt-12 pb-4 flex items-center justify-between">
        <button
          onClick={() => {
            if (currentView === 'main') {
              onClose();
            } else if (currentView === 'widgetEditor') {
              setCurrentView('widgetManage');
            } else if (currentView === 'editMode') {
              setCurrentView('layout');
            } else if (currentView === 'layout') {
              setCurrentView('beautify');
            } else if (currentView === 'themeManage' || currentView === 'iconManage' || currentView === 'widgetManage') {
              setCurrentView('beautify');
            } else {
              setCurrentView('main');
            }
          }}
          className="flex items-center text-[#007AFF] gap-1"
        >
          <ChevronLeft size={24} />
          <span className="text-[17px]">{currentView === 'main' ? '返回' : currentView === 'api' ? '设置' : currentView === 'beautify' ? '设置' : '美化'}</span>
        </button>
        <h1 className="text-[17px] font-semibold absolute left-1/2 -translate-x-1/2">
          {currentView === 'main' ? '设置' : currentView === 'api' ? 'API 设置' : currentView === 'beautify' ? 'UI 美化' : currentView === 'themeManage' ? '主题' : currentView === 'widgetManage' ? '组件管理' : currentView === 'widgetEditor' ? '编辑组件' : currentView === 'layout' ? '布局' : currentView === 'editMode' ? '编辑模式' : '图标'}
        </h1>
        <div className="w-10" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentView}
          initial={{ x: currentView === 'main' ? -20 : 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: currentView === 'main' ? 20 : -20, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="flex-1 flex flex-col overflow-hidden"
        >
          {currentView === 'main' ? renderMainView() : currentView === 'api' ? renderApiView() : currentView === 'beautify' ? <BeautifyView onNavigateToThemeManage={() => setCurrentView('themeManage')} onNavigateToIconManage={() => setCurrentView('iconManage')} onNavigateToWidgetManage={() => setCurrentView('widgetManage')} onNavigateToLayout={() => setCurrentView('layout')} /> : currentView === 'themeManage' ? <ThemeManageView onBack={() => setCurrentView('beautify')} /> : currentView === 'widgetManage' ? <WidgetManageView onNavigateToEditor={() => setCurrentView('widgetEditor')} /> : currentView === 'widgetEditor' ? <WidgetEditorView /> : currentView === 'layout' ? <DesktopLayoutView onEditLayout={() => setCurrentView('editMode')} /> : currentView === 'editMode' ? <DesktopEditModeView rows={desktopLayout.rows || 6} cols={desktopLayout.cols || 4} onSave={() => setCurrentView('layout')} /> : <IconManageView />}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export type { SettingsAppProps };
