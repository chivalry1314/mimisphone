// WidgetManageView.tsx
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Share,
  Sun,
  CalendarRange
} from 'lucide-react';

// ==================== 类型定义 ====================

export interface WidgetManageViewProps {
  onNavigateToEditor: (widgetId?: string) => void;
}

interface WidgetItem {
  id: string;
  name: string;
  type: string;
  size: string;
  isPro?: boolean;
  previewIcon: React.ReactNode;
  previewTitle: string;
  previewValue: string;
}

// ==================== 模拟数据 ====================

const MOCK_WIDGETS: WidgetItem[] = [
  {
    id: 'w_001',
    name: '天气 (Weather)',
    type: 'WEATHER',
    size: '2x2',
    previewIcon: <Sun size={28} className="text-amber-500" />,
    previewTitle: 'Sunny',
    previewValue: '72°'
  },
  {
    id: 'w_002',
    name: '日程 (Schedule)',
    type: 'SCHEDULE',
    size: '2x2',
    isPro: true,
    previewIcon: <CalendarRange size={28} className="text-indigo-500" />,
    previewTitle: 'Review',
    previewValue: ''
  }
];

// ==================== 动画配置 ====================

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

// ==================== 主组件 ====================

export const WidgetManageView: React.FC<WidgetManageViewProps> = ({ onNavigateToEditor }) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div 
        className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-12"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        {/* 内容网格 */}
        <motion.main 
          className="p-5 grid grid-cols-2 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* 已有组件卡片 */}
          {MOCK_WIDGETS.map((widget) => (
            <motion.div 
              key={widget.id} 
              variants={itemVariants}
              className="bg-white rounded-[1.5rem] p-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col group cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onNavigateToEditor(widget.id)}
            >
              {/* 组件预览区 */}
              <div className="bg-slate-50 rounded-2xl p-4 h-32 flex flex-col justify-between relative mb-4">
                {widget.isPro && (
                  <span className="absolute top-3 right-3 bg-slate-800 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">PRO</span>
                )}
                <div className="flex justify-between items-start">
                  {widget.previewIcon}
                  {widget.previewValue && <span className="text-sm font-semibold text-slate-400">{widget.previewValue}</span>}
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-1">{widget.type}</p>
                  <p className="text-lg font-bold text-slate-800">{widget.previewTitle}</p>
                </div>
              </div>

              {/* 卡片信息与操作 */}
              <div className="flex items-end justify-between mt-auto">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-700 truncate w-20">{widget.name}</span>
                  <span className="text-xs text-slate-400">{widget.size}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-50 transition-colors">
                    <Plus size={18} />
                  </button>
                  <button className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 transition-colors">
                    <Share size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {/* 新建组件入口 */}
          <motion.div 
            variants={itemVariants}
            onClick={() => onNavigateToEditor()}
            className="rounded-[1.5rem] border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100/50 transition-colors flex flex-col items-center justify-center min-h-[200px] cursor-pointer text-slate-400 hover:text-sky-500"
          >
            <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-3">
              <Plus size={24} />
            </div>
            <span className="text-sm font-medium">新建组件</span>
          </motion.div>
        </motion.main>
      </motion.div>
    </AnimatePresence>
  );
};

export default WidgetManageView;