import { AlertTriangle, BellRing, CalendarClock, CalendarDays, ClipboardEdit, FileWarning, ListChecks, Package, Truck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { NotificationKind } from '../../types';

export const notificationMeta: Record<NotificationKind, {icon: LucideIcon;label: string;tone: string;}> = {
  upcoming_event: { icon: CalendarDays, label: 'Upcoming event', tone: 'bg-info-50 text-info-600' },
  assignment_changed: { icon: BellRing, label: 'Assignment changed', tone: 'bg-info-50 text-info-600' },
  schedule_updated: { icon: CalendarClock, label: 'Schedule updated', tone: 'bg-info-50 text-info-600' },
  trailer_conflict: { icon: Truck, label: 'Trailer conflict', tone: 'bg-bad-50 text-bad-600' },
  missing_report: { icon: FileWarning, label: 'Missing sales report', tone: 'bg-bad-50 text-bad-600' },
  correction_requested: { icon: ClipboardEdit, label: 'Correction requested', tone: 'bg-warn-50 text-warn-600' },
  low_inventory: { icon: Package, label: 'Low inventory', tone: 'bg-warn-50 text-warn-600' },
  variance: { icon: AlertTriangle, label: 'Inventory variance', tone: 'bg-warn-50 text-warn-600' },
  follow_up: { icon: ListChecks, label: 'Follow-up due', tone: 'bg-berry-50 text-berry-700' }
};