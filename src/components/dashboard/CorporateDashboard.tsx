import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AlertTriangle, FileWarning, OctagonAlert, Package, SearchX, Truck } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { useScoped } from '../../hooks/useScoped';
import { Page } from '../layout/Page';
import { PageHeader } from '../ui/PageHeader';
import { Panel } from '../ui/Panel';
import { DemoBadge } from '../ui/DemoBadge';
import { FilterSelect } from '../ui/FilterSelect';
import { EmptyState } from '../ui/EmptyState';
import { Button } from '../ui/Button';
import { AttentionList } from './AttentionList';
import { weeklySales } from '../../data/salesHistory';
import { RANGE_LABELS, TODAY, fmtDateTime, inRange, relTime } from '../../utils/date';
import { eventEnded, findReport } from '../../utils/reports';
import { isCounted, summarize } from '../../utils/sales';
import { cx, fmtMoney, pct } from '../../utils/format';

const LINE_COLORS: Record<string, string> = { 'f-jc': '#BF2F77', 'f-knx': '#2F5F95', 'f-avl': '#A86A06' };

export function CorporateDashboard() {
  const store = useStore();
  const scoped = useScoped();
  const navigate = useNavigate();
  const [fFranchise, setFFranchise] = useState('all');
  const [fTerritory, setFTerritory] = useState('all');
  const [fTrailer, setFTrailer] = useState('all');
  const [fCategory, setFCategory] = useState('all');

  const match = (e: {franchiseId: string;territoryId: string;trailerId: string | null;category: string;}) =>
  (fFranchise === 'all' || e.franchiseId === fFranchise) && (
  fTerritory === 'all' || e.territoryId === fTerritory) && (
  fTrailer === 'all' || e.trailerId === fTrailer) && (
  fCategory === 'all' || e.category === fCategory);

  const events = scoped.events.filter(match);
  const inPeriod = events.filter((e) => inRange(e.date, store.dateRange) && e.status !== 'cancelled');
  const ended = inPeriod.filter(eventEnded);
  const submitted = ended.filter((e) => {
    const r = findReport(e.id, store.reports);
    return r && isCounted(r);
  });
  const periodReports = submitted.map((e) => findReport(e.id, store.reports)!).filter(Boolean);
  const sum = summarize(periodReports);
  const upcoming = events.filter((e) => e.date >= TODAY && e.status !== 'cancelled' && e.status !== 'completed');
  const missing = scoped.missing.filter(match);
  const noTrailer = upcoming.filter((e) => !e.trailerId);
  const conflicts = scoped.conflictEvents.filter(match);
  const filtersActive = [fFranchise, fTerritory, fTrailer, fCategory].some((v) => v !== 'all');

  const byFranchise = useMemo(
    () =>
    store.franchises.map((f) => {
      const evs = ended.filter((e) => e.franchiseId === f.id);
      const reps = evs.map((e) => findReport(e.id, store.reports)).filter((r): r is NonNullable<typeof r> => !!r && isCounted(r));
      return { id: f.id, name: f.shortName, sales: summarize(reps).total, needed: evs.length, submitted: reps.length };
    }),
    [ended, store.franchises, store.reports]
  );

  const byTerritory = scoped.territories.
  filter((t) => t.franchiseId).
  map((t) => ({
    id: t.id,
    name: t.name,
    completed: ended.filter((e) => e.territoryId === t.id).length,
    upcoming: upcoming.filter((e) => e.territoryId === t.id).length
  }));
  const maxTerritory = Math.max(1, ...byTerritory.map((t) => t.completed + t.upcoming));

  const exceptions = scoped.audit.filter((a) => ['Edited submitted report', 'Requested correction', 'Recorded count variance', 'Stock adjustment', 'Changed status', 'Cancelled event'].includes(a.action)).slice(0, 6);

  return (
    <Page>
      <PageHeader
        title="Network overview"
        description={`All Diggy Donuts franchises · ${RANGE_LABELS[store.dateRange]}`}
        meta={<DemoBadge />}
        actions={
        <>
            <FilterSelect label="Franchise" value={fFranchise} onChange={setFFranchise} options={[{ value: 'all', label: 'All franchises' }, ...store.franchises.map((f) => ({ value: f.id, label: f.shortName }))]} />
            <FilterSelect label="Territory" value={fTerritory} onChange={setFTerritory} options={[{ value: 'all', label: 'All territories' }, ...scoped.territories.filter((t) => t.franchiseId).map((t) => ({ value: t.id, label: t.name }))]} />
            <FilterSelect label="Trailer" value={fTrailer} onChange={setFTrailer} options={[{ value: 'all', label: 'All trailers' }, ...scoped.trailers.map((t) => ({ value: t.id, label: t.code }))]} />
            <FilterSelect label="Category" value={fCategory} onChange={setFCategory} options={[{ value: 'all', label: 'All categories' }, ...store.settings.categories.map((c) => ({ value: c.id, label: c.label }))]} />
          </>
        } />
      

      {filtersActive && events.length === 0 ?
      <Panel>
          <EmptyState
          icon={SearchX}
          title="No data for these filters"
          body="No events match this franchise, territory, trailer and category combination."
          action={<Button onClick={() => {setFFranchise('all');setFTerritory('all');setFTrailer('all');setFCategory('all');}}>Clear filters</Button>} />
        
        </Panel> :

      <div className="space-y-6">
          <div className="grid grid-cols-2 divide-line overflow-hidden rounded-2xl border border-line bg-white shadow-card sm:grid-cols-3 lg:grid-cols-6 lg:divide-x">
            <Fact label="Active franchisees" value={store.franchises.filter((f) => f.status !== 'paused').length} to="/franchisees" />
            <Fact label="Active territories" value={store.territories.filter((t) => t.franchiseId).length} sub={`${store.territories.filter((t) => !t.franchiseId).length} open`} to="/territories" />
            <Fact label="Registered trailers" value={store.trailers.length} sub={`${store.trailers.filter((t) => t.baseStatus !== 'available').length} out of service`} to="/trailers" />
            <Fact label="Upcoming events" value={upcoming.length} to="/events?scope=upcoming" />
            <Fact label="Events completed" value={ended.length} sub="in period" to="/events?scope=past" />
            <div className="col-span-2 px-5 py-4 sm:col-span-1">
              <p className="text-xs text-ink-3">Report submission</p>
              <p className={cx('font-display text-2xl font-semibold tabular', ended.length && submitted.length / ended.length < 0.8 ? 'text-warn-700' : 'text-ink')}>
                {ended.length ? pct(submitted.length / ended.length) : '—'}
              </p>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-cream-2">
                <div className="h-full rounded-full bg-berry-600" style={{ width: ended.length ? `${submitted.length / ended.length * 100}%` : 0 }} />
              </div>
              <p className="mt-1 text-[11px] text-ink-3">
                {submitted.length} of {ended.length} events
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Panel
            className="lg:col-span-2"
            title="Sales over time"
            description="Weekly reported sales by franchise. Select a week to open the sales-by-date report."
            action={
            <div className="text-right">
                  <p className="font-display text-2xl font-semibold tabular">{fmtMoney(sum.total)}</p>
                  <p className="text-xs text-ink-3">reported in period</p>
                </div>
            }>
            
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklySales} margin={{ top: 8, right: 8, left: -8, bottom: 0 }} onClick={() => navigate('/reports?type=sales-by-date')}>
                    <CartesianGrid stroke="#ECE2D7" vertical={false} />
                    <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#74686D' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#74686D' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                    <Tooltip formatter={(v: number) => fmtMoney(v)} contentStyle={{ borderRadius: 12, border: '1px solid #ECE2D7', fontSize: 13 }} />
                    <Legend iconType="plainline" wrapperStyle={{ fontSize: 12 }} />
                    {store.franchises.
                  filter((f) => fFranchise === 'all' || f.id === fFranchise).
                  map((f) =>
                  <Line key={f.id} type="monotone" dataKey={f.id} name={f.shortName} stroke={LINE_COLORS[f.id]} strokeWidth={2.25} dot={false} activeDot={{ r: 4, cursor: 'pointer' }} />
                  )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-2 text-[11px] text-ink-3">Week of Oct 12 is in progress. Weekly history is illustrative demo data.</p>
            </Panel>

            <AttentionList
            items={[
            { label: 'Reports missing or overdue', detail: missing.map((e) => e.name).slice(0, 2).join(', '), count: missing.length, to: '/missing-reports', icon: FileWarning, tone: 'bad' },
            { label: 'Scheduling conflicts', detail: conflicts.map((e) => e.name).slice(0, 2).join(', '), count: conflicts.length, to: '/events?issues=1', icon: OctagonAlert, tone: 'bad' },
            { label: 'Events without a trailer', detail: noTrailer.map((e) => e.name).join(', '), count: noTrailer.length, to: '/events?issues=1', icon: Truck, tone: 'warn' },
            { label: 'Low-stock alerts', detail: scoped.lowStock.map((l) => `${l.item.name} (${store.franchises.find((f) => f.id === l.item.franchiseId)?.shortName})`).join(', '), count: scoped.lowStock.length, to: '/inventory?tab=low', icon: Package, tone: 'warn' },
            { label: 'Variances awaiting review', detail: 'Count differences reported by franchises', count: scoped.awaitingVariances.length, to: '/inventory?tab=variances', icon: AlertTriangle, tone: 'info' }]
            } />
          
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Panel title="Sales by franchisee" description={RANGE_LABELS[store.dateRange]}>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byFranchise} layout="vertical" margin={{ left: 8, right: 16 }}>
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" width={88} tick={{ fontSize: 12, fill: '#574C51' }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(v: number) => fmtMoney(v)} cursor={{ fill: '#F4ECE0' }} contentStyle={{ borderRadius: 12, border: '1px solid #ECE2D7', fontSize: 13 }} />
                    <Bar dataKey="sales" name="Sales" fill="#BF2F77" radius={[0, 6, 6, 0]} barSize={18} cursor="pointer" onClick={(d: {id: string;}) => navigate(`/reports?type=sales-by-franchise&franchise=${d.id}`)} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            <Panel title="Report completion" description="Submitted reports for events that have ended">
              <ul className="space-y-4">
                {byFranchise.map((f) => {
                const rate = f.needed ? f.submitted / f.needed : null;
                return (
                  <li key={f.id}>
                      <Link to={`/missing-reports?franchise=${f.id}`} className="group block">
                        <div className="flex items-baseline justify-between text-sm">
                          <span className="font-medium group-hover:text-berry-700">{f.name}</span>
                          <span className="tabular text-ink-2">
                            {f.submitted}/{f.needed} {rate !== null && <span className={cx('ml-1 font-semibold', rate < 0.8 ? 'text-bad-700' : 'text-ok-700')}>{pct(rate)}</span>}
                          </span>
                        </div>
                        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-cream-2">
                          <div className={cx('h-full rounded-full', rate !== null && rate < 0.8 ? 'bg-bad-500' : 'bg-ok-500')} style={{ width: rate !== null ? `${rate * 100}%` : 0 }} />
                        </div>
                      </Link>
                    </li>);

              })}
              </ul>
            </Panel>

            <Panel title="Event activity by territory" description="Completed in period · upcoming">
              <ul className="space-y-3">
                {byTerritory.map((t) =>
              <li key={t.id}>
                    <Link to={`/territories/${t.id}`} className="group block">
                      <div className="flex items-baseline justify-between text-sm">
                        <span className="font-medium group-hover:text-berry-700">{t.name}</span>
                        <span className="text-xs text-ink-3 tabular">
                          {t.completed} done · {t.upcoming} upcoming
                        </span>
                      </div>
                      <div className="mt-1.5 flex h-2 overflow-hidden rounded-full bg-cream-2">
                        <div className="h-full bg-plum-3" style={{ width: `${t.completed / maxTerritory * 100}%` }} />
                        <div className="h-full bg-berry-200" style={{ width: `${t.upcoming / maxTerritory * 100}%` }} />
                      </div>
                    </Link>
                  </li>
              )}
              </ul>
              <div className="mt-4 flex gap-4 text-[11px] text-ink-3">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-plum-3" /> Completed</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-berry-200" /> Upcoming</span>
              </div>
            </Panel>
          </div>

          <Panel title="Recent operational exceptions" action={<Link to="/audit" className="text-[13px] font-medium text-berry-700 hover:underline">Open audit trail</Link>}>
            <ul className="divide-y divide-line">
              {exceptions.map((a) =>
            <li key={a.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2.5 text-sm">
                  <span className="w-28 shrink-0 text-xs text-ink-3" title={fmtDateTime(a.at)}>{relTime(a.at)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="font-medium">{a.action}</span> <span className="text-ink-2">· {a.recordLabel}</span>
                    {a.reason && <span className="block truncate text-xs text-ink-3">“{a.reason}”</span>}
                  </span>
                  <span className="text-xs text-ink-3">
                    {a.user} · {store.franchises.find((f) => f.id === a.franchiseId)?.shortName ?? 'Corporate'}
                  </span>
                </li>
            )}
            </ul>
          </Panel>
        </div>
      }
    </Page>);

}

function Fact({ label, value, sub, to }: {label: string;value: number;sub?: string;to: string;}) {
  return (
    <Link to={to} className="group border-b border-line px-5 py-4 transition-colors hover:bg-cream/60 lg:border-b-0">
      <p className="text-xs text-ink-3">{label}</p>
      <p className="font-display text-2xl font-semibold tabular group-hover:text-berry-700">{value}</p>
      {sub && <p className="text-[11px] text-ink-3">{sub}</p>}
    </Link>);

}