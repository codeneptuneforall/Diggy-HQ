import React, { useState } from 'react';
import { toast } from 'sonner';
import { useStore, HOME_FRANCHISE } from '../../contexts/StoreContext';
import { Drawer } from '../ui/Drawer';
import { Button } from '../ui/Button';
import { Field, inputCls, inputErrorCls } from '../ui/Field';
import { cx, uid } from '../../utils/format';
import type { InventoryItem } from '../../types';

const CATEGORIES = ['Ingredients', 'Toppings', 'Packaging', 'Fuel & supplies', 'Equipment'];

export function ItemFormDrawer({ open, onClose, item }: {open: boolean;onClose: () => void;item?: InventoryItem;}) {
  return (
    <Drawer open={open} onClose={onClose} title={item ? 'Edit item' : 'Add inventory item'} width="md">
      {open && <ItemForm item={item} onClose={onClose} />}
    </Drawer>);

}

function ItemForm({ item, onClose }: {item?: InventoryItem;onClose: () => void;}) {
  const store = useStore();
  const [d, setD] = useState<InventoryItem>(
    item ?? { id: uid('inv'), name: '', sku: '', category: 'Ingredients', unit: 'each', reorderLevel: 0, targetQty: null, franchiseId: store.scopeIds[0] ?? HOME_FRANCHISE, location: '', notes: '', active: true }
  );
  const [opening, setOpening] = useState('0');
  const [tried, setTried] = useState(false);
  const set = <K extends keyof InventoryItem,>(k: K, v: InventoryItem[K]) => setD((x) => ({ ...x, [k]: v }));
  const errors = { name: !d.name.trim() ? 'Name is required.' : undefined, sku: !d.sku.trim() ? 'SKU or internal ID is required.' : undefined };

  return (
    <div className="space-y-4 pb-20">
      <Field label="Item name" htmlFor="it-name" required error={tried ? errors.name : undefined}>
        <input id="it-name" className={cx(inputCls, tried && errors.name && inputErrorCls)} value={d.name} onChange={(e) => set('name', e.target.value)} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="SKU / internal ID" htmlFor="it-sku" required error={tried ? errors.sku : undefined}>
          <input id="it-sku" className={cx(inputCls, tried && errors.sku && inputErrorCls)} value={d.sku} onChange={(e) => set('sku', e.target.value)} />
        </Field>
        <Field label="Category" htmlFor="it-cat">
          <select id="it-cat" className={inputCls} value={d.category} onChange={(e) => set('category', e.target.value)}>
            {CATEGORIES.map((c) =>
            <option key={c}>{c}</option>
            )}
          </select>
        </Field>
        <Field label="Unit of measure" htmlFor="it-unit" hint="Configure units in Settings.">
          <select id="it-unit" className={inputCls} value={d.unit} onChange={(e) => set('unit', e.target.value)}>
            {store.settings.units.map((u) =>
            <option key={u}>{u}</option>
            )}
          </select>
        </Field>
        {!item &&
        <Field label="Opening quantity" htmlFor="it-open">
            <input id="it-open" type="number" min={0} className={inputCls} value={opening} onChange={(e) => setOpening(e.target.value)} />
          </Field>
        }
        <Field label="Reorder level" htmlFor="it-re" hint="Alert at or below this.">
          <input id="it-re" type="number" min={0} className={inputCls} value={d.reorderLevel} onChange={(e) => set('reorderLevel', Number(e.target.value))} />
        </Field>
        <Field label="Target quantity" htmlFor="it-tg" hint="Optional. Used to suggest reorder amounts.">
          <input id="it-tg" type="number" min={0} className={inputCls} value={d.targetQty ?? ''} onChange={(e) => set('targetQty', e.target.value === '' ? null : Number(e.target.value))} />
        </Field>
      </div>
      <Field label="Location" htmlFor="it-loc">
        <input id="it-loc" className={inputCls} value={d.location} onChange={(e) => set('location', e.target.value)} />
      </Field>
      <Field label="Notes" htmlFor="it-notes">
        <textarea id="it-notes" rows={2} className={inputCls} value={d.notes} onChange={(e) => set('notes', e.target.value)} />
      </Field>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={d.active} onChange={(e) => set('active', e.target.checked)} className="h-4 w-4 accent-berry-600" />
        Active — tracked and included in alerts
      </label>
      <div className="sticky bottom-0 -mx-6 -mb-5 flex justify-end gap-2 border-t border-line bg-white px-6 py-3">
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="primary"
          onClick={() => {
            setTried(true);
            if (errors.name || errors.sku) return;
            store.saveItem(d, item ? undefined : Math.max(0, Number(opening) || 0));
            toast.success(item ? 'Item updated' : 'Item added');
            onClose();
          }}>
          
          {item ? 'Save item' : 'Add item'}
        </Button>
      </div>
    </div>);

}