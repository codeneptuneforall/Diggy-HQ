import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Map } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { Page } from '../../components/layout/Page';
import { PageHeader } from '../../components/ui/PageHeader';
import { Panel } from '../../components/ui/Panel';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { StatusChip } from '../../components/ui/StatusChip';
import { inputCls } from '../../components/ui/Field';
import { fmtDate, inRange } from '../../utils/date';
import { eventStatusMeta } from '../../utils/status';

export function TerritoryDetailPage() {
  const { id } = useParams();
  const store = useStore();
  const [open, setOpen] = useState(false);
  const t = store.territories.find((x) => x.id === id);
  const [fid, setFid] = useState(t?.franchiseId ?? '');
  if (!t) return <Page><EmptyState icon={Map} title="Territory not found" /></Page>;
  const events = store.events.filter((e) => e.territoryId === t.id).sort((a, b) => b.date.localeCompare(a.date));
  const trailers = store.trailers.filter((x) => x.territoryId === t.id);
  const franchise = store.franchises.find((f) => f.id === t.franchiseId);

  return (
    <Page>
      <PageHeader
        back={{ label: 'Territories', to: '/territories' }}
        title={t.name}
        meta={franchise ? <StatusChip tone="ok" label={`Assigned · ${franchise.shortName}`} /> : <StatusChip tone="info" label="Open territory" />}
        description={`${t.region} · ${t.coverage}`}
        actions={<Button onClick={() => setOpen(true)}>{franchise ? 'Reassign' : 'Assign franchise'}</Button>} />
      
      <div className="grid gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-2" title="Event activity" description={`${events.filter((e) => inRange(e.date, 'last30')).length} events in the last 30 days`}>
          {events.length === 0 ?
          <p className="text-sm text-ink-3">No events in this territory yet.</p> :

          <ul className="divide-y divide-line">
              {events.map((e) =>
            <li key={e.id}>
                  <Link to={`/events/${e.id}`} className="flex items-center justify-between gap-3 py-2.5 hover:text-berry-700">
                    <span>
                      <span className="block text-sm font-medium">{e.name}</span>
                      <span className="block text-xs text-ink-3">{fmtDate(e.date)}</span>
                    </span>
                    <StatusChip {...eventStatusMeta[e.status]} />
                  </Link>
                </li>
            )}
            </ul>
          }
        </Panel>
        <div className="space-y-6">
          <Panel title="Trailers based here">
            {trailers.length === 0 ? <p className="text-sm text-ink-3">None.</p> :
            <ul className="space-y-2 text-sm">
                {trailers.map((x) =>
              <li key={x.id}>
                    <Link to={`/trailers/${x.id}`} className="font-medium hover:text-berry-700">{x.name}</Link>
                  </li>
              )}
              </ul>
            }
          </Panel>
          {t.notes &&
          <Panel title="Notes">
              <p className="text-sm">{t.notes}</p>
            </Panel>
          }
        </div>
      </div>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Assign territory"
        description="Existing events keep their franchise. New events in this territory will belong to the selected franchise."
        footer={
        <>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button
            variant="primary"
            onClick={() => {
              store.assignTerritory(t.id, fid || null);
              setOpen(false);
              toast.success('Territory assignment updated');
            }}>
            
              Save
            </Button>
          </>
        }>
        
        <label htmlFor="terr-f" className="text-[13px] font-medium text-ink-2">
          Franchise
        </label>
        <select id="terr-f" className={`${inputCls} mt-1.5`} value={fid} onChange={(e) => setFid(e.target.value)}>
          <option value="">Unassigned (open)</option>
          {store.franchises.map((f) =>
          <option key={f.id} value={f.id}>
              {f.name}
            </option>
          )}
        </select>
      </Modal>
    </Page>);

}