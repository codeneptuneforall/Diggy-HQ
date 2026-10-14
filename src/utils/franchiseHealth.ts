import { balanceOf, isLow } from './inventory';
import { eventEnded, findReport } from './reports';
import { isCounted, summarize } from './sales';
import type { DiggyEvent, InventoryItem, SalesReport, StockMovement, Territory, Trailer, AppUser } from '../types';

interface Source {
  events: DiggyEvent[];
  reports: SalesReport[];
  trailers: Trailer[];
  territories: Territory[];
  items: InventoryItem[];
  movements: StockMovement[];
  users: AppUser[];
}

export function franchiseHealth(fid: string, s: Source) {
  const events = s.events.filter((e) => e.franchiseId === fid && e.status !== 'cancelled' && e.date.startsWith('2026-10'));
  const ended = events.filter(eventEnded);
  const reps = ended.map((e) => findReport(e.id, s.reports)).filter((r): r is SalesReport => !!r && isCounted(r));
  const trailers = s.trailers.filter((t) => t.franchiseId === fid);
  return {
    events: events.length,
    sales: summarize(reps).total,
    rate: ended.length ? reps.length / ended.length : null,
    missing: ended.length - reps.length,
    trailers,
    activeTrailers: trailers.filter((t) => t.baseStatus === 'available').length,
    territories: s.territories.filter((t) => t.franchiseId === fid),
    lowStock: s.items.filter((i) => i.franchiseId === fid && isLow(i, balanceOf(i.id, s.movements))).length,
    users: s.users.filter((u) => u.franchiseId === fid)
  };
}