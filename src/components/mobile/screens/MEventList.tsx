import React, { useState } from 'react';
import { useStore } from '../../../contexts/StoreContext';
import { MHeader } from '../MHeader';
import { MShiftCard } from '../MShiftCard';
import { TODAY } from '../../../utils/date';
import { missingReportEvents } from '../../../utils/reports';
import { cx } from '../../../utils/format';

export function MEventList() {
  const store = useStore();
  const [tab, setTab] = useState<'upcoming' | 'needsReport' | 'past'>('upcoming');
  const events = store.events.filter((e) => e.franchiseId === 'f-jc' && e.status !== 'cancelled');
  const missing = missingReportEvents(events, store.reports);
  const list =
  tab === 'upcoming' ?
  events.filter((e) => e.date >= TODAY && e.status !== 'completed').sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start)) :
  tab === 'needsReport' ?
  missing :
  events.filter((e) => e.date < TODAY).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <MHeader title="Events" large />
      <div className="shrink-0 px-4 pb-3">
        <div className="flex rounded-xl bg-cream-2 p-1">
          {[
          ['upcoming', 'Upcoming'],
          ['needsReport', `Need report (${missing.length})`],
          ['past', 'Past']].
          map(([id, label]) =>
          <button key={id} onClick={() => setTab(id as typeof tab)} aria-pressed={tab === id} className={cx('flex-1 rounded-lg py-2 text-[13px] font-semibold', tab === id ? 'bg-white shadow-card' : 'text-ink-2')}>
              {label}
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto px-4 pb-6">
        {list.length ? list.map((e) => <MShiftCard key={e.id} event={e} />) : <p className="py-10 text-center text-[14px] text-ink-3">Nothing here.</p>}
      </div>
    </>);

}