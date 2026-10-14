import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { BellPlus, Check, ListChecks } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { useScoped } from '../../hooks/useScoped';
import { Page } from '../../components/layout/Page';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { FollowUpModal } from '../../components/customers/FollowUpModal';
import { TODAY, fmtDate, fmtDateTime } from '../../utils/date';
import { cx } from '../../utils/format';
import type { FollowUp } from '../../types';

export function FollowUpsPage() {
  const store = useStore();
  const scoped = useScoped();
  const [open, setOpen] = useState(false);
  const [showDone, setShowDone] = useState(false);

  const groups: {label: string;tone: string;items: FollowUp[];}[] = [
  { label: 'Overdue', tone: 'text-bad-700', items: scoped.followUps.filter((f) => !f.done && f.due < TODAY) },
  { label: 'Due today', tone: 'text-warn-700', items: scoped.followUps.filter((f) => !f.done && f.due === TODAY) },
  { label: 'Upcoming', tone: 'text-ink', items: scoped.followUps.filter((f) => !f.done && f.due > TODAY) },
  ...(showDone ? [{ label: 'Completed', tone: 'text-ink-3', items: scoped.followUps.filter((f) => f.done) }] : [])];

  const openCount = scoped.followUps.filter((f) => !f.done).length;

  return (
    <Page>
      <PageHeader
        title="Follow-ups"
        description={`${openCount} open reminders to rebook, thank or check in with customers.`}
        actions={
        <>
            <label className="mr-2 flex items-center gap-2 text-[13px] text-ink-2">
              <input type="checkbox" checked={showDone} onChange={(e) => setShowDone(e.target.checked)} className="h-4 w-4 accent-berry-600" />
              Show completed
            </label>
            <Button variant="primary" icon={BellPlus} onClick={() => setOpen(true)}>
              New follow-up
            </Button>
          </>
        } />
      
      {openCount === 0 && !showDone ?
      <div className="rounded-2xl border border-line bg-white shadow-card">
          <EmptyState icon={ListChecks} title="You’re all caught up" body="No open follow-ups. Schedule one from any customer profile." />
        </div> :

      <div className="space-y-6">
          {groups.
        filter((g) => g.items.length).
        map((g) =>
        <section key={g.label}>
                <h2 className={cx('mb-2 text-sm font-semibold', g.tone)}>
                  {g.label} <span className="font-normal text-ink-3">· {g.items.length}</span>
                </h2>
                <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white shadow-card">
                  {g.items.
            sort((a, b) => a.due.localeCompare(b.due)).
            map((f) => {
              const c = store.customers.find((x) => x.id === f.customerId);
              return (
                <li key={f.id} className="flex items-center gap-4 px-4 py-3">
                          <button
                    onClick={() => {
                      store.toggleFollowUp(f.id);
                      if (!f.done) toast.success('Marked complete');
                    }}
                    aria-label={f.done ? 'Reopen' : 'Mark complete'}
                    className={cx('flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-colors', f.done ? 'border-ok-600 bg-ok-600 text-white' : 'border-line-strong hover:border-berry-500 hover:bg-berry-50')}>
                    
                            {f.done && <Check className="h-4 w-4" />}
                          </button>
                          <div className="min-w-0 flex-1">
                            <p className={cx('text-sm', f.done && 'text-ink-3 line-through')}>{f.note}</p>
                            <Link to={`/customers/${f.customerId}`} className="text-xs font-medium text-berry-700 hover:underline">
                              {c?.name}
                            </Link>
                            <span className="text-xs text-ink-3"> · {c?.contactName} · {c?.phone}</span>
                          </div>
                          <span className="whitespace-nowrap text-right text-[13px] text-ink-2">
                            {f.done ? `Done ${f.completedAt ? fmtDateTime(f.completedAt) : ''}` : fmtDate(f.due)}
                            <span className="block text-xs text-ink-3">{f.owner}</span>
                          </span>
                        </li>);

            })}
                </ul>
              </section>
        )}
        </div>
      }
      <FollowUpModal open={open} onClose={() => setOpen(false)} />
    </Page>);

}