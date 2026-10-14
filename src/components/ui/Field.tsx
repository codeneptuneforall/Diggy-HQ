import React from 'react';
import { AlertCircle } from 'lucide-react';
import { cx } from '../../utils/format';

export const inputCls =
'w-full rounded-lg border border-line-strong bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-3 transition-[border-color,box-shadow] duration-150 focus:border-berry-500 focus:outline-none focus:ring-2 focus:ring-berry-100 disabled:bg-cream-2 disabled:text-ink-3';

export const inputErrorCls = 'border-bad-500 focus:border-bad-500 focus:ring-bad-100';

interface FieldProps {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function Field({ label, htmlFor, hint, error, required, className, children }: FieldProps) {
  return (
    <div className={cx('flex flex-col gap-1.5', className)}>
      <label htmlFor={htmlFor} className="text-[13px] font-medium text-ink-2">
        {label}
        {required && <span className="ml-0.5 text-bad-600" aria-hidden>*</span>}
      </label>
      {children}
      {error ?
      <p className="flex items-center gap-1 text-xs font-medium text-bad-700" role="alert">
          <AlertCircle className="h-3.5 w-3.5" aria-hidden />
          {error}
        </p> :

      hint && <p className="text-xs text-ink-3">{hint}</p>
      }
    </div>);

}