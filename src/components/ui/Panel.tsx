import React from 'react';
import { cx } from '../../utils/format';

interface PanelProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
  as?: 'section' | 'div';
}

export function Panel({ title, description, action, className, bodyClassName, children, as: Tag = 'section' }: PanelProps) {
  return (
    <Tag className={cx('rounded-2xl border border-line bg-white shadow-card', className)}>
      {(title || action) &&
      <div className="flex items-start justify-between gap-3 px-5 pt-4">
          <div>
            {title && <h2 className="text-[15px] font-semibold text-ink">{title}</h2>}
            {description && <p className="mt-0.5 text-[13px] text-ink-3">{description}</p>}
          </div>
          {action}
        </div>
      }
      <div className={cx(title || action ? 'px-5 pb-5 pt-3' : 'p-5', bodyClassName)}>{children}</div>
    </Tag>);

}