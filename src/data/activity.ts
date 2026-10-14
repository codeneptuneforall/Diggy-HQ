import type { AppNotification, AuditEntry, FollowUp, Reminder } from '../types';

// Illustrative demo data.
export const seedFollowUps: FollowUp[] = [
{ id: 'fu-1', customerId: 'c-boones', due: '2026-10-12', note: 'Rebook spring fundraiser — Tasha asked about April dates.', owner: 'Dana Whitfield', done: false },
{ id: 'fu-2', customerId: 'c-ridge', due: '2026-10-14', note: 'Confirm Q4 kickoff headcount and PO.', owner: 'Dana Whitfield', done: false },
{ id: 'fu-3', customerId: 'c-summit', due: '2026-10-16', note: 'Send monthly social proposal to Leah.', owner: 'Dana Whitfield', done: false },
{ id: 'fu-4', customerId: 'c-harper', due: '2026-10-19', note: 'Thank-you note + ask for photos and review.', owner: 'Dana Whitfield', done: false },
{ id: 'fu-5', customerId: 'c-kline', due: '2026-10-06', note: 'Thank-you call after birthday party.', owner: 'Dana Whitfield', done: true, completedAt: '2026-10-06T10:00' },
{ id: 'fu-6', customerId: 'c-bearden', due: '2026-10-15', note: 'Send donation summary to boosters.', owner: 'Marcus Bell', done: false }];


export const seedReminders: Reminder[] = [
{ id: 'rm-1', eventId: 'ev-202', at: '2026-10-12T21:00', by: 'System', to: 'Tyler Ross' },
{ id: 'rm-2', eventId: 'ev-202', at: '2026-10-13T21:00', by: 'Rick Brewer', to: 'Marcus Bell' },
{ id: 'rm-3', eventId: 'ev-106', at: '2026-10-13T20:00', by: 'System', to: 'Eli Carter' }];


export const seedNotifications: AppNotification[] = [
{ id: 'n1', kind: 'upcoming_event', title: 'Corporate Office Treat Day is underway', body: 'Trailer 01 · Maya Torres, Jordan Price · 10 AM – 1 PM', at: '2026-10-14T10:00', read: false, link: '/events/ev-108', franchiseId: 'f-jc', audience: 'all' },
{ id: 'n2', kind: 'trailer_conflict', title: 'Trailer conflict on Sat, Oct 17', body: 'Diggy Trailer 01 is assigned to Tri-Cities Community Fall Festival and Harper–Lowe Wedding Reception (5–6 PM overlap).', at: '2026-10-14T09:12', read: false, link: '/events/ev-111', franchiseId: 'f-jc', audience: 'all' },
{ id: 'n3', kind: 'missing_report', title: 'Sales report overdue', body: 'Summit Ridge Resident Social (Oct 12) has no submitted report.', at: '2026-10-13T20:00', read: false, link: '/missing-reports', franchiseId: 'f-jc', audience: 'all' },
{ id: 'n4', kind: 'missing_report', title: 'Sales report overdue — Knoxville', body: 'Bearden Booster Club Tailgate (Oct 11) has no submitted report. 2 reminders sent.', at: '2026-10-13T21:00', read: false, link: '/missing-reports', franchiseId: 'f-knx', audience: 'corporate' },
{ id: 'n5', kind: 'low_inventory', title: 'Mini donut mix is low', body: '5 bags on hand — reorder level is 6. Festival on Oct 17 typically uses 4+.', at: '2026-10-13T19:30', read: false, link: '/inventory/inv-mix', franchiseId: 'f-jc', audience: 'all' },
{ id: 'n6', kind: 'variance', title: 'Inventory variance awaiting review', body: 'Cinnamon sugar counted 1 lb short after Mountain View Church Fall Fundraiser.', at: '2026-10-10T21:20', read: true, link: '/inventory?tab=variances', franchiseId: 'f-jc', audience: 'all' },
{ id: 'n7', kind: 'correction_requested', title: 'Report correction requested', body: 'Mountain View Church Fall Fundraiser — card total doesn’t match the Square summary.', at: '2026-10-11T10:30', read: true, link: '/sales-reports/sr-105', franchiseId: 'f-jc', audience: 'all' },
{ id: 'n8', kind: 'follow_up', title: 'Follow-up due today', body: 'Ridgeline Health — confirm Q4 kickoff headcount and PO.', at: '2026-10-14T08:00', read: false, link: '/follow-ups', franchiseId: 'f-jc', audience: 'franchise' },
{ id: 'n9', kind: 'assignment_changed', title: 'Assignment changed', body: 'Sam Nguyen added to Harper–Lowe Wedding Reception.', at: '2026-10-12T15:05', read: true, link: '/events/ev-111', franchiseId: 'f-jc', audience: 'all' },
{ id: 'n10', kind: 'schedule_updated', title: 'Schedule updated', body: 'Eli Carter marked unavailable Wed, Oct 21, 8 AM – 12 PM.', at: '2026-10-11T18:40', read: true, link: '/schedule', franchiseId: 'f-jc', audience: 'all' }];


export const seedAudit: AuditEntry[] = [
{ id: 'au-1', at: '2026-10-08T16:22', user: 'Dana Whitfield', userRole: 'Franchise Owner', franchiseId: 'f-jc', recordType: 'Sales report', recordId: 'sr-103', recordLabel: 'Ridgeline Health Staff Appreciation · Oct 7', action: 'Edited submitted report', changes: [{ field: 'Card sales', from: '$1,095.00', to: '$1,140.00' }, { field: 'Total reported sales', from: '$1,190.00', to: '$1,235.00' }], reason: 'Late tap-to-pay batch settled the next morning.' },
{ id: 'au-2', at: '2026-10-09T10:05', user: 'Rick Brewer', userRole: 'Corporate Admin', franchiseId: 'f-jc', recordType: 'Sales report', recordId: 'sr-103', recordLabel: 'Ridgeline Health Staff Appreciation · Oct 7', action: 'Finalized report', changes: [{ field: 'Status', from: 'Reviewed', to: 'Finalized' }] },
{ id: 'au-3', at: '2026-10-11T09:15', user: 'Lauren Pike', userRole: 'Franchise Owner', franchiseId: 'f-avl', recordType: 'Sales report', recordId: 'sr-301', recordLabel: 'River Arts Fall Stroll · Oct 10', action: 'Edited submitted report', changes: [{ field: 'Recorded operating hours', from: '6', to: '5' }, { field: 'Sales per hour', from: '$141.67', to: '$170.00' }], reason: 'Opened an hour late due to fryer warm-up issue.' },
{ id: 'au-4', at: '2026-10-11T10:30', user: 'Dana Whitfield', userRole: 'Franchise Owner', franchiseId: 'f-jc', recordType: 'Sales report', recordId: 'sr-105', recordLabel: 'Mountain View Church Fall Fundraiser · Oct 10', action: 'Requested correction', changes: [{ field: 'Status', from: 'Submitted', to: 'Needs correction' }], reason: 'Card total doesn’t match the Square batch summary ($655).' },
{ id: 'au-5', at: '2026-10-10T21:20', user: 'Maya Torres', userRole: 'Shift Lead', franchiseId: 'f-jc', recordType: 'Inventory', recordId: 'inv-cin', recordLabel: 'Cinnamon sugar', action: 'Recorded count variance', changes: [{ field: 'Expected closing', from: '—', to: '10 lb' }, { field: 'Actual closing', from: '—', to: '9 lb' }], reason: 'Spill during setup.' },
{ id: 'au-6', at: '2026-10-12T09:00', user: 'Dana Whitfield', userRole: 'Franchise Owner', franchiseId: 'f-jc', recordType: 'Inventory', recordId: 'inv-boat', recordLabel: 'Serving boats', action: 'Stock adjustment', changes: [{ field: 'Quantity', from: '3 cases', to: '2 cases' }], reason: 'Water-damaged case discarded.' },
{ id: 'au-7', at: '2026-10-12T15:05', user: 'Dana Whitfield', userRole: 'Franchise Owner', franchiseId: 'f-jc', recordType: 'Employee assignment', recordId: 'ev-111', recordLabel: 'Harper–Lowe Wedding Reception · Oct 17', action: 'Updated crew', changes: [{ field: 'Employees', from: 'Jordan Price', to: 'Jordan Price, Sam Nguyen' }] },
{ id: 'au-8', at: '2026-10-12T15:02', user: 'Dana Whitfield', userRole: 'Franchise Owner', franchiseId: 'f-jc', recordType: 'Trailer', recordId: 'ev-111', recordLabel: 'Harper–Lowe Wedding Reception · Oct 17', action: 'Assigned trailer', changes: [{ field: 'Trailer', from: 'Diggy Trailer 02', to: 'Diggy Trailer 01' }], reason: 'Couple requested the larger trailer for photos.' },
{ id: 'au-9', at: '2026-10-12T08:30', user: 'Lauren Pike', userRole: 'Franchise Owner', franchiseId: 'f-avl', recordType: 'Trailer', recordId: 'tr-04', recordLabel: 'Diggy Trailer 04', action: 'Changed status', changes: [{ field: 'Status', from: 'Available', to: 'Maintenance' }], reason: 'Fryer thermostat failure.' },
{ id: 'au-10', at: '2026-10-09T13:00', user: 'Rick Brewer', userRole: 'Corporate Admin', franchiseId: 'f-avl', recordType: 'User', recordId: 'u-7', recordLabel: 'Hannah Brooks', action: 'Changed permissions', changes: [{ field: 'Can submit sales reports', from: 'No', to: 'Yes' }] },
{ id: 'au-11', at: '2026-10-05T11:00', user: 'Dana Whitfield', userRole: 'Franchise Owner', franchiseId: 'f-jc', recordType: 'Event', recordId: 'ev-110', recordLabel: 'Tri-Cities Community Fall Festival · Oct 17', action: 'Created event', changes: [] },
{ id: 'au-12', at: '2026-10-13T16:40', user: 'Dana Whitfield', userRole: 'Franchise Owner', franchiseId: 'f-jc', recordType: 'Event', recordId: 'ev-116', recordLabel: 'Kline Anniversary Party · Oct 22', action: 'Cancelled event', changes: [{ field: 'Status', from: 'Confirmed', to: 'Cancelled' }], reason: 'Customer postponed to spring.' }];