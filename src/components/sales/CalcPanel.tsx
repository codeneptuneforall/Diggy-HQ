import React from 'react';
import { AlertTriangle, Info, OctagonAlert } from 'lucide-react';
import { fmtMetric, safeDivide } from '../../utils/sales';
import { fmtMoney, fmtNum } from '../../utils/format';

interface CalcPanelProps {
  cash: number;
  card: number;
  other: number;
  otherLabel: string;
  operatingHours: number;
  employeeHours: number;
  batches: number;
  posTotal: number | null;
}

export function CalcPanel({ cash, card, other, otherLabel, operatingHours, employeeHours, batches, posTotal }: CalcPanelProps) {
  const total = cash + card + other;
  const ph = safeDivide(total, operatingHours);
  const pb = safeDivide(total, batches);
  const mismatch = posTotal !== null && Math.abs(posTotal - total) > 0.009;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-ink-3">Total reported sales</p>
        <p className="font-display text-4xl font-semibold tabular">{fmtMoney(total, true)}</p>
        <p className="mt-1 text-xs text-ink-3 tabular">
          {fmtMoney(cash, true)} cash + {fmtMoney(card, true)} card + {fmtMoney(other, true)} {otherLabel.toLowerCase()}
        </p>
      </div>
      {mismatch &&
      <p className="flex items-start gap-2 rounded-lg bg-bad-50 px-3 py-2 text-[13px] text-bad-700" role="alert">
          <OctagonAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          Payment breakdown ({fmtMoney(total, true)}) doesn’t match the POS total ({fmtMoney(posTotal ?? 0, true)}). Difference: {fmtMoney(Math.abs((posTotal ?? 0) - total), true)}.
        </p>
      }
      <dl className="divide-y divide-line rounded-xl border border-line">
        <div className="px-4 py-3">
          <dt className="flex justify-between text-sm">
            <span className="font-medium">Sales per hour</span>
            <span className="font-semibold tabular">{fmtMetric(ph)}</span>
          </dt>
          <dd className="mt-0.5 text-xs text-ink-3 tabular">
            {ph === null ? 'Not applicable — no operating hours recorded.' : `${fmtMoney(total, true)} ÷ ${fmtNum(operatingHours, 2)} operating hours`}
          </dd>
        </div>
        <div className="px-4 py-3">
          <dt className="flex justify-between text-sm">
            <span className="font-medium">Sales per batch</span>
            <span className="font-semibold tabular">{fmtMetric(pb)}</span>
          </dt>
          <dd className="mt-0.5 text-xs text-ink-3 tabular">{pb === null ? 'Not applicable — no batches recorded.' : `${fmtMoney(total, true)} ÷ ${fmtNum(batches, 1)} batches`}</dd>
        </div>
      </dl>
      {operatingHours === 0 &&
      <p className="flex items-start gap-2 text-[13px] text-warn-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> Zero operating hours. Sales per hour will show as N/A.
        </p>
      }
      {batches === 0 && total > 0 &&
      <p className="flex items-start gap-2 text-[13px] text-warn-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> Zero batches with sales recorded. Double-check the batch count.
        </p>
      }
      <p className="flex items-start gap-2 text-xs text-ink-3">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
        Per-hour uses operating hours (time the trailer was serving), not employee hours ({fmtNum(employeeHours, 2)} recorded). The two are never substituted.
      </p>
    </div>);

}