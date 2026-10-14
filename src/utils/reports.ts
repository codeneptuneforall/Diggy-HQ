import { addHours, differenceInMinutes, parseISO } from 'date-fns';
import { NOW, NOW_MIN, TODAY, duration, toMin } from './date';
import type { DiggyEvent, SalesReport } from '../types';

export function eventEnded(ev: DiggyEvent) {
  if (ev.status === 'cancelled') return false;
  if (ev.status === 'completed') return true;
  return ev.date < TODAY || ev.date === TODAY && toMin(ev.end) <= NOW_MIN;
}

export const findReport = (eventId: string, reports: SalesReport[]) => reports.find((r) => r.eventId === eventId);

export function reportDue(ev: DiggyEvent, dueHours: number) {
  const end = parseISO(`${ev.date}T${ev.end}`);
  const dueAt = addHours(end, dueHours);
  const diff = differenceInMinutes(NOW, dueAt);
  return {
    dueAt,
    overdue: diff > 0,
    minutesOver: diff,
    label: diff > 0 ? `Overdue ${duration(diff)}` : `Due in ${duration(-diff)}`
  };
}

/** Events that have finished but have no submitted report (missing or still a draft). */
export function missingReportEvents(events: DiggyEvent[], reports: SalesReport[]) {
  return events.filter((ev) => {
    if (!eventEnded(ev)) return false;
    const r = findReport(ev.id, reports);
    return !r || r.status === 'draft';
  });
}