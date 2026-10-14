import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ClipboardCheck, Minus, Package, PackagePlus, Pencil, SlidersHorizontal } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { useUI } from '../../contexts/UIContext';
import { Page } from '../../components/layout/Page';
import { PageHeader } from '../../components/ui/PageHeader';
import { Panel } from '../../components/ui/Panel';
import { Button } from '../../components/ui/Button';
import { StatusChip } from '../../components/ui/StatusChip';
import { EmptyState } from '../../components/ui/EmptyState';
import { ItemFormDrawer } from '../../components/inventory/ItemFormDrawer';
import { fmtDateTime } from '../../utils/date';
import { MOVEMENT_LABELS, balanceOf, isLow, suggestedReorder, withRunningBalance } from '../../utils/inventory';
import { cx, fmtNum } from '../../utils/format';

export function InventoryItemPage() {
  const { id } = useParams();
  const store = useStore();
  const ui = useUI();
  const [editOpen, setEditOpen] = useState(false);
  const item = store.items.find((i) => i.id === id);
  if (!item || !store.inScope(item.franchiseId)) {
    return (
      <Page>
        <EmptyState icon={Package} title="Item not found" />
      </Page>);

  }
  const balance = balanceOf(item.id, store.movements);
  const low = isLow(item, balance);
  const sug = suggestedReorder(item, balance);
  const rows = withRunningBalance(item.id, store.movements).reverse();
  const variances = store.variances.filter((v) => v.itemId === item.id);
  const ack = store.acks.find((a) => a.itemId === item.id);

  return (
    <Page>
      <PageHeader
        back={{ label: 'Inventory', to: '/inventory' }}
        title={item.name}
        meta={!item.active ? <StatusChip tone="neutral" label="Inactive" /> : low ? <StatusChip tone="bad" label="Below reorder level" /> : <StatusChip tone="ok" label="In stock" />}
        description={`${item.sku} · ${item.category} · ${item.location}${store.role === 'corporate' ? ` · ${store.franchises.find((f) => f.id === item.franchiseId)?.shortName}` : ''}`}
        actions={
        <>
            <Button icon={Pencil} onClick={() => setEditOpen(true)}>
              Edit item
            </Button>
            {item.active &&
          <>
                <Button icon={ClipboardCheck} onClick={() => ui.openStockForm({ itemId: item.id, type: 'count' })}>
                  Count
                </Button>
                <Button icon={SlidersHorizontal} onClick={() => ui.openStockForm({ itemId: item.id, type: 'adjustment' })}>
                  Adjust
                </Button>
                <Button icon={PackagePlus} onClick={() => ui.openStockForm({ itemId: item.id, type: 'received' })}>
                  Receive
                </Button>
                <Button variant="primary" icon={Minus} onClick={() => ui.openStockForm({ itemId: item.id, type: 'used' })}>
                  Record usage
                </Button>
              </>
          }
          </>
        } />
      

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Panel title="Movement history" description="Current balance = sum of every movement below. Nothing is edited in place.">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-line text-left text-xs text-ink-3">
                  <tr>
                    <th className="py-2 font-medium">When</th>
                    <th className="py-2 font-medium">Type</th>
                    <th className="py-2 font-medium">Event / reason</th>
                    <th className="py-2 text-right font-medium">Change</th>
                    <th className="py-2 text-right font-medium">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {rows.map((m) => {
                    const ev = store.events.find((e) => e.id === m.eventId);
                    return (
                      <tr key={m.id}>
                        <td className="whitespace-nowrap py-2.5 pr-3 text-ink-2">
                          {fmtDateTime(m.at)}
                          <span className="block text-xs text-ink-3">{m.by}</span>
                        </td>
                        <td className="py-2.5 pr-3">{MOVEMENT_LABELS[m.type]}</td>
                        <td className="max-w-[260px] py-2.5 pr-3 text-ink-2">
                          {ev &&
                          <Link to={`/events/${ev.id}`} className="block hover:text-berry-700">
                              {ev.name}
                            </Link>
                          }
                          {m.reason && <span className="block text-xs">{m.reason}</span>}
                          {!ev && !m.reason && '—'}
                        </td>
                        <td className={cx('py-2.5 text-right font-medium tabular', m.qty > 0 ? 'text-ok-700' : 'text-ink')}>
                          {m.qty > 0 ? '+' : ''}
                          {fmtNum(m.qty, 1)}
                        </td>
                        <td className={cx('py-2.5 text-right tabular', m.balance <= item.reorderLevel ? 'font-semibold text-bad-700' : '')}>{fmtNum(m.balance, 1)}</td>
                      </tr>);

                  })}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
        <div className="space-y-6">
          <section className={cx('rounded-2xl border p-5 shadow-card', low ? 'border-bad-100 bg-bad-50' : 'border-line bg-white')}>
            <p className="text-xs text-ink-3">On hand</p>
            <p className={cx('font-display text-5xl font-semibold tabular', low && 'text-bad-700')}>{fmtNum(balance, 1)}</p>
            <p className="text-sm text-ink-2">{item.unit}</p>
            <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-black/5 pt-4 text-sm">
              <div>
                <dt className="text-xs text-ink-3">Reorder level</dt>
                <dd className="font-medium">{item.reorderLevel}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-3">Target</dt>
                <dd className="font-medium">{item.targetQty ?? '—'}</dd>
              </div>
            </dl>
            {low &&
            <p className="mt-4 text-sm text-bad-700">
                {sug !== null ? `Suggested replenishment: ${fmtNum(sug, 1)} ${item.unit}.` : 'Set a target quantity to get a replenishment suggestion.'}
                <span className="block text-xs text-ink-2">{ack ? `Acknowledged by ${ack.by}` : 'Alert not yet acknowledged.'}</span>
              </p>
            }
          </section>
          <Panel title="Variances">
            {variances.length === 0 ?
            <p className="text-sm text-ink-3">No count variances recorded.</p> :

            <ul className="space-y-3">
                {variances.map((v) =>
              <li key={v.id} className="text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium tabular">
                        {v.expected} → {v.actual} ({v.actual - v.expected > 0 ? '+' : ''}
                        {v.actual - v.expected})
                      </span>
                      <StatusChip tone={v.status === 'awaiting' ? 'warn' : 'ok'} label={v.status === 'awaiting' ? 'Awaiting review' : 'Reviewed'} />
                    </div>
                    <p className="text-xs text-ink-2">{v.note}</p>
                  </li>
              )}
              </ul>
            }
          </Panel>
          {item.notes &&
          <Panel title="Notes">
              <p className="text-sm">{item.notes}</p>
            </Panel>
          }
        </div>
      </div>
      <ItemFormDrawer open={editOpen} onClose={() => setEditOpen(false)} item={item} />
    </Page>);

}