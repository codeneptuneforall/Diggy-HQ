import React from 'react';
import { Outlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useUI } from '../../contexts/UIContext';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { EventFormDrawer } from '../events/EventFormDrawer';
import { CustomerFormDrawer } from '../customers/CustomerFormDrawer';
import { StockFormDrawer } from '../inventory/StockFormDrawer';
import { ShiftFormDrawer } from '../schedule/ShiftFormDrawer';

export function AppShell() {
  const { navOpen, setNavOpen } = useUI();
  return (
    <div className="flex h-screen w-full overflow-hidden bg-cream text-ink">
      <div className="hidden lg:flex">
        <Sidebar />
      </div>
      <AnimatePresence>
        {navOpen &&
        <div className="fixed inset-0 z-50 flex lg:hidden">
            <motion.div className="absolute inset-0 bg-ink/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setNavOpen(false)} />
            <motion.div className="relative" initial={{ x: -24, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -24, opacity: 0 }} transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}>
              <Sidebar />
            </motion.div>
          </div>
        }
      </AnimatePresence>
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      <EventFormDrawer />
      <CustomerFormDrawer />
      <StockFormDrawer />
      <ShiftFormDrawer />
    </div>);

}