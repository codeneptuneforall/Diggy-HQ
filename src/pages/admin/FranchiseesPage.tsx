import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../contexts/StoreContext';
import { Page } from '../../components/layout/Page';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusChip } from '../../components/ui/StatusChip';
import { DemoBadge } from '../../components/ui/DemoBadge';
import { franchiseHealth } from '../../utils/franchiseHealth';
import { franchiseStatusMeta } from '../../utils/status';
import { cx, fmtMoney, pct } from '../../utils/format';

export function FranchiseesPage() {
  const store = useStore();
  return (
    <Page>
      <PageHeader title="Franchisees" description="Every Diggy Donuts franchise, with the operating health corporate watches most." meta={<DemoBadge />} />
      <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-card">
        <table className="w-full text-sm">
          <thead className="border-b border-line bg-cream/60 text-left text-xs text-ink-3">
            <tr>
              <th className="px-4 py-2.5 font-medium">Franchise</th>
              <th className="px-4 py-2.5 font-medium">Territories</th>
              <th className="px-4 py-2.5 font-medium">Active trailers</th>
              <th className="px-4 py-2.5 text-right font-medium">Events (Oct)</th>
              <th className="px-4 py-2.5 text-right font-medium">Sales (Oct)</th>
              <th className="px-4 py-2.5 font-medium">Report completion</th>
              <th className="px-4 py-2.5 text-right font-medium">Inventory alerts</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {store.franchises.map((f) => {
              const h = franchiseHealth(f.id, store);
              return (
                <tr key={f.id} className="transition-colors hover:bg-cream/50">
                  <td className="px-4 py-3">
                    <Link to={`/franchisees/${f.id}`} className="font-medium hover:text-berry-700">
                      {f.name}
                    </Link>
                    <p className="text-xs text-ink-3">{f.owner} · {f.city}</p>
                  </td>
                  <td className="px-4 py-3 text-ink-2">{h.territories.map((t) => t.name).join(', ') || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={cx('tabular', h.activeTrailers === 0 && 'font-semibold text-bad-700')}>
                      {h.activeTrailers} of {h.trailers.length}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right tabular">{h.events}</td>
                  <td className="px-4 py-3 text-right tabular">{fmtMoney(h.sales)}</td>
                  <td className="px-4 py-3">{h.rate === null ? <span className="text-ink-3">—</span> : <span className={cx('font-medium tabular', h.rate < 0.8 ? 'text-bad-700' : 'text-ok-700')}>{pct(h.rate)} <span className="font-normal text-ink-3">({h.missing} missing)</span></span>}</td>
                  <td className="px-4 py-3 text-right tabular">{h.lowStock || <span className="text-ink-3">0</span>}</td>
                  <td className="px-4 py-3">
                    <StatusChip {...franchiseStatusMeta[f.status]} />
                  </td>
                </tr>);

            })}
          </tbody>
        </table>
      </div>
    </Page>);

}