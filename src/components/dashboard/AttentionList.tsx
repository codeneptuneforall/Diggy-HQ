import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, CheckCircle2, BoxIcon } from "lucide-react";
import { cx } from "../../utils/format";
export interface AttentionItem {
  label: string;
  detail: string;
  count: number;
  to: string;
  icon: BoxIcon;
  tone: 'bad' | 'warn' | 'info';
}
export function AttentionList({
  items,
  title = 'Needs attention'



}: {items: AttentionItem[];title?: string;}) {
  const open = items.filter((i) => i.count > 0);
  return <section className="rounded-2xl border border-line bg-white shadow-card">
      <div className="flex items-center justify-between px-5 pt-4">
        <h2 className="text-[15px] font-semibold">{title}</h2>
        <span className="text-xs text-ink-3">{open.length ? `${open.reduce((s, i) => s + i.count, 0)} open items` : 'All clear'}</span>
      </div>
      {open.length === 0 ? <p className="flex items-center gap-2 px-5 py-6 text-sm text-ok-700">
          <CheckCircle2 className="h-4 w-4" aria-hidden /> Nothing needs attention right now.
        </p> : <ul className="mt-2 divide-y divide-line">
          {open.map((i) => <li key={i.label}>
              <Link to={i.to} className="group flex items-center gap-3 px-5 py-3 transition-colors hover:bg-cream/70">
                <span className={cx('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', i.tone === 'bad' ? 'bg-bad-50 text-bad-600' : i.tone === 'warn' ? 'bg-warn-50 text-warn-600' : 'bg-info-50 text-info-600')}>
                  <i.icon className="h-4 w-4" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-ink">{i.label}</span>
                  <span className="block truncate text-xs text-ink-3">{i.detail}</span>
                </span>
                <span className="font-display text-xl font-semibold tabular text-ink">{i.count}</span>
                <ChevronRight className="h-4 w-4 text-ink-3 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden />
              </Link>
            </li>)}
        </ul>}
    </section>;
}