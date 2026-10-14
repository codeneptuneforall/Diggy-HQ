import { fmtMoney } from './format';
import type { SalesReport } from '../types';

export const reportTotal = (r: Pick<SalesReport, 'cash' | 'card' | 'other'>) => r.cash + r.card + r.other;

/** Returns null (not applicable) instead of Infinity / NaN when the divisor is zero. */
export const safeDivide = (num: number, den: number) => den > 0 ? num / den : null;

export const perHour = (r: SalesReport) => safeDivide(reportTotal(r), r.operatingHours);
export const perBatch = (r: SalesReport) => safeDivide(reportTotal(r), r.batches);

export const fmtMetric = (v: number | null) => v === null ? 'N/A' : fmtMoney(v, true);

export function summarize(reports: SalesReport[]) {
  const s = reports.reduce(
    (a, r) => ({
      cash: a.cash + r.cash,
      card: a.card + r.card,
      other: a.other + r.other,
      opHours: a.opHours + r.operatingHours,
      empHours: a.empHours + r.employeeHours,
      batches: a.batches + r.batches
    }),
    { cash: 0, card: 0, other: 0, opHours: 0, empHours: 0, batches: 0 }
  );
  const total = s.cash + s.card + s.other;
  return { ...s, total, perHour: safeDivide(total, s.opHours), perBatch: safeDivide(total, s.batches), count: reports.length };
}

export const FINAL_STATUSES = ['submitted', 'needs_correction', 'reviewed', 'locked'] as const;
export const isCounted = (r: SalesReport) => (FINAL_STATUSES as readonly string[]).includes(r.status);