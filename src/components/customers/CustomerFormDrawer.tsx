import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';
import { useStore, HOME_FRANCHISE } from '../../contexts/StoreContext';
import { useUI } from '../../contexts/UIContext';
import { useScoped } from '../../hooks/useScoped';
import { Drawer } from '../ui/Drawer';
import { Button } from '../ui/Button';
import { Field, inputCls, inputErrorCls } from '../ui/Field';
import { TODAY } from '../../utils/date';
import { cx, uid } from '../../utils/format';
import type { Customer, CustomerType } from '../../types';

const TYPES: CustomerType[] = ['Business', 'Organization', 'School', 'Wedding / private event', 'Individual', 'Other'];

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const digits = (s: string) => s.replace(/\D/g, '');

export function CustomerFormDrawer() {
  const { customerForm, closeCustomerForm } = useUI();
  return (
    <Drawer open={!!customerForm} onClose={closeCustomerForm} title={customerForm?.customerId ? 'Edit customer' : 'Add customer'} subtitle="We’ll warn you if this looks like an existing customer." width="lg">
      {customerForm && <CustomerForm customerId={customerForm.customerId} />}
    </Drawer>);

}

function CustomerForm({ customerId }: {customerId?: string;}) {
  const store = useStore();
  const scoped = useScoped();
  const { closeCustomerForm, openEventForm } = useUI();
  const navigate = useNavigate();
  const existing = store.customers.find((c) => c.id === customerId);
  const defaultTerritory = scoped.territories.find((t) => t.franchiseId);

  const [draft, setDraft] = useState<Customer>(
    existing ?? {
      id: uid('c'),
      name: '',
      type: 'Business',
      contactName: '',
      phone: '',
      email: '',
      billing: '',
      location: '',
      franchiseId: defaultTerritory?.franchiseId ?? HOME_FRANCHISE,
      territoryId: defaultTerritory?.id ?? 't-tri',
      notes: '',
      status: 'active',
      createdAt: TODAY,
      interactions: []
    }
  );
  const [tried, setTried] = useState(false);
  const [confirmDup, setConfirmDup] = useState(false);
  const set = <K extends keyof Customer,>(k: K, v: Customer[K]) => setDraft((d) => ({ ...d, [k]: v }));

  const duplicates = useMemo(() => {
    const n = norm(draft.name);
    return scoped.customers.filter((c) => {
      if (c.id === draft.id) return false;
      const cn = norm(c.name);
      const nameMatch = n.length >= 4 && (cn.includes(n) || n.includes(cn));
      const emailMatch = draft.email.length > 4 && c.email.toLowerCase() === draft.email.toLowerCase();
      const phoneMatch = digits(draft.phone).length >= 10 && digits(c.phone) === digits(draft.phone);
      return nameMatch || emailMatch || phoneMatch;
    });
  }, [draft, scoped.customers]);

  const errors = {
    name: !draft.name.trim() ? 'Enter a customer or organization name.' : undefined,
    contactName: !draft.contactName.trim() ? 'Add a contact person.' : undefined,
    reach: !draft.phone.trim() && !draft.email.trim() ? 'Add a phone number or email.' : undefined
  };

  const save = () => {
    setTried(true);
    if (errors.name || errors.contactName || errors.reach) return;
    if (!existing && duplicates.length && !confirmDup) {
      toast.warning('Possible duplicate — review the match or confirm it’s a new customer.');
      return;
    }
    store.saveCustomer(draft);
    closeCustomerForm();
    if (existing) {
      toast.success('Customer updated');
      return;
    }
    toast.success(`${draft.name} added`, {
      action: { label: 'Schedule event', onClick: () => openEventForm({ mode: 'create', prefill: { customerId: draft.id } }) }
    });
    navigate(`/customers/${draft.id}`);
  };

  return (
    <div className="space-y-5 pb-20">
      {!existing && duplicates.length > 0 &&
      <div className="rounded-xl border border-warn-100 bg-warn-50 p-4" role="alert">
          <p className="flex items-center gap-2 text-sm font-semibold text-warn-700">
            <AlertTriangle className="h-4 w-4" aria-hidden /> This may be a returning customer
          </p>
          <ul className="mt-2 space-y-1.5">
            {duplicates.map((d) =>
          <li key={d.id} className="flex items-center justify-between gap-3 text-sm">
                <span>
                  <span className="font-medium">{d.name}</span> <span className="text-ink-2">· {d.contactName} · {d.phone}</span>
                </span>
                <Link to={`/customers/${d.id}`} onClick={closeCustomerForm} className="whitespace-nowrap font-medium text-berry-700 hover:underline">
                  Open record
                </Link>
              </li>
          )}
          </ul>
          <label className="mt-3 flex items-center gap-2 text-[13px] text-ink-2">
            <input type="checkbox" checked={confirmDup} onChange={(e) => setConfirmDup(e.target.checked)} className="h-4 w-4 accent-berry-600" />
            This is a different customer — create a new record anyway
          </label>
        </div>
      }
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Customer or organization name" htmlFor="c-name" required error={tried ? errors.name : undefined} className="sm:col-span-2">
          <input id="c-name" className={cx(inputCls, tried && errors.name && inputErrorCls)} value={draft.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Ridgeline Health" />
        </Field>
        <Field label="Customer type" htmlFor="c-type">
          <select id="c-type" className={inputCls} value={draft.type} onChange={(e) => set('type', e.target.value as CustomerType)}>
            {TYPES.map((t) =>
            <option key={t}>{t}</option>
            )}
          </select>
        </Field>
        <Field label="Status" htmlFor="c-status">
          <select id="c-status" className={inputCls} value={draft.status} onChange={(e) => set('status', e.target.value as Customer['status'])}>
            <option value="active">Active</option>
            <option value="lead">Lead</option>
            <option value="inactive">Inactive</option>
          </select>
        </Field>
        <Field label="Contact name" htmlFor="c-contact" required error={tried ? errors.contactName : undefined}>
          <input id="c-contact" className={cx(inputCls, tried && errors.contactName && inputErrorCls)} value={draft.contactName} onChange={(e) => set('contactName', e.target.value)} />
        </Field>
        <Field label="Phone" htmlFor="c-phone" error={tried ? errors.reach : undefined}>
          <input id="c-phone" className={inputCls} value={draft.phone} onChange={(e) => set('phone', e.target.value)} placeholder="(423) 555-0100" />
        </Field>
        <Field label="Email" htmlFor="c-email" className="sm:col-span-2">
          <input id="c-email" type="email" className={inputCls} value={draft.email} onChange={(e) => set('email', e.target.value)} />
        </Field>
        <Field label="Location" htmlFor="c-loc" className="sm:col-span-2">
          <input id="c-loc" className={inputCls} value={draft.location} onChange={(e) => set('location', e.target.value)} />
        </Field>
        <Field label="Territory" htmlFor="c-terr">
          <select
            id="c-terr"
            className={inputCls}
            value={draft.territoryId}
            onChange={(e) => {
              const t = store.territories.find((x) => x.id === e.target.value);
              setDraft((d) => ({ ...d, territoryId: e.target.value, franchiseId: t?.franchiseId ?? d.franchiseId }));
            }}>
            
            {scoped.territories.filter((t) => t.franchiseId).map((t) =>
            <option key={t.id} value={t.id}>
                {t.name}
              </option>
            )}
          </select>
        </Field>
        <Field label="Billing details" htmlFor="c-bill" hint="Optional — invoice terms, donation share, etc.">
          <input id="c-bill" className={inputCls} value={draft.billing} onChange={(e) => set('billing', e.target.value)} />
        </Field>
        <Field label="Notes" htmlFor="c-notes" className="sm:col-span-2">
          <textarea id="c-notes" rows={3} className={inputCls} value={draft.notes} onChange={(e) => set('notes', e.target.value)} />
        </Field>
      </div>
      <div className="sticky bottom-0 -mx-6 -mb-5 flex justify-end gap-2 border-t border-line bg-white px-6 py-3">
        <Button onClick={closeCustomerForm}>Cancel</Button>
        <Button variant="primary" onClick={save}>
          {existing ? 'Save changes' : 'Add customer'}
        </Button>
      </div>
    </div>);

}