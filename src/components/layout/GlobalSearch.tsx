import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Contact, Search, Truck, User } from 'lucide-react';
import { useScoped } from '../../hooks/useScoped';
import { useClickOutside } from '../../hooks/useClickOutside';
import { fmtDate } from '../../utils/date';

export function GlobalSearch() {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { events, customers, employees, trailers } = useScoped();
  useClickOutside(ref, () => setOpen(false), open);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (term.length < 2) return [];
    const r = [
    ...events.filter((e) => e.name.toLowerCase().includes(term) || e.venue.toLowerCase().includes(term)).map((e) => ({ id: e.id, icon: CalendarDays, label: e.name, sub: `Event · ${fmtDate(e.date)}`, to: `/events/${e.id}` })),
    ...customers.filter((c) => c.name.toLowerCase().includes(term) || c.contactName.toLowerCase().includes(term)).map((c) => ({ id: c.id, icon: Contact, label: c.name, sub: `Customer · ${c.contactName}`, to: `/customers/${c.id}` })),
    ...employees.filter((e) => e.name.toLowerCase().includes(term)).map((e) => ({ id: e.id, icon: User, label: e.name, sub: `Employee · ${e.role}`, to: `/employees/${e.id}` })),
    ...trailers.filter((t) => t.name.toLowerCase().includes(term) || t.code.toLowerCase().includes(term)).map((t) => ({ id: t.id, icon: Truck, label: t.name, sub: 'Trailer', to: `/trailers/${t.id}` }))];

    return r.slice(0, 8);
  }, [q, events, customers, employees, trailers]);

  return (
    <div ref={ref} className="relative w-full max-w-sm">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" aria-hidden />
      <input
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search events, customers, crew…"
        aria-label="Global search"
        className="h-9 w-full rounded-lg border border-line bg-cream/70 pl-9 pr-3 text-sm placeholder:text-ink-3 transition-colors focus:border-berry-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-berry-100" />
      
      {open && q.trim().length >= 2 &&
      <div className="absolute left-0 right-0 top-full z-40 mt-2 rounded-xl border border-line bg-white p-1.5 shadow-pop">
          {results.length === 0 ?
        <p className="px-3 py-4 text-center text-sm text-ink-3">No matches for “{q}”.</p> :

        <ul>
              {results.map((r) =>
          <li key={r.id}>
                  <button
              onClick={() => {
                navigate(r.to);
                setOpen(false);
                setQ('');
              }}
              className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-cream">
              
                    <r.icon className="h-4 w-4 text-ink-3" aria-hidden />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{r.label}</span>
                      <span className="block text-xs text-ink-3">{r.sub}</span>
                    </span>
                  </button>
                </li>
          )}
            </ul>
        }
        </div>
      }
    </div>);

}