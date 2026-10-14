import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowRightLeft, Store, Truck } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { Page } from '../../components/layout/Page';
import { PageHeader } from '../../components/ui/PageHeader';
import { Panel } from '../../components/ui/Panel';
import { Button } from '../../components/ui/Button';
import { StatusChip } from '../../components/ui/StatusChip';
import { EmptyState } from '../../components/ui/EmptyState';
import { DemoBadge } from '../../components/ui/DemoBadge';
import { franchiseHealth } from '../../utils/franchiseHealth';
import { TODAY, fmtDate } from '../../utils/date';
import { franchiseStatusMeta, trailerStatus, trailerStatusMeta, userStatusMeta } from '../../utils/status';
import { cx, fmtMoney, pct } from '../../utils/format';

export function FranchiseDetailPage() {
  const { id } = useParams();
  const store = useStore();
  const navigate = useNavigate();
  const f = store.franchises.find((x) => x.id === id);
  if (!f) return <Page><EmptyState icon={Store} title="Franchise not found" /></Page>;
  const h = franchiseHealth(f.id, store);
  const upcoming = store.events.filter((e) => e.franchiseId === f.id && e.date >= TODAY && e.status !== 'cancelled').sort((a, b) => a.date.localeCompare(b.date));

  return (
    <Page>
      <PageHeader
        back={{ label: 'Franchisees', to: '/franchisees' }}
        title={f.name}
        meta={<StatusChip {...franchiseStatusMeta[f.status]} />}
        description={`${f.owner} · ${f.ownerEmail} · ${f.phone} · franchisee since ${fmtDate(f.since, 'MMM yyyy')}`}
        actions={
        <Button
          variant="primary"
          icon={ArrowRightLeft}
          onClick={() => {
            store.setWorkspace(f.id);
            navigate('/');
          }}>
          
            Open as workspace
          </Button>
        } />
      
      <div className="mb-6 flex items-center gap-3">
        <dl className="grid flex-1 grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line shadow-card sm:grid-cols-4">
          {[
          ['Events in October', String(h.events)],
          ['Reported sales (Oct)', fmtMoney(h.sales)],
          ['Report completion', h.rate === null ? '—' : pct(h.rate)],
          ['Low-stock items', String(h.lowStock)]].
          map(([k, v]) =>
          <div key={k} className="bg-white px-4 py-3">
              <dt className="text-xs text-ink-3">{k}</dt>
              <dd className={cx('font-display text-xl font-semibold tabular', k === 'Report completion' && h.rate !== null && h.rate < 0.8 && 'text-bad-700')}>{v}</dd>
            </div>
          )}
        </dl>
        <DemoBadge />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Trailers" description={`${h.activeTrailers} active of ${h.trailers.length}`}>
          {h.trailers.length === 0 || h.activeTrailers === 0 ?
          <div className="mb-3 rounded-xl border border-warn-100 bg-warn-50 px-4 py-3 text-sm text-warn-700">
              <span className="font-semibold">No active trailers.</span> This franchise can’t confirm new events until a trailer is back in service.
            </div> :
          null}
          <ul className="divide-y divide-line">
            {h.trailers.map((t) =>
            <li key={t.id} className="flex items-center justify-between py-2.5">
                <Link to={`/trailers/${t.id}`} className="flex items-center gap-2 text-sm font-medium hover:text-berry-700">
                  <Truck className="h-4 w-4 text-ink-3" aria-hidden /> {t.name}
                </Link>
                <StatusChip {...trailerStatusMeta[trailerStatus(t, store.events)]} />
              </li>
            )}
          </ul>
        </Panel>
        <Panel title="Territories" action={<Link to="/territories" className="text-[13px] font-medium text-berry-700 hover:underline">Manage</Link>}>
          <ul className="divide-y divide-line">
            {h.territories.map((t) =>
            <li key={t.id} className="py-2.5">
                <Link to={`/territories/${t.id}`} className="text-sm font-medium hover:text-berry-700">
                  {t.name}
                </Link>
                <p className="text-xs text-ink-3">{t.coverage}</p>
              </li>
            )}
          </ul>
        </Panel>
        <Panel title="Upcoming events" description={`${upcoming.length} scheduled`}>
          {upcoming.length === 0 ?
          <p className="text-sm text-ink-3">No upcoming events.</p> :

          <ul className="divide-y divide-line">
              {upcoming.slice(0, 6).map((e) =>
            <li key={e.id}>
                  <Link to={`/events/${e.id}`} className="flex justify-between gap-3 py-2.5 text-sm hover:text-berry-700">
                    <span className="truncate">{e.name}</span>
                    <span className="shrink-0 text-ink-3">{fmtDate(e.date, 'MMM d')}</span>
                  </Link>
                </li>
            )}
            </ul>
          }
        </Panel>
        <Panel title="Users" description="People with access to this franchise">
          <ul className="divide-y divide-line">
            {h.users.map((u) =>
            <li key={u.id} className="flex items-center justify-between py-2.5 text-sm">
                <span>
                  <span className="block font-medium">{u.name}</span>
                  <span className="block text-xs text-ink-3">{u.role}</span>
                </span>
                <StatusChip {...userStatusMeta[u.status]} />
              </li>
            )}
          </ul>
        </Panel>
      </div>
    </Page>);

}