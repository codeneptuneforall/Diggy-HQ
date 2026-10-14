import React, { useEffect, useState } from 'react';
import { CheckCircle2, Download, FileSpreadsheet, FileText, Loader2, ShieldCheck, XCircle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { cx } from '../../utils/format';
import type { Column, Row } from '../../utils/reportBuilders';

type Phase = 'choose' | 'running' | 'done' | 'failed';

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  columns: Column[];
  rows: Row[];
  scopeLabel: string;
  filterSummary: string;
  tooLarge: boolean;
}

export function ExportDialog({ open, onClose, title, columns, rows, scopeLabel, filterSummary, tooLarge }: ExportDialogProps) {
  const [format, setFormat] = useState<'csv' | 'xlsx'>('csv');
  const [phase, setPhase] = useState<Phase>('choose');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (open) {
      setPhase('choose');
      setProgress(0);
    }
  }, [open]);

  useEffect(() => {
    if (phase !== 'running') return;
    const t = setInterval(() => setProgress((p) => Math.min(100, p + 18)), 160);
    return () => clearInterval(t);
  }, [phase]);

  useEffect(() => {
    if (phase === 'running' && progress >= 100) {
      if (tooLarge) setPhase('failed');else
      {
        download();
        setPhase('done');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress, phase]);

  const download = () => {
    const esc = (v: unknown) => {
      const s = v === null || v === undefined ? '' : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv = [columns.map((c) => esc(c.label)).join(','), ...rows.map((r) => columns.map((c) => esc(r[c.key])).join(','))].join('\n');
    const blob = new Blob([format === 'xlsx' ? '\uFEFF' + csv : csv], { type: format === 'xlsx' ? 'application/vnd.ms-excel' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diggy-hq-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.${format === 'xlsx' ? 'xls' : 'csv'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Export “${title}”`}
      footer={
      phase === 'choose' ?
      <>
            <Button onClick={onClose}>Cancel</Button>
            <Button variant="primary" icon={Download} onClick={() => setPhase('running')} disabled={rows.length === 0}>
              Export {rows.length} rows
            </Button>
          </> :
      phase === 'failed' ?
      <>
            <Button onClick={onClose}>Close</Button>
            <Button variant="primary" onClick={() => {setProgress(0);setPhase('choose');}}>
              Change filters
            </Button>
          </> :

      <Button onClick={onClose} disabled={phase === 'running'}>
            {phase === 'done' ? 'Done' : 'Exporting…'}
          </Button>

      }>
      
      {phase === 'choose' &&
      <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {[
          { id: 'csv' as const, label: 'CSV', sub: 'Any spreadsheet tool', icon: FileText },
          { id: 'xlsx' as const, label: 'Excel', sub: 'Excel-compatible file', icon: FileSpreadsheet }].
          map((o) =>
          <button key={o.id} onClick={() => setFormat(o.id)} aria-pressed={format === o.id} className={cx('flex items-center gap-3 rounded-xl border px-3 py-3 text-left transition-colors', format === o.id ? 'border-berry-500 bg-berry-50' : 'border-line-strong hover:border-berry-200')}>
                <o.icon className="h-5 w-5 text-ink-3" aria-hidden />
                <span>
                  <span className="block text-sm font-medium">{o.label}</span>
                  <span className="block text-xs text-ink-3">{o.sub}</span>
                </span>
              </button>
          )}
          </div>
          <div className="rounded-xl bg-cream-2 px-4 py-3 text-[13px]">
            <p className="flex items-center gap-2 font-medium">
              <ShieldCheck className="h-4 w-4 text-ok-600" aria-hidden /> Includes only data you’re permitted to see
            </p>
            <p className="mt-1 text-ink-2">Scope: {scopeLabel}</p>
            <p className="text-ink-2">Filters: {filterSummary}</p>
          </div>
        </div>
      }
      {phase === 'running' &&
      <div className="py-4">
          <p className="flex items-center gap-2 text-sm font-medium">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Preparing {rows.length} rows…
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-cream-2" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full rounded-full bg-berry-600 transition-[width] duration-150" style={{ width: `${progress}%` }} />
          </div>
        </div>
      }
      {phase === 'done' &&
      <p className="flex items-center gap-2 py-4 text-sm font-medium text-ok-700">
          <CheckCircle2 className="h-5 w-5" aria-hidden /> Export ready — your download has started.
        </p>
      }
      {phase === 'failed' &&
      <div className="py-2 text-sm">
          <p className="flex items-center gap-2 font-medium text-bad-700">
            <XCircle className="h-5 w-5" aria-hidden /> Export failed
          </p>
          <p className="mt-1 text-ink-2">This export is too large to generate at once. Narrow the date range (90 days or less per export for audit history) and try again.</p>
        </div>
      }
    </Modal>);

}