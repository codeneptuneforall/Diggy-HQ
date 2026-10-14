import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cx } from '../../utils/format';

interface FilterSelectProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: {value: string;label: string;}[];
  className?: string;
}

export function FilterSelect({ label, value, onChange, options, className }: FilterSelectProps) {
  const active = value !== 'all' && value !== '';
  return (
    <label className={cx('relative inline-flex items-center', className)}>
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cx(
          'h-9 appearance-none rounded-lg border bg-white py-1 pl-3 pr-8 text-[13px] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-berry-100',
          active ? 'border-berry-400 text-berry-800' : 'border-line-strong text-ink-2'
        )}>
        
        {options.map((o) =>
        <option key={o.value} value={o.value}>
            {o.label}
          </option>
        )}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 h-4 w-4 text-ink-3" aria-hidden />
    </label>);

}