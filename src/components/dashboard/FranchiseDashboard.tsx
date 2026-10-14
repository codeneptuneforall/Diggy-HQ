import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  CalendarPlus,
  ClipboardEdit,
  FileWarning,
  ListChecks,
  MapPin,
  OctagonAlert,
  Package,
  PackagePlus,
  Receipt,
  Truck,
  UserPlus,
  Users,
  BellRing } from
'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { useUI } from '../../contexts/UIContext';
import { useScoped } from '../../hooks/useScoped';
import { Page } from '../layout/Page';
import { Panel } from '../ui/Panel';
import { Button } from '../ui/Button';
import { StatusChip } from '../ui/StatusChip';
import { Avatar } from '../ui/Avatar';
import { DemoBadge } from '../ui/DemoBadge';
import { CategoryTag } from '../ui/CategoryTag';
import { AttentionList } from './AttentionList';
import { RANGE_LABELS, TODAY, addDaysStr, fmtDate, fmtTimeRange, hoursBetween, inRange } from '../../utils/date';
import { findReport } from '../../utils/reports';
import { fmtMetric, isCounted, reportTotal, summarize } from '../../utils/sales';
import { eventStatusMeta, trailerStatus, trailerStatusMeta } from '../../utils/status';
import { cx, fmtMoney, fmtNum } from '../../utils/format';

export function FranchiseDashboard() {
  const store = useStore();
  const scoped = useScoped();
  const ui = useUI();
  const navigate = useNavigate();
  const franchise = store.franchises.find((f) => f.id === store.scopeIds[0]);
  const firstName = store.role === 'franchise' ? store.user.name.split(' ')[0] : null;

  const today = scoped.events.filter((e) => e.date === TODAY && e.status !== 'cancelled').sort((a, b) => a.start.localeCompare(b.start));
  const nextWeek = scoped.events.
  filter((e) => e.date > TODAY && e.date <= addDaysStr(TODAY, 10) && e.status !== 'cancelled').
  sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));

  const periodReports = scoped.reports.filter((r) => isCounted(r) && inRange(r.date, store.dateRange));
  const s = summarize(periodReports);
  const corrections = scoped.reports.filter((r) => r.status === 'needs_correction');
  const weekShifts = scoped.employees.
  filter((e) => e.status === 'active').
  map((emp) => {
    const shifts = scoped.events.filter((e) => e.employeeIds.includes(emp.id) && e.date >= TODAY && e.date <= addDaysStr(TODAY, 6) && e.status !== 'cancelled');
    return { emp, shifts: shifts.length, hours: shifts.reduce((h, e) => h + hoursBetween(e.start, e.end), 0) };
  });

  const quick = [
  { label: 'Create event', icon: CalendarPlus, onClick: () => ui.openEventForm({ mode: 'create' }) },
  { label: 'Add customer', icon: UserPlus, onClick: () => ui.openCustomerForm({}) },
  { label: 'Assign employee', icon: Users, onClick: () => ui.openShiftForm({}) },
  { label: 'Submit sales report', icon: Receipt, onClick: () => navigate('/sales-reports/new') },
  { label: 'Record inventory', icon: PackagePlus, onClick: () => ui.openStockForm({}) },
  { label: 'Review alerts', icon: BellRing, onClick: () => navigate('/notifications') }];


  return (
    <Page>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-ink-3">{fmtDate(TODAY, 'EEEE, MMMM d')}</p>
          <h1 className="font-display text-[28px] font-semibold leading-tight">
            {firstName ? `Good morning, ${firstName}` : franchise?.name}
          </h1>
        </div>
        <DemoBadge />
      </div>

      <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
        {quick.map((q) =>
        <button
          key={q.label}
          onClick={q.onClick}
          className="flex items-center gap-2.5 rounded-xl border border-line bg-white px-3.5 py-3 text-left text-sm font-medium shadow-card transition-[border-color,transform] duration-150 hover:border-berry-200 active:scale-[0.98]">
          
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-berry-50 text-berry-700">
              <q.icon className="h-4 w-4" aria-hidden />
            </span>
            <span className="whitespace-nowrap">{q.label}</span>
          </button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
            <div className="flex items-center justify-between bg-plum px-5 py-3 text-white">
              <h2 className="font-display text-lg font-semibold">Today</h2>
              <span className="text-[13px] text-plum-muted">{today.length ? `${today.length} event${today.length > 1 ? 's' : ''}` : 'No events'}</span>
            </div>
            {today.length === 0 ?
            <div className="px-5 py-8 text-center">
                <p className="font-medium">No events scheduled today</p>
                <p className="mt-1 text-sm text-ink-3">A good day to follow up with customers or count inventory.</p>
              </div> :

            <ul className="divide-y divide-line">
                {today.map((e) => {
                const trailer = store.trailers.find((t) => t.id === e.trailerId);
                const report = findReport(e.id, store.reports);
                return (
                  <li key={e.id} className="grid gap-4 px-5 py-4 md:grid-cols-[140px_1fr_auto]">
                      <div>
                        <p className="font-display text-xl font-semibold tabular">{fmtTimeRange(e.start, e.end)}</p>
                        <StatusChip {...eventStatusMeta[e.status]} className="mt-1" />
                      </div>
                      <div className="min-w-0">
                        <Link to={`/events/${e.id}`} className="text-[15px] font-semibold hover:text-berry-700">
                          {e.name}
                        </Link>
                        <p className="mt-0.5 flex items-center gap-1 text-sm text-ink-2">
                          <MapPin className="h-3.5 w-3.5" aria-hidden /> {e.venue}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-ink-2">
                          <span className="flex items-center gap-1.5">
                            <Truck className="h-3.5 w-3.5" aria-hidden /> {trailer?.name ?? 'No trailer'}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="flex -space-x-1.5">
                              {e.employeeIds.map((id) =>
                            <Avatar key={id} name={store.employees.find((x) => x.id === id)?.name ?? ''} size="sm" />
                            )}
                            </span>
                            {e.employeeIds.map((id) => store.employees.find((x) => x.id === id)?.name.split(' ')[0]).join(', ')}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-start">
                        {report && isCounted(report) ?
                      <Button size="sm" onClick={() => navigate(`/sales-reports/${report.id}`)}>View report</Button> :

                      <Button size="sm" variant="subtle" icon={ClipboardEdit} onClick={() => navigate(`/sales-reports/new?event=${e.id}`)}>
                            Report after event
                          </Button>
                      }
                      </div>
                    </li>);

              })}
              </ul>
            }
          </section>

          <Panel
            title={`Performance · ${RANGE_LABELS[store.dateRange]}`}
            description={`${periodReports.length} submitted event reports`}
            action={<Link to="/reports?type=sales-by-event" className="text-[13px] font-medium text-berry-700 hover:underline">Full report</Link>}>
            
            <div className="grid gap-6 md:grid-cols-[1.1fr_1fr]">
              <div>
                <p className="text-xs text-ink-3">Total reported sales</p>
                <p className="font-display text-4xl font-semibold tabular">{fmtMoney(s.total)}</p>
                <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-cream-2" aria-hidden>
                  <div className="bg-plum-3" style={{ width: s.total ? `${s.card / s.total * 100}%` : 0 }} />
                  <div className="bg-berry-400" style={{ width: s.total ? `${s.cash / s.total * 100}%` : 0 }} />
                  <div className="bg-warn-500" style={{ width: s.total ? `${s.other / s.total * 100}%` : 0 }} />
                </div>
                <dl className="mt-3 grid grid-cols-3 gap-2 text-sm">
                  <Split color="bg-plum-3" label="Card" value={s.card} />
                  <Split color="bg-berry-400" label="Cash" value={s.cash} />
                  <Split color="bg-warn-500" label={store.settings.otherPaymentLabel} value={s.other} />
                </dl>
              </div>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-4 border-line md:border-l md:pl-6">
                <Metric label="Sales per hour" value={fmtMetric(s.perHour)} hint="÷ operating hours" />
                <Metric label="Sales per batch" value={fmtMetric(s.perBatch)} hint="÷ batches used" />
                <Metric label="Employee hours" value={fmtNum(s.empHours, 1)} hint="reported crew hours" />
                <Metric label="Batches used" value={fmtNum(s.batches)} hint={store.settings.batchUnit} />
              </dl>
            </div>
            <div className="mt-6 border-t border-line pt-4">
              <p className="mb-2 text-[13px] font-medium text-ink-2">Sales by event</p>
              <ul className="space-y-2">
                {periodReports.
                slice().
                sort((a, b) => reportTotal(b) - reportTotal(a)).
                slice(0, 5).
                map((r) => {
                  const ev = store.events.find((e) => e.id === r.eventId);
                  const max = Math.max(...periodReports.map(reportTotal));
                  return (
                    <li key={r.id}>
                        <Link to={`/sales-reports/${r.id}`} className="group grid grid-cols-[1fr_auto] items-center gap-3 text-sm">
                          <span className="min-w-0">
                            <span className="block truncate group-hover:text-berry-700">
                              {ev?.name} <span className="text-ink-3">· {fmtDate(r.date, 'MMM d')}</span>
                            </span>
                            <span className="mt-1 block h-1.5 rounded-full bg-cream-2">
                              <span className="block h-full rounded-full bg-berry-500" style={{ width: `${reportTotal(r) / max * 100}%` }} />
                            </span>
                          </span>
                          <span className="font-medium tabular">{fmtMoney(reportTotal(r))}</span>
                        </Link>
                      </li>);

                })}
              </ul>
            </div>
          </Panel>

          <Panel title="Coming up" description="Next 10 days" action={<Link to="/calendar" className="text-[13px] font-medium text-berry-700 hover:underline">Open calendar</Link>}>
            <ul className="divide-y divide-line">
              {nextWeek.map((e) => {
                const issues = scoped.issuesByEvent.get(e.id) ?? [];
                const conflict = issues.some((i) => i.severity === 'conflict');
                return (
                  <li key={e.id}>
                    <Link to={`/events/${e.id}`} className="grid grid-cols-[72px_1fr_auto] items-center gap-3 py-2.5 transition-colors hover:bg-cream/50">
                      <span className="text-[13px] leading-tight">
                        <span className="block font-semibold">{fmtDate(e.date, 'EEE d')}</span>
                        <span className="block text-ink-3">{fmtTimeRange(e.start, e.end).split(' – ')[0]}</span>
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">{e.name}</span>
                        <CategoryTag id={e.category} />
                      </span>
                      {issues.length ?
                      <StatusChip tone={conflict ? 'bad' : 'warn'} label={conflict ? 'Conflict' : issues[0].title} icon={conflict ? OctagonAlert : AlertTriangle} /> :

                      <StatusChip {...eventStatusMeta[e.status]} />
                      }
                    </Link>
                  </li>);

              })}
            </ul>
          </Panel>
        </div>

        <div className="space-y-6">
          <AttentionList
            title="Needs attention today"
            items={[
            { label: 'Sales reports pending', detail: scoped.missing.map((e) => e.name).join(', '), count: scoped.missing.length, to: '/missing-reports', icon: FileWarning, tone: 'bad' },
            { label: 'Reports needing correction', detail: 'Requested by reviewer', count: corrections.length, to: '/sales-reports?status=needs_correction', icon: ClipboardEdit, tone: 'warn' },
            { label: 'Scheduling conflicts', detail: scoped.conflictEvents.map((e) => e.name).join(', '), count: scoped.conflictEvents.length, to: '/events?issues=1', icon: OctagonAlert, tone: 'bad' },
            { label: 'Low-stock items', detail: scoped.lowStock.map((l) => l.item.name).join(', '), count: scoped.lowStock.length, to: '/inventory?tab=low', icon: Package, tone: 'warn' },
            { label: 'Inventory variances', detail: 'Awaiting your review', count: scoped.awaitingVariances.length, to: '/inventory?tab=variances', icon: AlertTriangle, tone: 'info' },
            { label: 'Follow-ups due', detail: scoped.followUpsDue.map((f) => store.customers.find((c) => c.id === f.customerId)?.name).join(', '), count: scoped.followUpsDue.length, to: '/follow-ups', icon: ListChecks, tone: 'info' }]
            } />
          

          <Panel title="Trailers" action={<Link to="/trailers?tab=availability" className="text-[13px] font-medium text-berry-700 hover:underline">Availability</Link>}>
            {scoped.trailers.length === 0 ?
            <p className="text-sm text-ink-3">No trailers registered for this franchise.</p> :

            <ul className="space-y-3">
                {scoped.trailers.map((t) => {
                const st = trailerStatus(t, store.events);
                const next = store.events.
                filter((e) => e.trailerId === t.id && e.date >= TODAY && e.status !== 'cancelled' && e.status !== 'completed').
                sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start))[0];
                return (
                  <li key={t.id}>
                      <Link to={`/trailers/${t.id}`} className="flex items-center justify-between gap-3 hover:text-berry-700">
                        <span className="min-w-0">
                          <span className="block text-sm font-medium">{t.name}</span>
                          <span className="block truncate text-xs text-ink-3">{next ? `Next: ${next.name} · ${fmtDate(next.date, 'EEE MMM d')}` : 'No upcoming bookings'}</span>
                        </span>
                        <StatusChip {...trailerStatusMeta[st]} />
                      </Link>
                    </li>);

              })}
              </ul>
            }
          </Panel>

          <Panel title="Crew this week" description="Scheduled shifts · next 7 days" action={<Link to="/schedule" className="text-[13px] font-medium text-berry-700 hover:underline">Schedule</Link>}>
            <ul className="space-y-2.5">
              {weekShifts.map(({ emp, shifts, hours }) =>
              <li key={emp.id} className="flex items-center gap-3 text-sm">
                  <Avatar name={emp.name} size="sm" />
                  <span className="flex-1">{emp.name}</span>
                  <span className={cx('tabular', shifts ? 'text-ink' : 'text-ink-3')}>
                    {shifts ? `${shifts} shift${shifts > 1 ? 's' : ''} · ${fmtNum(hours, 1)}h` : 'No shifts'}
                  </span>
                </li>
              )}
            </ul>
          </Panel>
        </div>
      </div>
    </Page>);

}

function Split({ color, label, value }: {color: string;label: string;value: number;}) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-xs text-ink-3">
        <span className={cx('h-2 w-2 rounded-sm', color)} aria-hidden /> {label}
      </dt>
      <dd className="font-medium tabular">{fmtMoney(value)}</dd>
    </div>);

}

function Metric({ label, value, hint }: {label: string;value: string;hint: string;}) {
  return (
    <div>
      <dt className="text-xs text-ink-3">{label}</dt>
      <dd className="font-display text-xl font-semibold tabular">{value}</dd>
      <dd className="text-[11px] text-ink-3">{hint}</dd>
    </div>);

}