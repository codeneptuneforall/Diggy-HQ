export type Role = 'corporate' | 'franchise';
export type DateRangeKey = 'last7' | 'last30' | 'thisMonth' | 'last90';

export interface Franchise {
  id: string;
  name: string;
  shortName: string;
  owner: string;
  ownerEmail: string;
  phone: string;
  city: string;
  status: 'active' | 'onboarding' | 'paused';
  since: string;
}

export interface Territory {
  id: string;
  name: string;
  region: string;
  coverage: string;
  franchiseId: string | null;
  notes: string;
}

export type TrailerBaseStatus = 'available' | 'unavailable' | 'maintenance';
export type TrailerStatus = TrailerBaseStatus | 'scheduled' | 'in_use';

export interface Trailer {
  id: string;
  name: string;
  code: string;
  franchiseId: string;
  territoryId: string;
  baseStatus: TrailerBaseStatus;
  notes: string;
  statusNote?: string;
}

export interface Unavailability {
  date: string;
  start: string;
  end: string;
  reason: string;
}

export interface Employee {
  id: string;
  name: string;
  phone: string;
  email: string;
  franchiseId: string;
  role: 'Shift Lead' | 'Crew' | 'Manager';
  status: 'active' | 'inactive' | 'on_leave';
  availability: string;
  unavailable: Unavailability[];
  hireDate: string;
  canSubmitReports: boolean;
}

export type CustomerType =
'Business' |
'Organization' |
'School' |
'Wedding / private event' |
'Individual' |
'Other';

export interface Interaction {
  id: string;
  at: string;
  by: string;
  text: string;
}

export interface Customer {
  id: string;
  name: string;
  type: CustomerType;
  contactName: string;
  phone: string;
  email: string;
  billing: string;
  location: string;
  franchiseId: string;
  territoryId: string;
  notes: string;
  status: 'active' | 'lead' | 'inactive';
  createdAt: string;
  interactions: Interaction[];
}

export type EventStatus = 'tentative' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export interface EventCategory {
  id: string;
  label: string;
  color: string;
  active: boolean;
}

export interface DiggyEvent {
  id: string;
  name: string;
  category: string;
  customerId: string | null;
  contactName: string;
  phone: string;
  email: string;
  date: string;
  start: string;
  end: string;
  venue: string;
  address: string;
  territoryId: string;
  franchiseId: string;
  trailerId: string | null;
  employeeIds: string[];
  staffNeeded: number;
  notes: string;
  internalNotes: string;
  followUpDate: string | null;
  status: EventStatus;
  cancelReason?: string;
}

export type ReportStatus = 'draft' | 'submitted' | 'needs_correction' | 'reviewed' | 'locked';

export interface ReportChange {
  id: string;
  at: string;
  by: string;
  field: string;
  from: string;
  to: string;
  reason: string;
}

export interface SalesReport {
  id: string;
  eventId: string;
  franchiseId: string;
  trailerId: string | null;
  reportedBy: string;
  date: string;
  cash: number;
  card: number;
  other: number;
  otherLabel: string;
  posTotal: number | null;
  operatingHours: number;
  employeeHours: number;
  batches: number;
  batchUnit: string;
  notes: string;
  status: ReportStatus;
  submittedAt: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  correctionNote: string | null;
  history: ReportChange[];
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
  reorderLevel: number;
  targetQty: number | null;
  franchiseId: string;
  location: string;
  notes: string;
  active: boolean;
}

export type MovementType = 'opening' | 'received' | 'used' | 'adjustment' | 'count';

export interface StockMovement {
  id: string;
  itemId: string;
  type: MovementType;
  qty: number;
  at: string;
  by: string;
  eventId?: string;
  reason?: string;
}

export interface VarianceRecord {
  id: string;
  itemId: string;
  eventId: string | null;
  at: string;
  expected: number;
  actual: number;
  note: string;
  countedBy: string;
  status: 'awaiting' | 'reviewed';
  reviewedBy?: string;
  reviewNote?: string;
}

export interface AlertAck {
  itemId: string;
  by: string;
  at: string;
}

export interface FollowUp {
  id: string;
  customerId: string;
  due: string;
  note: string;
  owner: string;
  done: boolean;
  completedAt?: string;
}

export type NotificationKind =
'upcoming_event' |
'assignment_changed' |
'schedule_updated' |
'trailer_conflict' |
'missing_report' |
'correction_requested' |
'low_inventory' |
'variance' |
'follow_up';

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  at: string;
  read: boolean;
  link: string;
  franchiseId: string | null;
  audience: 'corporate' | 'franchise' | 'all';
}

export interface AuditChange {
  field: string;
  from: string;
  to: string;
}

export type AuditRecordType =
'Sales report' |
'Event' |
'Inventory' |
'Trailer' |
'Employee assignment' |
'User' |
'Customer' |
'Settings';

export interface AuditEntry {
  id: string;
  at: string;
  user: string;
  userRole: string;
  franchiseId: string | null;
  recordType: AuditRecordType;
  recordId: string;
  recordLabel: string;
  action: string;
  changes: AuditChange[];
  reason?: string;
}

export type UserRole =
'Corporate Admin' |
'Corporate Viewer' |
'Franchise Owner' |
'Franchise Manager' |
'Employee';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  franchiseId: string | null;
  status: 'active' | 'invited' | 'suspended';
  lastActive: string;
}

export interface Reminder {
  id: string;
  eventId: string;
  at: string;
  by: string;
  to: string;
}

export interface ReportException {
  eventId: string;
  at: string;
  by: string;
  note: string;
}

export interface Settings {
  reportDueHours: number;
  reminderEveryHours: number;
  reminderMax: number;
  otherPaymentLabel: string;
  batchUnit: string;
  units: string[];
  categories: EventCategory[];
}

export interface Tone {
  tone: 'neutral' | 'info' | 'ok' | 'warn' | 'bad' | 'brand';
  label: string;
}