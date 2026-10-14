import React from 'react';
import { Link } from 'react-router-dom';
import { OctagonAlert, AlertTriangle } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { NOW_MIN, TODAY, fmtTime, fmtTimeRange, toMin } from '../../utils/date';
import { cx } from '../../utils/format';
import type { EventIssue } from '../../utils/conflicts';
import type { DiggyEvent } from '../../types';

export interface GridColumn {
  key: string;
  label: string;
  sub?: string;
  isToday?: boolean;
  events: DiggyEvent[];
  muted?: boolean;
}

interface TimeGridViewProps {
  columns: GridColumn[];
  issuesByEvent: Map<string, EventIssue[]>;
  highlightId?: string | null;
  showNowLine?: boolean;
}

const START = 7;
const END = 22;
const HOUR = 48;

function layoutLanes(events: DiggyEvent[]) {
  const sorted = [...events].sort((a, b) => a.start.localeCompare(b.start));
  const laneEnds: string[] = [];
  const lanes = new Map<string, number>();
  sorted.forEach((e) => {
    let lane = laneEnds.findIndex((end) => end <= e.start);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(e.end);
    } else laneEnds[lane] = e.end;
    lanes.set(e.id, lane);
  });
  return { lanes, count: Math.max(1, laneEnds.length) };
}

export function TimeGridView({ columns, issuesByEvent, highlightId, showNowLine }: TimeGridViewProps) {
  const { settings } = useStore();
  const hours = Array.from({ length: END - START }, (_, i) => START + i);
  const nowTop = (NOW_MIN - START * 60) / 60 * HOUR;

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
      <div className="overflow-x-auto">
        <div style={{ minWidth: columns.length > 4 ? 760 : 520 }}>
          <div className="grid border-b border-line bg-cream/60" style={{ gridTemplateColumns: `56px repeat(${columns.length}, minmax(0,1fr))` }}>
            <div />
            {columns.map((c) =>
            <div key={c.key} className={cx('border-l border-line px-2 py-2', c.muted && 'bg-cream-2/60')}>
                <p className={cx('text-[13px] font-semibold', c.isToday ? 'text-berry-700' : 'text-ink')}>{c.label}</p>
                {c.sub && <p className="truncate text-[11px] text-ink-3">{c.sub}</p>}
              </div>
            )}
          </div>
          <div className="relative grid" style={{ gridTemplateColumns: `56px repeat(${columns.length}, minmax(0,1fr))`, height: hours.length * HOUR }}>
            <div className="relative">
              {hours.map((h, i) =>
              <span key={h} className="absolute right-2 -translate-y-1/2 text-[11px] text-ink-3" style={{ top: i * HOUR }}>
                  {i === 0 ? '' : fmtTime(`${String(h).padStart(2, '0')}:00`)}
                </span>
              )}
            </div>
            {columns.map((c) => {
              const { lanes, count } = layoutLanes(c.events);
              return (
                <div key={c.key} className={cx('relative border-l border-line', c.muted && 'hatch')}>
                  {hours.map((h, i) =>
                  <div key={h} className="absolute left-0 right-0 border-t border-line/70" style={{ top: i * HOUR }} />
                  )}
                  {showNowLine && c.isToday && nowTop > 0 &&
                  <div className="absolute left-0 right-0 z-10 border-t-2 border-berry-500" style={{ top: nowTop }}>
                      <span className="absolute -left-1 -top-[5px] h-2 w-2 rounded-full bg-berry-500" />
                    </div>
                  }
                  {c.events.map((e) => {
                    const top = (toMin(e.start) - START * 60) / 60 * HOUR;
                    const height = Math.max((toMin(e.end) - toMin(e.start)) / 60 * HOUR - 2, 22);
                    const lane = lanes.get(e.id) ?? 0;
                    const color = settings.categories.find((x) => x.id === e.category)?.color ?? '#8A7F84';
                    const issues = issuesByEvent.get(e.id) ?? [];
                    const conflict = issues.some((i) => i.severity === 'conflict');
                    return (
                      <Link
                        key={e.id}
                        to={`/events/${e.id}`}
                        className={cx(
                          'absolute overflow-hidden rounded-md border-l-[3px] px-1.5 py-1 text-[12px] leading-tight transition-[filter] hover:brightness-95',
                          conflict && 'ring-2 ring-bad-500',
                          e.id === highlightId && 'ring-2 ring-berry-500',
                          e.status === 'cancelled' && 'opacity-50',
                          e.status === 'tentative' && 'outline-dashed outline-1 -outline-offset-1 outline-line-strong'
                        )}
                        style={{
                          top,
                          height,
                          left: `calc(${lane / count * 100}% + 2px)`,
                          width: `calc(${100 / count}% - 4px)`,
                          borderLeftColor: color,
                          backgroundColor: `${color}26`
                        }}>
                        
                        <span className="flex items-center gap-1 font-semibold text-ink">
                          {conflict && <OctagonAlert className="h-3 w-3 shrink-0 text-bad-600" aria-label="Conflict" />}
                          {!conflict && issues.length > 0 && <AlertTriangle className="h-3 w-3 shrink-0 text-warn-600" aria-label="Needs attention" />}
                          <span className={cx('truncate', e.status === 'cancelled' && 'line-through')}>{e.name}</span>
                        </span>
                        <span className="block truncate text-ink-2">{fmtTimeRange(e.start, e.end)}</span>
                      </Link>);

                  })}
                </div>);

            })}
          </div>
        </div>
      </div>
      {columns.some((c) => c.events.length === 0) && columns.every((c) => c.events.length === 0) &&
      <p className="border-t border-line px-4 py-3 text-center text-sm text-ink-3">No events in this range.</p>
      }
      <span className="sr-only">Today is {TODAY}</span>
    </div>);

}