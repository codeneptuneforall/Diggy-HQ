import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FileWarning, Plus, Receipt } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { useScoped } from '../../hooks/useScoped';
import { Page } from '../../components/layout/Page';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Tabs } from '../../components/ui/Tabs';
import { StatusChip } from '../../components/ui/StatusChip';
import { EmptyState } from '../../components/ui/EmptyState';
import { RANGE_LABELS, fmtDate, fmtDateTime, inRange } from '../../utils/date';
import { fmtMetric, perBatch, perHour, reportTotal } from '../../utils/sales';
import { reportStatusMeta } from '../../utils/status';
import { fmtMoney } from '../../utils/format';
import type { ReportStatus } from '../../types';

type TabId = 'all' | ReportStatus;

export function SalesReportsPage() {
  const store = useStore();
  const scoped = useScoped();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [tab, setTab] = useState<TabId>(params.get('status') as TabId ?? 'all');

  const inPeriod = scoped.reports.filter((r) => inRange(r.date, store.dateRange));
  const count = (s: ReportStatus) => inPeriod.filter((r) => r.status === s).length;
  const rows = inPeriod.filter((r) => tab === 'all' || r.status === tab).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <Page>
      <PageHeader
        title="Sales reports"
        description={`End-of-event sales, hours and batches · ${RANGE_LABELS[store.dateRange]}`}
        actions={
        <>
            {scoped.missing.length > 0 &&
          <Button icon={FileWarning} onClick={() => navigate('/missing-reports')}>
                {scoped.missing.length} missing
              </Button>
          }
            <Button variant="primary" icon={Plus} onClick={() => navigate('/sales-reports/new')}>
              New report
            </Button>
          </>
        } />
      
      <Tabs
        className="mb-4"
        value={tab}
        onChange={setTab}
        tabs={[
        { id: 'all', label: 'All', count: inPeriod.length },
        { id: 'submitted', label: 'Awaiting review', count: count('submitted') },
        { id: 'needs_correction', label: 'Needs correction', count: count('needs_correction'), alert: true },
        { id: 'reviewed', label: 'Reviewed', count: count('reviewed') },
        { id: 'locked', label: 'Finalized', count: count('locked') },
        { id: 'draft', label: 'Drafts', count: count('draft') }]
        } />
      
      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
        {rows.length === 0 ?
        <EmptyState icon={Receipt} title="No reports here" body="Nothing matches this status and date range." /> :

        <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-line bg-cream/60 text-left text-xs text-ink-3">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Event</th>
                  {store.role === 'corporate' && <th className="px-4 py-2.5 font-medium">Franchise</th>}
                  <th className="px-4 py-2.5 font-medium">Trailer</th>
                  <th className="px-4 py-2.5 text-right font-medium">Total</th>
                  <th className="px-4 py-2.5 text-right font-medium">Per hour</th>
                  <th className="px-4 py-2.5 text-right font-medium">Per batch</th>
                  <th className="px-4 py-2.5 font-medium">Submitted</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((r) => {
                const ev = store.events.find((e) => e.id === r.eventId);
                return (
                  <tr key={r.id} className="transition-colors hover:bg-cream/50">
                      <td className="px-4 py-3">
                        <Link to={r.status === 'draft' ? `/sales-reports/new?report=${r.id}` : `/sales-reports/${r.id}`} className="font-medium hover:text-berry-700">
                          {ev?.name}
                        </Link>
                        <p className="text-xs text-ink-3">{fmtDate(r.date)}</p>
                      </td>
                      {store.role === 'corporate' && <td className="px-4 py-3 text-ink-2">{store.franchises.find((f) => f.id === r.franchiseId)?.shortName}</td>}
                      <td className="px-4 py-3 text-ink-2">{store.trailers.find((t) => t.id === r.trailerId)?.code ?? '—'}</td>
                      <td className="px-4 py-3 text-right font-medium tabular">{fmtMoney(reportTotal(r), true)}</td>
                      <td className="px-4 py-3 text-right tabular text-ink-2">{fmtMetric(perHour(r))}</td>
                      <td className="px-4 py-3 text-right tabular text-ink-2">{fmtMetric(perBatch(r))}</td>
                      <td className="px-4 py-3 text-ink-2">
                        <span className="block">{r.reportedBy}</span>
                        <span className="block text-xs text-ink-3">{r.submittedAt ? fmtDateTime(r.submittedAt) : 'Not submitted'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusChip {...reportStatusMeta[r.status]} />
                      </td>
                    </tr>);

              })}
              </tbody>
            </table>
          </div>
        }
      </div>
    </Page>);

}