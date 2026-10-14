import type { SalesReport } from '../types';

const base = { otherLabel: 'Venmo / other', posTotal: null, batchUnit: 'batch (5 lb mix)', reviewedBy: null, reviewedAt: null, correctionNote: null, history: [] };

// Illustrative demo data — not actual Diggy Donuts sales.
export const seedReports: SalesReport[] = [
{ ...base, id: 'sr-101', eventId: 'ev-101', franchiseId: 'f-jc', trailerId: 'tr-01', reportedBy: 'Maya Torres', date: '2026-10-03', cash: 412, card: 786, other: 0, operatingHours: 4, employeeHours: 9, batches: 6, notes: 'Steady morning. Sold out of chocolate drizzle by 11.', status: 'reviewed', submittedAt: '2026-10-03T12:48', reviewedBy: 'Dana Whitfield', reviewedAt: '2026-10-04T09:10' },
{ ...base, id: 'sr-102', eventId: 'ev-102', franchiseId: 'f-jc', trailerId: 'tr-02', reportedBy: 'Dana Whitfield', date: '2026-10-04', cash: 0, card: 350, other: 0, operatingHours: 3, employeeHours: 3.5, batches: 3, notes: 'Flat package paid by card.', status: 'reviewed', submittedAt: '2026-10-04T18:02', reviewedBy: 'Dana Whitfield', reviewedAt: '2026-10-05T08:30' },
{
  ...base,
  id: 'sr-103', eventId: 'ev-103', franchiseId: 'f-jc', trailerId: 'tr-01', reportedBy: 'Maya Torres', date: '2026-10-07', cash: 95, card: 1140, other: 0, operatingHours: 3, employeeHours: 7, batches: 8, notes: 'Invoice portion billed separately.', status: 'locked', submittedAt: '2026-10-07T14:40', reviewedBy: 'Rick Brewer', reviewedAt: '2026-10-09T10:05',
  history: [
  { id: 'h1', at: '2026-10-08T16:22', by: 'Dana Whitfield', field: 'Card sales', from: '$1,095', to: '$1,140', reason: 'Late tap-to-pay batch settled the next morning.' }]

},
{ ...base, id: 'sr-104', eventId: 'ev-104', franchiseId: 'f-jc', trailerId: 'tr-01', reportedBy: 'Eli Carter', date: '2026-10-10', cash: 388, card: 702, other: 0, operatingHours: 4, employeeHours: 9, batches: 6, notes: '', status: 'submitted', submittedAt: '2026-10-10T12:55' },
{
  ...base,
  id: 'sr-105', eventId: 'ev-105', franchiseId: 'f-jc', trailerId: 'tr-02', reportedBy: 'Maya Torres', date: '2026-10-10', cash: 540, card: 610, other: 75, operatingHours: 4, employeeHours: 9.5, batches: 7, notes: 'Church took 15% donation from total.', status: 'needs_correction', submittedAt: '2026-10-10T21:10',
  correctionNote: 'Card total doesn’t match the Square batch summary ($655). Please verify and update with a reason.'
},
{ ...base, id: 'sr-107', eventId: 'ev-107', franchiseId: 'f-jc', trailerId: 'tr-01', reportedBy: 'Maya Torres', date: '2026-10-13', cash: 310, card: 0, other: 0, operatingHours: 4, employeeHours: 0, batches: 0, notes: '', status: 'draft', submittedAt: null },
{ ...base, id: 'sr-201', eventId: 'ev-201', franchiseId: 'f-knx', trailerId: 'tr-03', reportedBy: 'Priya Shah', date: '2026-10-09', cash: 820, card: 1420, other: 0, operatingHours: 6, employeeHours: 13, batches: 12, notes: '', status: 'reviewed', submittedAt: '2026-10-09T17:50', reviewedBy: 'Marcus Bell', reviewedAt: '2026-10-10T08:00' },
{
  ...base,
  id: 'sr-301', eventId: 'ev-301', franchiseId: 'f-avl', trailerId: 'tr-04', reportedBy: 'Hannah Brooks', date: '2026-10-10', cash: 260, card: 590, other: 0, operatingHours: 5, employeeHours: 5.5, batches: 5, notes: 'First public event for Asheville.', status: 'submitted', submittedAt: '2026-10-10T17:42',
  history: [
  { id: 'h2', at: '2026-10-11T09:15', by: 'Lauren Pike', field: 'Recorded operating hours', from: '6', to: '5', reason: 'Opened an hour late due to fryer warm-up issue.' }]

}];