import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { useUI, type StockFormState } from '../../contexts/UIContext';
import { useScoped } from '../../hooks/useScoped';
import { Drawer } from '../ui/Drawer';
import { Button } from '../ui/Button';
import { Field, inputCls, inputErrorCls } from '../ui/Field';
import { TODAY, fmtDate } from '../../utils/date';
import { balanceOf, MOVEMENT_LABELS } from '../../utils/inventory';
import { cx, fmtNum } from '../../utils/format';
import type { MovementType } from '../../types';

const TYPES: {id: Exclude<MovementType, 'opening'>;label: string;help: string;}[] = [
{ id: 'used', label: 'Event usage', help: 'Stock consumed at an event.' },
{ id: 'received', label: 'Received', help: 'New stock delivered or picked up.' },
{ id: 'adjustment', label: 'Adjustment', help: 'Damage, waste, transfers. Reason required.' },
{ id: 'count', label: 'Physical count', help: 'Record what’s actually on hand. Differences become a variance for review.' }];


export function StockFormDrawer() {
  const { stockForm, closeStockForm } = useUI();
  return (
    <Drawer open={!!stockForm} onClose={closeStockForm} title="Record inventory" subtitle="Every change is saved to item history — nothing is overwritten." width="lg">
      {stockForm && <StockForm initial={stockForm} />}
    </Drawer>);

}

function StockForm({ initial }: {initial: StockFormState;}) {
  const store = useStore();
  const scoped = useScoped();
  const { closeStockForm } = useUI();
  const activeItems = scoped.items.filter((i) => i.active);
  const [type, setType] = useState<Exclude<MovementType, 'opening'>>(initial.type as Exclude<MovementType, 'opening'> ?? 'used');
  const [itemId, setItemId] = useState(initial.itemId ?? activeItems[0]?.id ?? '');
  const [eventId, setEventId] = useState(initial.eventId ?? '');
  const [qty, setQty] = useState('');
  const [direction, setDirection] = useState<'remove' | 'add'>('remove');
  const [reason, setReason] = useState('');
  const [tried, setTried] = useState(false);

  const item = store.items.find((i) => i.id === itemId);
  const current = item ? balanceOf(item.id, store.movements) : 0;
  const n = Number(qty);
  const qtyValid = qty !== '' && !Number.isNaN(n) && n >= 0 && (type === 'count' || n > 0);

  const delta = !qtyValid ? 0 : type === 'used' ? -n : type === 'received' ? n : type === 'adjustment' ? direction === 'add' ? n : -n : n - current;
  const next = current + delta;
  const willBeLow = item && next <= item.reorderLevel;
  const goesNegative = next < 0;

  const recentEvents = useMemo(
    () => scoped.events.filter((e) => e.franchiseId === item?.franchiseId && e.status !== 'cancelled' && e.date <= TODAY).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8),
    [scoped.events, item]
  );

  const errors = {
    qty: !qtyValid ? type === 'count' ? 'Enter the counted quantity.' : 'Enter a quantity greater than 0.' : goesNegative ? `Only ${current} on hand — quantity can’t go below zero.` : undefined,
    event: type === 'used' && !eventId ? 'Link usage to the event it was used at.' : undefined,
    reason: (type === 'adjustment' || type === 'count' && delta !== 0) && reason.trim().length < 4 ? 'Explain the change — this is required for the audit trail.' : undefined
  };

  const save = () => {
    setTried(true);
    if (!item || errors.qty || errors.event || errors.reason) return;
    if (type === 'count') {
      if (delta === 0) {
        toast.success(`Count matches — ${fmtNum(current)} ${item.unit} on hand`);
        closeStockForm();
        return;
      }
      store.addMovement({ itemId, type: 'count', qty: delta, reason, eventId: eventId || undefined });
      store.addVariance({ itemId, eventId: eventId || null, expected: current, actual: n, note: reason });
      toast.success('Count recorded — variance sent for review');
    } else {
      store.addMovement({ itemId, type, qty: delta, eventId: type === 'used' ? eventId : undefined, reason: reason || undefined });
      toast.success(`${MOVEMENT_LABELS[type]} recorded — ${item.name} now ${fmtNum(next)} ${item.unit}`);
    }
    closeStockForm();
  };

  return (
    <div className="space-y-5 pb-24">
      <fieldset>
        <legend className="mb-2 text-[13px] font-medium text-ink-2">What are you recording?</legend>
        <div className="grid grid-cols-2 gap-2">
          {TYPES.map((t) =>
          <button
            key={t.id}
            type="button"
            aria-pressed={type === t.id}
            onClick={() => setType(t.id)}
            className={cx('rounded-xl border px-3 py-2.5 text-left transition-colors', type === t.id ? 'border-berry-500 bg-berry-50' : 'border-line-strong hover:border-berry-200')}>
            
              <span className="block text-sm font-medium">{t.label}</span>
              <span className="block text-xs text-ink-3">{t.help}</span>
            </button>
          )}
        </div>
      </fieldset>

      <Field label="Item" htmlFor="st-item" required>
        <select id="st-item" className={inputCls} value={itemId} onChange={(e) => setItemId(e.target.value)}>
          {activeItems.map((i) =>
          <option key={i.id} value={i.id}>
              {i.name} · {i.unit}
              {store.role === 'corporate' ? ` · ${store.franchises.find((f) => f.id === i.franchiseId)?.shortName}` : ''}
            </option>
          )}
        </select>
      </Field>

      {(type === 'used' || type === 'count') &&
      <Field label={type === 'used' ? 'Event' : 'Related event (optional)'} htmlFor="st-ev" required={type === 'used'} error={tried ? errors.event : undefined}>
          <select id="st-ev" className={cx(inputCls, tried && errors.event && inputErrorCls)} value={eventId} onChange={(e) => setEventId(e.target.value)}>
            <option value="">{type === 'used' ? 'Select event' : 'Not tied to an event'}</option>
            {recentEvents.map((e) =>
          <option key={e.id} value={e.id}>
                {fmtDate(e.date, 'MMM d')} · {e.name}
              </option>
          )}
          </select>
        </Field>
      }

      <div className="grid gap-4 sm:grid-cols-2">
        {type === 'adjustment' &&
        <Field label="Direction" htmlFor="st-dir">
            <select id="st-dir" className={inputCls} value={direction} onChange={(e) => setDirection(e.target.value as 'add' | 'remove')}>
              <option value="remove">Remove from stock</option>
              <option value="add">Add to stock</option>
            </select>
          </Field>
        }
        <Field label={type === 'count' ? `Counted quantity (${item?.unit})` : `Quantity (${item?.unit})`} htmlFor="st-qty" required error={tried ? errors.qty : goesNegative ? errors.qty : undefined}>
          <input id="st-qty" type="number" inputMode="decimal" min={0} step="0.5" className={cx(inputCls, tried && errors.qty && inputErrorCls)} value={qty} onChange={(e) => setQty(e.target.value)} />
        </Field>
      </div>

      <Field
        label={type === 'adjustment' || type === 'count' ? 'Reason' : 'Note (optional)'}
        htmlFor="st-reason"
        required={type === 'adjustment' || type === 'count' && delta !== 0}
        error={tried ? errors.reason : undefined}>
        
        <textarea id="st-reason" rows={2} className={cx(inputCls, tried && errors.reason && inputErrorCls)} value={reason} onChange={(e) => setReason(e.target.value)} placeholder={type === 'count' ? 'Explain any discrepancy (spill, miscount, waste…)' : ''} />
      </Field>

      {item &&
      <div className="rounded-xl border border-line bg-cream/60 p-4">
          <p className="text-[13px] font-medium text-ink-2">Balance preview</p>
          <div className="mt-2 flex items-center gap-3 tabular">
            <span className="text-lg font-semibold">
              {fmtNum(current, 1)} <span className="text-sm font-normal text-ink-3">{item.unit}</span>
            </span>
            <ArrowRight className="h-4 w-4 text-ink-3" aria-hidden />
            <span className={cx('text-lg font-semibold', willBeLow ? 'text-bad-700' : 'text-ink')}>
              {qtyValid ? fmtNum(next, 1) : '—'} <span className="text-sm font-normal text-ink-3">{item.unit}</span>
            </span>
            {type === 'count' && qtyValid && delta !== 0 &&
          <span className="rounded-full bg-warn-100 px-2 py-0.5 text-xs font-semibold text-warn-700">
                Variance {delta > 0 ? '+' : ''}
                {fmtNum(delta, 1)}
              </span>
          }
          </div>
          {qtyValid && !goesNegative &&
        <p className={cx('mt-2 flex items-center gap-1.5 text-[13px]', willBeLow ? 'text-bad-700' : 'text-ok-700')}>
              {willBeLow ? <AlertTriangle className="h-4 w-4" aria-hidden /> : <CheckCircle2 className="h-4 w-4" aria-hidden />}
              {willBeLow ? `At or below the reorder level (${item.reorderLevel}). A low-stock alert will be raised.` : `Above the reorder level (${item.reorderLevel}).`}
            </p>
        }
        </div>
      }

      <div className="sticky bottom-0 -mx-6 -mb-5 flex justify-end gap-2 border-t border-line bg-white px-6 py-3">
        <Button onClick={closeStockForm}>Cancel</Button>
        <Button variant="primary" onClick={save}>
          Save {TYPES.find((t) => t.id === type)?.label.toLowerCase()}
        </Button>
      </div>
    </div>);

}