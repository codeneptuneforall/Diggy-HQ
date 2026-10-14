import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { BellPlus, CalendarPlus, Check, Contact, Mail, MapPin, Pencil, Phone, Repeat } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { useUI } from '../../contexts/UIContext';
import { Page } from '../../components/layout/Page';
import { PageHeader } from '../../components/ui/PageHeader';
import { Panel } from '../../components/ui/Panel';
import { Button } from '../../components/ui/Button';
import { StatusChip } from '../../components/ui/StatusChip';
import { CategoryTag } from '../../components/ui/CategoryTag';
import { EmptyState } from '../../components/ui/EmptyState';
import { inputCls } from '../../components/ui/Field';
import { FollowUpModal } from '../../components/customers/FollowUpModal';
import { TODAY, fmtDate, fmtDateTime, fmtTimeRange } from '../../utils/date';
import { findReport } from '../../utils/reports';
import { isCounted, reportTotal } from '../../utils/sales';
import { customerStatusMeta, eventStatusMeta } from '../../utils/status';
import { cx, fmtMoney } from '../../utils/format';
import { differenceInDays, parseISO } from 'date-fns';

export function CustomerDetailPage() {
  const { id } = useParams();
  const store = useStore();
  const ui = useUI();
  const [note, setNote] = useState('');
  const [fuOpen, setFuOpen] = useState(false);
  const c = store.customers.find((x) => x.id === id);

  if (!c || !store.inScope(c.franchiseId)) {
    return (
      <Page>
        <EmptyState icon={Contact} title="Customer not found" body="It may belong to another franchise." />
      </Page>);

  }

  const evs = store.events.filter((e) => e.customerId === c.id);
  const upcoming = evs.filter((e) => e.date >= TODAY && e.status !== 'cancelled' && e.status !== 'completed').sort((a, b) => a.date.localeCompare(b.date));
  const past = evs.filter((e) => !upcoming.includes(e)).sort((a, b) => b.date.localeCompare(a.date));
  const completed = past.filter((e) => e.status === 'completed');
  const lifetime = completed.reduce((s, e) => {
    const r = findReport(e.id, store.reports);
    return s + (r && isCounted(r) ? reportTotal(r) : 0);
  }, 0);
  const dated = evs.filter((e) => e.status !== 'cancelled').map((e) => e.date).sort();
  const span = dated.length >= 2 ? differenceInDays(parseISO(dated[dated.length - 1]), parseISO(dated[0])) : 0;
  const frequency = dated.length >= 2 ? `About every ${Math.max(1, Math.round(span / (dated.length - 1)))} days` : dated.length === 1 ? 'First booking' : 'No bookings yet';
  const followUps = store.followUps.filter((f) => f.customerId === c.id).sort((a, b) => Number(a.done) - Number(b.done) || a.due.localeCompare(b.due));

  return (
    <Page>
      <PageHeader
        back={{ label: 'Customers', to: '/customers' }}
        title={c.name}
        meta={
        <>
            <StatusChip {...customerStatusMeta[c.status]} />
            {dated.length >= 2 && <StatusChip tone="brand" label="Repeat customer" icon={Repeat} />}
          </>
        }
        description={`${c.type} · ${store.territories.find((t) => t.id === c.territoryId)?.name} · customer since ${fmtDate(c.createdAt, 'MMM yyyy')}`}
        actions={
        <>
            <Button icon={Pencil} onClick={() => ui.openCustomerForm({ customerId: c.id })}>
              Edit
            </Button>
            <Button icon={BellPlus} onClick={() => setFuOpen(true)}>
              Schedule follow-up
            </Button>
            <Button variant="primary" icon={CalendarPlus} onClick={() => ui.openEventForm({ mode: 'create', prefill: { customerId: c.id } })}>
              Create event
            </Button>
          </>
        } />
      

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line shadow-card sm:grid-cols-4">
            {[
            ['Events', String(evs.filter((e) => e.status !== 'cancelled').length)],
            ['Frequency', frequency],
            ['Last event', past[0] ? fmtDate(past[0].date, 'MMM d') : '—'],
            ['Reported sales', fmtMoney(lifetime)]].
            map(([k, v]) =>
            <div key={k} className="bg-white px-4 py-3">
                <dt className="text-xs text-ink-3">{k}</dt>
                <dd className="text-[15px] font-semibold">{v}</dd>
              </div>
            )}
          </dl>

          <Panel title="Upcoming bookings">
            {upcoming.length === 0 ?
            <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-ink-3">Nothing booked yet.</p>
                <Button size="sm" variant="subtle" icon={CalendarPlus} onClick={() => ui.openEventForm({ mode: 'create', prefill: { customerId: c.id } })}>
                  Book an event
                </Button>
              </div> :

            <ul className="divide-y divide-line">
                {upcoming.map((e) =>
              <li key={e.id}>
                    <Link to={`/events/${e.id}`} className="flex items-center justify-between gap-3 py-2.5 hover:text-berry-700">
                      <span>
                        <span className="block text-sm font-medium">{e.name}</span>
                        <span className="block text-xs text-ink-3">
                          {fmtDate(e.date)} · {fmtTimeRange(e.start, e.end)}
                        </span>
                      </span>
                      <StatusChip {...eventStatusMeta[e.status]} />
                    </Link>
                  </li>
              )}
              </ul>
            }
          </Panel>

          <Panel title="Event history">
            {past.length === 0 ?
            <p className="text-sm text-ink-3">No past events.</p> :

            <table className="w-full text-sm">
                <tbody className="divide-y divide-line">
                  {past.map((e) => {
                  const r = findReport(e.id, store.reports);
                  return (
                    <tr key={e.id}>
                        <td className="whitespace-nowrap py-2.5 pr-3 text-ink-3">{fmtDate(e.date, 'MMM d, yyyy')}</td>
                        <td className="py-2.5">
                          <Link to={`/events/${e.id}`} className={cx('font-medium hover:text-berry-700', e.status === 'cancelled' && 'line-through')}>
                            {e.name}
                          </Link>
                          <div>
                            <CategoryTag id={e.category} />
                          </div>
                        </td>
                        <td className="py-2.5 text-right">
                          {e.status === 'cancelled' ?
                        <StatusChip {...eventStatusMeta.cancelled} /> :
                        r && isCounted(r) ?
                        <span className="tabular">{fmtMoney(reportTotal(r))}</span> :

                        <span className="text-xs text-bad-700">Report missing</span>
                        }
                        </td>
                      </tr>);

                })}
                </tbody>
              </table>
            }
          </Panel>

          <Panel title="Notes & interactions">
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (!note.trim()) return;
                store.addInteraction(c.id, note.trim());
                setNote('');
                toast.success('Note added');
              }}>
              
              <label htmlFor="c-note" className="sr-only">
                Add a note
              </label>
              <input id="c-note" className={inputCls} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Log a call, email or conversation…" />
              <Button type="submit" variant="primary" disabled={!note.trim()}>
                Add note
              </Button>
            </form>
            {c.notes && <p className="mt-4 rounded-lg bg-cream-2 px-3 py-2 text-sm">{c.notes}</p>}
            <ul className="mt-4 space-y-3">
              {c.interactions.map((i) =>
              <li key={i.id} className="text-sm">
                  <p>{i.text}</p>
                  <p className="text-xs text-ink-3">
                    {i.by} · {fmtDateTime(i.at)}
                  </p>
                </li>
              )}
            </ul>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Contact">
            <p className="font-medium">{c.contactName}</p>
            <div className="mt-2 space-y-2 text-sm text-ink-2">
              <a href={`tel:${c.phone}`} className="flex items-center gap-2 hover:text-berry-700">
                <Phone className="h-4 w-4" aria-hidden /> {c.phone}
              </a>
              <a href={`mailto:${c.email}`} className="flex items-center gap-2 break-all hover:text-berry-700">
                <Mail className="h-4 w-4 shrink-0" aria-hidden /> {c.email}
              </a>
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> {c.location}
              </p>
            </div>
            {c.billing &&
            <div className="mt-4 border-t border-line pt-3">
                <p className="text-xs text-ink-3">Billing</p>
                <p className="text-sm">{c.billing}</p>
              </div>
            }
          </Panel>

          <Panel title="Follow-ups" action={<Button size="sm" variant="ghost" icon={BellPlus} onClick={() => setFuOpen(true)}>Add</Button>}>
            {followUps.length === 0 ?
            <p className="text-sm text-ink-3">No follow-ups scheduled.</p> :

            <ul className="space-y-3">
                {followUps.map((f) =>
              <li key={f.id} className="flex items-start gap-3">
                    <button
                  onClick={() => {
                    store.toggleFollowUp(f.id);
                    if (!f.done) toast.success('Follow-up marked complete');
                  }}
                  aria-label={f.done ? 'Mark as not done' : 'Mark complete'}
                  className={cx('mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors', f.done ? 'border-ok-600 bg-ok-600 text-white' : 'border-line-strong hover:border-berry-500')}>
                  
                      {f.done && <Check className="h-3.5 w-3.5" />}
                    </button>
                    <span className="text-sm">
                      <span className={cx('block', f.done && 'text-ink-3 line-through')}>{f.note}</span>
                      <span className={cx('block text-xs', !f.done && f.due < TODAY ? 'font-medium text-bad-700' : 'text-ink-3')}>
                        {f.done ? `Done ${f.completedAt ? fmtDateTime(f.completedAt) : ''}` : `${f.due < TODAY ? 'Overdue · ' : ''}Due ${fmtDate(f.due)}`}
                      </span>
                    </span>
                  </li>
              )}
              </ul>
            }
          </Panel>
        </div>
      </div>
      <FollowUpModal open={fuOpen} onClose={() => setFuOpen(false)} customerId={c.id} />
    </Page>);

}