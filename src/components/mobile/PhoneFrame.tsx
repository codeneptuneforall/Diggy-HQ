import React from 'react';
import { BatteryFull, Signal, Wifi, WifiOff } from 'lucide-react';

export function PhoneFrame({ children, offline }: {children: React.ReactNode;offline: boolean;}) {
  return (
    <div className="relative h-[812px] w-[375px] shrink-0 rounded-[52px] bg-plum p-3 shadow-pop">
      <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[42px] bg-cream">
        <div className="flex h-11 shrink-0 items-center justify-between bg-cream px-7 pt-1 text-[14px] font-semibold text-ink">
          <span>11:20</span>
          <span className="absolute left-1/2 top-2.5 h-7 w-28 -translate-x-1/2 rounded-full bg-ink" aria-hidden />
          <span className="flex items-center gap-1">
            <Signal className="h-4 w-4" aria-hidden />
            {offline ? <WifiOff className="h-4 w-4" aria-hidden /> : <Wifi className="h-4 w-4" aria-hidden />}
            <BatteryFull className="h-5 w-5" aria-hidden />
          </span>
        </div>
        {children}
      </div>
    </div>);

}