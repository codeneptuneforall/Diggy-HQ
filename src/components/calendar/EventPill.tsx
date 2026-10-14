import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, OctagonAlert } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { fmtTime } from '../../utils/date';
import { cx } from '../../utils/format';
import type { EventIssue } from '../../utils/conflicts';
import type { DiggyEvent } from '../../types';

interface EventPillProps {
  event: DiggyEvent;
  issues?: EventIssue[];
  highlight?: boolean;
}

export function EventPill({ event, issues = [], highlight }: EventPillProps) {
  const { settings } = useStore();
  const color = settings.categories.find((c) => c.id === event.category)?.color ?? '#8A7F84';
  const conflict = issues.some((i) => i.severity === 'conflict');
  const warning = !conflict && issues.length > 0;
  const cancelled = event.status === 'cancelled';
  return (
    <Link
      to={`/events/${event.id}`}
      title={`${event.name}${conflict ? ' — scheduling conflict' : warning ? ` — ${issues[0].title}` : ''}`}
      className={cx(
        'flex items-center gap-1 truncate rounded-md border-l-[3px] px-1.5 py-0.5 text-[12px] leading-snug transition-[filter] hover:brightness-95',
        event.status === 'tentative' && 'border-dashed outline-dashed outline-1 -outline-offset-1 outline-line-strong',
        conflict && 'ring-1 ring-bad-500',
        highlight && 'ring-2 ring-berry-500',
        cancelled && 'opacity-60'
      )}
      style={{ borderLeftColor: color, backgroundColor: `${color}1F` }}>
      
      {conflict && <OctagonAlert className="h-3 w-3 shrink-0 text-bad-600" aria-label="Conflict" />}
      {warning && <AlertTriangle className="h-3 w-3 shrink-0 text-warn-600" aria-label="Needs attention" />}
      <span className="shrink-0 font-semibold text-ink">{fmtTime(event.start).replace(' ', '').toLowerCase()}</span>
      <span className={cx('truncate text-ink', cancelled && 'line-through')}>{event.name}</span>
    </Link>);

}