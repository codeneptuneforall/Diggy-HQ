import React, { useState } from 'react';
import { CalendarCheck2 } from 'lucide-react';
import { useStore } from '../../../contexts/StoreContext';
import { useMobile } from '../../../contexts/MobileContext';
import { MHeader } from '../MHeader';
import { MShiftCard } from '../MShiftCard';
import { TODAY, addDaysStr, fmtDate } from '../../../utils/date';
import { cx } from '../../../utils/format';

export function MSchedule({ initialDay }: {initialDay?: string;}) {
  const store = useStore();
  const { me } = useMobile();
  const [day, setDay] = useState(initialDay ?? TODAY);
  const days = Array.from({ length: 14 }, (_, i) => addDaysStr(TODAY, i));
  const mine = store.events.filter((e) => e.employeeIds.includes(me.employeeId ?? '') && e.status !== 'cancelled');
  const dayShifts = mine.filter((e) => e.date === day).sort((a, b) => a.start.localeCompare(b.start));
  const off = store.employees.find((e) => e.id === me.employeeId)?.unavailable.filter((u) => u.date === day) ?? [];

  return (
    <>
      <MHeader title="My schedule" large />
      <div className="shrink-0 overflow-x-auto px-3 pb-3">
        <div className="flex gap-1.5">
          {days.map((d) => {
            const has = mine.some((e) => e.date === d);
            const active = d === day;
            return (
              <button key={d} onClick={() => setDay(d)} aria-pressed={active} className={cx('flex w-12 shrink-0 flex-col items-center rounded-2xl py-2 transition-colors', active ? 'bg-berry-600 text-white' : 'bg-white text-ink shadow-card')}>
                <span className={cx('text-[11px] font-medium', active ? 'text-berry-100' : 'text-ink-3')}>{fmtDate(d, 'EEE')}</span>
                <span className="text-[17px] font-semibold">{fmtDate(d, 'd')}</span>
                <span className={cx('mt-0.5 h-1.5 w-1.5 rounded-full', has ? active ? 'bg-white' : 'bg-berry-500' : 'bg-transparent')} aria-hidden />
              </button>);

          })}
        </div>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto px-4 pb-6">
        <h2 className="px-1 text-[15px] font-semibold">{day === TODAY ? 'Today' : fmtDate(day, 'EEEE, MMMM d')}</h2>
        {off.map((u, i) =>
        <p key={i} className="hatch rounded-2xl border border-line px-4 py-3 text-[14px] text-ink-2">
            You marked this time unavailable · {u.reason}
          </p>
        )}
        {dayShifts.length ?
        dayShifts.map((e) => <MShiftCard key={e.id} event={e} showDate={false} />) :

        <div className="flex flex-col items-center rounded-3xl bg-white px-6 py-10 text-center shadow-card">
            <CalendarCheck2 className="h-10 w-10 text-berry-400" aria-hidden />
            <p className="mt-3 text-[17px] font-semibold">No shifts this day</p>
            <p className="mt-1 text-[14px] text-ink-3">Enjoy the time off. You’ll get a notification if you’re added to an event.</p>
          </div>
        }
      </div>
    </>);

}