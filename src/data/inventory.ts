import type { InventoryItem, StockMovement, VarianceRecord } from '../types';

// Illustrative demo data.
export const seedItems: InventoryItem[] = [
{ id: 'inv-mix', name: 'Mini donut mix', sku: 'DD-MIX-25', category: 'Ingredients', unit: 'bag (25 lb)', reorderLevel: 6, targetQty: 20, franchiseId: 'f-jc', location: 'JC commissary', notes: 'One bag ≈ 5 batches.', active: true },
{ id: 'inv-oil', name: 'Frying oil', sku: 'DD-OIL-35', category: 'Ingredients', unit: 'jug (35 lb)', reorderLevel: 4, targetQty: 10, franchiseId: 'f-jc', location: 'JC commissary', notes: '', active: true },
{ id: 'inv-cin', name: 'Cinnamon sugar', sku: 'DD-TOP-CIN', category: 'Toppings', unit: 'lb', reorderLevel: 10, targetQty: 30, franchiseId: 'f-jc', location: 'JC commissary', notes: 'Pre-mixed in-house.', active: true },
{ id: 'inv-pow', name: 'Powdered sugar', sku: 'DD-TOP-POW', category: 'Toppings', unit: 'lb', reorderLevel: 8, targetQty: 25, franchiseId: 'f-jc', location: 'JC commissary', notes: '', active: true },
{ id: 'inv-choc', name: 'Chocolate drizzle', sku: 'DD-TOP-CHO', category: 'Toppings', unit: 'bottle', reorderLevel: 6, targetQty: 18, franchiseId: 'f-jc', location: 'JC commissary', notes: '', active: true },
{ id: 'inv-boat', name: 'Serving boats', sku: 'DD-PKG-BOAT', category: 'Packaging', unit: 'case (500)', reorderLevel: 3, targetQty: 8, franchiseId: 'f-jc', location: 'Trailer 01 + commissary', notes: '', active: true },
{ id: 'inv-nap', name: 'Napkins', sku: 'DD-PKG-NAP', category: 'Packaging', unit: 'case (1,000)', reorderLevel: 2, targetQty: 5, franchiseId: 'f-jc', location: 'JC commissary', notes: '', active: true },
{ id: 'inv-prop', name: 'Propane', sku: 'DD-FUEL-20', category: 'Fuel & supplies', unit: 'tank (20 lb)', reorderLevel: 2, targetQty: 6, franchiseId: 'f-jc', location: 'Outdoor cage', notes: 'Swap at Tri-Cities Propane.', active: true },
{ id: 'inv-glove', name: 'Nitrile gloves', sku: 'DD-SUP-GLV', category: 'Fuel & supplies', unit: 'box (100)', reorderLevel: 4, targetQty: 10, franchiseId: 'f-jc', location: 'JC commissary', notes: '', active: true },
{ id: 'inv-pump', name: 'Pumpkin spice topping', sku: 'DD-TOP-PSP', category: 'Toppings', unit: 'lb', reorderLevel: 3, targetQty: null, franchiseId: 'f-jc', location: 'JC commissary', notes: 'Seasonal — inactive outside Sep–Nov.', active: false },
{ id: 'inv-k-mix', name: 'Mini donut mix', sku: 'DD-MIX-25', category: 'Ingredients', unit: 'bag (25 lb)', reorderLevel: 6, targetQty: 20, franchiseId: 'f-knx', location: 'Knoxville storage', notes: '', active: true },
{ id: 'inv-k-boat', name: 'Serving boats', sku: 'DD-PKG-BOAT', category: 'Packaging', unit: 'case (500)', reorderLevel: 3, targetQty: 8, franchiseId: 'f-knx', location: 'Knoxville storage', notes: '', active: true },
{ id: 'inv-a-mix', name: 'Mini donut mix', sku: 'DD-MIX-25', category: 'Ingredients', unit: 'bag (25 lb)', reorderLevel: 4, targetQty: 12, franchiseId: 'f-avl', location: 'Asheville storage', notes: '', active: true }];


const m = (id: string, itemId: string, type: StockMovement['type'], qty: number, at: string, by: string, extra: Partial<StockMovement> = {}): StockMovement => ({ id, itemId, type, qty, at, by, ...extra });

export const seedMovements: StockMovement[] = [
m('m1', 'inv-mix', 'opening', 14, '2026-10-01T08:00', 'Dana Whitfield'),
m('m2', 'inv-mix', 'used', -2, '2026-10-03T12:50', 'Maya Torres', { eventId: 'ev-101' }),
m('m3', 'inv-mix', 'used', -1, '2026-10-04T18:05', 'Dana Whitfield', { eventId: 'ev-102' }),
m('m4', 'inv-mix', 'used', -3, '2026-10-07T14:45', 'Maya Torres', { eventId: 'ev-103' }),
m('m5', 'inv-mix', 'received', 4, '2026-10-08T10:00', 'Dana Whitfield', { reason: 'Restock delivery' }),
m('m6', 'inv-mix', 'used', -2, '2026-10-10T13:00', 'Eli Carter', { eventId: 'ev-104' }),
m('m7', 'inv-mix', 'used', -3, '2026-10-10T21:15', 'Maya Torres', { eventId: 'ev-105' }),
m('m8', 'inv-mix', 'used', -2, '2026-10-13T19:30', 'Maya Torres', { eventId: 'ev-107' }),
m('m10', 'inv-cin', 'opening', 30, '2026-10-01T08:00', 'Dana Whitfield'),
m('m11', 'inv-cin', 'used', -4, '2026-10-03T12:50', 'Maya Torres', { eventId: 'ev-101' }),
m('m12', 'inv-cin', 'used', -2, '2026-10-04T18:05', 'Dana Whitfield', { eventId: 'ev-102' }),
m('m13', 'inv-cin', 'used', -5, '2026-10-07T14:45', 'Maya Torres', { eventId: 'ev-103' }),
m('m14', 'inv-cin', 'used', -4, '2026-10-10T13:00', 'Eli Carter', { eventId: 'ev-104' }),
m('m15', 'inv-cin', 'used', -5, '2026-10-10T21:15', 'Maya Torres', { eventId: 'ev-105' }),
m('m16', 'inv-cin', 'count', -1, '2026-10-10T21:20', 'Maya Torres', { eventId: 'ev-105', reason: 'Closing count 1 lb short — spill during setup.' }),
m('m20', 'inv-boat', 'opening', 8, '2026-10-01T08:00', 'Dana Whitfield'),
m('m21', 'inv-boat', 'used', -1, '2026-10-03T12:50', 'Maya Torres', { eventId: 'ev-101' }),
m('m22', 'inv-boat', 'used', -2, '2026-10-07T14:45', 'Maya Torres', { eventId: 'ev-103' }),
m('m23', 'inv-boat', 'used', -1, '2026-10-10T13:00', 'Eli Carter', { eventId: 'ev-104' }),
m('m24', 'inv-boat', 'used', -1, '2026-10-10T21:15', 'Maya Torres', { eventId: 'ev-105' }),
m('m25', 'inv-boat', 'adjustment', -1, '2026-10-12T09:00', 'Dana Whitfield', { reason: 'Water-damaged case discarded.' }),
m('m30', 'inv-oil', 'opening', 10, '2026-10-01T08:00', 'Dana Whitfield'),
m('m31', 'inv-oil', 'used', -1, '2026-10-03T12:50', 'Maya Torres', { eventId: 'ev-101' }),
m('m32', 'inv-oil', 'used', -1, '2026-10-07T14:45', 'Maya Torres', { eventId: 'ev-103' }),
m('m33', 'inv-oil', 'used', -1, '2026-10-10T21:15', 'Maya Torres', { eventId: 'ev-105' }),
m('m34', 'inv-oil', 'used', -1, '2026-10-13T19:30', 'Maya Torres', { eventId: 'ev-107' }),
m('m40', 'inv-pow', 'opening', 20, '2026-10-01T08:00', 'Dana Whitfield'),
m('m41', 'inv-pow', 'used', -2, '2026-10-03T12:50', 'Maya Torres', { eventId: 'ev-101' }),
m('m42', 'inv-pow', 'used', -2, '2026-10-07T14:45', 'Maya Torres', { eventId: 'ev-103' }),
m('m43', 'inv-pow', 'used', -2, '2026-10-13T19:30', 'Maya Torres', { eventId: 'ev-107' }),
m('m50', 'inv-choc', 'opening', 12, '2026-10-01T08:00', 'Dana Whitfield'),
m('m51', 'inv-choc', 'used', -2, '2026-10-03T12:50', 'Maya Torres', { eventId: 'ev-101' }),
m('m52', 'inv-choc', 'used', -1, '2026-10-07T14:45', 'Maya Torres', { eventId: 'ev-103' }),
m('m53', 'inv-choc', 'used', -2, '2026-10-10T21:15', 'Maya Torres', { eventId: 'ev-105' }),
m('m60', 'inv-nap', 'opening', 5, '2026-10-01T08:00', 'Dana Whitfield'),
m('m61', 'inv-nap', 'used', -1, '2026-10-07T14:45', 'Maya Torres', { eventId: 'ev-103' }),
m('m70', 'inv-prop', 'opening', 6, '2026-10-01T08:00', 'Dana Whitfield'),
m('m71', 'inv-prop', 'used', -1, '2026-10-03T12:50', 'Maya Torres', { eventId: 'ev-101' }),
m('m72', 'inv-prop', 'used', -1, '2026-10-10T21:15', 'Maya Torres', { eventId: 'ev-105' }),
m('m73', 'inv-prop', 'used', -1, '2026-10-13T19:30', 'Maya Torres', { eventId: 'ev-107' }),
m('m80', 'inv-glove', 'opening', 10, '2026-10-01T08:00', 'Dana Whitfield'),
m('m81', 'inv-glove', 'used', -1, '2026-10-03T12:50', 'Maya Torres', { eventId: 'ev-101' }),
m('m82', 'inv-glove', 'used', -1, '2026-10-10T21:15', 'Maya Torres', { eventId: 'ev-105' }),
m('m90', 'inv-pump', 'opening', 4, '2026-10-01T08:00', 'Dana Whitfield'),
m('m100', 'inv-k-mix', 'opening', 15, '2026-10-01T08:00', 'Marcus Bell'),
m('m101', 'inv-k-mix', 'used', -4, '2026-10-09T17:55', 'Priya Shah', { eventId: 'ev-201' }),
m('m102', 'inv-k-mix', 'used', -2, '2026-10-11T21:30', 'Tyler Ross', { eventId: 'ev-202' }),
m('m110', 'inv-k-boat', 'opening', 4, '2026-10-01T08:00', 'Marcus Bell'),
m('m111', 'inv-k-boat', 'used', -2, '2026-10-09T17:55', 'Priya Shah', { eventId: 'ev-201' }),
m('m120', 'inv-a-mix', 'opening', 8, '2026-10-01T08:00', 'Lauren Pike'),
m('m121', 'inv-a-mix', 'used', -1, '2026-10-10T17:45', 'Hannah Brooks', { eventId: 'ev-301' })];


export const seedVariances: VarianceRecord[] = [
{ id: 'var-1', itemId: 'inv-cin', eventId: 'ev-105', at: '2026-10-10T21:20', expected: 10, actual: 9, note: 'Spill during setup — bin tipped in wind.', countedBy: 'Maya Torres', status: 'awaiting' },
{ id: 'var-2', itemId: 'inv-boat', eventId: null, at: '2026-10-12T09:00', expected: 3, actual: 2, note: 'Water-damaged case discarded after rain on Oct 10.', countedBy: 'Dana Whitfield', status: 'awaiting' },
{ id: 'var-3', itemId: 'inv-k-mix', eventId: 'ev-201', at: '2026-10-09T18:00', expected: 11, actual: 11, note: 'Matched.', countedBy: 'Priya Shah', status: 'reviewed', reviewedBy: 'Marcus Bell', reviewNote: 'No action needed.' }];