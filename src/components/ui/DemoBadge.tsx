import React from 'react';
import { FlaskConical } from 'lucide-react';

export function DemoBadge({ label = 'Illustrative demo data' }: {label?: string;}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-dashed border-line-strong px-2 py-0.5 text-[11px] font-medium text-ink-3">
      <FlaskConical className="h-3 w-3" aria-hidden />
      {label}
    </span>);

}