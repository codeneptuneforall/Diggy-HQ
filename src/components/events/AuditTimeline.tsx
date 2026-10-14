import React from 'react';
import { ArrowRight } from 'lucide-react';
import { fmtDateTime } from '../../utils/date';
import type { AuditEntry } from '../../types';

export function AuditTimeline({ entries, empty }: {entries: AuditEntry[];empty: string;}) {
  if (!entries.length) return <p className="text-sm text-ink-3">{empty}</p>;
  return (
    <ol className="relative space-y-4 border-l border-line pl-5">
      {entries.map((a) =>
      <li key={a.id} className="relative">
          <span className="absolute -left-[25px] top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-berry-400" aria-hidden />
          <p className="text-sm">
            <span className="font-medium">{a.action}</span> <span className="text-ink-3">by {a.user}</span>
          </p>
          <p className="text-xs text-ink-3">{fmtDateTime(a.at)}</p>
          {a.changes.length > 0 &&
        <ul className="mt-1.5 space-y-1">
              {a.changes.map((c, i) =>
          <li key={i} className="flex flex-wrap items-center gap-1.5 text-[13px]">
                  <span className="text-ink-2">{c.field}:</span>
                  <span className="rounded bg-bad-50 px-1.5 text-bad-700 line-through decoration-bad-600/40">{c.from}</span>
                  <ArrowRight className="h-3 w-3 text-ink-3" aria-hidden />
                  <span className="rounded bg-ok-50 px-1.5 text-ok-700">{c.to}</span>
                </li>
          )}
            </ul>
        }
          {a.reason && <p className="mt-1 text-[13px] italic text-ink-2">“{a.reason}”</p>}
        </li>
      )}
    </ol>);

}