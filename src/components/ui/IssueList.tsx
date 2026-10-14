import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, OctagonAlert } from 'lucide-react';
import { cx } from '../../utils/format';
import type { EventIssue } from '../../utils/conflicts';

interface IssueListProps {
  issues: EventIssue[];
  action?: React.ReactNode;
  compact?: boolean;
}

export function IssueList({ issues, action, compact }: IssueListProps) {
  if (!issues.length) return null;
  const conflicts = issues.filter((i) => i.severity === 'conflict');
  const tone = conflicts.length ? 'bad' : 'warn';
  return (
    <div className={cx('rounded-xl border', tone === 'bad' ? 'border-bad-100 bg-bad-50' : 'border-warn-100 bg-warn-50')} role="alert">
      <div className={cx('flex items-center justify-between gap-3 px-4', compact ? 'py-2.5' : 'py-3')}>
        <p className={cx('flex items-center gap-2 text-sm font-semibold', tone === 'bad' ? 'text-bad-700' : 'text-warn-700')}>
          {tone === 'bad' ? <OctagonAlert className="h-4 w-4" aria-hidden /> : <AlertTriangle className="h-4 w-4" aria-hidden />}
          {conflicts.length ?
          `${conflicts.length} scheduling ${conflicts.length === 1 ? 'conflict' : 'conflicts'} must be resolved` :
          `${issues.length} ${issues.length === 1 ? 'item needs' : 'items need'} attention`}
        </p>
        {action}
      </div>
      <ul className="space-y-1.5 border-t border-black/5 px-4 py-3">
        {issues.map((i, idx) =>
        <li key={idx} className="flex gap-2 text-[13px]">
            <span className={cx('mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full', i.severity === 'conflict' ? 'bg-bad-600' : 'bg-warn-600')} aria-hidden />
            <span className="text-ink">
              <span className="font-medium">{i.title}.</span> <span className="text-ink-2">{i.message}</span>{' '}
              {i.relatedEventId &&
            <Link to={`/events/${i.relatedEventId}`} className="font-medium text-berry-700 underline-offset-2 hover:underline">
                  View event
                </Link>
            }
            </span>
          </li>
        )}
      </ul>
    </div>);

}