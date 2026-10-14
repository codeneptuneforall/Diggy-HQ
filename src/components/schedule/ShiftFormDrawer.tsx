import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { CheckCircle2 } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { useUI } from '../../contexts/UIContext';
import { useScoped } from '../../hooks/useScoped';
import { Drawer } from '../ui/Drawer';
import { Button } from '../ui/Button';
import { Field, inputCls } from '../ui/Field';
import { IssueList } from '../ui/IssueList';
import { TODAY, fmtDate, fmtTimeRange } from '../../utils/date';
import { getEventIssues } from '../../utils/conflicts';

export function ShiftFormDrawer() {
  const { shiftForm, closeShiftForm } = useUI();
  return (
    <Drawer open={!!shiftForm} onClose={closeShiftForm} title="Assign employee to shift" subtitle="Shifts follow the event’s time and trailer." width="md">
      {shiftForm && <ShiftForm initialEvent={shiftForm.eventId} initialEmployee={shiftForm.employeeId} />}
    </Drawer>);

}

function ShiftForm({ initialEvent, initialEmployee }: {initialEvent?: string;initialEmployee?: string;}) {
  const store = useStore();
  const scoped = useScoped();
  const { closeShiftForm } = useUI();
  const upcoming = scoped.events.filter((e) => e.date >= TODAY && e.status !== 'cancelled' && e.status !== 'completed').sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
  const [eventId, setEventId] = useState(initialEvent ?? upcoming[0]?.id ?? '');
  const ev = store.events.find((e) => e.id === eventId);
  const emps = scoped.employees.filter((e) => e.franchiseId === ev?.franchiseId && e.status === 'active');
  const [employeeId, setEmployeeId] = useState(initialEmployee ?? '');

  const already = ev?.employeeIds.includes(employeeId);
  const issues = useMemo(() => {
    if (!ev || !employeeId || already) return [];
    const trial = { ...ev, employeeIds: [...ev.employeeIds, employeeId] };
    return getEventIssues(trial, store.events, store.employees, store.trailers).filter((i) => i.resource === store.employees.find((e) => e.id === employeeId)?.name);
  }, [ev, employeeId, already, store.events, store.employees, store.trailers]);

  const save = () => {
    if (!ev || !employeeId || already || issues.some((i) => i.severity === 'conflict')) return;
    store.saveEvent({ ...ev, employeeIds: [...ev.employeeIds, employeeId] });
    toast.success(`${store.employees.find((e) => e.id === employeeId)?.name} assigned to ${ev.name}`);
    closeShiftForm();
  };

  return (
    <div className="space-y-5 pb-20">
      <Field label="Event" htmlFor="sh-ev" required>
        <select id="sh-ev" className={inputCls} value={eventId} onChange={(e) => setEventId(e.target.value)}>
          {upcoming.map((e) =>
          <option key={e.id} value={e.id}>
              {fmtDate(e.date, 'EEE MMM d')} · {e.name}
            </option>
          )}
        </select>
      </Field>
      {ev &&
      <div className="rounded-xl bg-cream-2 px-4 py-3 text-sm">
          <p className="font-medium">{fmtTimeRange(ev.start, ev.end)}</p>
          <p className="text-ink-2">
            {store.trailers.find((t) => t.id === ev.trailerId)?.name ?? 'No trailer assigned'} · {ev.employeeIds.length}/{ev.staffNeeded} crew
          </p>
        </div>
      }
      <Field label="Employee" htmlFor="sh-emp" required>
        <select id="sh-emp" className={inputCls} value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}>
          <option value="">Select employee</option>
          {emps.map((e) =>
          <option key={e.id} value={e.id}>
              {e.name} · {e.role}
            </option>
          )}
        </select>
      </Field>
      {already && <p className="text-sm text-ink-2">This employee is already on this shift.</p>}
      {employeeId && !already && (issues.length ? <IssueList issues={issues} compact /> : <p className="flex items-center gap-2 text-sm font-medium text-ok-700"><CheckCircle2 className="h-4 w-4" aria-hidden /> Available for this shift.</p>)}
      <div className="sticky bottom-0 -mx-6 -mb-5 flex justify-end gap-2 border-t border-line bg-white px-6 py-3">
        <Button onClick={closeShiftForm}>Cancel</Button>
        <Button variant="primary" onClick={save} disabled={!employeeId || already || issues.some((i) => i.severity === 'conflict')}>
          Assign shift
        </Button>
      </div>
    </div>);

}