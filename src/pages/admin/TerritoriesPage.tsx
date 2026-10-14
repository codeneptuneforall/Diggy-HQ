import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../contexts/StoreContext';
import { Page } from '../../components/layout/Page';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusChip } from '../../components/ui/StatusChip';
import { TODAY } from '../../utils/date';

export function TerritoriesPage() {
  const store = useStore();
  return (
    <Page>
      <PageHeader title="Territories" description="Service areas and which franchise holds them. Territory rules are configured by corporate — boundaries here are descriptive, not legal definitions." />
      <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-card">
        <table className="w-full text-sm">
          <thead className="border-b border-line bg-cream/60 text-left text-xs text-ink-3">
            <tr>
              <th className="px-4 py-2.5 font-medium">Territory</th>
              <th className="px-4 py-2.5 font-medium">Region</th>
              <th className="px-4 py-2.5 font-medium">Coverage</th>
              <th className="px-4 py-2.5 font-medium">Franchise</th>
              <th className="px-4 py-2.5 text-right font-medium">Trailers</th>
              <th className="px-4 py-2.5 text-right font-medium">Upcoming events</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {store.territories.map((t) =>
            <tr key={t.id} className="transition-colors hover:bg-cream/50">
                <td className="px-4 py-3">
                  <Link to={`/territories/${t.id}`} className="font-medium hover:text-berry-700">
                    {t.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-ink-2">{t.region}</td>
                <td className="max-w-[260px] px-4 py-3 text-ink-2">{t.coverage}</td>
                <td className="px-4 py-3">{t.franchiseId ? store.franchises.find((f) => f.id === t.franchiseId)?.shortName : <StatusChip tone="info" label="Open territory" />}</td>
                <td className="px-4 py-3 text-right tabular">{store.trailers.filter((x) => x.territoryId === t.id).length}</td>
                <td className="px-4 py-3 text-right tabular">{store.events.filter((e) => e.territoryId === t.id && e.date >= TODAY && e.status !== 'cancelled').length}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Page>);

}