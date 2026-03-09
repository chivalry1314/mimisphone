import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Cloud, Sun, CloudRain, Wind, Droplets } from 'lucide-react';
import { WeatherWidget } from './components';

interface WeatherAppProps {
  onClose: () => void;
}

export const WeatherApp: React.FC<WeatherAppProps> = ({ onClose }) => {
  const [selectedCity, setSelectedCity] = useState('萧县');

  const cities = [
    { name: '萧县', temp: 22, condition: '多云' },
    { name: '北京', temp: 15, condition: '晴' },
    { name: '上海', temp: 18, condition: '阴' },
    { name: '广州', temp: 25, condition: '雨' },
  ];

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="absolute inset-0 z-50 bg-gradient-to-b from-blue-400 to-blue-600 flex flex-col"
    >
      {/* Header */}
      <div className="px-3 pt-12 pb-4 flex items-center">
        <button onClick={onClose} className="text-white flex items-center gap-1 active:opacity-50">
          <ChevronLeft size={28} />
          <span className="text-[17px]">返回</span>
        </button>
        <h1 className="flex-1 text-center text-[17px] font-medium text-white">天气</h1>
        <div className="w-8" />
      </div>

      {/* Weather Widget */}
      <div className="px-4">
        <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4">
          <WeatherWidget />
        </div>
      </div>

      {/* City List */}
      <div className="flex-1 px-4 mt-6">
        <h2 className="text-white/80 text-[15px] mb-3">热门城市</h2>
        <div className="bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden">
          {cities.map((city, index) => (
            <div
              key={city.name}
              className={`flex items-center justify-between px-4 py-3 ${
                index < cities.length - 1 ? 'border-b border-white/10' : ''
              } ${city.name === selectedCity ? 'bg-white/10' : ''}`}
              onClick={() => setSelectedCity(city.name)}
            >
              <span className="text-white text-[16px]">{city.name}</span>
              <div className="flex items-center gap-3">
                <span className="text-white/80 text-[14px]">{city.condition}</span>
                <span className="text-white text-[18px] font-medium">{city.temp}°</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Info */}
      <div className="px-4 pb-8 mt-4">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex justify-around">
          <div className="flex flex-col items-center gap-1">
            <Wind size={20} className="text-white/80" />
            <span className="text-white/60 text-[12px]">风速</span>
            <span className="text-white text-[14px]">3级</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Droplets size={20} className="text-white/80" />
            <span className="text-white/60 text-[12px]">湿度</span>
            <span className="text-white text-[14px]">65%</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Sun size={20} className="text-white/80" />
            <span className="text-white/60 text-[12px]">紫外线</span>
            <span className="text-white text-[14px]">中等</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export type { WeatherAppProps };
