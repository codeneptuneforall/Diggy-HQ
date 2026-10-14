import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { CalendarOff, Mail, Phone, UserPlus, UserX } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { useUI } from '../../contexts/UIContext';
import { Page } from '../../components/layout/Page';
import { PageHeader } from '../../components/ui/PageHeader';
import { Panel } from '../../components/ui/Panel';
import { Button } from '../../components/ui/Button';
import { StatusChip } from '../../components/ui/StatusChip';
import { Avatar } from '../../components/ui/Avatar';
import { EmptyState } from '../../components/ui/EmptyState';
import { TODAY, fmtDate, fmtTimeRange, hoursBetween } from '../../utils/date';
import { employeeStatusMeta, eventStatusMeta } from '../../utils/status';
import { fmtNum } from '../../utils/format';

export function EmployeeDetailPage() {
  const { id } = useParams();
  const store = useStore();
  const { openShiftForm } = useUI();
  const emp = store.employees.find((e) => e.id === id);
  if (!emp || !store.inScope(emp.franchiseId)) {
    return (
      <Page>
        <EmptyState icon={UserX} title="Employee not found" />
      </Page>);

  }
  const shifts = store.events.filter((e) => e.employeeIds.includes(emp.id) && e.status !== 'cancelled');
  const upcoming = shifts.filter((e) => e.date >= TODAY && e.status !== 'completed').sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
  const past = shifts.filter((e) => e.status === 'completed').sort((a, b) => b.date.localeCompare(a.date));
  const pastHours = past.reduce((s, e) => s + hoursBetween(e.start, e.end), 0);

  return (
    <Page>
      <PageHeader
        back={{ label: 'Employees', to: '/employees' }}
        title={
        <span className="flex items-center gap-3">
            <Avatar name={emp.name} size="lg" /> {emp.name}
          </span>
        }
        meta={<StatusChip {...employeeStatusMeta[emp.status]} />}
        description={`${emp.role} · ${store.franchises.find((f) => f.id === emp.franchiseId)?.shortName} · since ${fmtDate(emp.hireDate, 'MMM yyyy')}`}
        actions={
        emp.status === 'active' &&
        <Button variant="primary" icon={UserPlus} onClick={() => openShiftForm({ employeeId: emp.id })}>
              Assign shift
            </Button>

        } />
      
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Panel title="Upcoming shifts" description={`${upcoming.length} assigned`}>
            {upcoming.length === 0 ?
            <p className="text-sm text-ink-3">No upcoming shifts.</p> :

            <ul className="divide-y divide-line">
                {upcoming.map((e) =>
              <li key={e.id}>
                    <Link to={`/events/${e.id}`} className="grid grid-cols-[110px_1fr_auto] items-center gap-3 py-2.5 hover:text-berry-700">
                      <span className="text-sm font-medium">{fmtDate(e.date, 'EEE, MMM d')}</span>
                      <span>
                        <span className="block text-sm">{e.name}</span>
                        <span className="block text-xs text-ink-3">
                          {fmtTimeRange(e.start, e.end)} · {store.trailers.find((t) => t.id === e.trailerId)?.name ?? 'No trailer'}
                        </span>
                      </span>
                      <StatusChip {...eventStatusMeta[e.status]} />
                    </Link>
                  </li>
              )}
              </ul>
            }
          </Panel>
          <Panel title="Work history" description={`${past.length} completed shifts · ${fmtNum(pastHours, 1)} scheduled hours`}>
            {past.length === 0 ?
            <p className="text-sm text-ink-3">No completed shifts yet.</p> :

            <table className="w-full text-sm">
                <tbody className="divide-y divide-line">
                  {past.map((e) =>
                <tr key={e.id}>
                      <td className="py-2 text-ink-3">{fmtDate(e.date, 'MMM d')}</td>
                      <td className="py-2">
                        <Link to={`/events/${e.id}`} className="hover:text-berry-700">
                          {e.name}
                        </Link>
                      </td>
                      <td className="py-2 text-right tabular text-ink-2">{fmtNum(hoursBetween(e.start, e.end), 1)} h</td>
                    </tr>
                )}
                </tbody>
              </table>
            }
          </Panel>
        </div>
        <div className="space-y-6">
          <Panel title="Contact">
            <div className="space-y-2 text-sm">
              <a href={`tel:${emp.phone}`} className="flex items-center gap-2 hover:text-berry-700">
                <Phone className="h-4 w-4 text-ink-3" aria-hidden /> {emp.phone}
              </a>
              <a href={`mailto:${emp.email}`} className="flex items-center gap-2 hover:text-berry-700">
                <Mail className="h-4 w-4 text-ink-3" aria-hidden /> {emp.email}
              </a>
            </div>
            <p className="mt-4 text-xs text-ink-3">Report permissions</p>
            <p className="text-sm">{emp.canSubmitReports ? 'Can submit event sales reports' : 'Cannot submit sales reports'}</p>
          </Panel>
          <Panel title="Availability">
            <p className="text-sm">{emp.availability}</p>
            {emp.unavailable.length > 0 &&
            <ul className="mt-3 space-y-2">
                {emp.unavailable.map((u, i) =>
              <li key={i} className="hatch flex items-start gap-2 rounded-lg border border-line px-3 py-2 text-[13px]">
                    <CalendarOff className="mt-0.5 h-4 w-4 text-ink-3" aria-hidden />
                    <span>
                      <span className="block font-medium">{fmtDate(u.date)}</span>
                      <span className="block text-ink-2">
                        {u.start === '00:00' ? 'All day' : fmtTimeRange(u.start, u.end)} · {u.reason}
                      </span>
                    </span>
                  </li>
              )}
              </ul>
            }
          </Panel>
        </div>
      </div>
    </Page>);

}