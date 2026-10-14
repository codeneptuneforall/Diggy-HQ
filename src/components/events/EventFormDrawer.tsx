import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { CheckCircle2, Plus, Truck, UserPlus } from 'lucide-react';
import { useStore, HOME_FRANCHISE } from '../../contexts/StoreContext';
import { useUI, type EventFormState } from '../../contexts/UIContext';
import { useScoped } from '../../hooks/useScoped';
import { Drawer } from '../ui/Drawer';
import { Button } from '../ui/Button';
import { Field, inputCls, inputErrorCls } from '../ui/Field';
import { IssueList } from '../ui/IssueList';
import { Avatar } from '../ui/Avatar';
import { getEventIssues, hasConflict, overlaps } from '../../utils/conflicts';
import { TODAY, addDaysStr, fmtTimeRange } from '../../utils/date';
import { cx, uid } from '../../utils/format';
import { eventStatusMeta } from '../../utils/status';
import type { DiggyEvent, EventStatus } from '../../types';

export function EventFormDrawer() {
  const { eventForm, closeEventForm } = useUI();
  const title = eventForm?.mode === 'edit' ? 'Edit event' : eventForm?.mode === 'duplicate' ? 'Duplicate event' : 'Create event';
  return (
    <Drawer open={!!eventForm} onClose={closeEventForm} title={title} subtitle="Conflicts are checked as you assign trailers and crew." width="xl">
      {eventForm && <EventForm state={eventForm} />}
    </Drawer>);

}

function blankEvent(franchiseId: string, territoryId: string, prefill?: Partial<DiggyEvent>): DiggyEvent {
  return {
    id: uid('ev'),
    name: '',
    category: '',
    customerId: null,
    contactName: '',
    phone: '',
    email: '',
    date: addDaysStr(TODAY, 1),
    start: '10:00',
    end: '14:00',
    venue: '',
    address: '',
    territoryId,
    franchiseId,
    trailerId: null,
    employeeIds: [],
    staffNeeded: 2,
    notes: '',
    internalNotes: '',
    followUpDate: null,
    status: 'tentative',
    ...prefill
  };
}

function EventForm({ state }: {state: EventFormState;}) {
  const store = useStore();
  const { closeEventForm, openCustomerForm } = useUI();
  const scoped = useScoped();
  const navigate = useNavigate();
  const defaultTerritory = scoped.territories.find((t) => t.franchiseId) ?? store.territories[0];

  const [draft, setDraft] = useState<DiggyEvent>(() => {
    if (state.mode === 'edit' && state.event) return { ...state.event };
    if (state.mode === 'duplicate' && state.event)
    return { ...state.event, id: uid('ev'), name: `${state.event.name} (copy)`, status: 'tentative', date: addDaysStr(TODAY, 7), employeeIds: [], trailerId: null };
    const base = blankEvent(defaultTerritory?.franchiseId ?? HOME_FRANCHISE, defaultTerritory?.id ?? 't-tri', state.prefill);
    if (state.prefill?.customerId) {
      const c = store.customers.find((x) => x.id === state.prefill?.customerId);
      if (c) Object.assign(base, { contactName: c.contactName, phone: c.phone, email: c.email, territoryId: c.territoryId, franchiseId: c.franchiseId, address: c.location, name: `${c.name} event` });
    }
    return base;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [triedSave, setTriedSave] = useState(false);

  const set = <K extends keyof DiggyEvent,>(k: K, v: DiggyEvent[K]) => setDraft((d) => ({ ...d, [k]: v }));

  const franchiseTrailers = store.trailers.filter((t) => t.franchiseId === draft.franchiseId);
  const franchiseEmployees = store.employees.filter((e) => e.franchiseId === draft.franchiseId && e.status !== 'inactive');
  const others = store.events.filter((o) => o.id !== draft.id && o.status !== 'cancelled' && o.date === draft.date && draft.start < draft.end && overlaps(draft.start, draft.end, o.start, o.end));

  const issues = useMemo(() => {
    if (draft.start >= draft.end) return [];
    return getEventIssues(draft, store.events, store.employees, store.trailers, { includePast: true });
  }, [draft, store.events, store.employees, store.trailers]);
  const blocking = hasConflict(issues);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!draft.name.trim()) e.name = 'Give the event a name.';
    if (!draft.category) e.category = 'Choose a category.';
    if (!draft.date) e.date = 'Pick a date.';
    if (draft.start >= draft.end) e.end = 'End time must be after the start time.';
    if (!draft.venue.trim()) e.venue = 'Add a venue name.';
    if (draft.status === 'confirmed' && !draft.trailerId) e.trailer = 'Confirmed events need a trailer. Assign one or keep the event tentative.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = () => {
    setTriedSave(true);
    if (!validate()) {
      toast.error('Some required details are missing.');
      return;
    }
    if (blocking) {
      toast.error('Resolve scheduling conflicts before saving.');
      return;
    }
    store.saveEvent(draft);
    closeEventForm();
    const isNew = state.mode !== 'edit';
    toast.success(isNew ? 'Event created and added to the calendar' : 'Event updated');
    if (isNew) navigate(`/calendar?date=${draft.date}&highlight=${draft.id}`);
  };

  const pickCustomer = (id: string) => {
    const c = store.customers.find((x) => x.id === id);
    if (!c) return set('customerId', null);
    setDraft((d) => ({
      ...d,
      customerId: c.id,
      contactName: c.contactName,
      phone: c.phone,
      email: c.email,
      territoryId: c.territoryId,
      franchiseId: c.franchiseId,
      address: d.address || c.location,
      name: d.name || `${c.name} event`
    }));
  };

  const toggleEmployee = (id: string) =>
  set('employeeIds', draft.employeeIds.includes(id) ? draft.employeeIds.filter((x) => x !== id) : [...draft.employeeIds, id]);

  const err = (k: string) => triedSave ? errors[k] : undefined;

  return (
    <div className="space-y-8 pb-20">
      <Section title="Customer" step={1}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Customer or organization" htmlFor="ev-customer" className="sm:col-span-2" hint="Picking a customer fills in contact details and territory.">
            <div className="flex gap-2">
              <select id="ev-customer" className={inputCls} value={draft.customerId ?? ''} onChange={(e) => pickCustomer(e.target.value)}>
                <option value="">No customer (e.g. public event)</option>
                {scoped.customers.map((c) =>
                <option key={c.id} value={c.id}>
                    {c.name} — {c.contactName}
                  </option>
                )}
              </select>
              <Button icon={Plus} onClick={() => openCustomerForm({})}>
                New
              </Button>
            </div>
          </Field>
          <Field label="Contact person" htmlFor="ev-contact">
            <input id="ev-contact" className={inputCls} value={draft.contactName} onChange={(e) => set('contactName', e.target.value)} />
          </Field>
          <Field label="Phone" htmlFor="ev-phone">
            <input id="ev-phone" className={inputCls} value={draft.phone} onChange={(e) => set('phone', e.target.value)} />
          </Field>
          <Field label="Email" htmlFor="ev-email" className="sm:col-span-2">
            <input id="ev-email" type="email" className={inputCls} value={draft.email} onChange={(e) => set('email', e.target.value)} />
          </Field>
        </div>
      </Section>

      <Section title="Event details" step={2}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Event name" htmlFor="ev-name" required error={err('name')} className="sm:col-span-2">
            <input id="ev-name" className={cx(inputCls, err('name') && inputErrorCls)} value={draft.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Corporate Office Treat Day" />
          </Field>
          <Field label="Category" htmlFor="ev-cat" required error={err('category')}>
            <select id="ev-cat" className={cx(inputCls, err('category') && inputErrorCls)} value={draft.category} onChange={(e) => set('category', e.target.value)}>
              <option value="">Select category</option>
              {store.settings.categories.filter((c) => c.active).map((c) =>
              <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              )}
            </select>
          </Field>
          <Field label="Status" htmlFor="ev-status">
            <select id="ev-status" className={inputCls} value={draft.status} onChange={(e) => set('status', e.target.value as EventStatus)}>
              {(['tentative', 'confirmed', 'in_progress', 'completed'] as EventStatus[]).map((s) =>
              <option key={s} value={s}>
                  {eventStatusMeta[s].label}
                </option>
              )}
            </select>
          </Field>
          <Field label="Date" htmlFor="ev-date" required error={err('date')}>
            <input id="ev-date" type="date" className={inputCls} value={draft.date} onChange={(e) => set('date', e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start" htmlFor="ev-start" required>
              <input id="ev-start" type="time" className={inputCls} value={draft.start} onChange={(e) => set('start', e.target.value)} />
            </Field>
            <Field label="End" htmlFor="ev-end" required error={err('end') ?? (draft.start >= draft.end ? 'Must be after start' : undefined)}>
              <input id="ev-end" type="time" className={cx(inputCls, draft.start >= draft.end && inputErrorCls)} value={draft.end} onChange={(e) => set('end', e.target.value)} />
            </Field>
          </div>
          <Field label="Venue name" htmlFor="ev-venue" required error={err('venue')}>
            <input id="ev-venue" className={cx(inputCls, err('venue') && inputErrorCls)} value={draft.venue} onChange={(e) => set('venue', e.target.value)} />
          </Field>
          <Field label="Territory" htmlFor="ev-terr">
            <select
              id="ev-terr"
              className={inputCls}
              value={draft.territoryId}
              onChange={(e) => {
                const t = store.territories.find((x) => x.id === e.target.value);
                setDraft((d) => ({ ...d, territoryId: e.target.value, franchiseId: t?.franchiseId ?? d.franchiseId, trailerId: t?.franchiseId !== d.franchiseId ? null : d.trailerId, employeeIds: t?.franchiseId !== d.franchiseId ? [] : d.employeeIds }));
              }}>
              
              {scoped.territories.filter((t) => t.franchiseId).map((t) =>
              <option key={t.id} value={t.id}>
                  {t.name}
                  {store.role === 'corporate' ? ` · ${store.franchises.find((f) => f.id === t.franchiseId)?.shortName}` : ''}
                </option>
              )}
            </select>
          </Field>
          <Field label="Venue address" htmlFor="ev-addr" className="sm:col-span-2" hint={!draft.address ? 'Crew will need this for directions.' : undefined}>
            <input id="ev-addr" className={inputCls} value={draft.address} onChange={(e) => set('address', e.target.value)} />
          </Field>
        </div>
      </Section>

      <Section title="Trailer" step={3}>
        {franchiseTrailers.length === 0 ?
        <p className="rounded-lg bg-cream-2 px-4 py-3 text-sm text-ink-2">This franchise has no trailers registered.</p> :

        <div className="grid gap-2 sm:grid-cols-2">
            {[null, ...franchiseTrailers].map((t) => {
            const booked = t ? others.find((o) => o.trailerId === t.id) : undefined;
            const down = t && t.baseStatus !== 'available';
            const selected = draft.trailerId === (t?.id ?? null);
            const status = !t ? 'Decide later' : down ? t.baseStatus === 'maintenance' ? 'In maintenance' : 'Unavailable' : booked ? `Booked · ${booked.name}, ${fmtTimeRange(booked.start, booked.end)}` : 'Available for this time';
            return (
              <button
                key={t?.id ?? 'none'}
                type="button"
                onClick={() => set('trailerId', t?.id ?? null)}
                aria-pressed={selected}
                className={cx(
                  'flex items-start gap-3 rounded-xl border px-3.5 py-3 text-left transition-[border-color,background-color] duration-150',
                  selected ? 'border-berry-500 bg-berry-50' : 'border-line-strong bg-white hover:border-berry-200'
                )}>
                
                  <Truck className={cx('mt-0.5 h-4 w-4 shrink-0', selected ? 'text-berry-600' : 'text-ink-3')} aria-hidden />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{t?.name ?? 'No trailer yet'}</span>
                    <span className={cx('block text-xs', booked || down ? 'font-medium text-bad-700' : t ? 'text-ok-700' : 'text-ink-3')}>{status}</span>
                  </span>
                </button>);

          })}
          </div>
        }
        {err('trailer') && <p className="mt-2 text-xs font-medium text-bad-700">{err('trailer')}</p>}
      </Section>

      <Section title="Crew" step={4}>
        <div className="mb-3 flex items-center gap-3">
          <label htmlFor="ev-staff" className="text-[13px] font-medium text-ink-2">
            Crew needed
          </label>
          <input id="ev-staff" type="number" min={1} max={6} className={cx(inputCls, 'w-20')} value={draft.staffNeeded} onChange={(e) => set('staffNeeded', Math.max(1, Number(e.target.value)))} />
          <span className="text-[13px] text-ink-3">
            {draft.employeeIds.length} of {draft.staffNeeded} assigned
          </span>
        </div>
        <ul className="divide-y divide-line rounded-xl border border-line-strong">
          {franchiseEmployees.map((emp) => {
            const busy = others.find((o) => o.employeeIds.includes(emp.id));
            const off = emp.unavailable.find((u) => u.date === draft.date && overlaps(draft.start, draft.end, u.start, u.end));
            const checked = draft.employeeIds.includes(emp.id);
            const label = emp.status === 'on_leave' ? 'On leave' : busy ? `Booked · ${busy.name}` : off ? `Unavailable · ${off.reason}` : 'Available';
            const bad = emp.status === 'on_leave' || !!busy || !!off;
            return (
              <li key={emp.id}>
                <label className="flex cursor-pointer items-center gap-3 px-3.5 py-2.5 transition-colors hover:bg-cream/60">
                  <input type="checkbox" checked={checked} onChange={() => toggleEmployee(emp.id)} className="h-4 w-4 rounded border-line-strong accent-berry-600" />
                  <Avatar name={emp.name} size="sm" />
                  <span className="flex-1">
                    <span className="block text-sm font-medium">{emp.name}</span>
                    <span className="block text-xs text-ink-3">{emp.role}</span>
                  </span>
                  <span className={cx('text-xs font-medium', bad ? 'text-bad-700' : 'text-ok-700')}>{label}</span>
                </label>
              </li>);

          })}
        </ul>
      </Section>

      <Section title="Notes & follow-up" step={5}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Event notes (visible to crew)" htmlFor="ev-notes" className="sm:col-span-2">
            <textarea id="ev-notes" rows={3} className={inputCls} value={draft.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Parking, check-in, serving times…" />
          </Field>
          <Field label="Internal notes" htmlFor="ev-int" hint="Only owners and corporate can see these.">
            <textarea id="ev-int" rows={2} className={inputCls} value={draft.internalNotes} onChange={(e) => set('internalNotes', e.target.value)} />
          </Field>
          <Field label="Follow-up date" htmlFor="ev-fu">
            <input id="ev-fu" type="date" className={inputCls} value={draft.followUpDate ?? ''} onChange={(e) => set('followUpDate', e.target.value || null)} />
          </Field>
        </div>
      </Section>

      <div className="sticky bottom-0 -mx-6 -mb-5 space-y-3 border-t border-line bg-white px-6 py-4">
        {issues.length > 0 ?
        <IssueList issues={issues} compact /> :

        <p className="flex items-center gap-2 text-sm font-medium text-ok-700">
            <CheckCircle2 className="h-4 w-4" aria-hidden /> No conflicts — trailer and crew are clear for this time.
          </p>
        }
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={() => openCustomerForm({})} icon={UserPlus} className="mr-auto hidden sm:inline-flex">
            Add customer
          </Button>
          <Button onClick={closeEventForm}>Cancel</Button>
          <Button variant="primary" onClick={save} disabled={blocking}>
            {state.mode === 'edit' ? 'Save changes' : 'Save event'}
          </Button>
        </div>
      </div>
    </div>);

}

function Section({ title, step, children }: {title: string;step: number;children: React.ReactNode;}) {
  return (
    <section>
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cream-2 text-[11px] font-semibold text-ink-2">{step}</span>
        {title}
      </h3>
      {children}
    </section>);

}