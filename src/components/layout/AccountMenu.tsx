import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, Smartphone, UserCog } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '../../contexts/StoreContext';
import { useClickOutside } from '../../hooks/useClickOutside';
import { Avatar } from '../ui/Avatar';

export function AccountMenu() {
  const { user, role } = useStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  useClickOutside(ref, () => setOpen(false), open);

  const go = (to: string) => {
    setOpen(false);
    navigate(to);
  };

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 transition-colors hover:bg-cream-2">
        <Avatar name={user.name} />
        <span className="hidden text-left leading-tight xl:block">
          <span className="block text-[13px] font-semibold">{user.name}</span>
          <span className="block text-[11px] text-ink-3">{user.title}</span>
        </span>
        <ChevronDown className="h-4 w-4 text-ink-3" aria-hidden />
      </button>
      <AnimatePresence>
        {open &&
        <motion.div
          initial={{ opacity: 0, y: -4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
          className="absolute right-0 top-full z-40 mt-2 w-64 origin-top-right rounded-xl border border-line bg-white p-1.5 shadow-pop">
          
            <div className="border-b border-line px-3 pb-2.5 pt-1.5">
              <p className="text-sm font-semibold">{user.name}</p>
              <p className="text-xs text-ink-3">{user.email}</p>
              <p className="mt-1.5 inline-flex rounded-full bg-cream-2 px-2 py-0.5 text-[11px] font-medium text-ink-2">
                {role === 'corporate' ? 'Diggy Corporate · Admin' : 'Johnson City · Franchise Owner'}
              </p>
            </div>
            <button onClick={() => go('/settings?tab=profile')} className="mt-1 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-cream">
              <UserCog className="h-4 w-4 text-ink-3" aria-hidden /> Profile & account
            </button>
            <button onClick={() => go('/mobile')} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-cream">
              <Smartphone className="h-4 w-4 text-ink-3" aria-hidden /> Open mobile app
            </button>
            <button onClick={() => go('/signin?expired=0')} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-bad-700 transition-colors hover:bg-bad-50">
              <LogOut className="h-4 w-4" aria-hidden /> Sign out
            </button>
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}