import React from 'react';
import { motion } from 'motion/react';
import * as LucideIcons from 'lucide-react';

interface AppIconProps {
  name: string;
  icon?: keyof typeof LucideIcons;
  color?: string;
  label?: string;
  customIcon?: React.ReactNode;
  isFolder?: boolean;
  isClock?: boolean;
  onClick?: () => void;
  // 全局样式
  size?: number;
  radius?: number;
  frosted?: number;
  shadow?: number;
}

export const AppIcon: React.FC<AppIconProps> = ({
  icon,
  label,
  customIcon,
  isFolder,
  isClock,
  onClick,
  size = 60,
  radius = 18,
  frosted = 10,
  shadow = 8,
}) => {
  const IconComponent = icon ? (LucideIcons[icon] as React.ElementType) : null;

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.9 }}
      className="flex flex-col items-center gap-1 cursor-pointer"
      onClick={onClick}
    >
      <div
        className="flex items-center justify-center relative overflow-hidden group"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: `${radius}px`,
          backgroundColor: 'rgba(255, 255, 255, 0.25)',
          backdropFilter: frosted > 0 ? `blur(${frosted}px)` : 'none',
          WebkitBackdropFilter: frosted > 0 ? `blur(${frosted}px)` : 'none',
          boxShadow: `0 ${shadow}px ${shadow * 2}px rgba(0,0,0,0.15)`,
          border: '1px solid rgba(255,255,255,0.5)'
        }}
      >
        {isClock ? (
          <div className="relative w-full h-full p-2">
            <div className="w-full h-full rounded-full border border-black/40 relative">
              {/* Clock Hands */}
              <div className="absolute top-1/2 left-1/2 w-[1px] h-[40%] bg-black origin-bottom -translate-x-1/2 -translate-y-full rotate-[30deg]" />
              <div className="absolute top-1/2 left-1/2 w-[1px] h-[30%] bg-black origin-bottom -translate-x-1/2 -translate-y-full rotate-[120deg]" />
              <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-black rounded-full -translate-x-1/2 -translate-y-1/2" />
              {/* Hour Markers */}
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute top-0 left-1/2 w-[1px] h-1 bg-black/40 origin-[center_22px]"
                  style={{ transform: `translateX(-50%) rotate(${i * 30}deg)` }}
                />
              ))}
            </div>
          </div>
        ) : isFolder ? (
          <div className="grid grid-cols-3 gap-1.5 p-2">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="w-2.5 h-2.5 bg-black/30 rounded-[3px] border border-black/10" />
            ))}
          </div>
        ) : customIcon ? (
          customIcon
        ) : IconComponent ? (
          <IconComponent size={size * 0.5} className="text-black" strokeWidth={1.5} />
        ) : null}
      </div>
      {label && <span className="text-[11px] font-medium text-black/90 tracking-wide">{label}</span>}
    </motion.div>
  );
};
