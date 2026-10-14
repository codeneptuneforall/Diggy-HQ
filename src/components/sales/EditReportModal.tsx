import React, { useState } from 'react';
import { toast } from 'sonner';
import { ArrowRight } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Field, inputCls } from '../ui/Field';
import { fmtMoney } from '../../utils/format';
import { reportTotal } from '../../utils/sales';
import type { SalesReport } from '../../types';

const FIELDS: {key: 'cash' | 'card' | 'other' | 'operatingHours' | 'employeeHours' | 'batches';label: string;money?: boolean;}[] = [
{ key: 'cash', label: 'Cash sales', money: true },
{ key: 'card', label: 'Card sales', money: true },
{ key: 'other', label: 'Other payments', money: true },
{ key: 'operatingHours', label: 'Operating hours' },
{ key: 'employeeHours', label: 'Employee hours' },
{ key: 'batches', label: 'Batches used' }];


export function EditReportModal({ report, open, onClose }: {report: SalesReport;open: boolean;onClose: () => void;}) {
  const store = useStore();
  const [vals, setVals] = useState(() => Object.fromEntries(FIELDS.map((f) => [f.key, String(report[f.key])])) as Record<string, string>);
  const [reason, setReason] = useState('');
  const parsed = Object.fromEntries(FIELDS.map((f) => [f.key, Number(vals[f.key])])) as Record<string, number>;
  const changed = FIELDS.filter((f) => parsed[f.key] !== report[f.key]);
  const invalid = FIELDS.some((f) => Number.isNaN(parsed[f.key]) || parsed[f.key] < 0);
  const newTotal = parsed.cash + parsed.card + parsed.other;
  const correction = report.status === 'needs_correction';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={correction ? 'Submit correction' : 'Edit submitted report'}
      description="Previous values are kept. Your change and reason are recorded in the audit trail."
      footer={
      <>
          <Button onClick={onClose}>Cancel</Button>
          <Button
          variant="primary"
          disabled={!changed.length || invalid || reason.trim().length < 5}
          onClick={() => {
            store.editSubmittedReport(report.id, parsed as Partial<SalesReport>, reason.trim());
            toast.success(correction ? 'Correction submitted for review' : 'Report updated — change recorded');
            onClose();
          }}>
          
            {correction ? 'Submit correction' : 'Save change'}
          </Button>
        </>
      }>
      
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {FIELDS.map((f) =>
        <Field key={f.key} label={f.label} htmlFor={`ed-${f.key}`}>
            <input id={`ed-${f.key}`} type="number" step={f.money ? '0.01' : '0.25'} min={0} className={inputCls} value={vals[f.key]} onChange={(e) => setVals((v) => ({ ...v, [f.key]: e.target.value }))} />
          </Field>
        )}
      </div>
      {changed.length > 0 && !invalid &&
      <ul className="mt-4 space-y-1 rounded-lg bg-cream-2 px-3 py-2 text-[13px]">
          {changed.map((f) =>
        <li key={f.key} className="flex items-center gap-2">
              <span className="text-ink-2">{f.label}:</span>
              <span className="text-bad-700 line-through">{f.money ? fmtMoney(report[f.key], true) : report[f.key]}</span>
              <ArrowRight className="h-3 w-3" aria-hidden />
              <span className="font-medium text-ok-700">{f.money ? fmtMoney(parsed[f.key], true) : parsed[f.key]}</span>
            </li>
        )}
          {newTotal !== reportTotal(report) &&
        <li className="flex items-center gap-2 font-medium">
              Total: {fmtMoney(reportTotal(report), true)} <ArrowRight className="h-3 w-3" aria-hidden /> {fmtMoney(newTotal, true)}
            </li>
        }
        </ul>
      }
      <Field label="Reason for change" htmlFor="ed-reason" required className="mt-4" hint="Required for financial edits.">
        <textarea id="ed-reason" rows={2} className={inputCls} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Late card batch settled next morning" />
      </Field>
    </Modal>);

}