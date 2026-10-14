import { fmtTimeRange } from './date';
import type { DiggyEvent, Employee, Trailer } from '../types';

export type IssueKind =
'trailer_overlap' |
'trailer_unavailable' |
'employee_overlap' |
'employee_unavailable' |
'missing_trailer' |
'missing_staff' |
'incomplete';

export interface EventIssue {
  kind: IssueKind;
  severity: 'conflict' | 'warning';
  title: string;
  message: string;
  relatedEventId?: string;
  resource?: string;
}

export const overlaps = (aS: string, aE: string, bS: string, bE: string) => aS < bE && bS < aE;

const ACTIVE = (e: DiggyEvent) => e.status !== 'cancelled';

export function getEventIssues(
ev: DiggyEvent,
events: DiggyEvent[],
employees: Employee[],
trailers: Trailer[],
opts: {includePast?: boolean;} = {})
: EventIssue[] {
  if (ev.status === 'cancelled') return [];
  if (!opts.includePast && ev.status === 'completed') return [];
  const issues: EventIssue[] = [];
  const sameTime = events.filter(
    (o) => o.id !== ev.id && ACTIVE(o) && o.date === ev.date && overlaps(ev.start, ev.end, o.start, o.end)
  );

  if (ev.trailerId) {
    const trailer = trailers.find((t) => t.id === ev.trailerId);
    const tName = trailer?.name ?? 'Trailer';
    sameTime.
    filter((o) => o.trailerId === ev.trailerId).
    forEach((o) =>
    issues.push({
      kind: 'trailer_overlap',
      severity: 'conflict',
      title: `${tName} is double-booked`,
      message: `Already assigned to ${o.name}, ${fmtTimeRange(o.start, o.end)}.`,
      relatedEventId: o.id,
      resource: tName
    })
    );
    if (trailer && trailer.baseStatus !== 'available') {
      issues.push({
        kind: 'trailer_unavailable',
        severity: 'conflict',
        title: `${tName} is ${trailer.baseStatus === 'maintenance' ? 'in maintenance' : 'unavailable'}`,
        message: trailer.statusNote ?? 'Choose another trailer or change the trailer status.',
        resource: tName
      });
    }
  } else {
    issues.push({
      kind: 'missing_trailer',
      severity: 'warning',
      title: 'No trailer assigned',
      message: 'Assign a trailer before this event can be confirmed.'
    });
  }

  ev.employeeIds.forEach((empId) => {
    const emp = employees.find((e) => e.id === empId);
    const name = emp?.name ?? 'Employee';
    sameTime.
    filter((o) => o.employeeIds.includes(empId)).
    forEach((o) =>
    issues.push({
      kind: 'employee_overlap',
      severity: 'conflict',
      title: `${name} has an overlapping shift`,
      message: `Also working ${o.name}, ${fmtTimeRange(o.start, o.end)}.`,
      relatedEventId: o.id,
      resource: name
    })
    );
    emp?.unavailable.
    filter((u) => u.date === ev.date && overlaps(ev.start, ev.end, u.start, u.end)).
    forEach((u) =>
    issues.push({
      kind: 'employee_unavailable',
      severity: 'conflict',
      title: `${name} is unavailable`,
      message: `${u.reason}, ${fmtTimeRange(u.start, u.end)}.`,
      resource: name
    })
    );
  });

  if (ev.employeeIds.length < ev.staffNeeded) {
    const missing = ev.staffNeeded - ev.employeeIds.length;
    issues.push({
      kind: 'missing_staff',
      severity: 'warning',
      title: `Needs ${missing} more ${missing === 1 ? 'employee' : 'employees'}`,
      message: `${ev.employeeIds.length} of ${ev.staffNeeded} required crew assigned.`
    });
  }

  const missingFields = [
  !ev.customerId && 'customer',
  !ev.contactName && 'contact',
  !ev.address && 'venue address'].
  filter(Boolean) as string[];
  if (missingFields.length) {
    issues.push({
      kind: 'incomplete',
      severity: 'warning',
      title: 'Incomplete event details',
      message: `Missing ${missingFields.join(', ')}.`
    });
  }
  return issues;
}

export const hasConflict = (issues: EventIssue[]) => issues.some((i) => i.severity === 'conflict');