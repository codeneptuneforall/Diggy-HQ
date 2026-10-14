import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Contact, Plus, Repeat, Search } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { useUI } from '../../contexts/UIContext';
import { useScoped } from '../../hooks/useScoped';
import { Page } from '../../components/layout/Page';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { FilterSelect } from '../../components/ui/FilterSelect';
import { StatusChip } from '../../components/ui/StatusChip';
import { EmptyState } from '../../components/ui/EmptyState';
import { TODAY, fmtDate } from '../../utils/date';
import { customerStatusMeta } from '../../utils/status';
import { cx } from '../../utils/format';

export function CustomersPage() {
  const store = useStore();
  const scoped = useScoped();
  const { openCustomerForm } = useUI();
  const [q, setQ] = useState('');
  const [type, setType] = useState('all');
  const [status, setStatus] = useState('all');
  const [repeatOnly, setRepeatOnly] = useState(false);

  const rows = scoped.customers.
  map((c) => {
    const evs = store.events.filter((e) => e.customerId === c.id && e.status !== 'cancelled');
    const past = evs.filter((e) => e.date < TODAY).sort((a, b) => b.date.localeCompare(a.date));
    const next = evs.filter((e) => e.date >= TODAY).sort((a, b) => a.date.localeCompare(b.date))[0];
    const fu = scoped.followUps.filter((f) => f.customerId === c.id && !f.done).sort((a, b) => a.due.localeCompare(b.due))[0];
    return { c, count: evs.length, last: past[0], next, fu };
  }).
  filter(({ c, count }) => (type === 'all' || c.type === type) && (status === 'all' || c.status === status) && (!repeatOnly || count >= 2)).
  filter(({ c }) => !q || `${c.name} ${c.contactName} ${c.email} ${c.phone}`.toLowerCase().includes(q.toLowerCase())).
  sort((a, b) => a.c.name.localeCompare(b.c.name));

  return (
    <Page>
      <PageHeader
        title="Customer CRM"
        description="Businesses, schools and families who book Diggy — with their event history and follow-ups."
        actions={
        <Button variant="primary" icon={Plus} onClick={() => openCustomerForm({})}>
            Add customer
          </Button>
        } />
      
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <label className="relative">
          <span className="sr-only">Search customers</span>
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" aria-hidden />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, contact, phone, email" className="h-9 w-64 rounded-lg border border-line-strong bg-white pl-8 pr-3 text-[13px] focus:border-berry-400 focus:outline-none focus:ring-2 focus:ring-berry-100" />
        </label>
        <FilterSelect label="Type" value={type} onChange={setType} options={[{ value: 'all', label: 'All types' }, ...['Business', 'Organization', 'School', 'Wedding / private event', 'Individual', 'Other'].map((t) => ({ value: t, label: t }))]} />
        <FilterSelect label="Status" value={status} onChange={setStatus} options={[{ value: 'all', label: 'All statuses' }, { value: 'active', label: 'Active' }, { value: 'lead', label: 'Lead' }, { value: 'inactive', label: 'Inactive' }]} />
        <label className="flex items-center gap-2 text-[13px] text-ink-2">
          <input type="checkbox" checked={repeatOnly} onChange={(e) => setRepeatOnly(e.target.checked)} className="h-4 w-4 accent-berry-600" />
          Repeat customers only
        </label>
      </div>
      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
        {rows.length === 0 ?
        <EmptyState icon={Contact} title="No customers match" body="Try another search, or add a new customer." /> :

        <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-line bg-cream/60 text-left text-xs text-ink-3">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Customer</th>
                  <th className="px-4 py-2.5 font-medium">Contact</th>
                  <th className="px-4 py-2.5 font-medium">Events</th>
                  <th className="px-4 py-2.5 font-medium">Last event</th>
                  <th className="px-4 py-2.5 font-medium">Upcoming</th>
                  <th className="px-4 py-2.5 font-medium">Follow-up</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map(({ c, count, last, next, fu }) =>
              <tr key={c.id} className="transition-colors hover:bg-cream/50">
                    <td className="px-4 py-3">
                      <Link to={`/customers/${c.id}`} className="font-medium hover:text-berry-700">
                        {c.name}
                      </Link>
                      <p className="text-xs text-ink-3">{c.type}</p>
                    </td>
                    <td className="px-4 py-3 text-ink-2">
                      <span className="block">{c.contactName}</span>
                      <span className="block text-xs text-ink-3">{c.phone}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2 tabular">
                        {count}
                        {count >= 2 &&
                    <span className="inline-flex items-center gap-1 rounded-full bg-berry-50 px-1.5 py-0.5 text-[11px] font-medium text-berry-700">
                            <Repeat className="h-3 w-3" aria-hidden /> Repeat
                          </span>
                    }
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-ink-2">{last ? fmtDate(last.date, 'MMM d') : '—'}</td>
                    <td className="px-4 py-3">{next ? <Link to={`/events/${next.id}`} className="whitespace-nowrap hover:text-berry-700">{fmtDate(next.date, 'MMM d')}</Link> : <span className="text-ink-3">—</span>}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {fu ? <span className={cx(fu.due < TODAY ? 'font-medium text-bad-700' : fu.due === TODAY ? 'font-medium text-warn-700' : 'text-ink-2')}>{fu.due < TODAY ? 'Overdue · ' : fu.due === TODAY ? 'Today · ' : ''}{fmtDate(fu.due, 'MMM d')}</span> : <span className="text-ink-3">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <StatusChip {...customerStatusMeta[c.status]} />
                    </td>
                  </tr>
              )}
              </tbody>
            </table>
          </div>
        }
      </div>
    </Page>);

}