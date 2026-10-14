import React from 'react';
import { CalendarPlus, ChevronRight, FileWarning, ListChecks, OctagonAlert, Package, Receipt, Truck } from 'lucide-react';
import { useStore } from '../../../contexts/StoreContext';
import { useMobile } from '../../../contexts/MobileContext';
import { MHeader } from '../MHeader';
import { MShiftCard } from '../MShiftCard';
import { TODAY, fmtDate, inRange } from '../../../utils/date';
import { missingReportEvents } from '../../../utils/reports';
import { getEventIssues } from '../../../utils/conflicts';
import { balanceOf, isLow } from '../../../utils/inventory';
import { fmtMetric, isCounted, summarize } from '../../../utils/sales';
import { cx, fmtMoney } from '../../../utils/format';

export function MManagerHome() {
  const store = useStore();
  const { push } = useMobile();
  const events = store.events.filter((e) => e.franchiseId === 'f-jc');
  const today = events.filter((e) => e.date === TODAY && e.status !== 'cancelled');
  const toReview = store.reports.filter((r) => r.franchiseId === 'f-jc' && r.status === 'submitted');
  const missing = missingReportEvents(events, store.reports);
  const conflicts = events.filter((e) => e.date >= TODAY && getEventIssues(e, store.events, store.employees, store.trailers).some((i) => i.severity === 'conflict'));
  const low = store.items.filter((i) => i.franchiseId === 'f-jc' && isLow(i, balanceOf(i.id, store.movements)));
  const fus = store.followUps.filter((f) => !f.done && f.due <= TODAY && store.customers.find((c) => c.id === f.customerId)?.franchiseId === 'f-jc');
  const week = summarize(store.reports.filter((r) => r.franchiseId === 'f-jc' && isCounted(r) && inRange(r.date, 'last7')));

  const tiles = [
  { label: 'Reports to review', count: toReview.length, icon: Receipt, go: () => push({ name: 'reviewReports' }), tone: 'info' },
  { label: 'Missing reports', count: missing.length, icon: FileWarning, go: () => push({ name: 'events' }), tone: 'bad' },
  { label: 'Scheduling conflicts', count: conflicts.length, icon: OctagonAlert, go: () => push({ name: 'event', id: conflicts[0]?.id ?? '' }), tone: 'bad' },
  { label: 'Low stock', count: low.length, icon: Package, go: () => push({ name: 'lowstock' }), tone: 'warn' },
  { label: 'Follow-ups due', count: fus.length, icon: ListChecks, go: () => push({ name: 'followups' }), tone: 'info' }].
  filter((t) => t.count > 0);

  return (
    <>
      <MHeader title="Johnson City" large />
      <div className="flex-1 space-y-5 overflow-y-auto px-4 pb-6">
        <p className="-mt-1 px-1 text-[15px] text-ink-3">{fmtDate(TODAY, 'EEEE, MMMM d')}</p>

        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => push({ name: 'createEvent' })} className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-berry-600 text-[15px] font-semibold text-white active:bg-berry-700">
            <CalendarPlus className="h-5 w-5" aria-hidden /> New event
          </button>
          <button onClick={() => push({ name: 'trailers' })} className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-white text-[15px] font-semibold shadow-card active:scale-[0.98]">
            <Truck className="h-5 w-5 text-berry-600" aria-hidden /> Trailers
          </button>
        </div>

        {tiles.length > 0 &&
        <section className="overflow-hidden rounded-2xl bg-white shadow-card">
            <h2 className="px-4 pb-1 pt-3.5 text-[15px] font-semibold">Needs attention</h2>
            <ul className="divide-y divide-line">
              {tiles.map((t) =>
            <li key={t.label}>
                  <button onClick={t.go} className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-cream">
                    <t.icon className={cx('h-5 w-5', t.tone === 'bad' ? 'text-bad-600' : t.tone === 'warn' ? 'text-warn-600' : 'text-info-600')} aria-hidden />
                    <span className="flex-1 text-[15px]">{t.label}</span>
                    <span className="font-display text-lg font-semibold">{t.count}</span>
                    <ChevronRight className="h-4 w-4 text-ink-3" aria-hidden />
                  </button>
                </li>
            )}
            </ul>
          </section>
        }

        <section>
          <h2 className="mb-2 px-1 text-[15px] font-semibold">Today</h2>
          <div className="space-y-2">
            {today.length ? today.map((e) => <MShiftCard key={e.id} event={e} showDate={false} />) : <p className="rounded-2xl bg-white px-4 py-5 text-center text-[14px] text-ink-3 shadow-card">No events today.</p>}
          </div>
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-card">
          <p className="text-[13px] text-ink-3">Sales · last 7 days</p>
          <p className="font-display text-[30px] font-semibold">{fmtMoney(week.total)}</p>
          <div className="mt-2 grid grid-cols-3 gap-2 text-[13px]">
            <span>
              <span className="block text-ink-3">Card</span>
              <span className="font-semibold">{fmtMoney(week.card)}</span>
            </span>
            <span>
              <span className="block text-ink-3">Per hour</span>
              <span className="font-semibold">{fmtMetric(week.perHour)}</span>
            </span>
            <span>
              <span className="block text-ink-3">Per batch</span>
              <span className="font-semibold">{fmtMetric(week.perBatch)}</span>
            </span>
          </div>
        </section>
      </div>
    </>);

}