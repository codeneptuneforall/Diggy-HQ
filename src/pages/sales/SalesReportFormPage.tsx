import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, LayoutDashboard, Package, Pencil, Receipt, Send } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { useUI } from '../../contexts/UIContext';
import { useScoped } from '../../hooks/useScoped';
import { Page } from '../../components/layout/Page';
import { PageHeader } from '../../components/ui/PageHeader';
import { Panel } from '../../components/ui/Panel';
import { Button } from '../../components/ui/Button';
import { Field, inputCls, inputErrorCls } from '../../components/ui/Field';
import { CalcPanel } from '../../components/sales/CalcPanel';
import { NOW_MIN, TODAY, fmtDate, fmtTimeRange, hoursBetween, toMin } from '../../utils/date';
import { findReport } from '../../utils/reports';
import { isCounted, reportTotal } from '../../utils/sales';
import { cx, fmtMoney, uid } from '../../utils/format';
import type { SalesReport } from '../../types';

type Step = 'form' | 'review' | 'done';
const num = (v: string) => v.trim() === '' ? NaN : Number(v);

export function SalesReportFormPage() {
  const store = useStore();
  const scoped = useScoped();
  const ui = useUI();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const existing = store.reports.find((r) => r.id === params.get('report'));
  const [eventId, setEventId] = useState(existing?.eventId ?? params.get('event') ?? '');
  const ev = store.events.find((e) => e.id === eventId);

  const eligible = useMemo(
    () =>
    scoped.events.
    filter((e) => e.status !== 'cancelled' && (e.date < TODAY || e.date === TODAY && toMin(e.start) <= NOW_MIN)).
    filter((e) => {
      const r = findReport(e.id, store.reports);
      return !r || !isCounted(r);
    }).
    sort((a, b) => b.date.localeCompare(a.date)),
    [scoped.events, store.reports]
  );

  const crewHours = ev ? hoursBetween(ev.start, ev.end) * ev.employeeIds.length : 0;
  const [f, setF] = useState({
    reportedBy: existing?.reportedBy ?? store.user.name,
    cash: existing ? String(existing.cash) : '',
    card: existing ? String(existing.card) : '',
    other: existing ? String(existing.other) : '0',
    posTotal: existing?.posTotal != null ? String(existing.posTotal) : '',
    operatingHours: existing ? String(existing.operatingHours) : ev ? String(hoursBetween(ev.start, ev.end)) : '',
    employeeHours: existing?.employeeHours ? String(existing.employeeHours) : ev ? String(crewHours) : '',
    batches: existing?.batches ? String(existing.batches) : '',
    notes: existing?.notes ?? ''
  });
  const [step, setStep] = useState<Step>('form');
  const [tried, setTried] = useState(false);
  const [saved, setSaved] = useState<SalesReport | null>(null);
  const set = (k: keyof typeof f, v: string) => setF((x) => ({ ...x, [k]: v }));

  const vals = {
    cash: num(f.cash),
    card: num(f.card),
    other: num(f.other || '0'),
    operatingHours: num(f.operatingHours),
    employeeHours: num(f.employeeHours),
    batches: num(f.batches),
    posTotal: f.posTotal.trim() === '' ? null : Number(f.posTotal)
  };
  const safe = (n: number) => Number.isFinite(n) && n >= 0 ? n : 0;
  const total = safe(vals.cash) + safe(vals.card) + safe(vals.other);

  const errors: Record<string, string | undefined> = {
    event: !ev ? 'Choose the event this report is for.' : undefined,
    cash: Number.isNaN(vals.cash) ? 'Enter cash sales (0 if none).' : vals.cash < 0 ? 'Can’t be negative.' : undefined,
    card: Number.isNaN(vals.card) ? 'Enter card sales (0 if none).' : vals.card < 0 ? 'Can’t be negative.' : undefined,
    other: vals.other < 0 ? 'Can’t be negative.' : undefined,
    operatingHours: Number.isNaN(vals.operatingHours) ? 'Enter hours the trailer was serving.' : vals.operatingHours < 0 || vals.operatingHours > 24 ? 'Enter between 0 and 24 hours.' : undefined,
    employeeHours: Number.isNaN(vals.employeeHours) ? 'Enter total crew hours.' : vals.employeeHours < 0 ? 'Can’t be negative.' : undefined,
    batches: Number.isNaN(vals.batches) ? 'Enter batches used (0 if none).' : vals.batches < 0 ? 'Can’t be negative.' : undefined,
    posTotal: vals.posTotal !== null && Math.abs(vals.posTotal - total) > 0.009 ? 'Breakdown doesn’t add up to the POS total.' : undefined
  };
  const hasErrors = Object.values(errors).some(Boolean);
  const err = (k: string) => tried ? errors[k] : undefined;

  const build = (): SalesReport => ({
    id: existing?.id ?? uid('sr'),
    eventId,
    franchiseId: ev?.franchiseId ?? '',
    trailerId: ev?.trailerId ?? null,
    reportedBy: f.reportedBy,
    date: ev?.date ?? TODAY,
    cash: safe(vals.cash),
    card: safe(vals.card),
    other: safe(vals.other),
    otherLabel: store.settings.otherPaymentLabel,
    posTotal: vals.posTotal,
    operatingHours: safe(vals.operatingHours),
    employeeHours: safe(vals.employeeHours),
    batches: safe(vals.batches),
    batchUnit: store.settings.batchUnit,
    notes: f.notes,
    status: 'draft',
    submittedAt: null,
    reviewedBy: null,
    reviewedAt: null,
    correctionNote: null,
    history: existing?.history ?? []
  });

  const saveDraft = () => {
    if (!ev) {
      setTried(true);
      return;
    }
    store.saveReport(build(), false);
    toast.success('Draft saved — it still needs to be submitted');
    navigate('/sales-reports?status=draft');
  };

  const toReview = () => {
    setTried(true);
    if (hasErrors) {
      toast.error('Fix the highlighted fields before submitting.');
      return;
    }
    setStep('review');
  };

  const submit = () => {
    const r = store.saveReport(build(), true);
    setSaved(r);
    setStep('done');
  };

  if (step === 'done' && saved) {
    return (
      <Page>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }} className="mx-auto max-w-lg py-12 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-ok-50 text-ok-600">
            <CheckCircle2 className="h-7 w-7" aria-hidden />
          </div>
          <h1 className="font-display text-2xl font-semibold">Report submitted</h1>
          <p className="mt-2 text-sm text-ink-2">
            {ev?.name} · {fmtMoney(reportTotal(saved), true)} in sales. It’s now waiting for review and counts toward dashboard totals.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button icon={Receipt} onClick={() => navigate(`/sales-reports/${saved.id}`)}>
              View report
            </Button>
            <Button icon={Package} onClick={() => ui.openStockForm({ type: 'used', eventId })}>
              Record inventory used
            </Button>
            <Button variant="primary" icon={LayoutDashboard} onClick={() => navigate('/')}>
              Back to dashboard
            </Button>
          </div>
        </motion.div>
      </Page>);

  }

  return (
    <Page>
      <PageHeader back={{ label: 'Sales reports', to: '/sales-reports' }} title={step === 'review' ? 'Review & submit' : existing ? 'Finish sales report' : 'New sales report'} description="Complete at the end of the event. Totals and per-hour/per-batch figures are calculated for you." />

      <AnimatePresence mode="wait" initial={false}>
        {step === 'form' ?
        <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="grid gap-6 lg:grid-cols-[1fr_380px]">
            <div className="space-y-6">
              <Panel title="Event">
                {existing ?
              <p className="text-sm font-medium">{ev?.name}</p> :

              <Field label="Which event is this for?" htmlFor="sr-ev" required error={err('event')}>
                    <select id="sr-ev" className={cx(inputCls, err('event') && inputErrorCls)} value={eventId} onChange={(e) => {
                  const next = store.events.find((x) => x.id === e.target.value);
                  setEventId(e.target.value);
                  if (next) setF((x) => ({ ...x, operatingHours: String(hoursBetween(next.start, next.end)), employeeHours: String(hoursBetween(next.start, next.end) * next.employeeIds.length) }));
                }}>
                      <option value="">Select event</option>
                      {eligible.map((e) =>
                  <option key={e.id} value={e.id}>
                          {fmtDate(e.date, 'MMM d')} · {e.name}
                        </option>
                  )}
                    </select>
                  </Field>
              }
                {ev &&
              <dl className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-cream/70 p-4 text-sm sm:grid-cols-4">
                    <Info label="Date" value={fmtDate(ev.date)} />
                    <Info label="Time" value={fmtTimeRange(ev.start, ev.end)} />
                    <Info label="Trailer" value={store.trailers.find((t) => t.id === ev.trailerId)?.name ?? '—'} />
                    <Info label="Franchise" value={store.franchises.find((x) => x.id === ev.franchiseId)?.shortName ?? '—'} />
                  </dl>
              }
                {ev &&
              <Field label="Reporting employee" htmlFor="sr-by" className="mt-4">
                    <select id="sr-by" className={inputCls} value={f.reportedBy} onChange={(e) => set('reportedBy', e.target.value)}>
                      {[store.user.name, ...ev.employeeIds.map((id) => store.employees.find((x) => x.id === id)?.name ?? '')].filter((v, i, a) => v && a.indexOf(v) === i).map((n) =>
                  <option key={n}>{n}</option>
                  )}
                    </select>
                  </Field>
              }
              </Panel>

              <Panel title="Sales by payment type">
                <div className="grid gap-4 sm:grid-cols-3">
                  <MoneyField id="sr-cash" label="Cash" value={f.cash} onChange={(v) => set('cash', v)} error={err('cash')} required />
                  <MoneyField id="sr-card" label="Credit / debit card" value={f.card} onChange={(v) => set('card', v)} error={err('card')} required />
                  <MoneyField id="sr-other" label={store.settings.otherPaymentLabel} value={f.other} onChange={(v) => set('other', v)} error={err('other')} />
                </div>
                <div className="mt-4 grid gap-4 border-t border-line pt-4 sm:grid-cols-[1fr_1fr]">
                  <MoneyField id="sr-pos" label="POS / register total (optional)" value={f.posTotal} onChange={(v) => set('posTotal', v)} error={err('posTotal') ?? (errors.posTotal && f.posTotal ? errors.posTotal : undefined)} hint="Used to cross-check the breakdown." />
                  <div className="flex flex-col justify-end">
                    <p className="text-[13px] font-medium text-ink-2">Total reported sales</p>
                    <p className="font-display text-2xl font-semibold tabular">{fmtMoney(total, true)}</p>
                  </div>
                </div>
              </Panel>

              <Panel title="Hours & batches">
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="Operating hours" htmlFor="sr-op" required error={err('operatingHours')} hint="Time the trailer was serving.">
                    <input id="sr-op" type="number" inputMode="decimal" step="0.25" min={0} className={cx(inputCls, err('operatingHours') && inputErrorCls)} value={f.operatingHours} onChange={(e) => set('operatingHours', e.target.value)} />
                  </Field>
                  <Field label="Employee hours" htmlFor="sr-emp" required error={err('employeeHours')} hint={ev ? `Scheduled: ${crewHours} crew hours` : 'Total across all crew.'}>
                    <input id="sr-emp" type="number" inputMode="decimal" step="0.25" min={0} className={cx(inputCls, err('employeeHours') && inputErrorCls)} value={f.employeeHours} onChange={(e) => set('employeeHours', e.target.value)} />
                  </Field>
                  <Field label="Batches used" htmlFor="sr-b" required error={err('batches')} hint={store.settings.batchUnit}>
                    <input id="sr-b" type="number" inputMode="decimal" step="0.5" min={0} className={cx(inputCls, err('batches') && inputErrorCls)} value={f.batches} onChange={(e) => set('batches', e.target.value)} />
                  </Field>
                </div>
                <Field label="Event notes" htmlFor="sr-notes" className="mt-4">
                  <textarea id="sr-notes" rows={3} className={inputCls} value={f.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Weather, sell-outs, anything unusual…" />
                </Field>
              </Panel>
            </div>

            <div className="lg:sticky lg:top-6 lg:self-start">
              <Panel title="Calculated">
                <CalcPanel cash={safe(vals.cash)} card={safe(vals.card)} other={safe(vals.other)} otherLabel={store.settings.otherPaymentLabel} operatingHours={safe(vals.operatingHours)} employeeHours={safe(vals.employeeHours)} batches={safe(vals.batches)} posTotal={vals.posTotal} />
                <div className="mt-5 flex flex-col gap-2">
                  <Button variant="primary" size="lg" iconRight={Send} onClick={toReview}>
                    Review & submit
                  </Button>
                  <Button onClick={saveDraft}>Save as draft</Button>
                </div>
                {tried && hasErrors && <p className="mt-3 text-center text-xs font-medium text-bad-700">Some fields need attention.</p>}
              </Panel>
            </div>
          </motion.div> :

        <motion.div key="review" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="mx-auto max-w-2xl">
            <Panel>
              <p className="text-sm text-ink-3">{ev?.name} · {ev && fmtDate(ev.date)}</p>
              <table className="mt-4 w-full text-sm">
                <tbody className="divide-y divide-line">
                  {[
                ['Cash', fmtMoney(safe(vals.cash), true)],
                ['Card', fmtMoney(safe(vals.card), true)],
                [store.settings.otherPaymentLabel, fmtMoney(safe(vals.other), true)],
                ['Total reported sales', fmtMoney(total, true)],
                ['Operating hours', String(safe(vals.operatingHours))],
                ['Employee hours', String(safe(vals.employeeHours))],
                [`Batches (${store.settings.batchUnit})`, String(safe(vals.batches))],
                ['Reported by', f.reportedBy]].
                map(([k, v]) =>
                <tr key={k}>
                      <td className="py-2 text-ink-2">{k}</td>
                      <td className={cx('py-2 text-right tabular', k === 'Total reported sales' && 'font-semibold')}>{v}</td>
                    </tr>
                )}
                </tbody>
              </table>
              <div className="mt-5 rounded-xl bg-cream/70 p-4">
                <CalcPanel cash={safe(vals.cash)} card={safe(vals.card)} other={safe(vals.other)} otherLabel={store.settings.otherPaymentLabel} operatingHours={safe(vals.operatingHours)} employeeHours={safe(vals.employeeHours)} batches={safe(vals.batches)} posTotal={vals.posTotal} />
              </div>
              <p className="mt-4 text-xs text-ink-3">After submitting, changes require a reason and are recorded in the audit trail.</p>
              <div className="mt-5 flex justify-end gap-2">
                <Button icon={Pencil} onClick={() => setStep('form')}>
                  Back to edit
                </Button>
                <Button variant="primary" icon={Send} onClick={submit}>
                  Submit report
                </Button>
              </div>
            </Panel>
          </motion.div>
        }
      </AnimatePresence>
      {!existing && eligible.length === 0 && step === 'form' &&
      <p className="mt-4 text-sm text-ink-3">
          Every finished event already has a report. <Link to="/sales-reports" className="font-medium text-berry-700 hover:underline">View reports</Link>
        </p>
      }
    </Page>);

}

function Info({ label, value }: {label: string;value: string;}) {
  return (
    <div>
      <dt className="text-xs text-ink-3">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>);

}

function MoneyField({ id, label, value, onChange, error, required, hint }: {id: string;label: string;value: string;onChange: (v: string) => void;error?: string;required?: boolean;hint?: string;}) {
  return (
    <Field label={label} htmlFor={id} required={required} error={error} hint={hint}>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-3">$</span>
        <input id={id} type="number" inputMode="decimal" step="0.01" min={0} className={cx(inputCls, 'pl-7 tabular', error && inputErrorCls)} value={value} onChange={(e) => onChange(e.target.value)} placeholder="0.00" />
      </div>
    </Field>);

}