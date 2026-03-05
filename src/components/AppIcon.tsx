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
}

export const AppIcon: React.FC<AppIconProps> = ({ name, icon, color, label, customIcon, isFolder, isClock, onClick }) => {
  const IconComponent = icon ? (LucideIcons[icon] as React.ElementType) : null;

  return (
    <motion.div 
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.9 }}
      className="flex flex-col items-center gap-1 cursor-pointer"
      onClick={onClick}
    >
      <div 
        className={`w-[60px] h-[60px] rounded-[1.2rem] flex items-center justify-center glass-icon ios-shadow relative overflow-hidden group`}
      >
        {isClock ? (
          <div className="relative w-full h-full p-2">
            <div className="w-full h-full rounded-full border border-white/40 relative">
              {/* Clock Hands */}
              <div className="absolute top-1/2 left-1/2 w-[1px] h-[40%] bg-white origin-bottom -translate-x-1/2 -translate-y-full rotate-[30deg]" />
              <div className="absolute top-1/2 left-1/2 w-[1px] h-[30%] bg-white origin-bottom -translate-x-1/2 -translate-y-full rotate-[120deg]" />
              <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
              {/* Hour Markers */}
              {[...Array(12)].map((_, i) => (
                <div 
                  key={i} 
                  className="absolute top-0 left-1/2 w-[1px] h-1 bg-white/40 origin-[center_22px]" 
                  style={{ transform: `translateX(-50%) rotate(${i * 30}deg)` }} 
                />
              ))}
            </div>
          </div>
        ) : isFolder ? (
          <div className="grid grid-cols-3 gap-1.5 p-2">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="w-2.5 h-2.5 bg-white/30 rounded-[3px] border border-white/10" />
            ))}
          </div>
        ) : customIcon ? (
          customIcon
        ) : IconComponent ? (
          <IconComponent size={30} className="text-white/90" strokeWidth={1.5} />
        ) : null}
      </div>
      {label && <span className="text-[11px] font-medium text-white/90 tracking-wide">{label}</span>}
    </motion.div>
  );
};
