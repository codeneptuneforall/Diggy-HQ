import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { addDays, addMonths, format, parseISO, startOfWeek } from 'date-fns';
import { AlertTriangle, ChevronLeft, ChevronRight, CircleDashed, OctagonAlert, Plus, Search } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { useUI } from '../../contexts/UIContext';
import { useScoped } from '../../hooks/useScoped';
import { Page } from '../../components/layout/Page';
import { Button } from '../../components/ui/Button';
import { FilterSelect } from '../../components/ui/FilterSelect';
import { MonthView } from '../../components/calendar/MonthView';
import { TimeGridView, type GridColumn } from '../../components/calendar/TimeGridView';
import { AgendaView } from '../../components/calendar/AgendaView';
import { TODAY, addDaysStr, fmtDate } from '../../utils/date';
import { cx } from '../../utils/format';
import { getEventIssues, type EventIssue } from '../../utils/conflicts';

type View = 'month' | 'week' | 'day' | 'agenda';

export function CalendarPage() {
  const store = useStore();
  const scoped = useScoped();
  const { openEventForm } = useUI();
  const [params] = useSearchParams();
  const [view, setView] = useState<View>(params.get('view') as View || 'month');
  const [cursor, setCursor] = useState(params.get('date') ?? TODAY);
  const highlightId = params.get('highlight');
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('all');
  const [trailer, setTrailer] = useState('all');
  const [territory, setTerritory] = useState('all');
  const [showCancelled, setShowCancelled] = useState(true);

  const events = scoped.events.filter(
    (e) =>
    (category === 'all' || e.category === category) && (
    trailer === 'all' || (trailer === 'none' ? !e.trailerId : e.trailerId === trailer)) && (
    territory === 'all' || e.territoryId === territory) && (
    showCancelled || e.status !== 'cancelled') && (
    !q || `${e.name} ${e.venue} ${e.contactName}`.toLowerCase().includes(q.toLowerCase()))
  );

  const issuesByEvent = useMemo(() => {
    const m = new Map<string, EventIssue[]>();
    events.forEach((e) => {
      const iss = getEventIssues(e, store.events, store.employees, store.trailers);
      if (iss.length) m.set(e.id, iss);
    });
    return m;
  }, [events, store.events, store.employees, store.trailers]);

  const move = (dir: 1 | -1) => {
    const c = parseISO(cursor);
    if (view === 'month') setCursor(format(addMonths(c, dir), 'yyyy-MM-dd'));else
    if (view === 'week') setCursor(addDaysStr(cursor, 7 * dir));else
    if (view === 'day') setCursor(addDaysStr(cursor, dir));else
    setCursor(addDaysStr(cursor, 14 * dir));
  };

  const weekStart = startOfWeek(parseISO(cursor));
  const title =
  view === 'month' ?
  fmtDate(cursor, 'MMMM yyyy') :
  view === 'week' ?
  `${format(weekStart, 'MMM d')} – ${format(addDays(weekStart, 6), 'MMM d, yyyy')}` :
  view === 'day' ?
  fmtDate(cursor, 'EEEE, MMMM d') :
  `${fmtDate(cursor, 'MMM d')} – ${fmtDate(addDaysStr(cursor, 20), 'MMM d')}`;

  const weekColumns: GridColumn[] = Array.from({ length: 7 }, (_, i) => {
    const d = format(addDays(weekStart, i), 'yyyy-MM-dd');
    return { key: d, label: fmtDate(d, 'EEE d'), isToday: d === TODAY, events: events.filter((e) => e.date === d) };
  });

  const dayTrailers = scoped.trailers.filter((t) => trailer === 'all' || t.id === trailer);
  const dayColumns: GridColumn[] = [
  ...dayTrailers.map((t) => ({
    key: t.id,
    label: t.name,
    sub: t.baseStatus === 'maintenance' ? 'Maintenance' : t.baseStatus === 'unavailable' ? 'Unavailable' : store.role === 'corporate' ? store.franchises.find((f) => f.id === t.franchiseId)?.shortName : 'Available',
    isToday: cursor === TODAY,
    muted: t.baseStatus !== 'available',
    events: events.filter((e) => e.date === cursor && e.trailerId === t.id)
  })),
  { key: 'none', label: 'No trailer', sub: 'Needs assignment', isToday: cursor === TODAY, events: events.filter((e) => e.date === cursor && !e.trailerId) }];


  const agendaEvents = events.filter((e) => e.date >= cursor && e.date <= addDaysStr(cursor, 20));

  return (
    <Page wide>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h1 className="mr-2 font-display text-[28px] font-semibold">Calendar</h1>
          <Button size="sm" onClick={() => setCursor(TODAY)}>
            Today
          </Button>
          <div className="flex">
            <button onClick={() => move(-1)} className="rounded-lg p-1.5 text-ink-2 hover:bg-cream-2" aria-label="Previous">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={() => move(1)} className="rounded-lg p-1.5 text-ink-2 hover:bg-cream-2" aria-label="Next">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          <p className="whitespace-nowrap text-[15px] font-semibold">{title}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg bg-cream-2 p-0.5" role="tablist" aria-label="Calendar view">
            {(['month', 'week', 'day', 'agenda'] as View[]).map((v) =>
            <button
              key={v}
              role="tab"
              aria-selected={view === v}
              onClick={() => setView(v)}
              className={cx('rounded-md px-3 py-1.5 text-[13px] font-medium capitalize transition-colors', view === v ? 'bg-white text-ink shadow-card' : 'text-ink-2 hover:text-ink')}>
              
                {v}
              </button>
            )}
          </div>
          <Button variant="primary" icon={Plus} onClick={() => openEventForm({ mode: 'create', prefill: { date: cursor >= TODAY ? cursor : addDaysStr(TODAY, 1) } })}>
            New event
          </Button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <label className="relative">
          <span className="sr-only">Search events</span>
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" aria-hidden />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search events" className="h-9 w-52 rounded-lg border border-line-strong bg-white pl-8 pr-3 text-[13px] focus:border-berry-400 focus:outline-none focus:ring-2 focus:ring-berry-100" />
        </label>
        <FilterSelect label="Category" value={category} onChange={setCategory} options={[{ value: 'all', label: 'All categories' }, ...store.settings.categories.map((c) => ({ value: c.id, label: c.label }))]} />
        <FilterSelect label="Trailer" value={trailer} onChange={setTrailer} options={[{ value: 'all', label: 'All trailers' }, ...scoped.trailers.map((t) => ({ value: t.id, label: t.name })), { value: 'none', label: 'No trailer assigned' }]} />
        {(store.role === 'corporate' || scoped.territories.length > 1) &&
        <FilterSelect label="Territory" value={territory} onChange={setTerritory} options={[{ value: 'all', label: 'All territories' }, ...scoped.territories.filter((t) => t.franchiseId).map((t) => ({ value: t.id, label: t.name }))]} />
        }
        <label className="flex items-center gap-2 text-[13px] text-ink-2">
          <input type="checkbox" checked={showCancelled} onChange={(e) => setShowCancelled(e.target.checked)} className="h-4 w-4 accent-berry-600" />
          Show cancelled
        </label>
      </div>

      {view === 'month' &&
      <MonthView
        cursor={cursor}
        events={events}
        issuesByEvent={issuesByEvent}
        highlightId={highlightId}
        onSelectDay={(d) => {
          setCursor(d);
          setView('day');
        }}
        onCreate={(d) => openEventForm({ mode: 'create', prefill: { date: d } })} />

      }
      {view === 'week' && <TimeGridView columns={weekColumns} issuesByEvent={issuesByEvent} highlightId={highlightId} showNowLine />}
      {view === 'day' &&
      <>
          <p className="mb-2 text-[13px] text-ink-3">Day view shows one column per trailer, so double-bookings are easy to spot.</p>
          <TimeGridView columns={dayColumns} issuesByEvent={issuesByEvent} highlightId={highlightId} showNowLine />
        </>
      }
      {view === 'agenda' && <AgendaView events={agendaEvents} issuesByEvent={issuesByEvent} />}

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-ink-2" aria-label="Legend">
        {store.settings.categories.filter((c) => c.active).map((c) =>
        <span key={c.id} className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: c.color }} aria-hidden />
            {c.label}
          </span>
        )}
        <span className="mx-1 h-4 w-px bg-line-strong" aria-hidden />
        <span className="flex items-center gap-1.5">
          <OctagonAlert className="h-3.5 w-3.5 text-bad-600" aria-hidden /> Conflict
        </span>
        <span className="flex items-center gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5 text-warn-600" aria-hidden /> Needs details
        </span>
        <span className="flex items-center gap-1.5">
          <CircleDashed className="h-3.5 w-3.5 text-ink-3" aria-hidden /> Dashed = tentative
        </span>
        <span className="flex items-center gap-1.5 line-through">Cancelled</span>
      </div>
    </Page>);

}