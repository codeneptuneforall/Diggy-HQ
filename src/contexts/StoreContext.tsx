import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { franchises, seedTrailers, territories as seedTerritories } from '../data/network';
import { employees } from '../data/employees';
import { seedCustomers } from '../data/customers';
import { seedCategories, seedEvents } from '../data/events';
import { seedReports } from '../data/salesReports';
import { seedItems, seedMovements, seedVariances } from '../data/inventory';
import { seedAudit, seedFollowUps, seedNotifications, seedReminders } from '../data/activity';
import { seedUsers } from '../data/users';
import { fmtDate, stamp } from '../utils/date';
import { fmtMoney, uid } from '../utils/format';
import { balanceOf } from '../utils/inventory';
import { reportStatusMeta, eventStatusMeta } from '../utils/status';
import { reportTotal } from '../utils/sales';
import type {
  AlertAck,
  AppNotification,
  AppUser,
  AuditChange,
  AuditEntry,
  Customer,
  DateRangeKey,
  DiggyEvent,
  EventStatus,
  FollowUp,
  InventoryItem,
  Reminder,
  ReportException,
  ReportStatus,
  Role,
  SalesReport,
  Settings,
  StockMovement,
  Territory,
  Trailer,
  TrailerBaseStatus,
  VarianceRecord } from
'../types';

export const HOME_FRANCHISE = 'f-jc';

const USERS = {
  corporate: { name: 'Rick Brewer', title: 'Corporate Admin', email: 'rick@diggydonuts.demo' },
  franchise: { name: 'Dana Whitfield', title: 'Franchise Owner', email: 'dana@diggyjc.demo' }
};

const REPORT_FIELDS: {key: keyof SalesReport;label: string;money?: boolean;}[] = [
{ key: 'cash', label: 'Cash sales', money: true },
{ key: 'card', label: 'Card sales', money: true },
{ key: 'other', label: 'Other payments', money: true },
{ key: 'operatingHours', label: 'Recorded operating hours' },
{ key: 'employeeHours', label: 'Employee hours' },
{ key: 'batches', label: 'Batches used' },
{ key: 'notes', label: 'Notes' }];


function useStoreState(initialRole: Role) {
  const [role, setRole] = useState<Role>(initialRole);
  const [workspace, setWorkspace] = useState<string>(initialRole === 'franchise' ? HOME_FRANCHISE : 'network');
  useEffect(() => {
    setRole(initialRole);
    setWorkspace(initialRole === 'franchise' ? HOME_FRANCHISE : 'network');
  }, [initialRole]);

  const [dateRange, setDateRange] = useState<DateRangeKey>('last30');
  const [events, setEvents] = useState<DiggyEvent[]>(seedEvents);
  const [trailers, setTrailers] = useState<Trailer[]>(seedTrailers);
  const [territories, setTerritories] = useState<Territory[]>(seedTerritories);
  const [customers, setCustomers] = useState<Customer[]>(seedCustomers);
  const [reports, setReports] = useState<SalesReport[]>(seedReports);
  const [items, setItems] = useState<InventoryItem[]>(seedItems);
  const [movements, setMovements] = useState<StockMovement[]>(seedMovements);
  const [variances, setVariances] = useState<VarianceRecord[]>(seedVariances);
  const [acks, setAcks] = useState<AlertAck[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>(seedFollowUps);
  const [notifications, setNotifications] = useState<AppNotification[]>(seedNotifications);
  const [audit, setAudit] = useState<AuditEntry[]>(seedAudit);
  const [reminders, setReminders] = useState<Reminder[]>(seedReminders);
  const [exceptions, setExceptions] = useState<ReportException[]>([]);
  const [users, setUsers] = useState<AppUser[]>(seedUsers);
  const [settings, setSettings] = useState<Settings>({
    reportDueHours: 24,
    reminderEveryHours: 24,
    reminderMax: 3,
    otherPaymentLabel: 'Venmo / other',
    batchUnit: 'batch (5 lb mix)',
    units: ['each', 'lb', 'bag (25 lb)', 'jug (35 lb)', 'bottle', 'case (500)', 'case (1,000)', 'box (100)', 'tank (20 lb)'],
    categories: seedCategories
  });

  const user = USERS[role];
  const scopeIds = useMemo(
    () => role === 'franchise' ? [HOME_FRANCHISE] : workspace === 'network' ? franchises.map((f) => f.id) : [workspace],
    [role, workspace]
  );
  const inScope = useCallback((fid: string | null) => fid === null ? role === 'corporate' : scopeIds.includes(fid), [scopeIds, role]);

  const trailerName = useCallback((id: string | null) => trailers.find((t) => t.id === id)?.name ?? 'None', [trailers]);
  const empNames = (ids: string[]) => ids.map((id) => employees.find((e) => e.id === id)?.name ?? id).join(', ') || 'None';

  const log = useCallback(
    (e: Omit<AuditEntry, 'id' | 'at' | 'user' | 'userRole'>) =>
    setAudit((a) => [{ ...e, id: uid('au'), at: stamp(), user: user.name, userRole: user.title }, ...a]),
    [user]
  );
  const notify = useCallback(
    (n: Omit<AppNotification, 'id' | 'at' | 'read'>) =>
    setNotifications((ns) => [{ ...n, id: uid('n'), at: stamp(), read: false }, ...ns]),
    []
  );

  // ——— Events ———
  const saveEvent = (ev: DiggyEvent, reason?: string) => {
    const prev = events.find((e) => e.id === ev.id);
    setEvents((list) => prev ? list.map((e) => e.id === ev.id ? ev : e) : [...list, ev]);
    const label = `${ev.name} · ${fmtDate(ev.date, 'MMM d')}`;
    if (!prev) {
      log({ franchiseId: ev.franchiseId, recordType: 'Event', recordId: ev.id, recordLabel: label, action: 'Created event', changes: [] });
      return;
    }
    const changes: AuditChange[] = [];
    if (prev.name !== ev.name) changes.push({ field: 'Name', from: prev.name, to: ev.name });
    if (prev.date !== ev.date) changes.push({ field: 'Date', from: fmtDate(prev.date), to: fmtDate(ev.date) });
    if (prev.start !== ev.start || prev.end !== ev.end) changes.push({ field: 'Time', from: `${prev.start}–${prev.end}`, to: `${ev.start}–${ev.end}` });
    if (prev.venue !== ev.venue) changes.push({ field: 'Venue', from: prev.venue || '—', to: ev.venue || '—' });
    if (prev.status !== ev.status) changes.push({ field: 'Status', from: eventStatusMeta[prev.status].label, to: eventStatusMeta[ev.status].label });
    if (changes.length) log({ franchiseId: ev.franchiseId, recordType: 'Event', recordId: ev.id, recordLabel: label, action: 'Edited event', changes, reason });
    if (prev.trailerId !== ev.trailerId)
    log({ franchiseId: ev.franchiseId, recordType: 'Trailer', recordId: ev.id, recordLabel: label, action: 'Assigned trailer', changes: [{ field: 'Trailer', from: trailerName(prev.trailerId), to: trailerName(ev.trailerId) }] });
    if (prev.employeeIds.join() !== ev.employeeIds.join()) {
      log({ franchiseId: ev.franchiseId, recordType: 'Employee assignment', recordId: ev.id, recordLabel: label, action: 'Updated crew', changes: [{ field: 'Employees', from: empNames(prev.employeeIds), to: empNames(ev.employeeIds) }] });
      notify({ kind: 'assignment_changed', title: 'Assignment changed', body: `${ev.name}: crew is now ${empNames(ev.employeeIds)}.`, link: `/events/${ev.id}`, franchiseId: ev.franchiseId, audience: 'all' });
    }
  };

  const setEventStatus = (id: string, status: EventStatus, reason?: string) => {
    const ev = events.find((e) => e.id === id);
    if (!ev) return;
    setEvents((list) => list.map((e) => e.id === id ? { ...e, status, cancelReason: status === 'cancelled' ? reason : e.cancelReason } : e));
    log({ franchiseId: ev.franchiseId, recordType: 'Event', recordId: id, recordLabel: `${ev.name} · ${fmtDate(ev.date, 'MMM d')}`, action: status === 'cancelled' ? 'Cancelled event' : status === 'completed' ? 'Marked complete' : 'Changed status', changes: [{ field: 'Status', from: eventStatusMeta[ev.status].label, to: eventStatusMeta[status].label }], reason });
  };

  // ——— Customers ———
  const saveCustomer = (c: Customer) => {
    const exists = customers.some((x) => x.id === c.id);
    setCustomers((list) => exists ? list.map((x) => x.id === c.id ? c : x) : [c, ...list]);
    log({ franchiseId: c.franchiseId, recordType: 'Customer', recordId: c.id, recordLabel: c.name, action: exists ? 'Edited customer' : 'Created customer', changes: [] });
  };
  const addInteraction = (customerId: string, text: string) =>
  setCustomers((list) => list.map((c) => c.id === customerId ? { ...c, interactions: [{ id: uid('i'), at: stamp(), by: user.name, text }, ...c.interactions] } : c));

  // ——— Follow-ups ———
  const addFollowUp = (f: Omit<FollowUp, 'id' | 'done' | 'owner'>) =>
  setFollowUps((list) => [...list, { ...f, id: uid('fu'), done: false, owner: user.name }]);
  const toggleFollowUp = (id: string) =>
  setFollowUps((list) => list.map((f) => f.id === id ? { ...f, done: !f.done, completedAt: !f.done ? stamp() : undefined } : f));

  // ——— Sales reports ———
  const saveReport = (r: SalesReport, submit: boolean) => {
    const prev = reports.find((x) => x.id === r.id);
    const next: SalesReport = { ...r, status: submit ? 'submitted' : r.status, submittedAt: submit ? stamp() : r.submittedAt };
    setReports((list) => prev ? list.map((x) => x.id === r.id ? next : x) : [...list, next]);
    const ev = events.find((e) => e.id === r.eventId);
    if (submit) {
      log({ franchiseId: r.franchiseId, recordType: 'Sales report', recordId: r.id, recordLabel: `${ev?.name ?? 'Event'} · ${fmtDate(r.date, 'MMM d')}`, action: 'Submitted report', changes: [{ field: 'Total reported sales', from: '—', to: fmtMoney(reportTotal(r), true) }] });
      if (ev && ev.status !== 'completed' && ev.status !== 'cancelled') setEvents((list) => list.map((e) => e.id === ev.id ? { ...e, status: 'completed' } : e));
    }
    return next;
  };

  const editSubmittedReport = (id: string, patch: Partial<SalesReport>, reason: string) => {
    const prev = reports.find((r) => r.id === id);
    if (!prev) return;
    const next = { ...prev, ...patch };
    const changes = REPORT_FIELDS.filter((f) => prev[f.key] !== next[f.key]).map((f) => ({
      field: f.label,
      from: f.money ? fmtMoney(Number(prev[f.key]), true) : String(prev[f.key] || '—'),
      to: f.money ? fmtMoney(Number(next[f.key]), true) : String(next[f.key] || '—')
    }));
    if (!changes.length) return;
    if (reportTotal(prev) !== reportTotal(next)) changes.push({ field: 'Total reported sales', from: fmtMoney(reportTotal(prev), true), to: fmtMoney(reportTotal(next), true) });
    const at = stamp();
    const resubmit = prev.status === 'needs_correction';
    setReports((list) =>
    list.map((r) =>
    r.id === id ?
    { ...next, status: resubmit ? 'submitted' : next.status, history: [...changes.map((c) => ({ id: uid('h'), at, by: user.name, reason, ...c })), ...prev.history] } :
    r
    )
    );
    const ev = events.find((e) => e.id === prev.eventId);
    log({ franchiseId: prev.franchiseId, recordType: 'Sales report', recordId: id, recordLabel: `${ev?.name ?? 'Event'} · ${fmtDate(prev.date, 'MMM d')}`, action: resubmit ? 'Submitted correction' : 'Edited submitted report', changes, reason });
  };

  const setReportStatus = (id: string, status: ReportStatus, note?: string) => {
    const prev = reports.find((r) => r.id === id);
    if (!prev) return;
    setReports((list) =>
    list.map((r) =>
    r.id === id ?
    { ...r, status, correctionNote: status === 'needs_correction' ? note ?? null : r.correctionNote, reviewedBy: status === 'reviewed' || status === 'locked' ? user.name : r.reviewedBy, reviewedAt: status === 'reviewed' || status === 'locked' ? stamp() : r.reviewedAt } :
    r
    )
    );
    const ev = events.find((e) => e.id === prev.eventId);
    const label = `${ev?.name ?? 'Event'} · ${fmtDate(prev.date, 'MMM d')}`;
    log({ franchiseId: prev.franchiseId, recordType: 'Sales report', recordId: id, recordLabel: label, action: status === 'needs_correction' ? 'Requested correction' : status === 'locked' ? 'Finalized report' : 'Marked reviewed', changes: [{ field: 'Status', from: reportStatusMeta[prev.status].label, to: reportStatusMeta[status].label }], reason: note });
    if (status === 'needs_correction')
    notify({ kind: 'correction_requested', title: 'Report correction requested', body: `${label} — ${note ?? ''}`, link: `/sales-reports/${id}`, franchiseId: prev.franchiseId, audience: 'all' });
  };

  // ——— Inventory ———
  const addMovement = (mv: Omit<StockMovement, 'id' | 'at' | 'by'>) => {
    const item = items.find((i) => i.id === mv.itemId);
    if (!item) return;
    const before = balanceOf(mv.itemId, movements);
    const after = before + mv.qty;
    setMovements((list) => [...list, { ...mv, id: uid('m'), at: stamp(), by: user.name }]);
    log({ franchiseId: item.franchiseId, recordType: 'Inventory', recordId: item.id, recordLabel: item.name, action: mv.type === 'used' ? 'Recorded event usage' : mv.type === 'received' ? 'Received stock' : mv.type === 'count' ? 'Recorded count correction' : 'Stock adjustment', changes: [{ field: 'Quantity', from: `${before} ${item.unit}`, to: `${after} ${item.unit}` }], reason: mv.reason });
    if (after <= item.reorderLevel && before > item.reorderLevel) {
      setAcks((a) => a.filter((x) => x.itemId !== item.id));
      notify({ kind: 'low_inventory', title: `${item.name} is low`, body: `${after} ${item.unit} on hand — reorder level is ${item.reorderLevel}.`, link: `/inventory/${item.id}`, franchiseId: item.franchiseId, audience: 'all' });
      toast.warning(`${item.name} fell to ${after} — low-stock alert created`);
    }
    return after;
  };

  const addVariance = (v: Omit<VarianceRecord, 'id' | 'at' | 'countedBy' | 'status'>) => {
    setVariances((list) => [{ ...v, id: uid('var'), at: stamp(), countedBy: user.name, status: 'awaiting' }, ...list]);
    const item = items.find((i) => i.id === v.itemId);
    notify({ kind: 'variance', title: 'Inventory variance awaiting review', body: `${item?.name}: expected ${v.expected}, counted ${v.actual}.`, link: '/inventory?tab=variances', franchiseId: item?.franchiseId ?? null, audience: 'all' });
  };

  const reviewVariance = (id: string, reviewNote: string) => {
    const v = variances.find((x) => x.id === id);
    setVariances((list) => list.map((x) => x.id === id ? { ...x, status: 'reviewed', reviewedBy: user.name, reviewNote } : x));
    const item = items.find((i) => i.id === v?.itemId);
    if (item) log({ franchiseId: item.franchiseId, recordType: 'Inventory', recordId: item.id, recordLabel: item.name, action: 'Reviewed variance', changes: [{ field: 'Variance status', from: 'Awaiting review', to: 'Reviewed' }], reason: reviewNote });
  };

  const acknowledgeAlert = (itemId: string) => setAcks((a) => [...a.filter((x) => x.itemId !== itemId), { itemId, by: user.name, at: stamp() }]);

  const saveItem = (item: InventoryItem, openingQty?: number) => {
    const exists = items.some((i) => i.id === item.id);
    setItems((list) => exists ? list.map((i) => i.id === item.id ? item : i) : [...list, item]);
    if (!exists && openingQty !== undefined)
    setMovements((list) => [...list, { id: uid('m'), itemId: item.id, type: 'opening', qty: openingQty, at: stamp(), by: user.name }]);
    log({ franchiseId: item.franchiseId, recordType: 'Inventory', recordId: item.id, recordLabel: item.name, action: exists ? 'Edited item' : 'Created item', changes: [] });
  };

  // ——— Trailers & territories ———
  const setTrailerStatus = (id: string, baseStatus: TrailerBaseStatus, note: string) => {
    const t = trailers.find((x) => x.id === id);
    if (!t) return;
    setTrailers((list) => list.map((x) => x.id === id ? { ...x, baseStatus, statusNote: note || undefined } : x));
    log({ franchiseId: t.franchiseId, recordType: 'Trailer', recordId: id, recordLabel: t.name, action: 'Changed status', changes: [{ field: 'Status', from: t.baseStatus, to: baseStatus }], reason: note });
  };
  const assignTerritory = (territoryId: string, franchiseId: string | null) =>
  setTerritories((list) => list.map((t) => t.id === territoryId ? { ...t, franchiseId } : t));

  // ——— Compliance ———
  const sendReminder = (eventId: string, to: string) => {
    setReminders((r) => [...r, { id: uid('rm'), eventId, at: stamp(), by: user.name, to }]);
    toast.success(`Reminder sent to ${to}`);
  };
  const flagException = (eventId: string, note: string) => {
    setExceptions((x) => [...x.filter((e) => e.eventId !== eventId), { eventId, at: stamp(), by: user.name, note }]);
    const ev = events.find((e) => e.id === eventId);
    if (ev) log({ franchiseId: ev.franchiseId, recordType: 'Event', recordId: eventId, recordLabel: `${ev.name} · ${fmtDate(ev.date, 'MMM d')}`, action: 'Flagged reporting exception', changes: [], reason: note });
  };

  // ——— Notifications, users, settings ———
  const markRead = (id: string, read = true) => setNotifications((ns) => ns.map((n) => n.id === id ? { ...n, read } : n));
  const markAllRead = () => setNotifications((ns) => ns.map((n) => ({ ...n, read: true })));
  const updateUser = (u: AppUser, change?: AuditChange) => {
    const exists = users.some((x) => x.id === u.id);
    setUsers((list) => exists ? list.map((x) => x.id === u.id ? u : x) : [...list, u]);
    log({ franchiseId: u.franchiseId, recordType: 'User', recordId: u.id, recordLabel: u.name, action: exists ? 'Changed permissions' : 'Invited user', changes: change ? [change] : [] });
  };
  const updateSettings = (patch: Partial<Settings>, label?: string) => {
    setSettings((s) => ({ ...s, ...patch }));
    if (label) log({ franchiseId: null, recordType: 'Settings', recordId: 'workspace', recordLabel: 'Workspace settings', action: label, changes: [] });
  };

  const visibleNotifications = notifications.filter(
    (n) => (n.audience === 'all' || n.audience === role) && (n.franchiseId === null || inScope(n.franchiseId))
  );

  return {
    role, setRole, workspace, setWorkspace, user, scopeIds, inScope, dateRange, setDateRange,
    franchises, territories, assignTerritory, trailers, setTrailerStatus, employees,
    events, saveEvent, setEventStatus,
    customers, saveCustomer, addInteraction,
    followUps, addFollowUp, toggleFollowUp,
    reports, saveReport, editSubmittedReport, setReportStatus,
    items, saveItem, movements, addMovement, variances, addVariance, reviewVariance, acks, acknowledgeAlert,
    notifications: visibleNotifications, markRead, markAllRead,
    audit, reminders, sendReminder, exceptions, flagException,
    users, updateUser, settings, updateSettings
  };
}

type Store = ReturnType<typeof useStoreState>;
const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ initialRole, children }: {initialRole: Role;children: React.ReactNode;}) {
  const store = useStoreState(initialRole);
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}