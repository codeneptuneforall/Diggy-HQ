import React from 'react';
import { useStore } from '../../contexts/StoreContext';

export function CategoryTag({ id }: {id: string;}) {
  const { settings } = useStore();
  const cat = settings.categories.find((c) => c.id === id);
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[13px] text-ink-2">
      <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: cat?.color ?? '#8A7F84' }} aria-hidden />
      {cat?.label ?? id}
    </span>);

}