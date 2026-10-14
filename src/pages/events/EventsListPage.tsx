import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertTriangle, CalendarX, OctagonAlert, Plus, Search } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { useUI } from '../../contexts/UIContext';
import { useScoped } from '../../hooks/useScoped';
import { Page } from '../../components/layout/Page';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { FilterSelect } from '../../components/ui/FilterSelect';
import { StatusChip } from '../../components/ui/StatusChip';
import { CategoryTag } from '../../components/ui/CategoryTag';
import { EmptyState } from '../../components/ui/EmptyState';
import { Avatar } from '../../components/ui/Avatar';
import { TODAY, fmtDate, fmtTimeRange } from '../../utils/date';
import { eventEnded, findReport } from '../../utils/reports';
import { eventStatusMeta, reportStatusMeta } from '../../utils/status';
import { cx } from '../../utils/format';

export function EventsListPage() {
  const store = useStore();
  const scoped = useScoped();
  const { openEventForm } = useUI();
  const [params] = useSearchParams();
  const [scope, setScope] = useState(params.get('scope') ?? 'upcoming');
  const [status, setStatus] = useState('all');
  const [category, setCategory] = useState('all');
  const [onlyIssues, setOnlyIssues] = useState(params.get('issues') === '1');
  const [q, setQ] = useState('');

  const rows = scoped.events.
  filter((e) => scope === 'upcoming' ? e.date >= TODAY : scope === 'past' ? e.date < TODAY : true).
  filter((e) => status === 'all' || e.status === status).
  filter((e) => category === 'all' || e.category === category).
  filter((e) => !onlyIssues || scoped.issuesByEvent.has(e.id)).
  filter((e) => !q || `${e.name} ${e.venue} ${e.contactName}`.toLowerCase().includes(q.toLowerCase())).
  sort((a, b) => scope === 'past' ? (b.date + b.start).localeCompare(a.date + a.start) : (a.date + a.start).localeCompare(b.date + b.start));

  return (
    <Page>
      <PageHeader
        title="Events"
        description="Every booking across your calendar, with trailer, crew and report status."
        actions={
        <Button variant="primary" icon={Plus} onClick={() => openEventForm({ mode: 'create' })}>
            New event
          </Button>
        } />
      
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex rounded-lg bg-cream-2 p-0.5">
          {[
          ['upcoming', 'Upcoming'],
          ['past', 'Past'],
          ['all', 'All']].
          map(([v, l]) =>
          <button key={v} onClick={() => setScope(v)} aria-pressed={scope === v} className={cx('rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors', scope === v ? 'bg-white shadow-card' : 'text-ink-2 hover:text-ink')}>
              {l}
            </button>
          )}
        </div>
        <label className="relative">
          <span className="sr-only">Search</span>
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" aria-hidden />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, venue, contact" className="h-9 w-60 rounded-lg border border-line-strong bg-white pl-8 pr-3 text-[13px] focus:border-berry-400 focus:outline-none focus:ring-2 focus:ring-berry-100" />
        </label>
        <FilterSelect label="Status" value={status} onChange={setStatus} options={[{ value: 'all', label: 'All statuses' }, ...Object.entries(eventStatusMeta).map(([k, v]) => ({ value: k, label: v.label }))]} />
        <FilterSelect label="Category" value={category} onChange={setCategory} options={[{ value: 'all', label: 'All categories' }, ...store.settings.categories.map((c) => ({ value: c.id, label: c.label }))]} />
        <label className="flex items-center gap-2 text-[13px] text-ink-2">
          <input type="checkbox" checked={onlyIssues} onChange={(e) => setOnlyIssues(e.target.checked)} className="h-4 w-4 accent-berry-600" />
          Only events needing attention
        </label>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
        {rows.length === 0 ?
        <EmptyState icon={CalendarX} title={onlyIssues ? 'No events need attention' : 'No events match'} body="Try a different time range or clear your filters." /> :

        <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-line bg-cream/60 text-left text-xs text-ink-3">
                <tr>
                  <th className="px-4 py-2.5 font-medium">When</th>
                  <th className="px-4 py-2.5 font-medium">Event</th>
                  {store.role === 'corporate' && store.workspace === 'network' && <th className="px-4 py-2.5 font-medium">Franchise</th>}
                  <th className="px-4 py-2.5 font-medium">Trailer</th>
                  <th className="px-4 py-2.5 font-medium">Crew</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium">Sales report</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((e) => {
                const issues = scoped.issuesByEvent.get(e.id) ?? [];
                const conflict = issues.some((i) => i.severity === 'conflict');
                const report = findReport(e.id, store.reports);
                return (
                  <tr key={e.id} className="transition-colors hover:bg-cream/50">
                      <td className="whitespace-nowrap px-4 py-3">
                        <p className="font-medium">{fmtDate(e.date)}</p>
                        <p className="text-xs text-ink-3">{fmtTimeRange(e.start, e.end)}</p>
                      </td>
                      <td className="px-4 py-3">
                        <Link to={`/events/${e.id}`} className={cx('font-medium hover:text-berry-700', e.status === 'cancelled' && 'line-through')}>
                          {e.name}
                        </Link>
                        <div className="flex items-center gap-3">
                          <CategoryTag id={e.category} />
                          {issues.length > 0 &&
                        <span className={cx('flex items-center gap-1 text-xs font-medium', conflict ? 'text-bad-700' : 'text-warn-700')}>
                              {conflict ? <OctagonAlert className="h-3.5 w-3.5" aria-hidden /> : <AlertTriangle className="h-3.5 w-3.5" aria-hidden />}
                              {conflict ? 'Conflict' : issues[0].title}
                            </span>
                        }
                        </div>
                      </td>
                      {store.role === 'corporate' && store.workspace === 'network' && <td className="px-4 py-3 text-ink-2">{store.franchises.find((f) => f.id === e.franchiseId)?.shortName}</td>}
                      <td className="whitespace-nowrap px-4 py-3 text-ink-2">{store.trailers.find((t) => t.id === e.trailerId)?.code ?? <span className="text-warn-700">—</span>}</td>
                      <td className="px-4 py-3">
                        <span className="flex -space-x-1.5">
                          {e.employeeIds.map((id) =>
                        <Avatar key={id} name={store.employees.find((x) => x.id === id)?.name ?? ''} size="sm" />
                        )}
                          {e.employeeIds.length < e.staffNeeded && <span className="ml-3 text-xs text-warn-700">{e.employeeIds.length}/{e.staffNeeded}</span>}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusChip {...eventStatusMeta[e.status]} />
                      </td>
                      <td className="px-4 py-3">
                        {report && report.status !== 'draft' ?
                      <Link to={`/sales-reports/${report.id}`}>
                            <StatusChip {...reportStatusMeta[report.status]} />
                          </Link> :
                      eventEnded(e) ?
                      <StatusChip tone="bad" label={report ? 'Draft only' : 'Missing'} /> :

                      <span className="text-xs text-ink-3">After event</span>
                      }
                      </td>
                    </tr>);

              })}
              </tbody>
            </table>
          </div>
        }
      </div>
      <p className="mt-3 text-xs text-ink-3">{rows.length} events</p>
    </Page>);

}