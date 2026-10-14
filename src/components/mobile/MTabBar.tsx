import React from 'react';
import { Bell, CalendarDays, ClipboardList, Home, Receipt, User } from 'lucide-react';
import { useMobile, type MScreen } from '../../contexts/MobileContext';
import { useStore } from '../../contexts/StoreContext';
import { cx } from '../../utils/format';

export function MTabBar() {
  const { persona, screen, reset } = useMobile();
  const { notifications } = useStore();
  const unread = notifications.filter((n) => !n.read && n.franchiseId === 'f-jc').length;

  const tabs: {label: string;icon: typeof Home;target: MScreen;match: string[];}[] =
  persona === 'employee' ?
  [
  { label: 'Home', icon: Home, target: { name: 'home' }, match: ['home', 'event', 'location', 'report', 'review', 'result', 'inventory', 'usage', 'lowstock'] },
  { label: 'Schedule', icon: CalendarDays, target: { name: 'schedule' }, match: ['schedule'] },
  { label: 'Alerts', icon: Bell, target: { name: 'notifications' }, match: ['notifications', 'notification'] },
  { label: 'Profile', icon: User, target: { name: 'profile' }, match: ['profile', 'settings'] }] :

  [
  { label: 'Home', icon: Home, target: { name: 'home' }, match: ['home', 'trailers', 'followups', 'inventory', 'lowstock', 'usage', 'createEvent'] },
  { label: 'Events', icon: ClipboardList, target: { name: 'events' }, match: ['events', 'event', 'location', 'report', 'review', 'result'] },
  { label: 'Reports', icon: Receipt, target: { name: 'reviewReports' }, match: ['reviewReports'] },
  { label: 'Alerts', icon: Bell, target: { name: 'notifications' }, match: ['notifications', 'notification'] },
  { label: 'Profile', icon: User, target: { name: 'profile' }, match: ['profile', 'settings'] }];


  return (
    <nav className="shrink-0 border-t border-line bg-white/95 pb-5 pt-1.5" aria-label="App">
      <ul className="flex">
        {tabs.map((t) => {
          const active = t.match.includes(screen.name);
          return (
            <li key={t.label} className="flex-1">
              <button onClick={() => reset(t.target)} className={cx('relative flex w-full flex-col items-center gap-0.5 py-1 text-[11px] font-medium', active ? 'text-berry-700' : 'text-ink-3')} aria-current={active ? 'page' : undefined}>
                <t.icon className="h-6 w-6" strokeWidth={active ? 2.25 : 1.75} aria-hidden />
                {t.label}
                {t.label === 'Alerts' && unread > 0 && <span className="absolute right-[calc(50%-18px)] top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-berry-600 px-1 text-[10px] text-white">{unread}</span>}
              </button>
            </li>);

        })}
      </ul>
    </nav>);

}