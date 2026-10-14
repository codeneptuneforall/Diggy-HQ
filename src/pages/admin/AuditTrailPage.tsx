import React, { useState } from 'react';
import { ArrowRight, History, Lock, Search } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { useScoped } from '../../hooks/useScoped';
import { Page } from '../../components/layout/Page';
import { PageHeader } from '../../components/ui/PageHeader';
import { FilterSelect } from '../../components/ui/FilterSelect';
import { EmptyState } from '../../components/ui/EmptyState';
import { Drawer } from '../../components/ui/Drawer';
import { fmtDateTime, inRange } from '../../utils/date';
import { cx } from '../../utils/format';
import type { AuditEntry, DateRangeKey } from '../../types';

export function AuditTrailPage() {
  const store = useStore();
  const scoped = useScoped();
  const [q, setQ] = useState('');
  const [user, setUser] = useState('all');
  const [franchise, setFranchise] = useState('all');
  const [type, setType] = useState('all');
  const [action, setAction] = useState('all');
  const [range, setRange] = useState<DateRangeKey | 'all'>('all');
  const [open, setOpen] = useState<AuditEntry | null>(null);

  const users = Array.from(new Set(scoped.audit.map((a) => a.user)));
  const types = Array.from(new Set(scoped.audit.map((a) => a.recordType)));
  const actions = Array.from(new Set(scoped.audit.map((a) => a.action)));
  const rows = scoped.audit.
  filter((a) => (user === 'all' || a.user === user) && (franchise === 'all' || a.franchiseId === franchise) && (type === 'all' || a.recordType === type) && (action === 'all' || a.action === action) && (range === 'all' || inRange(a.at.slice(0, 10), range))).
  filter((a) => !q || `${a.recordLabel} ${a.recordId} ${a.reason ?? ''}`.toLowerCase().includes(q.toLowerCase())).
  sort((a, b) => b.at.localeCompare(a.at));

  return (
    <Page>
      <PageHeader
        title={store.role === 'corporate' ? 'Audit trail' : 'Activity history'}
        description="A permanent record of important changes — especially financial ones."
        meta={
        <span className="inline-flex items-center gap-1 rounded-full bg-cream-2 px-2 py-0.5 text-[11px] font-medium text-ink-2">
            <Lock className="h-3 w-3" aria-hidden /> Read-only
          </span>
        } />
      
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <label className="relative">
          <span className="sr-only">Search records</span>
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" aria-hidden />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Record name, ID or reason" className="h-9 w-56 rounded-lg border border-line-strong bg-white pl-8 pr-3 text-[13px] focus:border-berry-400 focus:outline-none focus:ring-2 focus:ring-berry-100" />
        </label>
        <FilterSelect label="Date" value={range} onChange={(v) => setRange(v as DateRangeKey | 'all')} options={[{ value: 'all', label: 'Any date' }, { value: 'last7', label: 'Last 7 days' }, { value: 'last30', label: 'Last 30 days' }]} />
        <FilterSelect label="User" value={user} onChange={setUser} options={[{ value: 'all', label: 'All users' }, ...users.map((u) => ({ value: u, label: u }))]} />
        {store.role === 'corporate' && store.workspace === 'network' && <FilterSelect label="Franchise" value={franchise} onChange={setFranchise} options={[{ value: 'all', label: 'All franchises' }, ...store.franchises.map((f) => ({ value: f.id, label: f.shortName }))]} />}
        <FilterSelect label="Record type" value={type} onChange={setType} options={[{ value: 'all', label: 'All records' }, ...types.map((t) => ({ value: t, label: t }))]} />
        <FilterSelect label="Action" value={action} onChange={setAction} options={[{ value: 'all', label: 'All actions' }, ...actions.map((a) => ({ value: a, label: a }))]} />
      </div>
      <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-card">
        {rows.length === 0 ?
        <EmptyState icon={History} title="No matching entries" /> :

        <table className="w-full text-sm">
            <thead className="border-b border-line bg-cream/60 text-left text-xs text-ink-3">
              <tr>
                <th className="px-4 py-2.5 font-medium">When</th>
                <th className="px-4 py-2.5 font-medium">User</th>
                <th className="px-4 py-2.5 font-medium">Record</th>
                <th className="px-4 py-2.5 font-medium">Action</th>
                <th className="px-4 py-2.5 font-medium">Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((a) =>
            <tr key={a.id} onClick={() => setOpen(a)} className="cursor-pointer transition-colors hover:bg-cream/50">
                  <td className="whitespace-nowrap px-4 py-3 text-ink-2">{fmtDateTime(a.at)}</td>
                  <td className="px-4 py-3">
                    <span className="block">{a.user}</span>
                    <span className="block text-xs text-ink-3">{a.userRole}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cx('mr-1.5 rounded px-1.5 py-0.5 text-[11px] font-medium', a.recordType === 'Sales report' ? 'bg-berry-50 text-berry-700' : 'bg-cream-2 text-ink-2')}>{a.recordType}</span>
                    {a.recordLabel}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={(e) => {e.stopPropagation();setOpen(a);}} className="text-left font-medium hover:text-berry-700">
                      {a.action}
                    </button>
                  </td>
                  <td className="max-w-[280px] px-4 py-3 text-xs text-ink-2">
                    {a.changes[0] ?
                <span className="flex flex-wrap items-center gap-1">
                        {a.changes[0].field}: <span className="line-through">{a.changes[0].from}</span> <ArrowRight className="h-3 w-3" aria-hidden /> <span className="font-medium text-ink">{a.changes[0].to}</span>
                        {a.changes.length > 1 && <span className="text-ink-3">+{a.changes.length - 1} more</span>}
                      </span> :

                '—'
                }
                  </td>
                </tr>
            )}
            </tbody>
          </table>
        }
      </div>

      <Drawer open={!!open} onClose={() => setOpen(null)} title={open?.action ?? ''} subtitle={open ? `${open.recordType} · ${open.recordLabel}` : ''} width="lg">
        {open &&
        <div className="space-y-6">
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-xs text-ink-3">Changed by</dt>
                <dd className="font-medium">{open.user}</dd>
                <dd className="text-xs text-ink-3">{open.userRole}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-3">Timestamp</dt>
                <dd className="font-medium">{fmtDateTime(open.at)}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-3">Record ID</dt>
                <dd className="font-mono text-[13px]">{open.recordId}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-3">Franchise</dt>
                <dd>{store.franchises.find((f) => f.id === open.franchiseId)?.shortName ?? 'Corporate'}</dd>
              </div>
            </dl>
            {open.changes.length > 0 &&
          <div>
                <h3 className="mb-2 text-sm font-semibold">Previous vs updated</h3>
                <table className="w-full overflow-hidden rounded-xl border border-line text-sm">
                  <thead className="bg-cream/60 text-left text-xs text-ink-3">
                    <tr>
                      <th className="px-3 py-2 font-medium">Field</th>
                      <th className="px-3 py-2 font-medium">Previous</th>
                      <th className="px-3 py-2 font-medium">Updated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {open.changes.map((c, i) =>
                <tr key={i}>
                        <td className="px-3 py-2 text-ink-2">{c.field}</td>
                        <td className="px-3 py-2 tabular text-bad-700">{c.from}</td>
                        <td className="px-3 py-2 font-medium tabular text-ok-700">{c.to}</td>
                      </tr>
                )}
                  </tbody>
                </table>
              </div>
          }
            <div>
              <h3 className="mb-1 text-sm font-semibold">Reason</h3>
              <p className="rounded-lg bg-cream-2 px-3 py-2 text-sm">{open.reason ?? <span className="text-ink-3">No reason required for this action.</span>}</p>
            </div>
            <p className="flex items-center gap-2 text-xs text-ink-3">
              <Lock className="h-3.5 w-3.5" aria-hidden /> Audit entries can’t be edited or deleted.
            </p>
          </div>
        }
      </Drawer>
    </Page>);

}