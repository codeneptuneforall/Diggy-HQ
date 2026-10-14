import React, { useRef, useState } from 'react';
import { Check, ChevronDown, Globe, Store } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '../../contexts/StoreContext';
import { useClickOutside } from '../../hooks/useClickOutside';
import { cx } from '../../utils/format';

export function WorkspaceSwitcher() {
  const { role, workspace, setWorkspace, franchises } = useStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false), open);

  if (role === 'franchise') {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-cream-2 px-3 py-1.5 text-[13px] font-medium text-ink">
        <Store className="h-4 w-4 text-berry-600" aria-hidden />
        <span className="hidden sm:inline">Diggy Donuts —</span> Johnson City
      </div>);

  }

  const isNetwork = workspace === 'network';
  const current = franchises.find((f) => f.id === workspace);
  const options = [{ id: 'network', label: 'All franchises', sub: 'Network-wide corporate view' }, ...franchises.map((f) => ({ id: f.id, label: f.shortName, sub: f.owner }))];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={cx(
          'flex items-center gap-2 rounded-lg px-3 py-1.5 text-[13px] font-medium ring-1 ring-inset transition-colors',
          isNetwork ? 'bg-plum text-white ring-plum hover:bg-plum-2' : 'bg-berry-50 text-berry-800 ring-berry-200 hover:bg-berry-100'
        )}>
        
        {isNetwork ? <Globe className="h-4 w-4" aria-hidden /> : <Store className="h-4 w-4" aria-hidden />}
        <span className="whitespace-nowrap">{isNetwork ? 'Corporate · All franchises' : `Viewing ${current?.shortName}`}</span>
        <ChevronDown className="h-4 w-4 opacity-70" aria-hidden />
      </button>
      <AnimatePresence>
        {open &&
        <motion.ul
          role="listbox"
          initial={{ opacity: 0, y: -4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
          className="absolute left-0 top-full z-40 mt-2 w-72 origin-top-left rounded-xl border border-line bg-white p-1.5 shadow-pop">
          
            <li className="px-2.5 pb-1.5 pt-1 text-[11px] font-medium text-ink-3">Switch workspace</li>
            {options.map((o) =>
          <li key={o.id}>
                <button
              role="option"
              aria-selected={workspace === o.id}
              onClick={() => {
                setWorkspace(o.id);
                setOpen(false);
              }}
              className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-cream">
              
                  {o.id === 'network' ? <Globe className="h-4 w-4 text-ink-3" aria-hidden /> : <Store className="h-4 w-4 text-ink-3" aria-hidden />}
                  <span className="flex-1">
                    <span className="block text-sm font-medium text-ink">{o.label}</span>
                    <span className="block text-xs text-ink-3">{o.sub}</span>
                  </span>
                  {workspace === o.id && <Check className="h-4 w-4 text-berry-600" aria-hidden />}
                </button>
              </li>
          )}
          </motion.ul>
        }
      </AnimatePresence>
    </div>);

}