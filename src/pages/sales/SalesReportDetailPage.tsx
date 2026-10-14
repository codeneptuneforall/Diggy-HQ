import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { CheckCheck, Lock, MessageSquareWarning, Pencil, Receipt } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { Page } from '../../components/layout/Page';
import { PageHeader } from '../../components/ui/PageHeader';
import { Panel } from '../../components/ui/Panel';
import { Button } from '../../components/ui/Button';
import { StatusChip } from '../../components/ui/StatusChip';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { inputCls } from '../../components/ui/Field';
import { CalcPanel } from '../../components/sales/CalcPanel';
import { EditReportModal } from '../../components/sales/EditReportModal';
import { AuditTimeline } from '../../components/events/AuditTimeline';
import { fmtDate, fmtDateTime, fmtTimeRange } from '../../utils/date';
import { reportStatusMeta } from '../../utils/status';
import { fmtMoney } from '../../utils/format';

export function SalesReportDetailPage() {
  const { id } = useParams();
  const store = useStore();
  const [editOpen, setEditOpen] = useState(false);
  const [corrOpen, setCorrOpen] = useState(false);
  const [corrNote, setCorrNote] = useState('');
  const r = store.reports.find((x) => x.id === id);

  if (!r || !store.inScope(r.franchiseId)) {
    return (
      <Page>
        <EmptyState icon={Receipt} title="Report not found" body="It may belong to a franchise you can’t access." />
      </Page>);

  }
  const ev = store.events.find((e) => e.id === r.eventId);
  const audit = store.audit.filter((a) => a.recordId === r.id);
  const reviewer = store.role === 'corporate' || store.user.title === 'Franchise Owner';
  const locked = r.status === 'locked';

  return (
    <Page>
      <PageHeader
        back={{ label: 'Sales reports', to: '/sales-reports' }}
        title={ev?.name ?? 'Sales report'}
        meta={<StatusChip {...reportStatusMeta[r.status]} icon={locked ? Lock : undefined} />}
        description={`${fmtDate(r.date, 'EEEE, MMMM d, yyyy')} · ${store.franchises.find((f) => f.id === r.franchiseId)?.shortName}`}
        actions={
        <>
            {!locked && r.status !== 'draft' &&
          <Button icon={Pencil} onClick={() => setEditOpen(true)}>
                {r.status === 'needs_correction' ? 'Submit correction' : 'Edit'}
              </Button>
          }
            {reviewer && r.status === 'submitted' &&
          <>
                <Button icon={MessageSquareWarning} onClick={() => setCorrOpen(true)}>
                  Request correction
                </Button>
                <Button variant="primary" icon={CheckCheck} onClick={() => {store.setReportStatus(r.id, 'reviewed');toast.success('Report marked reviewed');}}>
                  Mark reviewed
                </Button>
              </>
          }
            {reviewer && r.status === 'reviewed' &&
          <Button variant="primary" icon={Lock} onClick={() => {store.setReportStatus(r.id, 'locked');toast.success('Report finalized and locked');}}>
                Finalize
              </Button>
          }
          </>
        } />
      

      {r.status === 'needs_correction' && r.correctionNote &&
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3 rounded-xl border border-warn-100 bg-warn-50 px-4 py-3" role="alert">
          <div className="text-sm">
            <p className="font-semibold text-warn-700">Correction requested</p>
            <p className="mt-0.5 text-ink">{r.correctionNote}</p>
          </div>
          <Button size="sm" variant="primary" onClick={() => setEditOpen(true)}>
            Submit correction
          </Button>
        </div>
      }
      {locked &&
      <p className="mb-6 flex items-center gap-2 rounded-xl bg-cream-2 px-4 py-3 text-sm text-ink-2">
          <Lock className="h-4 w-4" aria-hidden /> Finalized by {r.reviewedBy} on {r.reviewedAt && fmtDateTime(r.reviewedAt)}. Figures can no longer be edited.
        </p>
      }

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Panel title="Sales breakdown">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-line">
                <Row label="Cash" value={fmtMoney(r.cash, true)} />
                <Row label="Credit / debit card" value={fmtMoney(r.card, true)} />
                <Row label={r.otherLabel} value={fmtMoney(r.other, true)} />
                {r.posTotal !== null && <Row label="POS total (cross-check)" value={fmtMoney(r.posTotal, true)} muted />}
              </tbody>
            </table>
          </Panel>
          <Panel title="Calculated metrics">
            <CalcPanel cash={r.cash} card={r.card} other={r.other} otherLabel={r.otherLabel} operatingHours={r.operatingHours} employeeHours={r.employeeHours} batches={r.batches} posTotal={r.posTotal} />
          </Panel>
          <Panel title="Change history" description="Every edit after submission, with previous and new values.">
            {r.history.length === 0 && audit.length === 0 ?
            <p className="text-sm text-ink-3">No changes since submission.</p> :

            <AuditTimeline entries={audit.length ? audit : []} empty="" />
            }
            {r.history.length > 0 && audit.length === 0 &&
            <ul className="space-y-2 text-sm">
                {r.history.map((h) =>
              <li key={h.id}>
                    <span className="font-medium">{h.field}</span> {h.from} → {h.to} <span className="text-ink-3">· {h.by}, {fmtDateTime(h.at)}</span>
                    <p className="text-[13px] italic text-ink-2">“{h.reason}”</p>
                  </li>
              )}
              </ul>
            }
          </Panel>
        </div>
        <div className="space-y-6">
          <Panel title="Event">
            <dl className="space-y-3 text-sm">
              <Def label="Event" value={ev ? <Link to={`/events/${ev.id}`} className="font-medium text-berry-700 hover:underline">{ev.name}</Link> : '—'} />
              <Def label="Time" value={ev ? fmtTimeRange(ev.start, ev.end) : '—'} />
              <Def label="Trailer" value={store.trailers.find((t) => t.id === r.trailerId)?.name ?? '—'} />
              <Def label="Hours" value={`${r.operatingHours} operating · ${r.employeeHours} employee`} />
              <Def label="Batches" value={`${r.batches} × ${r.batchUnit}`} />
            </dl>
          </Panel>
          <Panel title="Submission">
            <dl className="space-y-3 text-sm">
              <Def label="Submitted by" value={r.reportedBy} />
              <Def label="Submitted" value={r.submittedAt ? fmtDateTime(r.submittedAt) : 'Not yet'} />
              <Def label="Review" value={r.reviewedBy ? `${r.reviewedBy} · ${r.reviewedAt ? fmtDateTime(r.reviewedAt) : ''}` : 'Not reviewed'} />
            </dl>
            {r.notes && <p className="mt-4 rounded-lg bg-cream-2 px-3 py-2 text-sm">{r.notes}</p>}
          </Panel>
        </div>
      </div>

      <EditReportModal key={r.id + r.status + r.history.length} report={r} open={editOpen} onClose={() => setEditOpen(false)} />
      <Modal
        open={corrOpen}
        onClose={() => setCorrOpen(false)}
        title="Request a correction"
        description="The submitter will be notified and the report moves to Needs correction."
        footer={
        <>
            <Button onClick={() => setCorrOpen(false)}>Cancel</Button>
            <Button
            variant="primary"
            disabled={corrNote.trim().length < 5}
            onClick={() => {
              store.setReportStatus(r.id, 'needs_correction', corrNote.trim());
              setCorrOpen(false);
              toast.success('Correction requested');
            }}>
            
              Send request
            </Button>
          </>
        }>
        
        <label htmlFor="corr" className="text-[13px] font-medium text-ink-2">
          What needs to change?
        </label>
        <textarea id="corr" rows={3} className={`${inputCls} mt-1.5`} value={corrNote} onChange={(e) => setCorrNote(e.target.value)} placeholder="e.g. Card total doesn’t match the Square summary" />
      </Modal>
    </Page>);

}

function Row({ label, value, muted }: {label: string;value: string;muted?: boolean;}) {
  return (
    <tr>
      <td className={`py-2.5 ${muted ? 'text-ink-3' : 'text-ink-2'}`}>{label}</td>
      <td className={`py-2.5 text-right tabular ${muted ? 'text-ink-3' : 'font-medium'}`}>{value}</td>
    </tr>);

}

function Def({ label, value }: {label: string;value: React.ReactNode;}) {
  return (
    <div>
      <dt className="text-xs text-ink-3">{label}</dt>
      <dd>{value}</dd>
    </div>);

}