// WidgetEditorView.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ZoomIn,
  ZoomOut,
  X
} from 'lucide-react';

// ==================== 类型定义 ====================

export interface WidgetEditorViewProps {
  widgetId?: string;
}

interface LayerItem {
  id: string;
  type: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

// ==================== 主组件 ====================

export const WidgetEditorView: React.FC<WidgetEditorViewProps> = ({ widgetId }) => {
  // 状态管理
  const [zoom, setZoom] = useState<number>(50);
  const [widgetName, setWidgetName] = useState<string>('新组件');
  const [gridW, setGridW] = useState<number>(2);
  const [gridH, setGridH] = useState<number>(2);
  const [bgColor, setBgColor] = useState<string>('#FFFFFF');
  
  const [layers, setLayers] = useState<LayerItem[]>([
    { id: 'l_1', type: 'image', x: 10, y: 10, w: 50, h: 20 }
  ]);

  // 事件处理
  const handleZoom = (delta: number) => {
    setZoom(prev => Math.min(Math.max(prev + delta, 10), 200));
  };

  const handleRemoveLayer = (id: string) => {
    setLayers(prev => prev.filter(layer => layer.id !== id));
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        className="h-screen flex flex-col bg-slate-50 text-slate-800 font-sans"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        {/* 可滚动的主体区域 */}
        <div className="flex-1 overflow-y-auto">
          
          {/* 2. 预览区域 (模拟手机屏幕) */}
          <section className="relative h-[320px] bg-slate-200/50 flex items-center justify-center overflow-hidden border-b border-slate-200">
            {/* 缩放控制器悬浮窗 */}
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md shadow-lg shadow-slate-200/50 rounded-2xl flex items-center p-1 z-10 border border-slate-100">
              <button onClick={() => handleZoom(-10)} className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors">
                <ZoomOut size={18} />
              </button>
              <span className="w-12 text-center text-xs font-bold text-slate-700">{zoom}%</span>
              <button onClick={() => handleZoom(10)} className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors">
                <ZoomIn size={18} />
              </button>
            </div>

            {/* 手机屏幕 Mockup */}
            <div 
              className="relative bg-slate-100 border-[6px] border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl"
              style={{ width: 220 * (zoom/100), height: 440 * (zoom/100) }}
            >
              {/* 模拟桌面网格 */}
              <div className="absolute inset-0 p-3 grid grid-cols-4 gap-2 content-start opacity-40">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div key={i} className="bg-slate-300 rounded-lg aspect-square" />
                ))}
              </div>
              {/* 正在编辑的组件预览框 */}
              <div className="absolute top-3 left-3 bg-white shadow-sm rounded-xl border border-sky-200 flex items-start justify-start p-2"
                   style={{ width: '48%', height: '22%' }}>
                <div className="border border-dashed border-sky-300 bg-sky-50 w-8 h-4 rounded-sm" />
              </div>
            </div>
          </section>

          {/* 3. 属性配置与图层管理区 */}
          <section className="p-5 space-y-8 pb-12 bg-white">
            
            {/* 组件属性 */}
            <div className="space-y-4">
              <h2 className="text-xs font-bold text-slate-400 tracking-widest pl-1">组件属性</h2>
              
              <div className="space-y-4">
                <input 
                  type="text" 
                  value={widgetName}
                  onChange={(e) => setWidgetName(e.target.value)}
                  className="w-full bg-slate-50 px-4 py-3.5 rounded-2xl border border-transparent focus:border-sky-200 focus:bg-white focus:ring-4 focus:ring-sky-50 outline-none transition-all text-sm font-medium text-slate-700"
                  placeholder="组件名称"
                />
                
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-[11px] font-semibold text-slate-400 ml-1 mb-1 block">Grid W</label>
                    <input type="number" value={gridW} onChange={(e) => setGridW(Number(e.target.value))} className="w-full bg-slate-50 px-4 py-3 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-sky-100 transition-all text-sm text-slate-700" />
                  </div>
                  <div className="flex-1">
                    <label className="text-[11px] font-semibold text-slate-400 ml-1 mb-1 block">Grid H</label>
                    <input type="number" value={gridH} onChange={(e) => setGridH(Number(e.target.value))} className="w-full bg-slate-50 px-4 py-3 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-sky-100 transition-all text-sm text-slate-700" />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 ml-1 mb-1 block">背景颜色</label>
                  <input type="text" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-full bg-slate-50 px-4 py-3 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-sky-100 transition-all text-sm text-slate-700" placeholder="#FFFFFF" />
                </div>
              </div>

              {/* 添加元素按钮组 */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                {['文本', '图片', '时钟', '天气'].map(item => (
                  <button key={item} className="bg-slate-50 hover:bg-slate-100 py-3 rounded-2xl text-sm font-medium text-slate-600 transition-colors border border-transparent hover:border-slate-200">
                    + {item}
                  </button>
                ))}
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* 图层元素 */}
            <div className="space-y-4">
              <h2 className="text-xs font-bold text-slate-400 tracking-widest pl-1">图层元素</h2>
              
              <div className="space-y-3">
                {layers.map(layer => (
                  <div key={layer.id} className="bg-slate-50 rounded-2xl p-4 border border-slate-100 relative group">
                    <div className="flex items-center justify-between mb-3">
                      <span className="bg-white px-2.5 py-1 rounded-md text-[11px] font-bold text-slate-600 shadow-sm border border-slate-100 uppercase tracking-wide">
                        {layer.type}
                      </span>
                      <button 
                        onClick={() => handleRemoveLayer(layer.id)}
                        className="text-slate-300 hover:text-rose-500 transition-colors p-1"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-2">
                      {['x', 'y', 'w', 'h'].map((prop) => (
                        <div key={prop} className="flex items-center bg-white rounded-xl border border-slate-200 overflow-hidden focus-within:ring-2 ring-sky-100 transition-all">
                          <span className="px-2 text-[10px] font-bold text-slate-400 uppercase bg-slate-50 border-r border-slate-100 flex items-center justify-center">{prop}</span>
                          <input 
                            type="number" 
                            defaultValue={layer[prop as keyof LayerItem]} 
                            className="w-full px-2 py-1.5 text-xs text-slate-700 outline-none" 
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </section>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WidgetEditorView;