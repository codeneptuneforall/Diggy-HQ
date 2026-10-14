import React from 'react';
import { ClipboardEdit, MapPin, Navigation, PackageSearch, Truck, Users } from 'lucide-react';
import { useStore } from '../../../contexts/StoreContext';
import { useMobile } from '../../../contexts/MobileContext';
import { MHeader } from '../MHeader';
import { MShiftCard } from '../MShiftCard';
import { NOW_MIN, TODAY, fmtDate, fmtTimeRange, toMin } from '../../../utils/date';
import { findReport } from '../../../utils/reports';
import { isCounted } from '../../../utils/sales';

export function MHome() {
  const store = useStore();
  const { me, push } = useMobile();
  const emp = store.employees.find((e) => e.id === me.employeeId);
  const mine = store.events.filter((e) => e.employeeIds.includes(me.employeeId ?? '') && e.status !== 'cancelled');
  const upcoming = mine.filter((e) => e.date >= TODAY && e.status !== 'completed').sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
  const current = upcoming.find((e) => e.date === TODAY && toMin(e.end) > NOW_MIN - 60);
  const next = current ?? upcoming[0];
  const later = upcoming.filter((e) => e.id !== next?.id).slice(0, 3);
  const pending = mine.filter((e) => e.date <= TODAY && (e.status === 'completed' || e.date < TODAY)).filter((e) => {
    const r = findReport(e.id, store.reports);
    return emp?.canSubmitReports && (!r || !isCounted(r));
  });
  const live = next && next.date === TODAY && toMin(next.start) <= NOW_MIN && toMin(next.end) > NOW_MIN;

  return (
    <>
      <MHeader title={`Hi, ${me.name.split(' ')[0]}`} large />
      <div className="flex-1 space-y-5 overflow-y-auto px-4 pb-6">
        <p className="-mt-1 px-1 text-[15px] text-ink-3">{fmtDate(TODAY, 'EEEE, MMMM d')}</p>

        {next ?
        <section className="overflow-hidden rounded-3xl bg-plum text-white shadow-pop">
            <div className="px-5 pb-4 pt-5">
              <p className="flex items-center gap-2 text-[13px] font-semibold text-berry-200">
                {live && <span className="h-2 w-2 animate-pulse rounded-full bg-berry-400" aria-hidden />}
                {live ? 'Happening now' : next.date === TODAY ? 'Later today' : `Next shift · ${fmtDate(next.date, 'EEE, MMM d')}`}
              </p>
              <h2 className="mt-1 font-display text-[24px] font-semibold leading-tight">{next.name}</h2>
              <p className="mt-1 text-[17px]">{fmtTimeRange(next.start, next.end)}</p>
              <div className="mt-4 space-y-2 text-[14px] text-plum-text">
                <p className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> {next.venue}
                </p>
                <p className="flex items-center gap-2">
                  <Truck className="h-4 w-4" aria-hidden /> {store.trailers.find((t) => t.id === next.trailerId)?.name ?? 'Trailer TBD'}
                </p>
                <p className="flex items-center gap-2">
                  <Users className="h-4 w-4" aria-hidden /> {next.employeeIds.map((id) => store.employees.find((e) => e.id === id)?.name.split(' ')[0]).join(', ')}
                </p>
              </div>
              {next.notes && <p className="mt-4 rounded-xl bg-plum-2 px-3 py-2.5 text-[14px] leading-snug text-white">{next.notes}</p>}
            </div>
            <div className="grid grid-cols-2 gap-px bg-plum-3">
              <button onClick={() => push({ name: 'location', id: next.id })} className="flex h-14 items-center justify-center gap-2 bg-plum-2 text-[15px] font-semibold active:bg-plum-3">
                <Navigation className="h-4 w-4" aria-hidden /> Directions
              </button>
              {emp?.canSubmitReports && next.date === TODAY ?
            <button onClick={() => push({ name: 'report', eventId: next.id })} className="flex h-14 items-center justify-center gap-2 bg-berry-600 text-[15px] font-semibold active:bg-berry-700">
                  <ClipboardEdit className="h-4 w-4" aria-hidden /> Sales report
                </button> :

            <button onClick={() => push({ name: 'event', id: next.id })} className="flex h-14 items-center justify-center gap-2 bg-plum-2 text-[15px] font-semibold active:bg-plum-3">
                  Event details
                </button>
            }
            </div>
          </section> :

        <section className="rounded-3xl bg-white p-6 text-center shadow-card">
            <p className="text-[17px] font-semibold">No upcoming shifts</p>
            <p className="mt-1 text-[14px] text-ink-3">When you’re assigned to an event it will show up here.</p>
          </section>
        }

        {pending.length > 0 &&
        <section>
            <h2 className="mb-2 px-1 text-[15px] font-semibold">Reports to finish</h2>
            <ul className="space-y-2">
              {pending.map((e) => {
              const r = findReport(e.id, store.reports);
              return (
                <li key={e.id}>
                    <button onClick={() => push({ name: 'report', eventId: e.id })} className="flex w-full items-center justify-between gap-3 rounded-2xl border border-bad-100 bg-bad-50 px-4 py-3.5 text-left active:scale-[0.98]">
                      <span>
                        <span className="block text-[15px] font-semibold">{e.name}</span>
                        <span className="block text-[13px] text-bad-700">{r ? 'Draft saved — not submitted' : 'Not started'} · {fmtDate(e.date, 'MMM d')}</span>
                      </span>
                      <ClipboardEdit className="h-5 w-5 text-bad-700" aria-hidden />
                    </button>
                  </li>);

            })}
            </ul>
          </section>
        }

        {later.length > 0 &&
        <section>
            <h2 className="mb-2 px-1 text-[15px] font-semibold">Coming up</h2>
            <div className="space-y-2">
              {later.map((e) =>
            <MShiftCard key={e.id} event={e} />
            )}
            </div>
          </section>
        }

        <button onClick={() => push({ name: 'inventory' })} className="flex w-full items-center gap-3 rounded-2xl bg-white px-4 py-3.5 text-left shadow-card active:scale-[0.98]">
          <PackageSearch className="h-5 w-5 text-berry-600" aria-hidden />
          <span className="flex-1 text-[15px] font-medium">Inventory lookup</span>
        </button>
      </div>
    </>);

}