import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Check, Package, PackagePlus, Plus, Search } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { useUI } from '../../contexts/UIContext';
import { useScoped } from '../../hooks/useScoped';
import { Page } from '../../components/layout/Page';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Tabs } from '../../components/ui/Tabs';
import { StatusChip } from '../../components/ui/StatusChip';
import { FilterSelect } from '../../components/ui/FilterSelect';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import { inputCls } from '../../components/ui/Field';
import { ItemFormDrawer } from '../../components/inventory/ItemFormDrawer';
import { StockLevelBar } from '../../components/inventory/StockLevelBar';
import { fmtDate, fmtDateTime, relTime } from '../../utils/date';
import { MOVEMENT_LABELS, balanceOf, isLow, suggestedReorder } from '../../utils/inventory';
import { cx, fmtNum } from '../../utils/format';

type Tab = 'items' | 'low' | 'variances' | 'history';

export function InventoryPage() {
  const store = useStore();
  const scoped = useScoped();
  const ui = useUI();
  const [params] = useSearchParams();
  const [tab, setTab] = useState<Tab>(params.get('tab') as Tab || 'items');
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('all');
  const [showInactive, setShowInactive] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [reviewId, setReviewId] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const franchiseCol = store.role === 'corporate' && store.workspace === 'network';
  const fName = (id: string) => store.franchises.find((f) => f.id === id)?.shortName;

  const categories = Array.from(new Set(scoped.items.map((i) => i.category)));
  const items = scoped.items.
  filter((i) => (showInactive || i.active) && (category === 'all' || i.category === category) && (!q || `${i.name} ${i.sku}`.toLowerCase().includes(q.toLowerCase()))).
  map((i) => ({ item: i, balance: balanceOf(i.id, store.movements) }));

  const history = store.movements.filter((m) => scoped.items.some((i) => i.id === m.itemId)).sort((a, b) => b.at.localeCompare(a.at));

  return (
    <Page>
      <PageHeader
        title="Inventory"
        description={`${scoped.items.filter((i) => i.active).length} active items · balances are calculated from every recorded movement.`}
        actions={
        <>
            <Button icon={Plus} onClick={() => setAddOpen(true)}>
              Add item
            </Button>
            <Button variant="primary" icon={PackagePlus} onClick={() => ui.openStockForm({})}>
              Record inventory
            </Button>
          </>
        } />
      
      <Tabs
        className="mb-4"
        value={tab}
        onChange={setTab}
        tabs={[
        { id: 'items', label: 'Items', count: scoped.items.filter((i) => i.active).length },
        { id: 'low', label: 'Low-stock alerts', count: scoped.lowStock.length, alert: true },
        { id: 'variances', label: 'Variance review', count: scoped.awaitingVariances.length, alert: true },
        { id: 'history', label: 'Movement history' }]
        } />
      

      {tab === 'items' &&
      <>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <label className="relative">
              <span className="sr-only">Search items</span>
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" aria-hidden />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Item or SKU" className="h-9 w-56 rounded-lg border border-line-strong bg-white pl-8 pr-3 text-[13px] focus:border-berry-400 focus:outline-none focus:ring-2 focus:ring-berry-100" />
            </label>
            <FilterSelect label="Category" value={category} onChange={setCategory} options={[{ value: 'all', label: 'All categories' }, ...categories.map((c) => ({ value: c, label: c }))]} />
            <label className="flex items-center gap-2 text-[13px] text-ink-2">
              <input type="checkbox" checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} className="h-4 w-4 accent-berry-600" />
              Show inactive
            </label>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-card">
            {items.length === 0 ?
          <EmptyState icon={Package} title="No items match" /> :

          <table className="w-full text-sm">
                <thead className="border-b border-line bg-cream/60 text-left text-xs text-ink-3">
                  <tr>
                    <th className="px-4 py-2.5 font-medium">Item</th>
                    {franchiseCol && <th className="px-4 py-2.5 font-medium">Franchise</th>}
                    <th className="px-4 py-2.5 font-medium">Category</th>
                    <th className="px-4 py-2.5 text-right font-medium">On hand</th>
                    <th className="px-4 py-2.5 font-medium">Level</th>
                    <th className="px-4 py-2.5 text-right font-medium">Reorder at</th>
                    <th className="px-4 py-2.5 font-medium">Status</th>
                    <th className="px-4 py-2.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {items.map(({ item, balance }) => {
                const low = isLow(item, balance);
                return (
                  <tr key={item.id} className={cx('transition-colors hover:bg-cream/50', !item.active && 'text-ink-3')}>
                        <td className="px-4 py-3">
                          <Link to={`/inventory/${item.id}`} className="font-medium hover:text-berry-700">
                            {item.name}
                          </Link>
                          <p className="text-xs text-ink-3">{item.sku}</p>
                        </td>
                        {franchiseCol && <td className="px-4 py-3 text-ink-2">{fName(item.franchiseId)}</td>}
                        <td className="px-4 py-3 text-ink-2">{item.category}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-right">
                          <span className={cx('font-semibold tabular', low && 'text-bad-700')}>{fmtNum(balance, 1)}</span> <span className="text-xs text-ink-3">{item.unit}</span>
                        </td>
                        <td className="px-4 py-3">
                          <StockLevelBar balance={balance} reorder={item.reorderLevel} target={item.targetQty} />
                        </td>
                        <td className="px-4 py-3 text-right tabular text-ink-2">{item.reorderLevel}</td>
                        <td className="px-4 py-3">{!item.active ? <StatusChip tone="neutral" label="Inactive" /> : low ? <StatusChip tone="bad" label="Low stock" /> : <StatusChip tone="ok" label="OK" />}</td>
                        <td className="px-4 py-3 text-right">
                          {item.active &&
                      <Button size="sm" variant="ghost" onClick={() => ui.openStockForm({ itemId: item.id })}>
                              Record
                            </Button>
                      }
                        </td>
                      </tr>);

              })}
                </tbody>
              </table>
          }
          </div>
        </>
      }

      {tab === 'low' &&
      <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-card">
          {scoped.lowStock.length === 0 ?
        <EmptyState icon={Check} title="Nothing is low" body="Every active item is above its reorder level." /> :

        <table className="w-full text-sm">
              <thead className="border-b border-line bg-cream/60 text-left text-xs text-ink-3">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Item</th>
                  {franchiseCol && <th className="px-4 py-2.5 font-medium">Franchise</th>}
                  <th className="px-4 py-2.5 text-right font-medium">Current</th>
                  <th className="px-4 py-2.5 text-right font-medium">Reorder at</th>
                  <th className="px-4 py-2.5 text-right font-medium">Suggested replenishment</th>
                  <th className="px-4 py-2.5 font-medium">Acknowledged</th>
                  <th className="px-4 py-2.5 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {scoped.lowStock.map(({ item, balance }) => {
              const ack = store.acks.find((a) => a.itemId === item.id);
              const sug = suggestedReorder(item, balance);
              return (
                <tr key={item.id}>
                      <td className="px-4 py-3">
                        <Link to={`/inventory/${item.id}`} className="font-medium hover:text-berry-700">
                          {item.name}
                        </Link>
                        <p className="text-xs text-ink-3">{item.unit}</p>
                      </td>
                      {franchiseCol && <td className="px-4 py-3 text-ink-2">{fName(item.franchiseId)}</td>}
                      <td className="px-4 py-3 text-right font-semibold tabular text-bad-700">{fmtNum(balance, 1)}</td>
                      <td className="px-4 py-3 text-right tabular">{item.reorderLevel}</td>
                      <td className="px-4 py-3 text-right tabular">{sug !== null ? `${fmtNum(sug, 1)} to reach ${item.targetQty}` : <span className="text-ink-3">No target set</span>}</td>
                      <td className="px-4 py-3">{ack ? <StatusChip tone="ok" label={`${ack.by.split(' ')[0]} · ${relTime(ack.at)}`} /> : <StatusChip tone="warn" label="Not acknowledged" />}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1.5">
                          {!ack &&
                      <Button size="sm" onClick={() => {store.acknowledgeAlert(item.id);toast.success('Alert acknowledged');}}>
                              Acknowledge
                            </Button>
                      }
                          <Button size="sm" variant="subtle" onClick={() => ui.openStockForm({ itemId: item.id, type: 'received' })}>
                            Record received
                          </Button>
                        </div>
                      </td>
                    </tr>);

            })}
              </tbody>
            </table>
        }
        </div>
      }

      {tab === 'variances' &&
      <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-card">
          {scoped.variances.length === 0 ?
        <EmptyState icon={Check} title="No variances recorded" /> :

        <table className="w-full text-sm">
              <thead className="border-b border-line bg-cream/60 text-left text-xs text-ink-3">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Item</th>
                  <th className="px-4 py-2.5 font-medium">Event</th>
                  <th className="px-4 py-2.5 text-right font-medium">Expected</th>
                  <th className="px-4 py-2.5 text-right font-medium">Counted</th>
                  <th className="px-4 py-2.5 text-right font-medium">Variance</th>
                  <th className="px-4 py-2.5 font-medium">Explanation</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {scoped.variances.
            slice().
            sort((a, b) => a.status === b.status ? b.at.localeCompare(a.at) : a.status === 'awaiting' ? -1 : 1).
            map((v) => {
              const item = store.items.find((i) => i.id === v.itemId);
              const ev = store.events.find((e) => e.id === v.eventId);
              const diff = v.actual - v.expected;
              return (
                <tr key={v.id} className="align-top">
                        <td className="px-4 py-3">
                          <Link to={`/inventory/${v.itemId}`} className="font-medium hover:text-berry-700">
                            {item?.name}
                          </Link>
                          <p className="text-xs text-ink-3">{fmtDateTime(v.at)} · {v.countedBy}</p>
                        </td>
                        <td className="px-4 py-3 text-ink-2">{ev ? <Link to={`/events/${ev.id}`} className="hover:text-berry-700">{ev.name}</Link> : '—'}</td>
                        <td className="px-4 py-3 text-right tabular">{v.expected}</td>
                        <td className="px-4 py-3 text-right tabular">{v.actual}</td>
                        <td className={cx('px-4 py-3 text-right font-semibold tabular', diff < 0 ? 'text-bad-700' : diff > 0 ? 'text-warn-700' : 'text-ok-700')}>
                          {diff > 0 ? '+' : ''}
                          {fmtNum(diff, 1)} <span className="text-xs font-normal text-ink-3">{item?.unit}</span>
                        </td>
                        <td className="max-w-[240px] px-4 py-3 text-ink-2">
                          {v.note}
                          {v.reviewNote && <span className="mt-1 block text-xs text-ink-3">Review: {v.reviewNote}</span>}
                        </td>
                        <td className="px-4 py-3">
                          {v.status === 'awaiting' ?
                    <Button size="sm" variant="subtle" onClick={() => setReviewId(v.id)}>
                              Review
                            </Button> :

                    <StatusChip tone="ok" label={`Reviewed · ${v.reviewedBy?.split(' ')[0]}`} />
                    }
                        </td>
                      </tr>);

            })}
              </tbody>
            </table>
        }
        </div>
      }

      {tab === 'history' &&
      <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-card">
          <table className="w-full text-sm">
            <thead className="border-b border-line bg-cream/60 text-left text-xs text-ink-3">
              <tr>
                <th className="px-4 py-2.5 font-medium">When</th>
                <th className="px-4 py-2.5 font-medium">Item</th>
                <th className="px-4 py-2.5 font-medium">Type</th>
                <th className="px-4 py-2.5 text-right font-medium">Change</th>
                <th className="px-4 py-2.5 font-medium">Event / reason</th>
                <th className="px-4 py-2.5 font-medium">By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {history.slice(0, 40).map((m) => {
              const item = store.items.find((i) => i.id === m.itemId);
              const ev = store.events.find((e) => e.id === m.eventId);
              return (
                <tr key={m.id}>
                    <td className="whitespace-nowrap px-4 py-2.5 text-ink-2">{fmtDate(m.at.slice(0, 10), 'MMM d')} <span className="text-xs text-ink-3">{m.at.slice(11)}</span></td>
                    <td className="px-4 py-2.5">
                      <Link to={`/inventory/${m.itemId}`} className="hover:text-berry-700">
                        {item?.name}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-ink-2">{MOVEMENT_LABELS[m.type]}</td>
                    <td className={cx('px-4 py-2.5 text-right font-medium tabular', m.qty < 0 ? 'text-ink' : 'text-ok-700')}>
                      {m.qty > 0 ? '+' : ''}
                      {fmtNum(m.qty, 1)}
                    </td>
                    <td className="max-w-[260px] truncate px-4 py-2.5 text-ink-2">{ev?.name ?? m.reason ?? '—'}</td>
                    <td className="px-4 py-2.5 text-ink-2">{m.by}</td>
                  </tr>);

            })}
            </tbody>
          </table>
        </div>
      }

      <ItemFormDrawer open={addOpen} onClose={() => setAddOpen(false)} />
      <Modal
        open={!!reviewId}
        onClose={() => setReviewId(null)}
        title="Review variance"
        description="Confirm the explanation. The stock balance already reflects the count."
        footer={
        <>
            <Button onClick={() => setReviewId(null)}>Cancel</Button>
            <Button
            variant="primary"
            disabled={reviewNote.trim().length < 3}
            onClick={() => {
              if (reviewId) store.reviewVariance(reviewId, reviewNote.trim());
              toast.success('Variance reviewed');
              setReviewId(null);
              setReviewNote('');
            }}>
            
              Mark reviewed
            </Button>
          </>
        }>
        
        <label htmlFor="rv-note" className="text-[13px] font-medium text-ink-2">
          Review note
        </label>
        <textarea id="rv-note" rows={3} className={`${inputCls} mt-1.5`} value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} placeholder="e.g. Accepted — spill documented by shift lead" />
      </Modal>
    </Page>);

}