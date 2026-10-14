import React from 'react';
import { addDays, endOfMonth, endOfWeek, format, isSameMonth, parseISO, startOfMonth, startOfWeek } from 'date-fns';
import { Plus } from 'lucide-react';
import { EventPill } from './EventPill';
import { TODAY } from '../../utils/date';
import { cx } from '../../utils/format';
import type { EventIssue } from '../../utils/conflicts';
import type { DiggyEvent } from '../../types';

interface MonthViewProps {
  cursor: string;
  events: DiggyEvent[];
  issuesByEvent: Map<string, EventIssue[]>;
  highlightId?: string | null;
  onSelectDay: (d: string) => void;
  onCreate: (d: string) => void;
}

export function MonthView({ cursor, events, issuesByEvent, highlightId, onSelectDay, onCreate }: MonthViewProps) {
  const c = parseISO(cursor);
  const start = startOfWeek(startOfMonth(c));
  const end = endOfWeek(endOfMonth(c));
  const days: Date[] = [];
  for (let d = start; d <= end; d = addDays(d, 1)) days.push(d);

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
      <div className="grid grid-cols-7 border-b border-line bg-cream/60">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) =>
        <div key={d} className="px-2 py-2 text-xs font-medium text-ink-3">
            {d}
          </div>
        )}
      </div>
      <div className="grid grid-cols-7">
        {days.map((d, i) => {
          const key = format(d, 'yyyy-MM-dd');
          const dayEvents = events.filter((e) => e.date === key).sort((a, b) => a.start.localeCompare(b.start));
          const inMonth = isSameMonth(d, c);
          const isToday = key === TODAY;
          return (
            <div key={key} className={cx('group relative min-h-[118px] border-b border-line p-1.5', i % 7 !== 6 && 'border-r', !inMonth && 'bg-cream/40')}>
              <div className="mb-1 flex items-center justify-between">
                <button
                  onClick={() => onSelectDay(key)}
                  className={cx(
                    'flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-semibold transition-colors',
                    isToday ? 'bg-berry-600 text-white' : inMonth ? 'text-ink hover:bg-cream-2' : 'text-ink-3 hover:bg-cream-2'
                  )}
                  aria-label={`Open ${format(d, 'MMMM d')} in day view`}>
                  
                  {format(d, 'd')}
                </button>
                <button
                  onClick={() => onCreate(key)}
                  className="rounded p-0.5 text-ink-3 opacity-0 transition-opacity hover:bg-cream-2 hover:text-ink focus:opacity-100 group-hover:opacity-100"
                  aria-label={`Create event on ${format(d, 'MMMM d')}`}>
                  
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((e) =>
                <EventPill key={e.id} event={e} issues={issuesByEvent.get(e.id)} highlight={e.id === highlightId} />
                )}
                {dayEvents.length > 3 &&
                <button onClick={() => onSelectDay(key)} className="px-1.5 text-[11px] font-medium text-ink-2 hover:text-berry-700">
                    +{dayEvents.length - 3} more
                  </button>
                }
              </div>
            </div>);

        })}
      </div>
    </div>);

}