import { NOW_MIN, TODAY, toMin } from './date';
import type {
  AppUser,
  Customer,
  DiggyEvent,
  Employee,
  EventStatus,
  Franchise,
  ReportStatus,
  Tone,
  Trailer,
  TrailerStatus } from
'../types';

export const eventStatusMeta: Record<EventStatus, Tone> = {
  tentative: { tone: 'neutral', label: 'Tentative' },
  confirmed: { tone: 'info', label: 'Confirmed' },
  in_progress: { tone: 'brand', label: 'In progress' },
  completed: { tone: 'ok', label: 'Completed' },
  cancelled: { tone: 'bad', label: 'Cancelled' }
};

export const reportStatusMeta: Record<ReportStatus, Tone> = {
  draft: { tone: 'neutral', label: 'Draft' },
  submitted: { tone: 'info', label: 'Submitted' },
  needs_correction: { tone: 'warn', label: 'Needs correction' },
  reviewed: { tone: 'ok', label: 'Reviewed' },
  locked: { tone: 'ok', label: 'Finalized' }
};

export const trailerStatusMeta: Record<TrailerStatus, Tone> = {
  available: { tone: 'ok', label: 'Available' },
  scheduled: { tone: 'info', label: 'Scheduled' },
  in_use: { tone: 'brand', label: 'In use' },
  unavailable: { tone: 'neutral', label: 'Unavailable' },
  maintenance: { tone: 'warn', label: 'Maintenance' }
};

export const employeeStatusMeta: Record<Employee['status'], Tone> = {
  active: { tone: 'ok', label: 'Active' },
  inactive: { tone: 'neutral', label: 'Inactive' },
  on_leave: { tone: 'warn', label: 'On leave' }
};

export const customerStatusMeta: Record<Customer['status'], Tone> = {
  active: { tone: 'ok', label: 'Active' },
  lead: { tone: 'info', label: 'Lead' },
  inactive: { tone: 'neutral', label: 'Inactive' }
};

export const franchiseStatusMeta: Record<Franchise['status'], Tone> = {
  active: { tone: 'ok', label: 'Active' },
  onboarding: { tone: 'info', label: 'Onboarding' },
  paused: { tone: 'warn', label: 'Paused' }
};

export const userStatusMeta: Record<AppUser['status'], Tone> = {
  active: { tone: 'ok', label: 'Active' },
  invited: { tone: 'info', label: 'Invited' },
  suspended: { tone: 'bad', label: 'Suspended' }
};

export function trailerStatus(t: Trailer, events: DiggyEvent[]): TrailerStatus {
  if (t.baseStatus !== 'available') return t.baseStatus;
  const mine = events.filter((e) => e.trailerId === t.id && e.status !== 'cancelled' && e.status !== 'completed');
  if (mine.some((e) => e.date === TODAY && toMin(e.start) <= NOW_MIN && toMin(e.end) > NOW_MIN)) return 'in_use';
  if (mine.some((e) => e.date >= TODAY)) return 'scheduled';
  return 'available';
}