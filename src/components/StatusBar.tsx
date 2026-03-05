import React from 'react';
import { Battery, Wifi, SignalHigh, Flower } from 'lucide-react';

interface StatusBarProps {
  dark?: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = ({ dark }) => {
  const [time, setTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={`flex justify-between items-center px-8 pt-4 pb-2 w-full z-50 font-medium text-[15px] transition-colors duration-300 ${
      dark ? 'text-black' : 'text-white'
    }`}>
      <div className="flex items-center gap-1">
        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
        <Flower size={14} className={dark ? 'text-black/60' : 'text-white/80'} />
      </div>
      <div className="flex items-center gap-1.5">
        <SignalHigh size={16} />
        <span className="text-[12px] font-bold">5G</span>
        <div className={`flex items-center rounded-full px-1.5 py-0.5 gap-1 border ${
          dark ? 'bg-black/5 border-black/10' : 'bg-white/20 border-white/20'
        }`}>
          <span className="text-[10px] font-bold">81</span>
          <div className={`w-5 h-2.5 border rounded-[3px] relative flex items-center p-[1px] ${
            dark ? 'border-black/40' : 'border-white/60'
          }`}>
            <div className={`h-full rounded-[1px] ${dark ? 'bg-black' : 'bg-white'}`} style={{ width: '81%' }} />
            <div className={`absolute -right-[3px] w-[2px] h-1.5 rounded-r-full ${
              dark ? 'bg-black/40' : 'bg-white/60'
            }`} />
          </div>
        </div>
      </div>
    </div>
  );
};
