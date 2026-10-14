import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertTriangle, Truck } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { useScoped } from '../../hooks/useScoped';
import { Page } from '../../components/layout/Page';
import { PageHeader } from '../../components/ui/PageHeader';
import { Tabs } from '../../components/ui/Tabs';
import { StatusChip } from '../../components/ui/StatusChip';
import { EmptyState } from '../../components/ui/EmptyState';
import { AvailabilityGrid } from '../../components/trailers/AvailabilityGrid';
import { TODAY, fmtDate, fmtTimeRange } from '../../utils/date';
import { trailerStatus, trailerStatusMeta } from '../../utils/status';

export function TrailersPage() {
  const store = useStore();
  const scoped = useScoped();
  const [params] = useSearchParams();
  const [tab, setTab] = useState<'directory' | 'availability'>(params.get('tab') === 'availability' ? 'availability' : 'directory');
  const active = scoped.trailers.filter((t) => t.baseStatus === 'available');
  const noTrailerUpcoming = scoped.events.filter((e) => !e.trailerId && e.date >= TODAY && e.status !== 'cancelled');

  return (
    <Page wide={tab === 'availability'}>
      <PageHeader title="Trailers" description="Who has which trailer, when — and whether it’s ready to roll." />
      {scoped.trailers.length > 0 && active.length === 0 &&
      <div className="mb-5 flex items-start gap-3 rounded-xl border border-warn-100 bg-warn-50 px-4 py-3 text-sm" role="alert">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warn-700" aria-hidden />
          <p>
            <span className="font-semibold text-warn-700">No active trailers.</span> Every trailer in this workspace is out of service. {noTrailerUpcoming.length} upcoming event{noTrailerUpcoming.length === 1 ? '' : 's'} can’t be confirmed until one is available.
          </p>
        </div>
      }
      <Tabs
        className="mb-5"
        value={tab}
        onChange={setTab}
        tabs={[
        { id: 'directory', label: 'Directory', count: scoped.trailers.length },
        { id: 'availability', label: 'Availability · next 14 days' }]
        } />
      
      {scoped.trailers.length === 0 ?
      <div className="rounded-2xl border border-line bg-white shadow-card">
          <EmptyState icon={Truck} title="No trailers registered" body="Ask Diggy Corporate to register a trailer for this franchise." />
        </div> :
      tab === 'directory' ?
      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
          <table className="w-full text-sm">
            <thead className="border-b border-line bg-cream/60 text-left text-xs text-ink-3">
              <tr>
                <th className="px-4 py-2.5 font-medium">Trailer</th>
                {store.role === 'corporate' && <th className="px-4 py-2.5 font-medium">Franchise</th>}
                <th className="px-4 py-2.5 font-medium">Territory</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">Next booking</th>
                <th className="px-4 py-2.5 text-right font-medium">Events this month</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {scoped.trailers.map((t) => {
              const st = trailerStatus(t, store.events);
              const next = store.events.filter((e) => e.trailerId === t.id && e.date >= TODAY && e.status !== 'cancelled' && e.status !== 'completed').sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start))[0];
              const month = store.events.filter((e) => e.trailerId === t.id && e.date.startsWith('2026-10') && e.status !== 'cancelled').length;
              return (
                <tr key={t.id} className="transition-colors hover:bg-cream/50">
                    <td className="px-4 py-3">
                      <Link to={`/trailers/${t.id}`} className="font-medium hover:text-berry-700">
                        {t.name}
                      </Link>
                      <p className="text-xs text-ink-3">{t.code}</p>
                    </td>
                    {store.role === 'corporate' && <td className="px-4 py-3 text-ink-2">{store.franchises.find((f) => f.id === t.franchiseId)?.shortName}</td>}
                    <td className="px-4 py-3 text-ink-2">{store.territories.find((x) => x.id === t.territoryId)?.name}</td>
                    <td className="px-4 py-3">
                      <StatusChip {...trailerStatusMeta[st]} />
                      {t.statusNote && <p className="mt-1 max-w-[220px] text-xs text-ink-3">{t.statusNote}</p>}
                    </td>
                    <td className="px-4 py-3">
                      {next ?
                    <Link to={`/events/${next.id}`} className="hover:text-berry-700">
                          <span className="block">{next.name}</span>
                          <span className="block text-xs text-ink-3">
                            {fmtDate(next.date)} · {fmtTimeRange(next.start, next.end)}
                          </span>
                        </Link> :

                    <span className="text-ink-3">—</span>
                    }
                    </td>
                    <td className="px-4 py-3 text-right tabular">{month}</td>
                  </tr>);

            })}
            </tbody>
          </table>
        </div> :

      <>
          <AvailabilityGrid trailers={scoped.trailers} events={store.events} />
          {noTrailerUpcoming.length > 0 &&
        <p className="mt-3 text-sm text-warn-700">
              {noTrailerUpcoming.length} upcoming event{noTrailerUpcoming.length > 1 ? 's have' : ' has'} no trailer:{' '}
              {noTrailerUpcoming.map((e, i) =>
          <React.Fragment key={e.id}>
                  {i > 0 && ', '}
                  <Link to={`/events/${e.id}`} className="font-medium underline-offset-2 hover:underline">
                    {e.name}
                  </Link>
                </React.Fragment>
          )}
            </p>
        }
        </>
      }
    </Page>);

}