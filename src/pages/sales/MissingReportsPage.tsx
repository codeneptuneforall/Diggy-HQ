import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { BellRing, CheckCircle2, Flag, Settings2 } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { useScoped } from '../../hooks/useScoped';
import { Page } from '../../components/layout/Page';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { StatusChip } from '../../components/ui/StatusChip';
import { FilterSelect } from '../../components/ui/FilterSelect';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { inputCls } from '../../components/ui/Field';
import { fmtDate, fmtTimeRange, relTime } from '../../utils/date';
import { findReport, reportDue } from '../../utils/reports';

export function MissingReportsPage() {
  const store = useStore();
  const scoped = useScoped();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [franchise, setFranchise] = useState(params.get('franchise') ?? 'all');
  const [flagFor, setFlagFor] = useState<string | null>(null);
  const [flagNote, setFlagNote] = useState('');

  const rows = scoped.missing.
  filter((e) => franchise === 'all' || e.franchiseId === franchise).
  map((e) => {
    const due = reportDue(e, store.settings.reportDueHours);
    const responsible = store.employees.find((x) => e.employeeIds.includes(x.id) && x.canSubmitReports) ?? store.employees.find((x) => e.employeeIds.includes(x.id));
    const reminders = store.reminders.filter((r) => r.eventId === e.id).sort((a, b) => b.at.localeCompare(a.at));
    const exception = store.exceptions.find((x) => x.eventId === e.id);
    const draft = findReport(e.id, store.reports);
    const actions = [
    ...reminders.map((r) => ({ at: r.at, label: `Reminder to ${r.to}` })),
    ...(exception ? [{ at: exception.at, label: 'Flagged for review' }] : [])].
    sort((a, b) => b.at.localeCompare(a.at));
    return { e, due, responsible, reminders, exception, draft, last: actions[0] };
  }).
  sort((a, b) => b.due.minutesOver - a.due.minutesOver);

  const overdue = rows.filter((r) => r.due.overdue).length;

  return (
    <Page>
      <PageHeader
        title="Missing reports"
        description="Finished events without a submitted sales report."
        actions={
        store.role === 'corporate' && store.workspace === 'network' ?
        <FilterSelect label="Franchise" value={franchise} onChange={setFranchise} options={[{ value: 'all', label: 'All franchises' }, ...store.franchises.map((f) => ({ value: f.id, label: f.shortName }))]} /> :
        undefined
        } />
      
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-cream-2 px-4 py-3 text-sm">
        <p>
          <span className="font-semibold">Due rule:</span> reports are due {store.settings.reportDueHours} hours after an event ends. Reminders repeat every {store.settings.reminderEveryHours} hours, up to {store.settings.reminderMax} times.
        </p>
        <Link to="/settings?tab=workspace" className="flex items-center gap-1.5 text-[13px] font-medium text-berry-700 hover:underline">
          <Settings2 className="h-4 w-4" aria-hidden /> Change rule
        </Link>
      </div>

      {rows.length === 0 ?
      <div className="rounded-2xl border border-line bg-white shadow-card">
          <EmptyState icon={CheckCircle2} title="Every finished event has a report" body="Nice work. New gaps will show up here automatically." />
        </div> :

      <>
          <p className="mb-2 text-sm text-ink-2">
            <span className="font-semibold text-bad-700">{overdue} overdue</span> · {rows.length - overdue} due soon
          </p>
          <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-card">
            <table className="w-full text-sm">
              <thead className="border-b border-line bg-cream/60 text-left text-xs text-ink-3">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Event</th>
                  {store.role === 'corporate' && <th className="px-4 py-2.5 font-medium">Franchise · territory</th>}
                  <th className="px-4 py-2.5 font-medium">Trailer</th>
                  <th className="px-4 py-2.5 font-medium">Responsible</th>
                  <th className="px-4 py-2.5 font-medium">Due status</th>
                  <th className="px-4 py-2.5 font-medium">Reminders · last action</th>
                  <th className="px-4 py-2.5 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map(({ e, due, responsible, reminders, exception, draft, last }) =>
              <tr key={e.id} className="align-top">
                    <td className="px-4 py-3">
                      <Link to={`/events/${e.id}`} className="font-medium hover:text-berry-700">
                        {e.name}
                      </Link>
                      <p className="text-xs text-ink-3">
                        {fmtDate(e.date)} · {fmtTimeRange(e.start, e.end)}
                      </p>
                      {draft && <p className="mt-0.5 text-xs text-warn-700">Draft started, not submitted</p>}
                    </td>
                    {store.role === 'corporate' &&
                <td className="px-4 py-3 text-ink-2">
                        {store.franchises.find((f) => f.id === e.franchiseId)?.shortName}
                        <span className="block text-xs text-ink-3">{store.territories.find((t) => t.id === e.territoryId)?.name}</span>
                      </td>
                }
                    <td className="px-4 py-3 text-ink-2">{store.trailers.find((t) => t.id === e.trailerId)?.code ?? '—'}</td>
                    <td className="px-4 py-3">{responsible?.name ?? <span className="text-ink-3">Unassigned</span>}</td>
                    <td className="px-4 py-3">
                      <StatusChip tone={due.overdue ? 'bad' : 'warn'} label={due.label} />
                      {exception && <StatusChip tone="info" label="Exception flagged" icon={Flag} className="mt-1" />}
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-2">
                      <span className="block font-medium text-ink">{reminders.length ? `${reminders.length} sent` : 'None sent'}</span>
                      {last ? `${last.label} · ${relTime(last.at)}` : 'No action yet'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        {responsible &&
                    <Button size="sm" icon={BellRing} onClick={() => store.sendReminder(e.id, responsible.name)}>
                            Remind
                          </Button>
                    }
                        <Button size="sm" variant="ghost" onClick={() => navigate(draft ? `/sales-reports/new?report=${draft.id}` : `/events/${e.id}`)}>
                          {draft ? 'View draft' : 'Open event'}
                        </Button>
                        {store.role === 'corporate' || store.user.title === 'Franchise Owner' ?
                    <Button size="sm" variant="ghost" icon={Flag} onClick={() => setFlagFor(e.id)} aria-label="Flag exception" /> :
                    null}
                      </div>
                    </td>
                  </tr>
              )}
              </tbody>
            </table>
          </div>
        </>
      }

      <Modal
        open={!!flagFor}
        onClose={() => setFlagFor(null)}
        title="Flag as reporting exception"
        description="Use when a report legitimately can’t be submitted (e.g. donated event, rained out). The exception is logged for review."
        footer={
        <>
            <Button onClick={() => setFlagFor(null)}>Cancel</Button>
            <Button
            variant="primary"
            disabled={flagNote.trim().length < 5}
            onClick={() => {
              if (flagFor) store.flagException(flagFor, flagNote.trim());
              toast.success('Exception flagged for review');
              setFlagFor(null);
              setFlagNote('');
            }}>
            
              Flag exception
            </Button>
          </>
        }>
        
        <label htmlFor="flag-note" className="text-[13px] font-medium text-ink-2">
          Explanation
        </label>
        <textarea id="flag-note" rows={3} className={`${inputCls} mt-1.5`} value={flagNote} onChange={(e) => setFlagNote(e.target.value)} />
      </Modal>
    </Page>);

}