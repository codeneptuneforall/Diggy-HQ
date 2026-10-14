import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Ban, CalendarCheck2, Copy, Mail, MapPin, Package, Pencil, Phone, Plus, Truck, UserPlus, X } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { useUI } from '../../contexts/UIContext';
import { Page } from '../../components/layout/Page';
import { PageHeader } from '../../components/ui/PageHeader';
import { Panel } from '../../components/ui/Panel';
import { Button } from '../../components/ui/Button';
import { StatusChip } from '../../components/ui/StatusChip';
import { CategoryTag } from '../../components/ui/CategoryTag';
import { IssueList } from '../../components/ui/IssueList';
import { Avatar } from '../../components/ui/Avatar';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { inputCls } from '../../components/ui/Field';
import { EventReportPanel } from '../../components/events/EventReportPanel';
import { AuditTimeline } from '../../components/events/AuditTimeline';
import { fmtDate, fmtDateTime, fmtTimeRange, hoursBetween } from '../../utils/date';
import { getEventIssues } from '../../utils/conflicts';
import { eventEnded } from '../../utils/reports';
import { MOVEMENT_LABELS } from '../../utils/inventory';
import { eventStatusMeta, trailerStatus, trailerStatusMeta } from '../../utils/status';
import { fmtNum } from '../../utils/format';

export function EventDetailPage() {
  const { id } = useParams();
  const store = useStore();
  const ui = useUI();
  const navigate = useNavigate();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const ev = store.events.find((e) => e.id === id);
  if (!ev || !store.inScope(ev.franchiseId)) {
    return (
      <Page>
        <EmptyState icon={Ban} title="Event not found" body="It may have been removed, or it belongs to a franchise you can’t access." action={<Button onClick={() => navigate('/events')}>Back to events</Button>} />
      </Page>);

  }

  const issues = getEventIssues(ev, store.events, store.employees, store.trailers);
  const trailer = store.trailers.find((t) => t.id === ev.trailerId);
  const customer = store.customers.find((c) => c.id === ev.customerId);
  const territory = store.territories.find((t) => t.id === ev.territoryId);
  const franchise = store.franchises.find((f) => f.id === ev.franchiseId);
  const usage = store.movements.filter((m) => m.eventId === ev.id);
  const history = store.audit.filter((a) => a.recordId === ev.id);
  const customerEvents = customer ? store.events.filter((e) => e.customerId === customer.id && e.id !== ev.id) : [];
  const canComplete = ev.status !== 'completed' && ev.status !== 'cancelled' && (eventEnded(ev) || ev.status === 'in_progress');
  const editable = ev.status !== 'cancelled';

  const removeEmployee = (empId: string) => {
    store.saveEvent({ ...ev, employeeIds: ev.employeeIds.filter((x) => x !== empId) });
    toast.success('Removed from shift');
  };

  return (
    <Page>
      <PageHeader
        back={{ label: 'Events', to: '/events' }}
        title={ev.name}
        meta={<StatusChip {...eventStatusMeta[ev.status]} />}
        description={
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <CategoryTag id={ev.category} />
            <span>{fmtDate(ev.date, 'EEEE, MMMM d, yyyy')}</span>
            <span>{fmtTimeRange(ev.start, ev.end)}</span>
          </span>
        }
        actions={
        <>
            {editable &&
          <Button icon={Pencil} onClick={() => ui.openEventForm({ mode: 'edit', event: ev })}>
                Edit
              </Button>
          }
            <Button icon={Copy} onClick={() => ui.openEventForm({ mode: 'duplicate', event: ev })}>
              Duplicate
            </Button>
            {editable && ev.status !== 'completed' &&
          <Button icon={Ban} variant="ghost" onClick={() => setCancelOpen(true)}>
                Cancel event
              </Button>
          }
            {canComplete &&
          <Button
            variant="primary"
            icon={CalendarCheck2}
            onClick={() => {
              store.setEventStatus(ev.id, 'completed');
              toast.success('Event marked complete — sales report is now due');
            }}>
            
                Mark complete
              </Button>
          }
          </>
        } />
      

      {ev.status === 'cancelled' &&
      <div className="mb-6 rounded-xl border border-bad-100 bg-bad-50 px-4 py-3 text-sm text-bad-700" role="status">
          <span className="font-semibold">This event was cancelled.</span> {ev.cancelReason && `Reason: ${ev.cancelReason}`} Trailer and crew have been released.
        </div>
      }
      {issues.length > 0 &&
      <div className="mb-6">
          <IssueList
          issues={issues}
          action={
          <Button size="sm" variant={issues.some((i) => i.severity === 'conflict') ? 'danger' : 'secondary'} onClick={() => ui.openEventForm({ mode: 'edit', event: ev })}>
                Resolve
              </Button>
          } />
        
        </div>
      }

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Panel title="Schedule & location">
            <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
              <Item label="Date" value={fmtDate(ev.date, 'EEEE, MMMM d')} />
              <Item label="Time" value={`${fmtTimeRange(ev.start, ev.end)} · ${fmtNum(hoursBetween(ev.start, ev.end), 1)} hrs`} />
              <Item label="Venue" value={ev.venue} />
              <Item
                label="Address"
                value={
                ev.address ?
                <span className="flex items-start gap-1.5">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ink-3" aria-hidden />
                      {ev.address}
                    </span> :

                <span className="text-warn-700">Missing — add before the event</span>

                } />
              
              <Item label="Territory" value={territory?.name ?? '—'} />
              {store.role === 'corporate' && <Item label="Franchise" value={franchise?.shortName ?? '—'} />}
            </dl>
            {(ev.notes || ev.internalNotes) &&
            <div className="mt-5 grid gap-4 border-t border-line pt-4 sm:grid-cols-2">
                {ev.notes &&
              <div>
                    <p className="text-xs font-medium text-ink-3">Event notes · visible to crew</p>
                    <p className="mt-1 text-sm">{ev.notes}</p>
                  </div>
              }
                {ev.internalNotes &&
              <div>
                    <p className="text-xs font-medium text-ink-3">Internal notes</p>
                    <p className="mt-1 text-sm">{ev.internalNotes}</p>
                  </div>
              }
              </div>
            }
          </Panel>

          <Panel
            title="Trailer & crew"
            description={`${ev.employeeIds.length} of ${ev.staffNeeded} crew assigned`}
            action={
            editable && ev.status !== 'completed' ?
            <Button size="sm" icon={UserPlus} onClick={() => ui.openShiftForm({ eventId: ev.id })}>
                  Assign employee
                </Button> :
            undefined
            }>
            
            <div className="flex items-center justify-between gap-3 rounded-xl bg-cream/70 px-4 py-3">
              <span className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-ink-3" aria-hidden />
                {trailer ?
                <Link to={`/trailers/${trailer.id}`} className="font-medium hover:text-berry-700">
                    {trailer.name}
                  </Link> :

                <span className="font-medium text-warn-700">No trailer assigned</span>
                }
              </span>
              {trailer ? <StatusChip {...trailerStatusMeta[trailerStatus(trailer, store.events)]} /> : editable && <Button size="sm" variant="subtle" onClick={() => ui.openEventForm({ mode: 'edit', event: ev })}>Assign trailer</Button>}
            </div>
            <ul className="mt-3 divide-y divide-line">
              {ev.employeeIds.map((eid) => {
                const emp = store.employees.find((x) => x.id === eid);
                if (!emp) return null;
                const empIssue = issues.find((i) => i.resource === emp.name);
                return (
                  <li key={eid} className="flex items-center gap-3 py-2.5">
                    <Avatar name={emp.name} />
                    <span className="flex-1">
                      <Link to={`/employees/${emp.id}`} className="block text-sm font-medium hover:text-berry-700">
                        {emp.name}
                      </Link>
                      <span className="block text-xs text-ink-3">
                        {emp.role} · {fmtTimeRange(ev.start, ev.end)}
                      </span>
                    </span>
                    {empIssue && <StatusChip tone="bad" label={empIssue.kind === 'employee_unavailable' ? 'Unavailable' : 'Overlap'} />}
                    {editable && ev.status !== 'completed' &&
                    <button onClick={() => removeEmployee(eid)} className="rounded-lg p-1.5 text-ink-3 transition-colors hover:bg-cream-2 hover:text-bad-700" aria-label={`Remove ${emp.name}`}>
                        <X className="h-4 w-4" />
                      </button>
                    }
                  </li>);

              })}
              {ev.employeeIds.length === 0 && <li className="py-3 text-sm text-warn-700">No crew assigned yet.</li>}
            </ul>
          </Panel>

          <EventReportPanel event={ev} />

          <Panel
            title="Inventory usage"
            description="Stock recorded against this event"
            action={
            eventEnded(ev) || ev.status === 'in_progress' ?
            <Button size="sm" icon={Plus} onClick={() => ui.openStockForm({ type: 'used', eventId: ev.id })}>
                  Record usage
                </Button> :
            undefined
            }>
            
            {usage.length === 0 ?
            <p className="flex items-center gap-2 text-sm text-ink-3">
                <Package className="h-4 w-4" aria-hidden /> No inventory recorded for this event yet.
              </p> :

            <table className="w-full text-sm">
                <tbody className="divide-y divide-line">
                  {usage.map((m) => {
                  const item = store.items.find((i) => i.id === m.itemId);
                  return (
                    <tr key={m.id}>
                        <td className="py-2">
                          <Link to={`/inventory/${m.itemId}`} className="font-medium hover:text-berry-700">
                            {item?.name}
                          </Link>
                          <span className="block text-xs text-ink-3">{MOVEMENT_LABELS[m.type]}{m.reason ? ` · ${m.reason}` : ''}</span>
                        </td>
                        <td className="py-2 text-right tabular">
                          {m.qty > 0 ? '+' : ''}
                          {fmtNum(m.qty, 1)} {item?.unit}
                        </td>
                        <td className="py-2 pl-4 text-right text-xs text-ink-3">{m.by}</td>
                      </tr>);

                })}
                </tbody>
              </table>
            }
          </Panel>

          <Panel title="Activity history">
            <AuditTimeline entries={history} empty="No changes recorded yet." />
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Customer">
            {customer ?
            <div>
                <Link to={`/customers/${customer.id}`} className="font-semibold hover:text-berry-700">
                  {customer.name}
                </Link>
                <p className="text-xs text-ink-3">{customer.type}</p>
                {customerEvents.length > 0 &&
              <p className="mt-2 inline-flex rounded-full bg-berry-50 px-2 py-0.5 text-xs font-medium text-berry-700">
                    Repeat customer · {customerEvents.length + 1} events
                  </p>
              }
              </div> :

            <p className="text-sm text-ink-3">No customer linked (public event).</p>
            }
            <div className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
              <p className="font-medium">{ev.contactName || <span className="text-warn-700">No contact person</span>}</p>
              {ev.phone &&
              <a href={`tel:${ev.phone}`} className="flex items-center gap-2 text-ink-2 hover:text-berry-700">
                  <Phone className="h-4 w-4" aria-hidden /> {ev.phone}
                </a>
              }
              {ev.email &&
              <a href={`mailto:${ev.email}`} className="flex items-center gap-2 text-ink-2 hover:text-berry-700">
                  <Mail className="h-4 w-4" aria-hidden /> {ev.email}
                </a>
              }
            </div>
            {ev.followUpDate &&
            <p className="mt-4 rounded-lg bg-cream-2 px-3 py-2 text-[13px]">
                Follow up on <span className="font-medium">{fmtDate(ev.followUpDate)}</span>
              </p>
            }
          </Panel>
          {history[0] && <p className="px-1 text-xs text-ink-3">Last changed {fmtDateTime(history[0].at)} by {history[0].user}</p>}
        </div>
      </div>

      <Modal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title="Cancel this event?"
        description="The trailer and crew will be released, and the customer’s history will show the cancellation."
        footer={
        <>
            <Button onClick={() => setCancelOpen(false)}>Keep event</Button>
            <Button
            variant="danger"
            disabled={cancelReason.trim().length < 3}
            onClick={() => {
              store.setEventStatus(ev.id, 'cancelled', cancelReason);
              setCancelOpen(false);
              toast.success('Event cancelled');
            }}>
            
              Cancel event
            </Button>
          </>
        }>
        
        <label htmlFor="cancel-reason" className="text-[13px] font-medium text-ink-2">
          Reason (required)
        </label>
        <textarea id="cancel-reason" rows={3} className={`${inputCls} mt-1.5`} value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="e.g. Customer postponed to spring" />
      </Modal>
    </Page>);

}

function Item({ label, value }: {label: string;value: React.ReactNode;}) {
  return (
    <div>
      <dt className="text-xs text-ink-3">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium">{value}</dd>
    </div>);

}