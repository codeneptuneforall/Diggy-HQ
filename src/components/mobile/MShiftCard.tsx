import React from 'react';
import { ChevronRight, MapPin, Truck } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { useMobile } from '../../contexts/MobileContext';
import { StatusChip } from '../ui/StatusChip';
import { fmtDate, fmtTimeRange } from '../../utils/date';
import { eventStatusMeta } from '../../utils/status';
import type { DiggyEvent } from '../../types';

export function MShiftCard({ event, showDate = true }: {event: DiggyEvent;showDate?: boolean;}) {
  const store = useStore();
  const { push } = useMobile();
  const color = store.settings.categories.find((c) => c.id === event.category)?.color ?? '#8A7F84';
  return (
    <button onClick={() => push({ name: 'event', id: event.id })} className="flex w-full items-stretch gap-3 rounded-2xl bg-white p-4 text-left shadow-card transition-transform active:scale-[0.98]">
      <span className="w-1 shrink-0 rounded-full" style={{ backgroundColor: color }} aria-hidden />
      <span className="min-w-0 flex-1">
        {showDate && <span className="block text-[13px] font-semibold text-berry-700">{fmtDate(event.date, 'EEE, MMM d')}</span>}
        <span className="block truncate text-[16px] font-semibold">{event.name}</span>
        <span className="mt-0.5 block text-[14px] text-ink-2">{fmtTimeRange(event.start, event.end)}</span>
        <span className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-ink-3">
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" aria-hidden /> {event.venue}
          </span>
          <span className="flex items-center gap-1">
            <Truck className="h-3.5 w-3.5" aria-hidden /> {store.trailers.find((t) => t.id === event.trailerId)?.code ?? 'TBD'}
          </span>
        </span>
        {event.status !== 'confirmed' && <StatusChip {...eventStatusMeta[event.status]} className="mt-2" />}
      </span>
      <ChevronRight className="h-5 w-5 self-center text-ink-3" aria-hidden />
    </button>);

}