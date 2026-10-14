import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Users } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { useScoped } from '../../hooks/useScoped';
import { Page } from '../../components/layout/Page';
import { PageHeader } from '../../components/ui/PageHeader';
import { FilterSelect } from '../../components/ui/FilterSelect';
import { StatusChip } from '../../components/ui/StatusChip';
import { Avatar } from '../../components/ui/Avatar';
import { EmptyState } from '../../components/ui/EmptyState';
import { TODAY, fmtDate } from '../../utils/date';
import { employeeStatusMeta } from '../../utils/status';

export function EmployeesPage() {
  const store = useStore();
  const scoped = useScoped();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');

  const rows = scoped.employees.filter((e) => (status === 'all' || e.status === status) && (!q || e.name.toLowerCase().includes(q.toLowerCase())));

  return (
    <Page>
      <PageHeader title="Employees" description="Crew contact details, availability and upcoming shifts. Payroll and HR live outside Diggy HQ." />
      <div className="mb-4 flex flex-wrap gap-2">
        <label className="relative">
          <span className="sr-only">Search employees</span>
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" aria-hidden />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name" className="h-9 w-56 rounded-lg border border-line-strong bg-white pl-8 pr-3 text-[13px] focus:border-berry-400 focus:outline-none focus:ring-2 focus:ring-berry-100" />
        </label>
        <FilterSelect label="Status" value={status} onChange={setStatus} options={[{ value: 'all', label: 'All statuses' }, { value: 'active', label: 'Active' }, { value: 'on_leave', label: 'On leave' }, { value: 'inactive', label: 'Inactive' }]} />
      </div>
      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
        {rows.length === 0 ?
        <EmptyState icon={Users} title="No employees match" /> :

        <table className="w-full text-sm">
            <thead className="border-b border-line bg-cream/60 text-left text-xs text-ink-3">
              <tr>
                <th className="px-4 py-2.5 font-medium">Name</th>
                {store.role === 'corporate' && <th className="px-4 py-2.5 font-medium">Franchise</th>}
                <th className="px-4 py-2.5 font-medium">Contact</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">Next shift</th>
                <th className="px-4 py-2.5 font-medium">Availability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((emp) => {
              const next = store.events.filter((e) => e.employeeIds.includes(emp.id) && e.date >= TODAY && e.status !== 'cancelled' && e.status !== 'completed').sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start))[0];
              return (
                <tr key={emp.id} className="transition-colors hover:bg-cream/50">
                    <td className="px-4 py-3">
                      <Link to={`/employees/${emp.id}`} className="flex items-center gap-3">
                        <Avatar name={emp.name} />
                        <span>
                          <span className="block font-medium hover:text-berry-700">{emp.name}</span>
                          <span className="block text-xs text-ink-3">{emp.role}</span>
                        </span>
                      </Link>
                    </td>
                    {store.role === 'corporate' && <td className="px-4 py-3 text-ink-2">{store.franchises.find((f) => f.id === emp.franchiseId)?.shortName}</td>}
                    <td className="px-4 py-3 text-ink-2">
                      <span className="block">{emp.phone}</span>
                      <span className="block text-xs text-ink-3">{emp.email}</span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusChip {...employeeStatusMeta[emp.status]} />
                    </td>
                    <td className="px-4 py-3">
                      {next ?
                    <Link to={`/events/${next.id}`} className="hover:text-berry-700">
                          <span className="block">{next.name}</span>
                          <span className="block text-xs text-ink-3">{fmtDate(next.date)}</span>
                        </Link> :

                    <span className="text-ink-3">—</span>
                    }
                    </td>
                    <td className="max-w-[220px] px-4 py-3 text-xs text-ink-2">{emp.availability}</td>
                  </tr>);

            })}
            </tbody>
          </table>
        }
      </div>
    </Page>);

}