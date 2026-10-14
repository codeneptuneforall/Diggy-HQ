import React from "react";
import { NavLink } from "react-router-dom";
import { BarChart3, Bell, CalendarClock, CalendarDays, ClipboardList, Contact, FileWarning, History, LayoutDashboard, ListChecks, Map, Package, Receipt, Settings, ShieldCheck, Store, Truck, Users, BoxIcon } from "lucide-react";
import { useStore } from "../../contexts/StoreContext";
import { useUI } from "../../contexts/UIContext";
import { useScoped } from "../../hooks/useScoped";
import { cx } from "../../utils/format";
export const LOGO_URL = "/image.png";
interface NavItem {
  to: string;
  label: string;
  icon: BoxIcon;
  count?: number;
  countTone?: 'bad' | 'neutral';
}
export function Sidebar() {
  const {
    role,
    notifications
  } = useStore();
  const {
    setNavOpen
  } = useUI();
  const {
    missing,
    lowStock,
    followUpsDue
  } = useScoped();
  const unread = notifications.filter((n) => !n.read).length;
  const groups: {
    label: string;
    items: NavItem[];
    hidden?: boolean;
  }[] = [{
    label: 'Overview',
    items: [{
      to: '/',
      label: 'Dashboard',
      icon: LayoutDashboard
    }]
  }, {
    label: 'Operations',
    items: [{
      to: '/calendar',
      label: 'Calendar',
      icon: CalendarDays
    }, {
      to: '/events',
      label: 'Events',
      icon: ClipboardList
    }, {
      to: '/trailers',
      label: 'Trailers',
      icon: Truck
    }, {
      to: '/employees',
      label: 'Employees',
      icon: Users
    }, {
      to: '/schedule',
      label: 'Schedule',
      icon: CalendarClock
    }]
  }, {
    label: 'Customers',
    items: [{
      to: '/customers',
      label: 'Customer CRM',
      icon: Contact
    }, {
      to: '/follow-ups',
      label: 'Follow-ups',
      icon: ListChecks,
      count: followUpsDue.length,
      countTone: 'neutral'
    }]
  }, {
    label: 'Business performance',
    items: [{
      to: '/sales-reports',
      label: 'Sales reports',
      icon: Receipt
    }, {
      to: '/missing-reports',
      label: 'Missing reports',
      icon: FileWarning,
      count: missing.length,
      countTone: 'bad'
    }, {
      to: '/inventory',
      label: 'Inventory',
      icon: Package,
      count: lowStock.length,
      countTone: 'bad'
    }, {
      to: '/reports',
      label: 'Reports & exports',
      icon: BarChart3
    }]
  }, {
    label: 'Corporate administration',
    hidden: role !== 'corporate',
    items: [{
      to: '/franchisees',
      label: 'Franchisees',
      icon: Store
    }, {
      to: '/territories',
      label: 'Territories',
      icon: Map
    }, {
      to: '/users',
      label: 'Users & permissions',
      icon: ShieldCheck
    }, {
      to: '/audit',
      label: 'Audit trail',
      icon: History
    }]
  }, {
    label: 'Workspace',
    items: [...(role === 'franchise' ? [{
      to: '/audit',
      label: 'Activity history',
      icon: History
    }] : []), {
      to: '/notifications',
      label: 'Notifications',
      icon: Bell,
      count: unread,
      countTone: 'neutral' as const
    }, {
      to: '/settings',
      label: 'Settings',
      icon: Settings
    }]
  }];
  return <nav className="flex h-full w-64 shrink-0 flex-col bg-plum text-plum-text" aria-label="Main">
      <div className="flex items-center gap-3 px-4 pb-4 pt-5">
        <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-white p-0.5">
          <img src={LOGO_URL} alt="Diggy Donuts" className="h-full w-full object-contain" />
        </div>
        <div className="leading-tight">
          <p className="font-display text-lg font-semibold text-white">Diggy HQ</p>
          <p className="text-[11px] text-plum-muted">Franchise operations</p>
        </div>
      </div>
      <div className="flex-1 space-y-5 overflow-y-auto px-3 pb-6">
        {groups.filter((g) => !g.hidden).map((g) => <div key={g.label}>
              <p className="px-2 pb-1.5 text-[11px] font-medium text-plum-muted">{g.label}</p>
              <ul className="space-y-0.5">
                {g.items.map((item) => <li key={item.to + item.label}>
                    <NavLink to={item.to} end={item.to === '/'} onClick={() => setNavOpen(false)} className={({
              isActive
            }) => cx('flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13.5px] font-medium transition-colors duration-150', isActive ? 'bg-plum-3 text-white' : 'text-plum-text hover:bg-plum-2 hover:text-white')}>
                      <item.icon className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                      <span className="flex-1 truncate">{item.label}</span>
                      {!!item.count && <span className={cx('rounded-full px-1.5 text-[11px] font-semibold tabular', item.countTone === 'bad' ? 'bg-berry-500 text-white' : 'bg-plum-3 text-white')}>
                          {item.count}
                        </span>}
                    </NavLink>
                  </li>)}
              </ul>
            </div>)}
      </div>
    </nav>;
}