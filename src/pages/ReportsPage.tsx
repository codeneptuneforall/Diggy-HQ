import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Download, Search, SearchX } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { useScoped } from '../hooks/useScoped';
import { Page } from '../components/layout/Page';
import { Button } from '../components/ui/Button';
import { FilterSelect } from '../components/ui/FilterSelect';
import { EmptyState } from '../components/ui/EmptyState';
import { DemoBadge } from '../components/ui/DemoBadge';
import { ExportDialog } from '../components/reports/ExportDialog';
import { REPORT_CATALOG, buildReport, type Column, type ReportType } from '../utils/reportBuilders';
import { RANGE_LABELS } from '../utils/date';
import { cx, fmtMoney, fmtNum, pct } from '../utils/format';

const PAGE = 10;

export function ReportsPage() {
  const store = useStore();
  const scoped = useScoped();
  const [params] = useSearchParams();
  const [type, setType] = useState<ReportType>(params.get('type') as ReportType ?? 'sales-by-event');
  const [franchise, setFranchise] = useState(params.get('franchise') ?? 'all');
  const [territory, setTerritory] = useState('all');
  const [trailer, setTrailer] = useState('all');
  const [category, setCategory] = useState('all');
  const [employee, setEmployee] = useState('all');
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<{key: string;dir: 1 | -1;} | null>(null);
  const [page, setPage] = useState(0);
  const [exportOpen, setExportOpen] = useState(false);
  const isNetwork = store.role === 'corporate' && store.workspace === 'network';

  const catalog = REPORT_CATALOG.map((g) => ({ ...g, items: g.items.filter((i) => !i.corporateOnly || isNetwork) })).filter((g) => g.items.length);
  const label = REPORT_CATALOG.flatMap((g) => g.items).find((i) => i.id === type)?.label ?? '';

  const { columns, rows } = useMemo(
    () =>
    buildReport(type, {
      events: scoped.events,
      reports: scoped.reports,
      customers: scoped.customers,
      items: scoped.items,
      movements: store.movements,
      variances: scoped.variances,
      audit: scoped.audit,
      trailers: store.trailers,
      employees: scoped.employees,
      franchises: store.franchises,
      territories: store.territories,
      dueHours: store.settings.reportDueHours,
      filters: { range: store.dateRange, franchise, territory, trailer, category, employee }
    }),
    [type, scoped, store.movements, store.trailers, store.franchises, store.territories, store.settings.reportDueHours, store.dateRange, franchise, territory, trailer, category, employee]
  );

  const filtered = rows.
  filter((r) => !q || Object.values(r).some((v) => String(v ?? '').toLowerCase().includes(q.toLowerCase()))).
  sort((a, b) => {
    if (!sort) return 0;
    const av = a[sort.key];
    const bv = b[sort.key];
    if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * sort.dir;
    return String(av ?? '').localeCompare(String(bv ?? '')) * sort.dir;
  });
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const visible = filtered.slice(page * PAGE, page * PAGE + PAGE);

  const totals = columns.filter((c) => c.kind === 'money').map((c) => ({ key: c.key, sum: filtered.reduce((s, r) => s + (Number(r[c.key]) || 0), 0) }));
  const noTotals = ['sales-per-hour', 'sales-per-batch', 'sales-by-franchise', 'sales-by-territory', 'sales-by-trailer'].includes(type);

  const scopeLabel = store.role === 'franchise' ? 'Diggy Donuts — Johnson City only' : isNetwork ? 'All franchises (corporate)' : `${store.franchises.find((f) => f.id === store.workspace)?.shortName} only`;
  const filterSummary = [RANGE_LABELS[store.dateRange], franchise !== 'all' && store.franchises.find((f) => f.id === franchise)?.shortName, territory !== 'all' && store.territories.find((t) => t.id === territory)?.name, trailer !== 'all' && store.trailers.find((t) => t.id === trailer)?.code, category !== 'all' && category, employee !== 'all' && store.employees.find((e) => e.id === employee)?.name, q && `“${q}”`].filter(Boolean).join(' · ');

  const reset = () => setPage(0);

  return (
    <Page wide>
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <nav aria-label="Report types" className="space-y-5">
          <h1 className="font-display text-[28px] font-semibold">Reports</h1>
          {catalog.map((g) =>
          <div key={g.group}>
              <p className="mb-1 px-2 text-xs font-medium text-ink-3">{g.group}</p>
              <ul className="space-y-0.5">
                {g.items.map((i) =>
              <li key={i.id}>
                    <button
                  onClick={() => {
                    setType(i.id);
                    setSort(null);
                    reset();
                  }}
                  aria-current={type === i.id}
                  className={cx('w-full rounded-lg px-2 py-1.5 text-left text-[13.5px] transition-colors', type === i.id ? 'bg-white font-semibold text-ink shadow-card' : 'text-ink-2 hover:bg-cream-2')}>
                  
                      {i.label}
                    </button>
                  </li>
              )}
              </ul>
            </div>
          )}
        </nav>

        <section className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-semibold">{label}</h2>
              <p className="text-sm text-ink-3">
                {RANGE_LABELS[store.dateRange]} · {scopeLabel}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <DemoBadge />
              <Button variant="primary" icon={Download} onClick={() => setExportOpen(true)}>
                Export
              </Button>
            </div>
          </div>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <label className="relative">
              <span className="sr-only">Search rows</span>
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" aria-hidden />
              <input value={q} onChange={(e) => {setQ(e.target.value);reset();}} placeholder="Search rows" className="h-9 w-48 rounded-lg border border-line-strong bg-white pl-8 pr-3 text-[13px] focus:border-berry-400 focus:outline-none focus:ring-2 focus:ring-berry-100" />
            </label>
            {isNetwork && <FilterSelect label="Franchise" value={franchise} onChange={(v) => {setFranchise(v);reset();}} options={[{ value: 'all', label: 'All franchises' }, ...store.franchises.map((f) => ({ value: f.id, label: f.shortName }))]} />}
            <FilterSelect label="Territory" value={territory} onChange={(v) => {setTerritory(v);reset();}} options={[{ value: 'all', label: 'All territories' }, ...scoped.territories.filter((t) => t.franchiseId).map((t) => ({ value: t.id, label: t.name }))]} />
            <FilterSelect label="Trailer" value={trailer} onChange={(v) => {setTrailer(v);reset();}} options={[{ value: 'all', label: 'All trailers' }, ...scoped.trailers.map((t) => ({ value: t.id, label: t.code }))]} />
            <FilterSelect label="Category" value={category} onChange={(v) => {setCategory(v);reset();}} options={[{ value: 'all', label: 'All categories' }, ...store.settings.categories.map((c) => ({ value: c.id, label: c.label }))]} />
            <FilterSelect label="Employee" value={employee} onChange={(v) => {setEmployee(v);reset();}} options={[{ value: 'all', label: 'All employees' }, ...scoped.employees.map((e) => ({ value: e.id, label: e.name }))]} />
          </div>

          <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
            {filtered.length === 0 ?
            <EmptyState icon={SearchX} title="No data for selected filters" body="Try a wider date range from the header, or clear some filters." /> :

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-line bg-cream/60 text-xs text-ink-3">
                    <tr>
                      {columns.map((c) =>
                    <th key={c.key} className={cx('px-4 py-2.5 font-medium', isNumeric(c) ? 'text-right' : 'text-left')} aria-sort={sort?.key === c.key ? sort.dir === 1 ? 'ascending' : 'descending' : 'none'}>
                          <button onClick={() => setSort((s) => s?.key === c.key ? { key: c.key, dir: s.dir === 1 ? -1 : 1 } : { key: c.key, dir: -1 })} className="inline-flex items-center gap-1 hover:text-ink">
                            {c.label}
                            {sort?.key === c.key && (sort.dir === 1 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                          </button>
                        </th>
                    )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {visible.map((r, i) =>
                  <tr key={i} className="hover:bg-cream/40">
                        {columns.map((c) =>
                    <td key={c.key} className={cx('px-4 py-2.5', isNumeric(c) ? 'text-right tabular' : '')}>
                            {formatCell(c, r[c.key])}
                          </td>
                    )}
                      </tr>
                  )}
                  </tbody>
                  {!noTotals && totals.length > 0 &&
                <tfoot className="border-t-2 border-line-strong bg-cream/40 font-semibold">
                      <tr>
                        {columns.map((c, i) =>
                    <td key={c.key} className={cx('px-4 py-2.5', isNumeric(c) ? 'text-right tabular' : '')}>
                            {i === 0 ? 'Total' : c.kind === 'money' ? fmtMoney(totals.find((t) => t.key === c.key)?.sum ?? 0, true) : ''}
                          </td>
                    )}
                      </tr>
                    </tfoot>
                }
                </table>
              </div>
            }
          </div>
          {filtered.length > 0 &&
          <div className="mt-3 flex items-center justify-between text-[13px] text-ink-2">
              <span>
                {page * PAGE + 1}–{Math.min(filtered.length, (page + 1) * PAGE)} of {filtered.length} rows
              </span>
              <span className="flex items-center gap-1">
                <button disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="rounded-lg p-1.5 hover:bg-cream-2 disabled:opacity-40" aria-label="Previous page">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                Page {page + 1} of {pages}
                <button disabled={page >= pages - 1} onClick={() => setPage((p) => p + 1)} className="rounded-lg p-1.5 hover:bg-cream-2 disabled:opacity-40" aria-label="Next page">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </span>
            </div>
          }
        </section>
      </div>
      <ExportDialog open={exportOpen} onClose={() => setExportOpen(false)} title={label} columns={columns} rows={filtered} scopeLabel={scopeLabel} filterSummary={filterSummary || 'None'} tooLarge={type === 'audit-history' && store.dateRange === 'last90'} />
    </Page>);

}

const isNumeric = (c: Column) => c.kind === 'money' || c.kind === 'num' || c.kind === 'pct';

function formatCell(c: Column, v: string | number | null) {
  if (v === null || v === undefined) return <span className="text-ink-3">N/A</span>;
  if (c.kind === 'money') return fmtMoney(Number(v), true);
  if (c.kind === 'pct') return pct(Number(v));
  if (c.kind === 'num') return fmtNum(Number(v), 1);
  return String(v);
}