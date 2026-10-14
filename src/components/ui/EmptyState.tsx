import React from "react";
import { BoxIcon } from "lucide-react";
interface EmptyStateProps {
  icon: BoxIcon;
  title: string;
  body?: string;
  action?: React.ReactNode;
  compact?: boolean;
}
export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
  compact
}: EmptyStateProps) {
  return <div className={`flex flex-col items-center justify-center text-center ${compact ? 'py-8' : 'py-14'}`}>
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-cream-2 text-ink-3">
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <p className="font-medium text-ink">{title}</p>
      {body && <p className="mt-1 max-w-sm text-sm text-ink-3">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>;
}