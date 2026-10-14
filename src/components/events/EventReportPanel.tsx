import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BellRing, ClipboardEdit, Receipt } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { Panel } from '../ui/Panel';
import { Button } from '../ui/Button';
import { StatusChip } from '../ui/StatusChip';
import { eventEnded, findReport, reportDue } from '../../utils/reports';
import { fmtMetric, isCounted, perBatch, perHour, reportTotal } from '../../utils/sales';
import { reportStatusMeta } from '../../utils/status';
import { fmtDateTime } from '../../utils/date';
import { fmtMoney } from '../../utils/format';
import type { DiggyEvent } from '../../types';

export function EventReportPanel({ event }: {event: DiggyEvent;}) {
  const store = useStore();
  const navigate = useNavigate();
  const report = findReport(event.id, store.reports);
  const ended = eventEnded(event);
  const due = reportDue(event, store.settings.reportDueHours);
  const responsible = store.employees.find((e) => event.employeeIds.includes(e.id) && e.canSubmitReports) ?? store.employees.find((e) => event.employeeIds.includes(e.id));
  const reminders = store.reminders.filter((r) => r.eventId === event.id);

  if (event.status === 'cancelled') {
    return (
      <Panel title="Sales report">
        <p className="text-sm text-ink-3">No report needed — event was cancelled.</p>
      </Panel>);

  }

  if (report && isCounted(report)) {
    return (
      <Panel
        title="Sales report"
        action={<StatusChip {...reportStatusMeta[report.status]} />}
        description={`Submitted by ${report.reportedBy}${report.submittedAt ? ` · ${fmtDateTime(report.submittedAt)}` : ''}`}>
        
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          <Fig label="Total sales" value={fmtMoney(reportTotal(report), true)} strong />
          <Fig label="Cash" value={fmtMoney(report.cash, true)} />
          <Fig label="Card" value={fmtMoney(report.card, true)} />
          <Fig label="Per hour" value={fmtMetric(perHour(report))} />
          <Fig label="Per batch" value={fmtMetric(perBatch(report))} />
        </div>
        <Button size="sm" className="mt-4" icon={Receipt} onClick={() => navigate(`/sales-reports/${report.id}`)}>
          Open report
        </Button>
      </Panel>);

  }

  if (!ended) {
    return (
      <Panel title="Sales report">
        <p className="text-sm text-ink-2">
          Due {store.settings.reportDueHours} hours after the event ends.{responsible && ` ${responsible.name} is responsible for submitting it.`}
        </p>
        {event.status === 'in_progress' &&
        <Button size="sm" variant="subtle" className="mt-3" icon={ClipboardEdit} onClick={() => navigate(`/sales-reports/new?event=${event.id}`)}>
            Start report
          </Button>
        }
      </Panel>);

  }

  return (
    <section className="rounded-2xl border border-bad-100 bg-bad-50/60 p-5" aria-label="Sales report">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-semibold">Sales report {report ? 'not submitted (draft saved)' : 'missing'}</h2>
          <p className="mt-0.5 text-sm text-ink-2">
            <span className={due.overdue ? 'font-semibold text-bad-700' : 'font-semibold text-warn-700'}>{due.label}</span>
            {responsible && ` · Responsible: ${responsible.name}`}
            {reminders.length > 0 && ` · ${reminders.length} reminder${reminders.length > 1 ? 's' : ''} sent`}
          </p>
        </div>
        <div className="flex gap-2">
          {responsible &&
          <Button size="sm" icon={BellRing} onClick={() => store.sendReminder(event.id, responsible.name)}>
              Send reminder
            </Button>
          }
          <Button size="sm" variant="primary" icon={ClipboardEdit} onClick={() => navigate(report ? `/sales-reports/new?report=${report.id}` : `/sales-reports/new?event=${event.id}`)}>
            {report ? 'Finish report' : 'Enter report'}
          </Button>
        </div>
      </div>
    </section>);

}

function Fig({ label, value, strong }: {label: string;value: string;strong?: boolean;}) {
  return (
    <div>
      <p className="text-xs text-ink-3">{label}</p>
      <p className={strong ? 'font-display text-xl font-semibold tabular' : 'text-sm font-medium tabular'}>{value}</p>
    </div>);

}