import React from 'react';
import { ChevronLeft, CloudOff } from 'lucide-react';
import { useMobile } from '../../contexts/MobileContext';

interface MHeaderProps {
  title: string;
  back?: boolean;
  action?: React.ReactNode;
  large?: boolean;
}

export function MHeader({ title, back, action, large }: MHeaderProps) {
  const { back: goBack, offline } = useMobile();
  return (
    <div className="shrink-0 bg-cream">
      {offline &&
      <div className="flex items-center justify-center gap-1.5 bg-ink px-3 py-1.5 text-[12px] font-medium text-white" role="status">
          <CloudOff className="h-3.5 w-3.5" aria-hidden /> Offline — showing schedule saved at 11:02 AM
        </div>
      }
      <div className="flex min-h-[52px] items-center gap-1 px-2">
        {back ?
        <button onClick={goBack} className="flex h-11 items-center gap-0.5 rounded-lg pr-2 text-[15px] font-medium text-berry-700 active:bg-cream-2" aria-label="Back">
            <ChevronLeft className="h-6 w-6" />
            Back
          </button> :

        <span className="w-2" />
        }
        {!large && <h1 className="flex-1 truncate text-center text-[16px] font-semibold">{title}</h1>}
        {large && <span className="flex-1" />}
        <div className="flex min-w-[64px] justify-end">{action}</div>
      </div>
      {large && <h1 className="px-5 pb-2 font-display text-[28px] font-semibold leading-tight">{title}</h1>}
    </div>);

}