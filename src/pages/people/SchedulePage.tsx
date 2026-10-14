import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { addDays, format, parseISO, startOfWeek } from 'date-fns';
import { CalendarOff, ChevronLeft, ChevronRight, OctagonAlert, Plus, UserPlus } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { useUI } from '../../contexts/UIContext';
import { useScoped } from '../../hooks/useScoped';
import { Page } from '../../components/layout/Page';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { StatusChip } from '../../components/ui/StatusChip';
import { TODAY, addDaysStr, fmtDate, fmtTime, fmtTimeRange, hoursBetween } from '../../utils/date';
import { overlaps } from '../../utils/conflicts';
import { eventStatusMeta } from '../../utils/status';
import { cx, fmtNum } from '../../utils/format';

export function SchedulePage() {
  const store = useStore();
  const scoped = useScoped();
  const { openShiftForm } = useUI();
  const [weekStart, setWeekStart] = useState(format(startOfWeek(parseISO(TODAY)), 'yyyy-MM-dd'));
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const days = Array.from({ length: 7 }, (_, i) => addDaysStr(weekStart, i));
  const emps = scoped.employees.filter((e) => e.status !== 'inactive');
  const weekEvents = scoped.events.filter((e) => e.date >= days[0] && e.date <= days[6] && e.status !== 'cancelled');

  const shiftConflict = (empId: string, evId: string) => {
    const ev = store.events.find((e) => e.id === evId)!;
    const emp = store.employees.find((e) => e.id === empId)!;
    const clash = weekEvents.some((o) => o.id !== evId && o.date === ev.date && o.employeeIds.includes(empId) && overlaps(o.start, o.end, ev.start, ev.end));
    const off = emp.unavailable.some((u) => u.date === ev.date && overlaps(u.start, u.end, ev.start, ev.end));
    return clash ? 'Overlapping shift' : off ? 'Marked unavailable' : null;
  };

  return (
    <Page wide>
      <PageHeader
        title="Schedule"
        description="Shifts come from event assignments. Overlaps and unavailable time are flagged so nothing is double-booked."
        actions={
        <Button variant="primary" icon={UserPlus} onClick={() => openShiftForm({})}>
            Assign shift
          </Button>
        } />
      
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setWeekStart(format(startOfWeek(parseISO(TODAY)), 'yyyy-MM-dd'))}>
            This week
          </Button>
          <button onClick={() => setWeekStart(addDaysStr(weekStart, -7))} className="rounded-lg p-1.5 hover:bg-cream-2" aria-label="Previous week">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button onClick={() => setWeekStart(addDaysStr(weekStart, 7))} className="rounded-lg p-1.5 hover:bg-cream-2" aria-label="Next week">
            <ChevronRight className="h-5 w-5" />
          </button>
          <p className="text-[15px] font-semibold">
            {fmtDate(days[0], 'MMM d')} – {fmtDate(days[6], 'MMM d, yyyy')}
          </p>
        </div>
        <div className="flex rounded-lg bg-cream-2 p-0.5">
          {(['grid', 'list'] as const).map((v) =>
          <button key={v} onClick={() => setView(v)} aria-pressed={view === v} className={cx('rounded-md px-3 py-1.5 text-[13px] font-medium capitalize transition-colors', view === v ? 'bg-white shadow-card' : 'text-ink-2')}>
              {v === 'grid' ? 'Calendar' : 'List'}
            </button>
          )}
        </div>
      </div>

      {view === 'grid' ?
      <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-card">
          <table className="w-full border-collapse text-xs" style={{ minWidth: 980 }}>
            <thead>
              <tr className="bg-cream/60">
                <th className="w-48 border-b border-r border-line px-3 py-2 text-left font-medium text-ink-3">Employee</th>
                {days.map((d) =>
              <th key={d} className={cx('border-b border-line px-2 py-2 text-left font-medium', d === TODAY ? 'text-berry-700' : 'text-ink-3')}>
                    {fmtDate(d, 'EEE d')}
                  </th>
              )}
                <th className="border-b border-l border-line px-3 py-2 text-right font-medium text-ink-3">Hours</th>
              </tr>
            </thead>
            <tbody>
              {emps.map((emp) => {
              const mine = weekEvents.filter((e) => e.employeeIds.includes(emp.id));
              const hours = mine.reduce((s, e) => s + hoursBetween(e.start, e.end), 0);
              const onLeave = emp.status === 'on_leave';
              return (
                <tr key={emp.id}>
                    <th scope="row" className="border-b border-r border-line px-3 py-2 text-left font-normal">
                      <Link to={`/employees/${emp.id}`} className="flex items-center gap-2">
                        <Avatar name={emp.name} size="sm" />
                        <span>
                          <span className="block text-[13px] font-medium text-ink hover:text-berry-700">{emp.name}</span>
                          <span className="block text-[11px] text-ink-3">{onLeave ? 'On leave' : emp.role}</span>
                        </span>
                      </Link>
                    </th>
                    {days.map((d) => {
                    const dayShifts = mine.filter((e) => e.date === d).sort((a, b) => a.start.localeCompare(b.start));
                    const off = emp.unavailable.filter((u) => u.date === d);
                    return (
                      <td key={d} className={cx('group h-20 border-b border-line p-1 align-top', (onLeave || off.length > 0) && 'hatch')}>
                          <div className="space-y-1">
                            {off.map((u, i) =>
                          <div key={i} className="flex items-center gap-1 rounded bg-cream-2 px-1.5 py-1 text-[11px] text-ink-2">
                                <CalendarOff className="h-3 w-3 shrink-0" aria-hidden />
                                <span className="truncate">{u.start === '00:00' ? 'Off all day' : `Off ${fmtTime(u.start)}–${fmtTime(u.end)}`}</span>
                              </div>
                          )}
                            {dayShifts.map((e) => {
                            const problem = shiftConflict(emp.id, e.id);
                            return (
                              <Link
                                key={e.id}
                                to={`/events/${e.id}`}
                                title={problem ?? e.name}
                                className={cx('block rounded px-1.5 py-1 text-[11px] leading-tight transition-[filter] hover:brightness-95', problem ? 'bg-bad-100 text-bad-700 ring-1 ring-bad-500' : 'bg-berry-50 text-berry-800')}>
                                
                                  <span className="flex items-center gap-1 font-semibold">
                                    {problem && <OctagonAlert className="h-3 w-3 shrink-0" aria-label={problem} />}
                                    {fmtTime(e.start)}–{fmtTime(e.end)}
                                  </span>
                                  <span className="block truncate">{e.name}</span>
                                  <span className="block truncate opacity-80">{store.trailers.find((t) => t.id === e.trailerId)?.code ?? 'No trailer'}</span>
                                </Link>);

                          })}
                            {!onLeave && dayShifts.length === 0 && off.length === 0 && d >= TODAY &&
                          <button onClick={() => openShiftForm({ employeeId: emp.id })} className="flex w-full items-center justify-center rounded py-2 text-ink-3 opacity-0 transition-opacity hover:bg-cream focus:opacity-100 group-hover:opacity-100" aria-label={`Assign ${emp.name} on ${fmtDate(d)}`}>
                                <Plus className="h-4 w-4" />
                              </button>
                          }
                          </div>
                        </td>);

                  })}
                    <td className="border-b border-l border-line px-3 text-right text-[13px] font-medium tabular">{hours ? fmtNum(hours, 1) : '—'}</td>
                  </tr>);

            })}
            </tbody>
          </table>
        </div> :

      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
          <table className="w-full text-sm">
            <thead className="border-b border-line bg-cream/60 text-left text-xs text-ink-3">
              <tr>
                <th className="px-4 py-2.5 font-medium">Employee</th>
                <th className="px-4 py-2.5 font-medium">Date & time</th>
                <th className="px-4 py-2.5 font-medium">Event</th>
                <th className="px-4 py-2.5 font-medium">Trailer</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {weekEvents.
            flatMap((e) => e.employeeIds.map((empId) => ({ e, empId }))).
            sort((a, b) => (a.e.date + a.e.start).localeCompare(b.e.date + b.e.start)).
            map(({ e, empId }) => {
              const problem = shiftConflict(empId, e.id);
              return (
                <tr key={e.id + empId}>
                      <td className="px-4 py-2.5">{store.employees.find((x) => x.id === empId)?.name}</td>
                      <td className="px-4 py-2.5 text-ink-2">
                        {fmtDate(e.date)} · {fmtTimeRange(e.start, e.end)}
                      </td>
                      <td className="px-4 py-2.5">
                        <Link to={`/events/${e.id}`} className="hover:text-berry-700">
                          {e.name}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5 text-ink-2">{store.trailers.find((t) => t.id === e.trailerId)?.code ?? '—'}</td>
                      <td className="px-4 py-2.5">{problem ? <StatusChip tone="bad" label={problem} /> : <StatusChip {...eventStatusMeta[e.status]} />}</td>
                    </tr>);

            })}
            </tbody>
          </table>
        </div>
      }
      <div className="mt-3 flex flex-wrap gap-5 text-xs text-ink-2">
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-berry-50 ring-1 ring-berry-200" /> Shift</span>
        <span className="flex items-center gap-1.5"><OctagonAlert className="h-3.5 w-3.5 text-bad-600" /> Overlap or unavailable</span>
        <span className="flex items-center gap-1.5"><span className="hatch h-3 w-3 rounded border border-line" /> Unavailable / on leave</span>
      </div>
    </Page>);

}