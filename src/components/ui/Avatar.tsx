import React from 'react';
import { cx, initials } from '../../utils/format';

const palette = ['bg-berry-100 text-berry-800', 'bg-info-100 text-info-700', 'bg-ok-100 text-ok-700', 'bg-warn-100 text-warn-700', 'bg-cream-3 text-ink-2'];

export function Avatar({ name, size = 'md', className }: {name: string;size?: 'sm' | 'md' | 'lg';className?: string;}) {
  const idx = name.split('').reduce((s, c) => s + c.charCodeAt(0), 0) % palette.length;
  const sz = size === 'sm' ? 'h-6 w-6 text-[10px]' : size === 'lg' ? 'h-12 w-12 text-base' : 'h-8 w-8 text-xs';
  return (
    <span className={cx('inline-flex shrink-0 items-center justify-center rounded-full font-semibold ring-2 ring-white', palette[idx], sz, className)} aria-hidden>
      {initials(name)}
    </span>);

}