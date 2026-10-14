import { addDays, addMinutes, differenceInMinutes, format, parseISO } from 'date-fns';
import type { DateRangeKey } from '../types';

/** The prototype runs on a fixed "today" so demo data stays coherent. */
export const TODAY = '2026-10-14';
export const NOW = new Date(2026, 9, 14, 11, 20);
export const NOW_MIN = 11 * 60 + 20;

let tick = 0;
export function stamp(): string {
  tick += 1;
  return format(addMinutes(NOW, tick), "yyyy-MM-dd'T'HH:mm");
}

export const toMin = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

export const fmtDate = (d: string, pattern = 'EEE, MMM d') => format(parseISO(d), pattern);

export function fmtTime(t: string) {
  const [h, m] = t.split(':').map(Number);
  const ap = h >= 12 ? 'PM' : 'AM';
  const hh = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${hh} ${ap}` : `${hh}:${String(m).padStart(2, '0')} ${ap}`;
}

export const fmtTimeRange = (s: string, e: string) => `${fmtTime(s)} – ${fmtTime(e)}`;
export const fmtDateTime = (iso: string) => format(parseISO(iso), 'MMM d, h:mm a');
export const hoursBetween = (s: string, e: string) => (toMin(e) - toMin(s)) / 60;
export const addDaysStr = (d: string, n: number) => format(addDays(parseISO(d), n), 'yyyy-MM-dd');

export function duration(mins: number) {
  const m = Math.abs(Math.round(mins));
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ${m % 60 ? `${m % 60}m` : ''}`.trim();
  const d = Math.floor(h / 24);
  return `${d}d ${h % 24 ? `${h % 24}h` : ''}`.trim();
}

export function relTime(iso: string) {
  const mins = differenceInMinutes(NOW, parseISO(iso));
  if (Math.abs(mins) < 1) return 'Just now';
  if (mins < 0) return `in ${duration(mins)}`;
  if (mins < 60 * 24 * 7) return `${duration(mins)} ago`;
  return format(parseISO(iso), 'MMM d');
}

export const RANGE_LABELS: Record<DateRangeKey, string> = {
  last7: 'Last 7 days',
  last30: 'Last 30 days',
  thisMonth: 'October 2026',
  last90: 'Last 90 days'
};

export function rangeStart(k: DateRangeKey) {
  if (k === 'last7') return addDaysStr(TODAY, -6);
  if (k === 'last30') return addDaysStr(TODAY, -29);
  if (k === 'thisMonth') return '2026-10-01';
  return addDaysStr(TODAY, -89);
}

export const inRange = (d: string, k: DateRangeKey) => d >= rangeStart(k) && d <= TODAY;

export function greeting() {
  return 'Good morning';
}