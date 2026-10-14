import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarX, MapPin, Truck } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { EmptyState } from '../ui/EmptyState';
import { StatusChip } from '../ui/StatusChip';
import { CategoryTag } from '../ui/CategoryTag';
import { TODAY, fmtDate, fmtTimeRange } from '../../utils/date';
import { eventStatusMeta } from '../../utils/status';
import type { EventIssue } from '../../utils/conflicts';
import type { DiggyEvent } from '../../types';

export function AgendaView({ events, issuesByEvent }: {events: DiggyEvent[];issuesByEvent: Map<string, EventIssue[]>;}) {
  const store = useStore();
  const dates = Array.from(new Set(events.map((e) => e.date))).sort();
  if (!dates.length) {
    return (
      <div className="rounded-2xl border border-line bg-white shadow-card">
        <EmptyState icon={CalendarX} title="No scheduled events" body="Nothing matches this period and these filters." />
      </div>);

  }
  return (
    <div className="space-y-5">
      {dates.map((d) =>
      <section key={d}>
          <h3 className="mb-2 flex items-baseline gap-2 text-sm font-semibold">
            {fmtDate(d, 'EEEE, MMMM d')}
            {d === TODAY && <span className="rounded-full bg-berry-600 px-2 py-0.5 text-[11px] text-white">Today</span>}
          </h3>
          <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white shadow-card">
            {events.
          filter((e) => e.date === d).
          sort((a, b) => a.start.localeCompare(b.start)).
          map((e) => {
            const issues = issuesByEvent.get(e.id) ?? [];
            const conflict = issues.some((i) => i.severity === 'conflict');
            return (
              <li key={e.id}>
                    <Link to={`/events/${e.id}`} className="grid gap-2 px-4 py-3 transition-colors hover:bg-cream/50 md:grid-cols-[150px_1fr_200px_auto] md:items-center">
                      <span className="text-sm font-semibold tabular">{fmtTimeRange(e.start, e.end)}</span>
                      <span className="min-w-0">
                        <span className={`block truncate text-sm font-medium ${e.status === 'cancelled' ? 'line-through' : ''}`}>{e.name}</span>
                        <span className="flex items-center gap-3">
                          <CategoryTag id={e.category} />
                          <span className="flex items-center gap-1 truncate text-xs text-ink-3">
                            <MapPin className="h-3 w-3" aria-hidden /> {e.venue}
                          </span>
                        </span>
                      </span>
                      <span className="flex items-center gap-1.5 text-[13px] text-ink-2">
                        <Truck className="h-3.5 w-3.5" aria-hidden /> {store.trailers.find((t) => t.id === e.trailerId)?.name ?? <span className="text-warn-700">No trailer</span>}
                      </span>
                      {issues.length ? <StatusChip tone={conflict ? 'bad' : 'warn'} label={conflict ? 'Conflict' : issues[0].title} /> : <StatusChip {...eventStatusMeta[e.status]} />}
                    </Link>
                  </li>);

          })}
          </ul>
        </section>
      )}
    </div>);

}