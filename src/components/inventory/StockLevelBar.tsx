import React from 'react';
import { cx } from '../../utils/format';

/** Horizontal fill showing on-hand vs target with a reorder marker. */
export function StockLevelBar({ balance, reorder, target }: {balance: number;reorder: number;target: number | null;}) {
  const max = Math.max(target ?? reorder * 3, balance, 1);
  const low = balance <= reorder;
  return (
    <div className="relative h-1.5 w-28 rounded-full bg-cream-2" aria-hidden>
      <div className={cx('h-full rounded-full', low ? 'bg-bad-500' : 'bg-ok-500')} style={{ width: `${Math.min(100, balance / max * 100)}%` }} />
      <div className="absolute -top-0.5 h-2.5 w-0.5 rounded bg-ink-2" style={{ left: `${reorder / max * 100}%` }} />
    </div>);

}