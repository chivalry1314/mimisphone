import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Star, Code, Layers } from 'lucide-react';
import styles from './TemplateApp.module.css';

interface TemplateAppProps {
  onClose: () => void;
}

export const TemplateApp: React.FC<TemplateAppProps> = ({ onClose }) => {
  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      // 温柔的奶油蜜桃色渐变背景
      className="absolute inset-0 z-50 bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 flex flex-col font-sans text-slate-700"
    >
      {/* Header */}
      <div className="px-2 pt-12 pb-4 flex items-center bg-white/40 backdrop-blur-md border-b border-white/60 shadow-sm z-10">
        <button
          onClick={onClose}
          className="text-slate-500 flex items-center gap-1 active:scale-95 p-2 transition-transform"
        >
          <ChevronLeft size={28} />
          <span className="text-[17px] font-medium">返回</span>
        </button>
        <h1 className="flex-1 text-center text-[17px] font-semibold text-slate-700 tracking-wide pr-10">
          UI 规范库
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 py-6 overflow-y-auto space-y-6 scrollbar-hide">
        
        {/* 示例1: Tailwind 原子类 */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Code size={18} className="text-rose-400" />
            <h2 className="text-slate-700 text-[16px] font-semibold">1. Tailwind 原子类</h2>
          </div>
          <div className="bg-white/70 backdrop-blur-xl border border-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <p className="text-slate-500 text-[14px] leading-relaxed">
              基础样式直接使用 Tailwind 原子类，样式与逻辑绑定，保持组件的高度内聚和轻量化。
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="bg-rose-100/80 text-rose-600 px-3 py-1.5 rounded-full text-xs font-medium">无全局污染</span>
              <span className="bg-orange-100/80 text-orange-600 px-3 py-1.5 rounded-full text-xs font-medium">即插即用</span>
            </div>
          </div>
        </section>

        {/* 示例2: CSS Modules */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Layers size={18} className="text-amber-400" />
            <h2 className="text-slate-700 text-[16px] font-semibold">2. CSS Modules</h2>
          </div>
          <div className={styles.complexCard}>
            <div className="bg-amber-100/80 p-3 rounded-full h-fit flex-shrink-0">
              <Star className={styles.starIcon} size={28} />
            </div>
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>动态光效卡片</h3>
              <p className={styles.cardDesc}>
                针对复杂的关键帧动画、伪元素背景定位等场景，使用独立的 CSS 模块来避免样式冲突。
              </p>
              <div className={styles.badge}>CSS Modules 隔离</div>
            </div>
          </div>
        </section>

        {/* 示例3: 混合使用 */}
        <section>
          <h2 className="text-slate-700 text-[16px] font-semibold mb-3 pl-1">3. 交互组件示例</h2>
          <div className="bg-white/70 backdrop-blur-xl border border-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <p className="text-slate-500 text-[13px] mb-5">
              推荐方案：外层布局与常规样式采用 Tailwind，复杂的 Hover 或动效使用 CSS Modules。
            </p>
            <div className="flex flex-col gap-4">
              <button className="w-full bg-slate-50 hover:bg-slate-100 active:scale-[0.98] border border-slate-200 transition-all px-4 py-3 rounded-2xl text-slate-600 text-[15px] font-medium flex justify-center items-center shadow-sm">
                常规 Tailwind 按钮
              </button>
              <button className={styles.customButton}>
                温柔呼吸按钮 (CSS)
              </button>
            </div>
          </div>
        </section>
      </div>
    </motion.div>
  );
};

export type { TemplateAppProps };