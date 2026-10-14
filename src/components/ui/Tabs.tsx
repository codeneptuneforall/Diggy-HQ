import React from 'react';
import { cx } from '../../utils/format';

interface TabsProps<T extends string> {
  tabs: {id: T;label: string;count?: number;alert?: boolean;}[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}

export function Tabs<T extends string>({ tabs, value, onChange, className }: TabsProps<T>) {
  return (
    <div className={cx('flex gap-1 overflow-x-auto border-b border-line', className)} role="tablist">
      {tabs.map((t) => {
        const active = t.id === value;
        return (
          <button
            key={t.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.id)}
            className={cx(
              '-mb-px inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors duration-150',
              active ? 'border-berry-600 text-ink' : 'border-transparent text-ink-3 hover:text-ink'
            )}>
            
            {t.label}
            {t.count !== undefined &&
            <span className={cx('rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular', t.alert && t.count > 0 ? 'bg-bad-50 text-bad-700' : 'bg-cream-2 text-ink-2')}>
                {t.count}
              </span>
            }
          </button>);

      })}
    </div>);

}