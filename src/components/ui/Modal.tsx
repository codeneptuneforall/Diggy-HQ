import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { XIcon } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  footer?: React.ReactNode;
  children?: React.ReactNode;
}

const EASE = [0.23, 1, 0.32, 1] as const;

export function Modal({ open, onClose, title, description, footer, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open &&
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
          <motion.div className="absolute inset-0 bg-ink/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} onClick={onClose} />
          <motion.div
          className="relative w-full max-w-lg rounded-2xl bg-white shadow-pop"
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.2, ease: EASE }}>
          
            <div className="flex items-start justify-between gap-4 px-6 pt-5">
              <div>
                <h2 className="font-display text-lg font-semibold">{title}</h2>
                {description && <p className="mt-1 text-sm text-ink-2">{description}</p>}
              </div>
              <button onClick={onClose} className="rounded-lg p-1 text-ink-3 transition-colors hover:bg-cream-2" aria-label="Close">
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            {children && <div className="px-6 py-4">{children}</div>}
            {footer && <div className="flex justify-end gap-2 border-t border-line px-6 py-3">{footer}</div>}
          </motion.div>
        </div>
      }
    </AnimatePresence>);

}