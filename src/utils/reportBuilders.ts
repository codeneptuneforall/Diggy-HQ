import { fmtDate, fmtDateTime, hoursBetween, inRange } from './date';
import { eventEnded, findReport, reportDue } from './reports';
import { isCounted, reportTotal, safeDivide, summarize } from './sales';
import { balanceOf, isLow, suggestedReorder } from './inventory';
import type {
  AuditEntry,
  Customer,
  DateRangeKey,
  DiggyEvent,
  Employee,
  Franchise,
  InventoryItem,
  SalesReport,
  StockMovement,
  Territory,
  Trailer,
  VarianceRecord } from
'../types';

export type ReportType =
'sales-by-event' |
'sales-by-date' |
'sales-by-franchise' |
'sales-by-territory' |
'sales-by-trailer' |
'cash-vs-card' |
'sales-per-hour' |
'sales-per-batch' |
'employee-hours' |
'report-completion' |
'missing-reports' |
'inventory-usage' |
'low-stock' |
'inventory-variance' |
'customer-history' |
'audit-history';

export const REPORT_CATALOG: {group: string;items: {id: ReportType;label: string;corporateOnly?: boolean;}[];}[] = [
{
  group: 'Sales',
  items: [
  { id: 'sales-by-event', label: 'Sales by event' },
  { id: 'sales-by-date', label: 'Sales by date' },
  { id: 'sales-by-franchise', label: 'Sales by franchisee', corporateOnly: true },
  { id: 'sales-by-territory', label: 'Sales by territory' },
  { id: 'sales-by-trailer', label: 'Sales by trailer' },
  { id: 'cash-vs-card', label: 'Cash vs card' },
  { id: 'sales-per-hour', label: 'Sales per hour' },
  { id: 'sales-per-batch', label: 'Sales per batch' }]

},
{
  group: 'Operations',
  items: [
  { id: 'employee-hours', label: 'Employee hours' },
  { id: 'report-completion', label: 'Report completion' },
  { id: 'missing-reports', label: 'Missing reports' }]

},
{
  group: 'Inventory',
  items: [
  { id: 'inventory-usage', label: 'Inventory usage' },
  { id: 'low-stock', label: 'Low-stock items' },
  { id: 'inventory-variance', label: 'Inventory variance' }]

},
{
  group: 'Customers & history',
  items: [
  { id: 'customer-history', label: 'Customer event history' },
  { id: 'audit-history', label: 'Audit history' }]

}];


export interface Column {
  key: string;
  label: string;
  kind?: 'money' | 'num' | 'pct' | 'text';
}
export type Row = Record<string, string | number | null>;

export interface Filters {
  range: DateRangeKey;
  franchise: string;
  territory: string;
  trailer: string;
  category: string;
  employee: string;
}

export interface BuildCtx {
  events: DiggyEvent[];
  reports: SalesReport[];
  customers: Customer[];
  items: InventoryItem[];
  movements: StockMovement[];
  variances: VarianceRecord[];
  audit: AuditEntry[];
  trailers: Trailer[];
  employees: Employee[];
  franchises: Franchise[];
  territories: Territory[];
  dueHours: number;
  filters: Filters;
}

const money = (key: string, label: string): Column => ({ key, label, kind: 'money' });

export function buildReport(type: ReportType, ctx: BuildCtx): {columns: Column[];rows: Row[];} {
  const { filters: f } = ctx;
  const fName = (id: string) => ctx.franchises.find((x) => x.id === id)?.shortName ?? '—';
  const tName = (id: string | null) => ctx.trailers.find((x) => x.id === id)?.name ?? '—';
  const terrName = (id: string) => ctx.territories.find((x) => x.id === id)?.name ?? '—';

  const events = ctx.events.filter(
    (e) =>
    e.status !== 'cancelled' &&
    inRange(e.date, f.range) && (
    f.franchise === 'all' || e.franchiseId === f.franchise) && (
    f.territory === 'all' || e.territoryId === f.territory) && (
    f.trailer === 'all' || e.trailerId === f.trailer) && (
    f.category === 'all' || e.category === f.category) && (
    f.employee === 'all' || e.employeeIds.includes(f.employee))
  );
  const pairs = events.
  map((e) => ({ e, r: findReport(e.id, ctx.reports) })).
  filter((p): p is {e: DiggyEvent;r: SalesReport;} => !!p.r && isCounted(p.r));

  const groupSales = (keyOf: (e: DiggyEvent) => string, label: (k: string) => string, colLabel: string) => {
    const keys = Array.from(new Set(pairs.map((p) => keyOf(p.e))));
    return {
      columns: [{ key: 'name', label: colLabel }, { key: 'events', label: 'Events', kind: 'num' as const }, money('total', 'Total sales'), money('avg', 'Avg per event'), money('perHour', 'Sales / hour')],
      rows: keys.map((k) => {
        const s = summarize(pairs.filter((p) => keyOf(p.e) === k).map((p) => p.r));
        return { name: label(k), events: s.count, total: s.total, avg: s.total / s.count, perHour: s.perHour };
      })
    };
  };

  switch (type) {
    case 'sales-by-event':
      return {
        columns: [{ key: 'date', label: 'Date' }, { key: 'event', label: 'Event' }, { key: 'franchise', label: 'Franchise' }, { key: 'trailer', label: 'Trailer' }, money('cash', 'Cash'), money('card', 'Card'), money('other', 'Other'), money('total', 'Total'), { key: 'status', label: 'Report status' }],
        rows: pairs.map(({ e, r }) => ({ date: fmtDate(e.date, 'yyyy-MM-dd'), event: e.name, franchise: fName(e.franchiseId), trailer: tName(e.trailerId), cash: r.cash, card: r.card, other: r.other, total: reportTotal(r), status: r.status }))
      };
    case 'sales-by-date':{
        const dates = Array.from(new Set(pairs.map((p) => p.e.date))).sort();
        return {
          columns: [{ key: 'date', label: 'Date' }, { key: 'events', label: 'Events', kind: 'num' }, money('cash', 'Cash'), money('card', 'Card'), money('total', 'Total')],
          rows: dates.map((d) => {
            const s = summarize(pairs.filter((p) => p.e.date === d).map((p) => p.r));
            return { date: fmtDate(d, 'yyyy-MM-dd'), events: s.count, cash: s.cash, card: s.card, total: s.total };
          })
        };
      }
    case 'sales-by-franchise':
      return groupSales((e) => e.franchiseId, fName, 'Franchise');
    case 'sales-by-territory':
      return groupSales((e) => e.territoryId, terrName, 'Territory');
    case 'sales-by-trailer':
      return groupSales((e) => e.trailerId ?? 'none', (k) => tName(k), 'Trailer');
    case 'cash-vs-card':{
        const keys = Array.from(new Set(pairs.map((p) => p.e.franchiseId)));
        return {
          columns: [{ key: 'name', label: 'Franchise' }, money('cash', 'Cash'), money('card', 'Card'), money('other', 'Other'), { key: 'cashShare', label: 'Cash share', kind: 'pct' }],
          rows: keys.map((k) => {
            const s = summarize(pairs.filter((p) => p.e.franchiseId === k).map((p) => p.r));
            return { name: fName(k), cash: s.cash, card: s.card, other: s.other, cashShare: safeDivide(s.cash, s.total) };
          })
        };
      }
    case 'sales-per-hour':
      return {
        columns: [{ key: 'date', label: 'Date' }, { key: 'event', label: 'Event' }, money('total', 'Total'), { key: 'hours', label: 'Operating hrs', kind: 'num' }, money('perHour', 'Sales / hour')],
        rows: pairs.map(({ e, r }) => ({ date: fmtDate(e.date, 'yyyy-MM-dd'), event: e.name, total: reportTotal(r), hours: r.operatingHours, perHour: safeDivide(reportTotal(r), r.operatingHours) }))
      };
    case 'sales-per-batch':
      return {
        columns: [{ key: 'date', label: 'Date' }, { key: 'event', label: 'Event' }, money('total', 'Total'), { key: 'batches', label: 'Batches', kind: 'num' }, money('perBatch', 'Sales / batch')],
        rows: pairs.map(({ e, r }) => ({ date: fmtDate(e.date, 'yyyy-MM-dd'), event: e.name, total: reportTotal(r), batches: r.batches, perBatch: safeDivide(reportTotal(r), r.batches) }))
      };
    case 'employee-hours':
      return {
        columns: [{ key: 'name', label: 'Employee' }, { key: 'franchise', label: 'Franchise' }, { key: 'shifts', label: 'Shifts', kind: 'num' }, { key: 'hours', label: 'Scheduled hours', kind: 'num' }],
        rows: ctx.employees.
        filter((emp) => f.employee === 'all' || emp.id === f.employee).
        map((emp) => {
          const mine = events.filter((e) => e.employeeIds.includes(emp.id));
          return { name: emp.name, franchise: fName(emp.franchiseId), shifts: mine.length, hours: mine.reduce((s, e) => s + hoursBetween(e.start, e.end), 0) };
        })
      };
    case 'report-completion':{
        const keys = Array.from(new Set(events.map((e) => e.franchiseId)));
        return {
          columns: [{ key: 'name', label: 'Franchise' }, { key: 'needed', label: 'Events ended', kind: 'num' }, { key: 'submitted', label: 'Submitted', kind: 'num' }, { key: 'missing', label: 'Missing', kind: 'num' }, { key: 'rate', label: 'Completion', kind: 'pct' }],
          rows: keys.map((k) => {
            const ended = events.filter((e) => e.franchiseId === k && eventEnded(e));
            const sub = ended.filter((e) => {
              const r = findReport(e.id, ctx.reports);
              return r && isCounted(r);
            }).length;
            return { name: fName(k), needed: ended.length, submitted: sub, missing: ended.length - sub, rate: safeDivide(sub, ended.length) };
          })
        };
      }
    case 'missing-reports':
      return {
        columns: [{ key: 'date', label: 'Date' }, { key: 'event', label: 'Event' }, { key: 'franchise', label: 'Franchise' }, { key: 'trailer', label: 'Trailer' }, { key: 'due', label: 'Due status' }],
        rows: events.
        filter((e) => {
          const r = findReport(e.id, ctx.reports);
          return eventEnded(e) && (!r || r.status === 'draft');
        }).
        map((e) => ({ date: fmtDate(e.date, 'yyyy-MM-dd'), event: e.name, franchise: fName(e.franchiseId), trailer: tName(e.trailerId), due: reportDue(e, ctx.dueHours).label }))
      };
    case 'inventory-usage':
      return {
        columns: [{ key: 'item', label: 'Item' }, { key: 'franchise', label: 'Franchise' }, { key: 'unit', label: 'Unit' }, { key: 'used', label: 'Used', kind: 'num' }, { key: 'received', label: 'Received', kind: 'num' }, { key: 'adjusted', label: 'Adjustments', kind: 'num' }],
        rows: ctx.items.
        filter((i) => f.franchise === 'all' || i.franchiseId === f.franchise).
        map((i) => {
          const ms = ctx.movements.filter((m) => m.itemId === i.id && inRange(m.at.slice(0, 10), f.range));
          const sum = (t: string) => ms.filter((m) => m.type === t).reduce((s, m) => s + m.qty, 0);
          return { item: i.name, franchise: fName(i.franchiseId), unit: i.unit, used: Math.abs(sum('used')), received: sum('received'), adjusted: sum('adjustment') + sum('count') };
        })
      };
    case 'low-stock':
      return {
        columns: [{ key: 'item', label: 'Item' }, { key: 'franchise', label: 'Franchise' }, { key: 'current', label: 'Current', kind: 'num' }, { key: 'reorder', label: 'Reorder at', kind: 'num' }, { key: 'suggested', label: 'Suggested', kind: 'num' }],
        rows: ctx.items.
        filter((i) => f.franchise === 'all' || i.franchiseId === f.franchise).
        map((i) => ({ i, b: balanceOf(i.id, ctx.movements) })).
        filter(({ i, b }) => isLow(i, b)).
        map(({ i, b }) => ({ item: i.name, franchise: fName(i.franchiseId), current: b, reorder: i.reorderLevel, suggested: suggestedReorder(i, b) }))
      };
    case 'inventory-variance':
      return {
        columns: [{ key: 'date', label: 'Date' }, { key: 'item', label: 'Item' }, { key: 'expected', label: 'Expected', kind: 'num' }, { key: 'actual', label: 'Counted', kind: 'num' }, { key: 'variance', label: 'Variance', kind: 'num' }, { key: 'status', label: 'Status' }],
        rows: ctx.variances.
        filter((v) => inRange(v.at.slice(0, 10), f.range)).
        map((v) => ({ date: v.at.slice(0, 10), item: ctx.items.find((i) => i.id === v.itemId)?.name ?? '—', expected: v.expected, actual: v.actual, variance: v.actual - v.expected, status: v.status === 'awaiting' ? 'Awaiting review' : 'Reviewed' }))
      };
    case 'customer-history':
      return {
        columns: [{ key: 'customer', label: 'Customer' }, { key: 'type', label: 'Type' }, { key: 'events', label: 'Events', kind: 'num' }, { key: 'last', label: 'Last event' }, money('sales', 'Reported sales')],
        rows: ctx.customers.
        filter((c) => f.franchise === 'all' || c.franchiseId === f.franchise).
        map((c) => {
          const mine = events.filter((e) => e.customerId === c.id);
          const reps = pairs.filter((p) => p.e.customerId === c.id).map((p) => p.r);
          const last = mine.map((e) => e.date).sort().pop();
          return { customer: c.name, type: c.type, events: mine.length, last: last ? fmtDate(last, 'yyyy-MM-dd') : '—', sales: summarize(reps).total };
        }).
        filter((r) => r.events as number > 0)
      };
    case 'audit-history':
      return {
        columns: [{ key: 'at', label: 'When' }, { key: 'user', label: 'User' }, { key: 'record', label: 'Record' }, { key: 'action', label: 'Action' }, { key: 'reason', label: 'Reason' }],
        rows: ctx.audit.
        filter((a) => inRange(a.at.slice(0, 10), f.range) && (f.franchise === 'all' || a.franchiseId === f.franchise)).
        map((a) => ({ at: fmtDateTime(a.at), user: a.user, record: `${a.recordType}: ${a.recordLabel}`, action: a.action, reason: a.reason ?? '' }))
      };
  }
}