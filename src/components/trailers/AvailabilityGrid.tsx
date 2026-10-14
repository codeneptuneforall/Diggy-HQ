import React from 'react';
import { Link } from 'react-router-dom';
import { OctagonAlert, Wrench } from 'lucide-react';
import { TODAY, addDaysStr, fmtDate, fmtTime } from '../../utils/date';
import { overlaps } from '../../utils/conflicts';
import { cx } from '../../utils/format';
import type { DiggyEvent, Trailer } from '../../types';

interface AvailabilityGridProps {
  trailers: Trailer[];
  events: DiggyEvent[];
  days?: number;
  start?: string;
}

export function AvailabilityGrid({ trailers, events, days = 14, start = TODAY }: AvailabilityGridProps) {
  const dates = Array.from({ length: days }, (_, i) => addDaysStr(start, i));
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-card">
      <table className="w-full border-collapse text-xs" style={{ minWidth: 160 + days * 84 }}>
        <thead>
          <tr className="bg-cream/60">
            <th className="sticky left-0 z-10 w-40 border-b border-r border-line bg-cream px-3 py-2 text-left font-medium text-ink-3">Trailer</th>
            {dates.map((d) =>
            <th key={d} className={cx('border-b border-line px-1.5 py-2 text-left font-medium', d === TODAY ? 'text-berry-700' : 'text-ink-3')}>
                <span className="block">{fmtDate(d, 'EEE')}</span>
                <span className="block text-[13px] text-ink">{fmtDate(d, 'MMM d')}</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {trailers.map((t) =>
          <tr key={t.id}>
              <th scope="row" className="sticky left-0 z-10 border-b border-r border-line bg-white px-3 py-2 text-left">
                <Link to={`/trailers/${t.id}`} className="text-[13px] font-medium hover:text-berry-700">
                  {t.name}
                </Link>
              </th>
              {dates.map((d) => {
              const dayEvents = events.filter((e) => e.trailerId === t.id && e.date === d && e.status !== 'cancelled').sort((a, b) => a.start.localeCompare(b.start));
              const clash = dayEvents.some((a, i) => dayEvents.some((b, j) => i !== j && overlaps(a.start, a.end, b.start, b.end)));
              const down = t.baseStatus !== 'available';
              return (
                <td key={d} className={cx('h-16 border-b border-line p-1 align-top', clash && 'bg-bad-50', down && 'hatch')}>
                    {down && dayEvents.length === 0 ?
                  <span className="flex items-center gap-1 text-[11px] text-warn-700">
                        <Wrench className="h-3 w-3" aria-hidden /> {t.baseStatus === 'maintenance' ? 'Maint.' : 'Unavail.'}
                      </span> :
                  dayEvents.length === 0 ?
                  <span className="text-[11px] text-ok-700">Free</span> :

                  <div className="space-y-0.5">
                        {clash &&
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-bad-700">
                            <OctagonAlert className="h-3 w-3" aria-hidden /> Double-booked
                          </span>
                    }
                        {dayEvents.map((e) =>
                    <Link key={e.id} to={`/events/${e.id}`} className={cx('block truncate rounded px-1 py-0.5 text-[11px] hover:brightness-95', clash ? 'bg-bad-100 text-bad-700' : 'bg-info-50 text-info-700')} title={e.name}>
                            {fmtTime(e.start)} {e.name}
                          </Link>
                    )}
                      </div>
                  }
                  </td>);

            })}
            </tr>
          )}
        </tbody>
      </table>
    </div>);

}