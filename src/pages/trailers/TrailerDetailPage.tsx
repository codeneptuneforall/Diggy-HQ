import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Settings2, Truck } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { Page } from '../../components/layout/Page';
import { PageHeader } from '../../components/ui/PageHeader';
import { Panel } from '../../components/ui/Panel';
import { Button } from '../../components/ui/Button';
import { StatusChip } from '../../components/ui/StatusChip';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { Field, inputCls } from '../../components/ui/Field';
import { AvailabilityGrid } from '../../components/trailers/AvailabilityGrid';
import { AuditTimeline } from '../../components/events/AuditTimeline';
import { TODAY, fmtDate, fmtTimeRange } from '../../utils/date';
import { findReport } from '../../utils/reports';
import { isCounted, reportTotal } from '../../utils/sales';
import { eventStatusMeta, trailerStatus, trailerStatusMeta } from '../../utils/status';
import { fmtMoney } from '../../utils/format';
import type { TrailerBaseStatus } from '../../types';

export function TrailerDetailPage() {
  const { id } = useParams();
  const store = useStore();
  const t = store.trailers.find((x) => x.id === id);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<TrailerBaseStatus>(t?.baseStatus ?? 'available');
  const [note, setNote] = useState(t?.statusNote ?? '');

  if (!t || !store.inScope(t.franchiseId)) {
    return (
      <Page>
        <EmptyState icon={Truck} title="Trailer not found" body="It may belong to a franchise you can’t access." />
      </Page>);

  }

  const mine = store.events.filter((e) => e.trailerId === t.id);
  const upcoming = mine.filter((e) => e.date >= TODAY && e.status !== 'cancelled' && e.status !== 'completed').sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
  const past = mine.filter((e) => e.status === 'completed').sort((a, b) => b.date.localeCompare(a.date));
  const assignmentHistory = store.audit.filter((a) => a.recordId === t.id || a.recordType === 'Trailer' && a.changes.some((c) => c.from === t.name || c.to === t.name));

  return (
    <Page>
      <PageHeader
        back={{ label: 'Trailers', to: '/trailers' }}
        title={t.name}
        meta={<StatusChip {...trailerStatusMeta[trailerStatus(t, store.events)]} />}
        description={`${t.code} · ${store.franchises.find((f) => f.id === t.franchiseId)?.shortName} · ${store.territories.find((x) => x.id === t.territoryId)?.name}`}
        actions={
        <Button icon={Settings2} onClick={() => setOpen(true)}>
            Change status
          </Button>
        } />
      
      {t.statusNote && <p className="mb-6 rounded-xl border border-warn-100 bg-warn-50 px-4 py-3 text-sm text-warn-700">{t.statusNote}</p>}

      <div className="mb-6">
        <h2 className="mb-2 text-[15px] font-semibold">Availability · next 14 days</h2>
        <AvailabilityGrid trailers={[t]} events={store.events} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Panel title="Upcoming schedule" description={`${upcoming.length} bookings`}>
            {upcoming.length === 0 ?
            <p className="text-sm text-ink-3">No upcoming bookings.</p> :

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
            <p className="text-sm text-ink-3">No completed events yet.</p> :

            <table className="w-full text-sm">
                <tbody className="divide-y divide-line">
                  {past.map((e) => {
                  const r = findReport(e.id, store.reports);
                  return (
                    <tr key={e.id}>
                        <td className="py-2.5 text-ink-3">{fmtDate(e.date, 'MMM d')}</td>
                        <td className="py-2.5">
                          <Link to={`/events/${e.id}`} className="font-medium hover:text-berry-700">
                            {e.name}
                          </Link>
                        </td>
                        <td className="py-2.5 text-right tabular">{r && isCounted(r) ? fmtMoney(reportTotal(r)) : <span className="text-bad-700">No report</span>}</td>
                      </tr>);

                })}
                </tbody>
              </table>
            }
          </Panel>
        </div>
        <div className="space-y-6">
          <Panel title="Details">
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs text-ink-3">Identifier</dt>
                <dd className="font-medium">{t.code}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-3">Notes</dt>
                <dd>{t.notes}</dd>
              </div>
            </dl>
          </Panel>
          <Panel title="Assignment history">
            <AuditTimeline entries={assignmentHistory} empty="No assignment changes recorded." />
          </Panel>
        </div>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Change trailer status"
        description="Scheduled and in-use are set automatically from bookings. Use this for maintenance or downtime."
        footer={
        <>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button
            variant="primary"
            onClick={() => {
              store.setTrailerStatus(t.id, status, note);
              setOpen(false);
              toast.success('Trailer status updated');
            }}>
            
              Save status
            </Button>
          </>
        }>
        
        <div className="space-y-4">
          <Field label="Status" htmlFor="tr-st">
            <select id="tr-st" className={inputCls} value={status} onChange={(e) => setStatus(e.target.value as TrailerBaseStatus)}>
              <option value="available">Available for booking</option>
              <option value="maintenance">Maintenance</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </Field>
          <Field label="Note" htmlFor="tr-note" hint="Shown wherever this trailer is assigned.">
            <textarea id="tr-note" rows={2} className={inputCls} value={note} onChange={(e) => setNote(e.target.value)} />
          </Field>
          {status !== 'available' && upcoming.length > 0 &&
          <p className="rounded-lg bg-warn-50 px-3 py-2 text-[13px] text-warn-700">{upcoming.length} upcoming booking{upcoming.length > 1 ? 's' : ''} will be flagged as conflicts until reassigned.</p>
          }
        </div>
      </Modal>
    </Page>);

}