import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Info, Lock, Plus } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { Page } from '../components/layout/Page';
import { PageHeader } from '../components/ui/PageHeader';
import { Panel } from '../components/ui/Panel';
import { Tabs } from '../components/ui/Tabs';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { Field, inputCls } from '../components/ui/Field';
import { notificationMeta } from '../components/notifications/notificationMeta';
import { cx, uid } from '../utils/format';
import type { NotificationKind } from '../types';

type Tab = 'workspace' | 'notifications' | 'profile';
type Channel = 'inApp' | 'email' | 'push';

export function SettingsPage() {
  const store = useStore();
  const [params] = useSearchParams();
  const [tab, setTab] = useState<Tab>(params.get('tab') as Tab || 'workspace');
  const canEdit = store.role === 'corporate';
  const [rule, setRule] = useState({ due: String(store.settings.reportDueHours), every: String(store.settings.reminderEveryHours), max: String(store.settings.reminderMax), other: store.settings.otherPaymentLabel, batch: store.settings.batchUnit });
  const [newCat, setNewCat] = useState('');
  const [newUnit, setNewUnit] = useState('');
  const [prefs, setPrefs] = useState<Record<NotificationKind, Record<Channel, boolean>>>(() =>
  Object.fromEntries((Object.keys(notificationMeta) as NotificationKind[]).map((k) => [k, { inApp: true, email: ['missing_report', 'correction_requested', 'trailer_conflict'].includes(k), push: ['upcoming_event', 'assignment_changed', 'schedule_updated', 'missing_report'].includes(k) }])) as Record<NotificationKind, Record<Channel, boolean>>
  );

  return (
    <Page className="max-w-5xl">
      <PageHeader title="Settings" />
      <Tabs className="mb-6" value={tab} onChange={setTab} tabs={[{ id: 'workspace', label: 'Workspace' }, { id: 'notifications', label: 'Notifications' }, { id: 'profile', label: 'Profile & account' }]} />

      {tab === 'workspace' &&
      <div className="space-y-6">
          {!canEdit &&
        <p className="flex items-center gap-2 rounded-xl bg-cream-2 px-4 py-3 text-sm text-ink-2">
              <Lock className="h-4 w-4" aria-hidden /> These rules are set by Diggy Corporate for the whole network. You can view them here.
            </p>
        }
          <Panel title="Sales reporting rules" description="Applies to every franchise. Changes are recorded in the audit trail.">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Report due after event ends" htmlFor="s-due" hint="Hours">
                <input id="s-due" type="number" min={1} disabled={!canEdit} className={inputCls} value={rule.due} onChange={(e) => setRule({ ...rule, due: e.target.value })} />
              </Field>
              <Field label="Remind every" htmlFor="s-every" hint="Hours, while still missing">
                <input id="s-every" type="number" min={1} disabled={!canEdit} className={inputCls} value={rule.every} onChange={(e) => setRule({ ...rule, every: e.target.value })} />
              </Field>
              <Field label="Maximum reminders" htmlFor="s-max">
                <input id="s-max" type="number" min={0} disabled={!canEdit} className={inputCls} value={rule.max} onChange={(e) => setRule({ ...rule, max: e.target.value })} />
              </Field>
              <Field label="Other payment type label" htmlFor="s-other">
                <input id="s-other" disabled={!canEdit} className={inputCls} value={rule.other} onChange={(e) => setRule({ ...rule, other: e.target.value })} />
              </Field>
              <Field label="Batch unit" htmlFor="s-batch" hint="How batches are counted on reports">
                <input id="s-batch" disabled={!canEdit} className={inputCls} value={rule.batch} onChange={(e) => setRule({ ...rule, batch: e.target.value })} />
              </Field>
            </div>
            {canEdit &&
          <Button
            variant="primary"
            className="mt-4"
            onClick={() => {
              store.updateSettings({ reportDueHours: Math.max(1, Number(rule.due) || 24), reminderEveryHours: Math.max(1, Number(rule.every) || 24), reminderMax: Math.max(0, Number(rule.max) || 0), otherPaymentLabel: rule.other || 'Other', batchUnit: rule.batch || 'batch' }, 'Updated reporting rules');
              toast.success('Reporting rules saved');
            }}>
            
                Save rules
              </Button>
          }
          </Panel>

          <Panel title="Event categories" description="Shown in the event form, calendar legend and reports.">
            <ul className="divide-y divide-line">
              {store.settings.categories.map((c) =>
            <li key={c.id} className="flex items-center gap-3 py-2.5">
                  <span className="h-3 w-3 rounded" style={{ backgroundColor: c.color }} aria-hidden />
                  <span className={cx('flex-1 text-sm', !c.active && 'text-ink-3 line-through')}>{c.label}</span>
                  <label className="flex items-center gap-2 text-[13px] text-ink-2">
                    <input
                  type="checkbox"
                  disabled={!canEdit}
                  checked={c.active}
                  onChange={() => store.updateSettings({ categories: store.settings.categories.map((x) => x.id === c.id ? { ...x, active: !x.active } : x) }, `Toggled category ${c.label}`)}
                  className="h-4 w-4 accent-berry-600" />
                
                    Active
                  </label>
                </li>
            )}
            </ul>
            {canEdit &&
          <form
            className="mt-3 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!newCat.trim()) return;
              store.updateSettings({ categories: [...store.settings.categories, { id: uid('cat'), label: newCat.trim(), color: '#7A6E73', active: true }] }, `Added category ${newCat.trim()}`);
              setNewCat('');
              toast.success('Category added');
            }}>
            
                <label htmlFor="new-cat" className="sr-only">New category</label>
                <input id="new-cat" className={inputCls} placeholder="New category name" value={newCat} onChange={(e) => setNewCat(e.target.value)} />
                <Button type="submit" icon={Plus}>Add</Button>
              </form>
          }
          </Panel>

          <Panel title="Inventory units" description="Items can use any of these units — not everything is counted the same way.">
            <div className="flex flex-wrap gap-2">
              {store.settings.units.map((u) =>
            <span key={u} className="rounded-full bg-cream-2 px-3 py-1 text-[13px]">{u}</span>
            )}
            </div>
            {canEdit &&
          <form
            className="mt-3 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!newUnit.trim()) return;
              store.updateSettings({ units: [...store.settings.units, newUnit.trim()] }, `Added unit ${newUnit.trim()}`);
              setNewUnit('');
            }}>
            
                <label htmlFor="new-unit" className="sr-only">New unit</label>
                <input id="new-unit" className={inputCls} placeholder="e.g. tub (10 lb)" value={newUnit} onChange={(e) => setNewUnit(e.target.value)} />
                <Button type="submit" icon={Plus}>Add</Button>
              </form>
          }
          </Panel>
        </div>
      }

      {tab === 'notifications' &&
      <Panel title="Notification preferences" description="Choose how you hear about each kind of update.">
          <p className="mb-4 flex items-start gap-2 rounded-xl bg-info-50 px-4 py-3 text-[13px] text-info-700">
            <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            These are your preferences. Push delivery to phones requires the Diggy HQ mobile app with notifications allowed on the device, plus backend delivery setup — this prototype doesn’t send real push notifications.
          </p>
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-ink-3">
              <tr>
                <th className="py-2 font-medium">Update</th>
                <th className="py-2 text-center font-medium">In-app</th>
                <th className="py-2 text-center font-medium">Email</th>
                <th className="py-2 text-center font-medium">Push</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {(Object.keys(notificationMeta) as NotificationKind[]).map((k) =>
            <tr key={k}>
                  <td className="py-2.5">{notificationMeta[k].label}</td>
                  {(['inApp', 'email', 'push'] as Channel[]).map((ch) =>
              <td key={ch} className="py-2.5 text-center">
                      <input
                  type="checkbox"
                  aria-label={`${notificationMeta[k].label} via ${ch}`}
                  checked={prefs[k][ch]}
                  disabled={ch === 'inApp' && ['missing_report', 'trailer_conflict'].includes(k)}
                  onChange={() => setPrefs((p) => ({ ...p, [k]: { ...p[k], [ch]: !p[k][ch] } }))}
                  className="h-4 w-4 accent-berry-600" />
                
                    </td>
              )}
                </tr>
            )}
            </tbody>
          </table>
          <p className="mt-3 text-xs text-ink-3">Missing-report and conflict alerts always appear in-app.</p>
          <Button variant="primary" className="mt-4" onClick={() => toast.success('Preferences saved')}>
            Save preferences
          </Button>
        </Panel>
      }

      {tab === 'profile' &&
      <div className="grid gap-6 lg:grid-cols-2">
          <Panel title="Profile">
            <div className="mb-4 flex items-center gap-4">
              <Avatar name={store.user.name} size="lg" />
              <div>
                <p className="font-semibold">{store.user.name}</p>
                <p className="text-sm text-ink-3">{store.user.title}{store.role === 'franchise' ? ' · Johnson City' : ' · Diggy Corporate'}</p>
              </div>
            </div>
            <div className="space-y-4">
              <Field label="Full name" htmlFor="p-name">
                <input id="p-name" className={inputCls} defaultValue={store.user.name} />
              </Field>
              <Field label="Email" htmlFor="p-email">
                <input id="p-email" type="email" className={inputCls} defaultValue={store.user.email} />
              </Field>
              <Field label="Mobile phone" htmlFor="p-phone" hint="Used for urgent schedule changes.">
                <input id="p-phone" className={inputCls} defaultValue="(423) 555-0100" />
              </Field>
              <Button variant="primary" onClick={() => toast.success('Profile updated')}>Save profile</Button>
            </div>
          </Panel>
          <Panel title="Security">
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span>
                  <span className="block font-medium">Password</span>
                  <span className="block text-ink-3">Last changed 3 months ago</span>
                </span>
                <Button size="sm" onClick={() => toast.success('Password reset link sent')}>Change</Button>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-line pt-4">
                <span>
                  <span className="block font-medium">Active sessions</span>
                  <span className="block text-ink-3">This browser · iPhone app</span>
                </span>
                <Button size="sm" variant="ghost" onClick={() => toast.success('Signed out of other devices')}>Sign out others</Button>
              </div>
              <p className="border-t border-line pt-4 text-xs text-ink-3">Sessions expire after 12 hours of inactivity.</p>
            </div>
          </Panel>
        </div>
      }
    </Page>);

}