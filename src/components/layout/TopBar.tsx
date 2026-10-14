import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, CalendarRange, Menu } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { useUI } from '../../contexts/UIContext';
import { RANGE_LABELS } from '../../utils/date';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';
import { GlobalSearch } from './GlobalSearch';
import { AccountMenu } from './AccountMenu';
import { FilterSelect } from '../ui/FilterSelect';
import type { DateRangeKey } from '../../types';

const RANGE_PAGES = ['/', '/reports', '/sales-reports'];

export function TopBar() {
  const { dateRange, setDateRange, notifications } = useStore();
  const { setNavOpen } = useUI();
  const { pathname } = useLocation();
  const unread = notifications.filter((n) => !n.read).length;
  const showRange = RANGE_PAGES.includes(pathname);

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-line bg-white px-4 lg:px-6">
      <button onClick={() => setNavOpen(true)} className="rounded-lg p-2 text-ink-2 hover:bg-cream-2 lg:hidden" aria-label="Open navigation">
        <Menu className="h-5 w-5" />
      </button>
      <WorkspaceSwitcher />
      {showRange &&
      <div className="hidden items-center gap-1.5 md:flex">
          <CalendarRange className="h-4 w-4 text-ink-3" aria-hidden />
          <FilterSelect
          label="Date range"
          value={dateRange}
          onChange={(v) => setDateRange(v as DateRangeKey)}
          options={(Object.keys(RANGE_LABELS) as DateRangeKey[]).map((k) => ({ value: k, label: RANGE_LABELS[k] }))} />
        
        </div>
      }
      <div className="ml-auto flex flex-1 items-center justify-end gap-2">
        <div className="hidden flex-1 justify-end md:flex">
          <GlobalSearch />
        </div>
        <Link to="/notifications" className="relative rounded-lg p-2 text-ink-2 transition-colors hover:bg-cream-2 hover:text-ink" aria-label={`Notifications, ${unread} unread`}>
          <Bell className="h-5 w-5" />
          {unread > 0 &&
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-berry-600 px-1 text-[10px] font-semibold text-white">{unread}</span>
          }
        </Link>
        <AccountMenu />
      </div>
    </header>);

}