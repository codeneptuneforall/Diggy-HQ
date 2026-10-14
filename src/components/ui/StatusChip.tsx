import React from "react";
import { Activity, AlertTriangle, CheckCircle2, CircleDashed, CircleDot, XCircle, BoxIcon } from "lucide-react";
import { cx } from "../../utils/format";
import { Tone } from "../../types";
const toneCls: Record<Tone['tone'], string> = {
  neutral: 'bg-cream-2 text-ink-2 ring-line-strong',
  info: 'bg-info-50 text-info-700 ring-info-100',
  ok: 'bg-ok-50 text-ok-700 ring-ok-100',
  warn: 'bg-warn-50 text-warn-700 ring-warn-100',
  bad: 'bg-bad-50 text-bad-700 ring-bad-100',
  brand: 'bg-berry-50 text-berry-700 ring-berry-100'
};
const toneIcon: Record<Tone['tone'], BoxIcon> = {
  neutral: CircleDashed,
  info: CircleDot,
  ok: CheckCircle2,
  warn: AlertTriangle,
  bad: XCircle,
  brand: Activity
};
interface StatusChipProps extends Tone {
  icon?: BoxIcon;
  className?: string;
}
export function StatusChip({
  tone,
  label,
  icon,
  className
}: StatusChipProps) {
  const Icon = icon ?? toneIcon[tone];
  return <span className={cx('inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset', toneCls[tone], className)}>
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {label}
    </span>;
}