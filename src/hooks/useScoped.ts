import { useMemo } from 'react';
import { useStore } from '../contexts/StoreContext';
import { getEventIssues, type EventIssue } from '../utils/conflicts';
import { TODAY } from '../utils/date';
import { balanceOf, isLow } from '../utils/inventory';
import { missingReportEvents } from '../utils/reports';

/** All collections narrowed to what the current user/workspace is permitted to see. */
export function useScoped() {
  const s = useStore();
  return useMemo(() => {
    const events = s.events.filter((e) => s.inScope(e.franchiseId));
    const reports = s.reports.filter((r) => s.inScope(r.franchiseId));
    const customers = s.customers.filter((c) => s.inScope(c.franchiseId));
    const trailers = s.trailers.filter((t) => s.inScope(t.franchiseId));
    const employees = s.employees.filter((e) => s.inScope(e.franchiseId));
    const items = s.items.filter((i) => s.inScope(i.franchiseId));
    const itemIds = new Set(items.map((i) => i.id));
    const variances = s.variances.filter((v) => itemIds.has(v.itemId));
    const customerIds = new Set(customers.map((c) => c.id));
    const followUps = s.followUps.filter((f) => customerIds.has(f.customerId));
    const franchises = s.franchises.filter((f) => s.inScope(f.id));
    const territories = s.territories.filter((t) => t.franchiseId ? s.inScope(t.franchiseId) : s.role === 'corporate' && s.workspace === 'network');
    const audit = s.audit.filter((a) => a.franchiseId === null ? s.role === 'corporate' : s.inScope(a.franchiseId));

    const missing = missingReportEvents(events, s.reports);
    const lowStock = items.
    map((item) => ({ item, balance: balanceOf(item.id, s.movements) })).
    filter(({ item, balance }) => isLow(item, balance));
    const awaitingVariances = variances.filter((v) => v.status === 'awaiting');

    const issuesByEvent = new Map<string, EventIssue[]>();
    events.
    filter((e) => e.date >= TODAY).
    forEach((e) => {
      const issues = getEventIssues(e, s.events, s.employees, s.trailers);
      if (issues.length) issuesByEvent.set(e.id, issues);
    });
    const conflictEvents = events.filter((e) => issuesByEvent.get(e.id)?.some((i) => i.severity === 'conflict'));
    const followUpsDue = followUps.filter((f) => !f.done && f.due <= TODAY);

    return {
      events,
      reports,
      customers,
      trailers,
      employees,
      items,
      variances,
      followUps,
      franchises,
      territories,
      audit,
      missing,
      lowStock,
      awaitingVariances,
      issuesByEvent,
      conflictEvents,
      followUpsDue
    };
  }, [s]);
}