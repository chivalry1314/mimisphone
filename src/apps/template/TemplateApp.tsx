import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Star } from 'lucide-react';
import styles from './TemplateApp.module.css';

interface TemplateAppProps {
  onClose: () => void;
}

/**
 * 模板应用示例
 *
 * 样式规范：
 * 1. 优先使用 Tailwind 原子类（推荐）
 * 2. 复杂样式使用同目录下的 .module.css 文件（CSS Modules）
 *
 * 目录结构：
 * ├── index.ts              # 应用入口（manifest）
 * ├── TemplateApp.tsx       # 主应用组件
 * ├── TemplateApp.module.css # CSS Modules（复杂样式）
 * ├── types.ts             # 类型定义
 * ├── store.ts             # 状态管理（可选）
 * └── components/          # 子组件目录（可选）
 */
export const TemplateApp: React.FC<TemplateAppProps> = ({ onClose }) => {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="absolute inset-0 z-50 bg-gradient-to-b from-blue-500 to-blue-700 flex flex-col"
    >
      {/* Header - 使用 Tailwind 原子类 */}
      <div className="px-3 pt-12 pb-4 flex items-center">
        <button
          onClick={onClose}
          className="text-white flex items-center gap-1 active:opacity-50"
        >
          <ChevronLeft size={28} />
          <span className="text-[17px]">返回</span>
        </button>
        <h1 className="flex-1 text-center text-[17px] font-medium text-white">
          模板应用
        </h1>
        <div className="w-8" />
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-6 overflow-y-auto">
        {/* 示例1: Tailwind 原子类（首选方式） */}
        <section className="mb-8">
          <h2 className="text-white/80 text-[15px] mb-3 font-medium">
            1. Tailwind 原子类（推荐）
          </h2>
          <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4">
            <p className="text-white text-[14px]">
              简单样式直接使用 Tailwind 原子类，样式与逻辑绑定，无需额外 CSS 文件。
            </p>
            <div className="mt-3 flex gap-2">
              <span className="bg-white/30 px-3 py-1 rounded-full text-xs">无全局污染</span>
              <span className="bg-white/30 px-3 py-1 rounded-full text-xs">即插即用</span>
            </div>
          </div>
        </section>

        {/* 示例2: CSS Modules（复杂样式隔离） */}
        <section className="mb-8">
          <h2 className="text-white/80 text-[15px] mb-3 font-medium">
            2. CSS Modules（复杂样式）
          </h2>
          <div className={styles.complexCard}>
            <Star className={styles.starIcon} size={32} />
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>复杂动画示例</h3>
              <p className={styles.cardDesc}>
                当需要复杂动画、特殊背景定位时，使用 CSS Modules 避免全局污染。
              </p>
              {/* CSS Modules 会生成唯一哈希类名 */}
              <div className={styles.badge}>已隔离</div>
            </div>
          </div>
        </section>

        {/* 示例3: 混合使用 */}
        <section>
          <h2 className="text-white/80 text-[15px] mb-3 font-medium">
            3. 混合使用
          </h2>
          <div className="bg-white/10 rounded-2xl p-4">
            <p className="text-white/60 text-[13px] mb-3">
              推荐：布局用 Tailwind，复杂效果用 CSS Modules
            </p>
            <div className="flex flex-wrap gap-2">
              <button className="bg-white/30 hover:bg-white/40 active:scale-95 transition-all px-4 py-2 rounded-lg text-white text-sm">
                Tailwind 按钮
              </button>
              <button className={styles.customButton}>
                CSS Modules 按钮
              </button>
            </div>
          </div>
        </section>
      </div>
    </motion.div>
  );
};

export type { TemplateAppProps };
