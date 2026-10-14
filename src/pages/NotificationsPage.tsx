import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BellOff, CheckCheck, Settings2 } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { Page } from '../components/layout/Page';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Tabs } from '../components/ui/Tabs';
import { EmptyState } from '../components/ui/EmptyState';
import { FilterSelect } from '../components/ui/FilterSelect';
import { notificationMeta } from '../components/notifications/notificationMeta';
import { fmtDateTime, relTime } from '../utils/date';
import { cx } from '../utils/format';
import type { NotificationKind } from '../types';

export function NotificationsPage() {
  const store = useStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'all' | 'unread'>('all');
  const [kind, setKind] = useState('all');
  const list = store.notifications.filter((n) => (tab === 'all' || !n.read) && (kind === 'all' || n.kind === kind)).sort((a, b) => b.at.localeCompare(a.at));
  const unread = store.notifications.filter((n) => !n.read).length;

  return (
    <Page className="max-w-4xl">
      <PageHeader
        title="Notifications"
        description="Operational updates that need your attention."
        actions={
        <>
            <Button icon={Settings2} onClick={() => navigate('/settings?tab=notifications')}>
              Preferences
            </Button>
            <Button icon={CheckCheck} onClick={store.markAllRead} disabled={!unread}>
              Mark all read
            </Button>
          </>
        } />
      
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <Tabs value={tab} onChange={setTab} tabs={[{ id: 'all', label: 'All', count: store.notifications.length }, { id: 'unread', label: 'Unread', count: unread }]} />
        <FilterSelect label="Type" value={kind} onChange={setKind} options={[{ value: 'all', label: 'All types' }, ...(Object.keys(notificationMeta) as NotificationKind[]).map((k) => ({ value: k, label: notificationMeta[k].label }))]} />
      </div>
      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
        {list.length === 0 ?
        <EmptyState icon={BellOff} title={tab === 'unread' ? 'You’re all caught up' : 'No notifications'} body="New alerts about events, reports and inventory will appear here." /> :

        <ul className="divide-y divide-line">
            {list.map((n) => {
            const meta = notificationMeta[n.kind];
            return (
              <li key={n.id} className={cx('flex items-start gap-4 px-5 py-4 transition-colors', !n.read && 'bg-berry-50/40')}>
                  <span className={cx('mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', meta.tone)}>
                    <meta.icon className="h-4 w-4" aria-hidden />
                  </span>
                  <Link
                  to={n.link}
                  onClick={() => store.markRead(n.id)}
                  className="min-w-0 flex-1">
                  
                    <p className="flex items-center gap-2 text-sm">
                      {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-berry-600" aria-label="Unread" />}
                      <span className={cx(n.read ? 'font-medium text-ink-2' : 'font-semibold text-ink')}>{n.title}</span>
                    </p>
                    <p className="mt-0.5 text-sm text-ink-2">{n.body}</p>
                    <p className="mt-1 text-xs text-ink-3" title={fmtDateTime(n.at)}>
                      {meta.label} · {relTime(n.at)}
                      {store.role === 'corporate' && n.franchiseId && ` · ${store.franchises.find((f) => f.id === n.franchiseId)?.shortName}`}
                    </p>
                  </Link>
                  <button onClick={() => store.markRead(n.id, !n.read)} className="whitespace-nowrap rounded-lg px-2 py-1 text-xs font-medium text-ink-3 transition-colors hover:bg-cream-2 hover:text-ink">
                    Mark {n.read ? 'unread' : 'read'}
                  </button>
                </li>);

          })}
          </ul>
        }
      </div>
    </Page>);

}